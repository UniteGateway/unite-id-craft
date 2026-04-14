import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, ZoomIn, Move, Palette } from "lucide-react";
import { type IDCardData, BG_COLOR_PRESETS } from "./IDCard";

interface IDCardFormProps {
  index: number;
  data: IDCardData;
  onChange: (index: number, data: IDCardData) => void;
}

const IDCardForm: React.FC<IDCardFormProps> = ({ index, data, onChange }) => {
  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          onChange(index, {
            ...data,
            photo: ev.target?.result as string,
            photoZoom: 1,
            photoOffsetX: 0,
            photoOffsetY: 0,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [index, data, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          onChange(index, {
            ...data,
            photo: ev.target?.result as string,
            photoZoom: 1,
            photoOffsetX: 0,
            photoOffsetY: 0,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [index, data, onChange]
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Card #{index + 1}
      </h3>

      <div className="space-y-2">
        <Label htmlFor={`name-${index}`} className="text-xs text-muted-foreground">
          Full Name
        </Label>
        <Input
          id={`name-${index}`}
          value={data.name}
          onChange={(e) => onChange(index, { ...data, name: e.target.value })}
          placeholder="Asim Ahmed Khan"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`designation-${index}`} className="text-xs text-muted-foreground">
          Designation
        </Label>
        <Input
          id={`designation-${index}`}
          value={data.designation}
          onChange={(e) =>
            onChange(index, { ...data, designation: e.target.value })
          }
          placeholder="Branch Manager - Business Development"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`empid-${index}`} className="text-xs text-muted-foreground">
          Employee ID
        </Label>
        <Input
          id={`empid-${index}`}
          value={data.employeeId}
          onChange={(e) =>
            onChange(index, { ...data, employeeId: e.target.value })
          }
          placeholder="US-BA-001"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Photo</Label>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-4 cursor-pointer hover:border-primary transition-colors"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {data.photo ? (
            <img
              src={data.photo}
              alt="Preview"
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Upload className="h-5 w-5" />
              <span className="text-xs">Drop or click to upload</span>
            </div>
          )}
        </div>
      </div>

      {/* Photo adjustment controls */}
      {data.photo && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <ZoomIn className="h-3 w-3" /> Photo Adjustment
          </p>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Zoom: {((data.photoZoom ?? 1) * 100).toFixed(0)}%
            </Label>
            <Slider
              min={100}
              max={300}
              step={5}
              value={[(data.photoZoom ?? 1) * 100]}
              onValueChange={([v]) =>
                onChange(index, { ...data, photoZoom: v / 100 })
              }
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Move className="h-3 w-3" /> Horizontal: {data.photoOffsetX ?? 0}%
            </Label>
            <Slider
              min={-50}
              max={50}
              step={1}
              value={[data.photoOffsetX ?? 0]}
              onValueChange={([v]) =>
                onChange(index, { ...data, photoOffsetX: v })
              }
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Move className="h-3 w-3" /> Vertical: {data.photoOffsetY ?? 0}%
            </Label>
            <Slider
              min={-50}
              max={50}
              step={1}
              value={[data.photoOffsetY ?? 0]}
              onValueChange={([v]) =>
                onChange(index, { ...data, photoOffsetY: v })
              }
            />
          </div>
        </div>
      )}

      {/* Background color picker */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Palette className="h-3 w-3" /> Background Color
        </Label>
        <div className="flex flex-wrap gap-2">
          {BG_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              title={preset.label}
              onClick={() => onChange(index, { ...data, bgColor: preset.value })}
              className={`h-7 w-7 rounded-full border-2 transition-all ${
                (data.bgColor || "#3a3a3a") === preset.value
                  ? "border-primary scale-110 ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: preset.value }}
            />
          ))}
          <label
            title="Custom color"
            className="relative h-7 w-7 rounded-full border-2 border-dashed border-border hover:border-primary/50 cursor-pointer flex items-center justify-center overflow-hidden"
          >
            <Palette className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="color"
              value={data.bgColor || "#3a3a3a"}
              onChange={(e) => onChange(index, { ...data, bgColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default IDCardForm;
