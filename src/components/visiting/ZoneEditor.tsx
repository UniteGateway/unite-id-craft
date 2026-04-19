import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { CardZone } from "@/lib/visiting-card-print";

interface Props {
  zone: CardZone;
  onChange: (z: CardZone) => void;
  onDelete: () => void;
}

const ZoneEditor: React.FC<Props> = ({ zone, onChange, onDelete }) => {
  const num = (k: keyof CardZone, min: number, max: number, step: number) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground capitalize">
        {String(k).replace("_", " ")}: {Math.round((zone[k] as number) * 10) / 10}
      </Label>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[zone[k] as number]}
        onValueChange={([v]) => onChange({ ...zone, [k]: v })}
      />
    </div>
  );

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Input
          value={zone.role}
          onChange={(e) => onChange({ ...zone, role: e.target.value })}
          className="h-8 text-sm font-medium max-w-[60%]"
        />
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {num("x", 0, 100, 0.5)}
        {num("y", 0, 100, 0.5)}
        {num("width", 5, 100, 0.5)}
        {num("height", 2, 60, 0.5)}
      </div>
      {num("font_size_pct", 1, 30, 0.5)}
      <div className="flex items-center gap-2">
        <select
          value={zone.text_align}
          onChange={(e) => onChange({ ...zone, text_align: e.target.value as any })}
          className="h-8 text-xs rounded-md border border-input bg-background px-2"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
        <input
          type="color"
          value={zone.color_hex || "#111111"}
          onChange={(e) => onChange({ ...zone, color_hex: e.target.value })}
          className="h-8 w-10 rounded border border-input"
        />
      </div>
    </div>
  );
};

export default ZoneEditor;
