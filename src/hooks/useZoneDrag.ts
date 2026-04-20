import { useCallback, useRef } from "react";
import type { CardZone } from "@/lib/visiting-card-print";

type Mode = "move" | "resize";

interface DragState {
  idx: number;
  mode: Mode;
  startX: number;
  startY: number;
  origin: CardZone;
  containerW: number;
  containerH: number;
}

/**
 * Returns a pointer-down handler factory for moving / resizing zones on a
 * percentage-based canvas. The container element is the relatively-positioned
 * preview wrapper that holds the zones.
 */
export function useZoneDrag(
  containerRef: React.RefObject<HTMLDivElement>,
  zones: CardZone[],
  onZoneChange?: (idx: number, next: CardZone) => void,
) {
  const dragRef = useRef<DragState | null>(null);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d || !onZoneChange) return;
    const dxPct = ((e.clientX - d.startX) / d.containerW) * 100;
    const dyPct = ((e.clientY - d.startY) / d.containerH) * 100;
    const z = d.origin;
    if (d.mode === "move") {
      const x = Math.max(0, Math.min(100 - z.width, z.x + dxPct));
      const y = Math.max(0, Math.min(100 - z.height, z.y + dyPct));
      onZoneChange(d.idx, { ...z, x, y });
    } else {
      const width = Math.max(5, Math.min(100 - z.x, z.width + dxPct));
      const height = Math.max(2, Math.min(100 - z.y, z.height + dyPct));
      onZoneChange(d.idx, { ...z, width, height });
    }
  }, [onZoneChange]);

  const stop = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stop);
  }, [onPointerMove]);

  const startDrag = useCallback((idx: number, mode: Mode) => (e: React.PointerEvent) => {
    if (!onZoneChange || !containerRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = {
      idx, mode,
      startX: e.clientX, startY: e.clientY,
      origin: zones[idx],
      containerW: rect.width, containerH: rect.height,
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stop);
  }, [zones, onZoneChange, containerRef, onPointerMove, stop]);

  return { startDrag };
}
