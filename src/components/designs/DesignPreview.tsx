import React from "react";
import EditableText from "@/components/EditableText";
import type { CardZone } from "@/lib/visiting-card-print";

interface Props {
  imageUrl: string;
  aspect: string; // e.g. "1 / 1.414"
  zones: CardZone[];
  values: Record<string, string>;
  selectedZone?: number | null;
  onZoneClick?: (idx: number) => void;
  onValueChange?: (role: string, next: string) => void;
  className?: string;
}

const DesignPreview: React.FC<Props> = ({
  imageUrl, aspect, zones, values, selectedZone, onZoneClick, onValueChange, className,
}) => {
  return (
    <div
      className={"relative w-full overflow-hidden rounded-lg border border-border shadow-sm bg-muted " + (className || "")}
      style={{ aspectRatio: aspect }}
    >
      {imageUrl && (
        <img src={imageUrl} alt="Design template"
          className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
      )}
      {zones.map((z, i) => {
        const isSelected = selectedZone === i;
        return (
          <div
            key={i}
            onClick={() => onZoneClick?.(i)}
            className={"absolute flex items-start cursor-pointer transition-all " + (isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50")}
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
              className="w-full whitespace-pre-wrap"
              style={{ fontSize: `${z.font_size_pct}cqh` as any, display: "block" }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DesignPreview;
