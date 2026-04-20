import React, { useEffect, useRef } from "react";
import type { CardZone } from "@/lib/visiting-card-print";
import EditableText from "@/components/EditableText";
import { injectGoogleFont } from "@/lib/google-fonts";
import { useZoneDrag } from "@/hooks/useZoneDrag";

interface Props {
  imageUrl: string;
  zones: CardZone[];
  values: Record<string, string>;
  selectedZone?: number | null;
  onZoneClick?: (idx: number) => void;
  onValueChange?: (role: string, next: string) => void;
  onZoneChange?: (idx: number, next: CardZone) => void;
  className?: string;
}

const VisitingCardPreview: React.FC<Props> = ({
  imageUrl, zones, values, selectedZone, onZoneClick, onValueChange, onZoneChange, className,
}) => {
  useEffect(() => {
    zones.forEach((z) => z.font_family && injectGoogleFont(z.font_family));
  }, [zones]);

  const containerRef = useRef<HTMLDivElement>(null);
  const { startDrag } = useZoneDrag(containerRef, zones, onZoneChange);

  return (
    <div
      ref={containerRef}
      className={"relative w-full overflow-hidden rounded-lg border border-border shadow-sm select-none " + (className || "")}
      style={{ aspectRatio: "3.5 / 2", background: "#f4f4f4" }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Card template"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          crossOrigin="anonymous"
          draggable={false}
        />
      )}
      {zones.map((z, i) => {
        const text = values[z.role] || "";
        const isSelected = selectedZone === i;
        return (
          <div
            key={i}
            onPointerDown={onZoneChange ? startDrag(i, "move") : undefined}
            onClick={(e) => { e.stopPropagation(); onZoneClick?.(i); }}
            className={"absolute flex items-start transition-all " + (onZoneChange ? "cursor-move " : "cursor-pointer ") + (isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50")}
            style={{
              left: `${z.x}%`, top: `${z.y}%`, width: `${z.width}%`, height: `${z.height}%`,
              color: z.color_hex || "#111",
              fontFamily: z.font_family ? `"${z.font_family}", Inter, system-ui, sans-serif` : undefined,
              fontWeight: z.font_weight || 600,
              textAlign: z.text_align,
              justifyContent: z.text_align === "center" ? "center" : z.text_align === "right" ? "flex-end" : "flex-start",
              lineHeight: 1.1,
              containerType: "size",
            }}
          >
            <EditableText
              as="span"
              value={text}
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

export default VisitingCardPreview;
