import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  /** Coalesce rapid-fire updates into a single history entry (ms). */
  debounceMs?: number;
  /** Maximum history entries to retain. */
  limit?: number;
  /** When false, keyboard shortcuts and history tracking are disabled. */
  enabled?: boolean;
}

/**
 * Drop-in replacement for useState that records history and exposes undo/redo.
 * Listens globally for Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y).
 *
 * Important: Use `setValue` for user-driven edits (these are recorded). Use
 * `replaceValue` for programmatic resets (e.g. loading a new card) to clear
 * the history without polluting the undo stack.
 */
export function useUndoableState<T>(initial: T, options: Options = {}) {
  const { debounceMs = 400, limit = 100, enabled = true } = options;
  const [value, setValueState] = useState<T>(initial);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  const lastCommitRef = useRef<T>(initial);
  const pendingTimerRef = useRef<number | null>(null);

  const commit = useCallback(() => {
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    // Snapshot is taken from the lastCommitRef (the value BEFORE the latest run of edits)
  }, []);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        if (Object.is(resolved, prev)) return prev;

        // Schedule a history push for the value BEFORE this edit-burst started.
        if (pendingTimerRef.current === null) {
          const snapshot = lastCommitRef.current;
          pendingTimerRef.current = window.setTimeout(() => {
            pastRef.current.push(snapshot);
            if (pastRef.current.length > limit) pastRef.current.shift();
            futureRef.current = [];
            lastCommitRef.current = resolved;
            pendingTimerRef.current = null;
          }, debounceMs);
        }
        return resolved;
      });
    },
    [debounceMs, limit],
  );

  /** Replace value without recording history (e.g. loading a new doc). */
  const replaceValue = useCallback((next: T) => {
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    pastRef.current = [];
    futureRef.current = [];
    lastCommitRef.current = next;
    setValueState(next);
  }, []);

  const undo = useCallback(() => {
    // Flush any pending snapshot first so the in-flight edit is recoverable
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
      pastRef.current.push(lastCommitRef.current);
    }
    const prev = pastRef.current.pop();
    if (prev === undefined) return false;
    setValueState((current) => {
      futureRef.current.push(current);
      lastCommitRef.current = prev;
      return prev;
    });
    return true;
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (next === undefined) return false;
    setValueState((current) => {
      pastRef.current.push(current);
      lastCommitRef.current = next;
      return next;
    });
    return true;
  }, []);

  // Global Ctrl/Cmd+Z and Ctrl/Cmd+Y (or Shift+Z) listener.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, undo, redo]);

  return { value, setValue, replaceValue, undo, redo, commit } as const;
}
