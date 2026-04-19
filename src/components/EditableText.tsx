import React, { useEffect, useRef, useState, CSSProperties } from "react";

interface EditableTextProps {
  value: string;
  onChange?: (next: string) => void;
  /** If false, double-click editing is disabled (read-only). */
  editable?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Placeholder shown when value is empty (visual only, not committed). */
  placeholder?: string;
  /** Force uppercase visually & on commit. */
  uppercase?: boolean;
  /** Tag to render. Defaults to span. */
  as?: "span" | "div";
  /** Stop propagation on dblclick (useful when wrapped in clickable parent). */
  stopPropagation?: boolean;
  title?: string;
}

/**
 * Inline contentEditable text. Double-click to edit, Enter or blur to save,
 * Esc to cancel. Designed to sit inside any preview without disturbing layout.
 */
const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  editable = true,
  className,
  style,
  placeholder,
  uppercase,
  as = "span",
  stopPropagation,
  title,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);
  const Tag = as as any;

  // While not editing, React owns the text content. When entering edit mode,
  // we seed the element with the raw value (so the user edits the value, not
  // the placeholder). On commit/cancel we hand control back to React.
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.textContent = value || "";
    }
  }, [editing, value]);

  const commit = () => {
    if (!ref.current) return;
    let next = ref.current.textContent ?? "";
    if (uppercase) next = next.toUpperCase();
    setEditing(false);
    if (next !== value) onChange?.(next);
    else ref.current.textContent = value || "";
  };

  const cancel = () => {
    setEditing(false);
    if (ref.current) ref.current.textContent = value || "";
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!editable || !onChange) return;
    if (stopPropagation) e.stopPropagation();
    setEditing(true);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  const showPlaceholder = !editing && !value && placeholder;

  return (
    <Tag
      ref={ref as any}
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={false}
      onDoubleClick={handleDoubleClick}
      onBlur={editing ? commit : undefined}
      onKeyDown={editing ? handleKeyDown : undefined}
      title={title || (editable && onChange ? "Double-click to edit" : undefined)}
      className={className}
      style={{
        outline: editing ? "2px dashed currentColor" : "none",
        outlineOffset: 2,
        cursor: editable && onChange ? (editing ? "text" : "pointer") : "inherit",
        textTransform: uppercase ? "uppercase" : undefined,
        minWidth: editing ? 8 : undefined,
        ...style,
      }}
    >
      {showPlaceholder ? placeholder : value}
    </Tag>
  );
};

export default EditableText;
