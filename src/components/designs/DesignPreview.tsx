import React, { useRef } from "react";
import EditableText from "@/components/EditableText";
import type { CardZone } from "@/lib/visiting-card-print";
import { useZoneDrag } from "@/hooks/useZoneDrag";

interface Props {
  imageUrl: string;
  aspect: string;
  zones: CardZone[];
  values: Record<string, string>;
  selectedZone?: number | null;
  onZoneClick?: (idx: number) => void;
  onValueChange?: (role: string, next: string) => void;
  onZoneChange?: (idx: number, next: CardZone) => void;
  className?: string;
}

const DesignPreview: React.FC<Props> = ({
  imageUrl, aspect, zones, values, selectedZone, onZoneClick, onValueChange, onZoneChange, className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { startDrag } = useZoneDrag(containerRef, zones, onZoneChange);

  return (
    <div
      ref={containerRef}
      className={"relative w-full overflow-hidden rounded-lg border border-border shadow-sm bg-muted select-none " + (className || "")}
      style={{ aspectRatio: aspect }}
    >
      {imageUrl && (
        <img src={imageUrl} alt="Design template"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          crossOrigin="anonymous" draggable={false} />
      )}
      {zones.map((z, i) => {
        const isSelected = selectedZone === i;
        return (
          <div
            key={i}
            onPointerDown={onZoneChange ? startDrag(i, "move") : undefined}
            onClick={(e) => { e.stopPropagation(); onZoneClick?.(i); }}
            className={"absolute flex items-start transition-all " + (onZoneChange ? "cursor-move " : "cursor-pointer ") + (isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50")}
            style={{
              left: `${z.x}%`, top: `${z.y}%`, width: `${z.width}%`, height: `${z.height}%`,
              color: z.color_hex || "#111", fontWeight: 600, textAlign: z.text_align,
              justifyContent: z.text_align === "center" ? "center" : z.text_align === "right" ? "flex-end" : "flex-start",
              lineHeight: 1.15, containerType: "size",
            }}
          >
            <EditableText
              as="span"
              value={values[z.role] || ""}
              placeholder={`[${z.role}]`}
              onChange={onValueChange ? (v) => onValueChange(z.role, v) : undefined}
              stopPropagation
              className="w-full whitespace-pre-wrap pointer-events-auto"
              style={{ fontSize: `${z.font_size_pct}cqh` as any, display: "block" }}
            />
            {isSelected && onZoneChange && (
              <div
                onPointerDown={startDrag(i, "resize")}
                className="absolute -bottom-1 -right-1 h-3 w-3 bg-primary border border-background rounded-sm cursor-se-resize"
                title="Drag to resize"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DesignPreview;
