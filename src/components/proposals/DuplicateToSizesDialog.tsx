import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Copy } from "lucide-react";
import { RESIDENTIAL_KW_OPTIONS } from "@/lib/residential-presets";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  baseKw: number;
  busy?: boolean;
  onConfirm: (targetSizes: number[]) => Promise<void> | void;
  title?: string;
  description?: string;
};

const DuplicateToSizesDialog: React.FC<Props> = ({ open, onOpenChange, baseKw, busy, onConfirm, title, description }) => {
  const allSizes = RESIDENTIAL_KW_OPTIONS.filter((k) => k !== baseKw);
  const [picked, setPicked] = useState<number[]>([...allSizes]);

  const toggle = (kw: number) =>
    setPicked((prev) => (prev.includes(kw) ? prev.filter((x) => x !== kw) : [...prev, kw].sort((a, b) => a - b)));

  const allSelected = picked.length === allSizes.length;
  const toggleAll = () => setPicked(allSelected ? [] : [...allSizes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Copy className="h-4 w-4" /> {title || "Duplicate to All Sizes"}</DialogTitle>
          <DialogDescription>
            {description || `Scale this BOQ from ${baseKw} kW to the selected sizes. Items marked "Fixed" stay the same; panels round up; cables get a 10% buffer; everything else scales proportionally.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <button type="button" onClick={toggleAll} className="text-xs text-primary underline">
            {allSelected ? "Clear all" : "Select all"}
          </button>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {allSizes.map((kw) => (
              <label key={kw} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition ${picked.includes(kw) ? "border-primary bg-primary/5" : "border-border"}`}>
                <Checkbox checked={picked.includes(kw)} onCheckedChange={() => toggle(kw)} />
                <span className="text-sm font-medium">{kw} kW</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!picked.length || busy} onClick={() => onConfirm(picked)}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            Duplicate to {picked.length} size{picked.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateToSizesDialog;