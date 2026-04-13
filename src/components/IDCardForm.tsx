import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import type { IDCardData } from "./IDCard";

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
          onChange(index, { ...data, photo: ev.target?.result as string });
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
          onChange(index, { ...data, photo: ev.target?.result as string });
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
    </div>
  );
};

export default IDCardForm;
