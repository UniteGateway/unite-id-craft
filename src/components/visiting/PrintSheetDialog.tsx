import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Loader2 } from "lucide-react";
import {
  SHEET_OPTIONS, BLEED_IN, CARD_W_IN, CARD_H_IN,
  exportPrintSheet, loadCard, type CardZone,
} from "@/lib/visiting-card-print";
import { toast } from "sonner";

interface Props {
  imageUrl: string;
  zones: CardZone[];
  values: Record<string, string>;
  filename?: string;
  trigger?: React.ReactNode;
}

const PrintSheetDialog: React.FC<Props> = ({ imageUrl, zones, values, filename = "cards-sheet.pdf", trigger }) => {
  const [open, setOpen] = useState(false);
  const [sheetId, setSheetId] = useState(SHEET_OPTIONS[0].id);
  const [quantity, setQuantity] = useState(24);
  const [cropMarks, setCropMarks] = useState(true);
  const [busy, setBusy] = useState(false);

  const sheet = useMemo(() => SHEET_OPTIONS.find((s) => s.id === sheetId)!, [sheetId]);
  const ups = useMemo(() => {
    const wB = CARD_W_IN + BLEED_IN * 2;
    const hB = CARD_H_IN + BLEED_IN * 2;
    const cols = Math.floor((sheet.widthIn - sheet.marginIn * 2) / wB);
    const rows = Math.floor((sheet.heightIn - sheet.marginIn * 2) / hB);
    return { cols, rows, perSheet: cols * rows };
  }, [sheet]);
  const sheetsNeeded = Math.max(1, Math.ceil(quantity / ups.perSheet));

  const run = async () => {
    if (!imageUrl) return;
    setBusy(true);
    try {
      const card = await loadCard(imageUrl, zones, values);
      const cards = Array.from({ length: quantity }, () => card);
      const result = await exportPrintSheet(cards, { sheet, cropMarks, filename });
      toast.success(`PDF ready · ${result.cols}×${result.rows} per sheet`);
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" disabled={!imageUrl}>
            <Printer className="h-4 w-4" /> Print Sheet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export print sheet</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Sheet size</Label>
            <Select value={sheetId} onValueChange={setSheetId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SHEET_OPTIONS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Layout</span>
              <span className="font-mono font-semibold">{ups.cols} × {ups.rows} = {ups.perSheet} cards/sheet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bleed</span>
              <span className="font-mono">3 mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Crop marks</span>
              <span className="font-mono">0.25pt hairline</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Quantity</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
            <p className="text-[11px] text-muted-foreground">
              → {sheetsNeeded} sheet{sheetsNeeded > 1 ? "s" : ""} ({sheetsNeeded * ups.perSheet} card slots)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="crop" className="text-sm">Include hairline crop marks</Label>
            <Switch id="crop" checked={cropMarks} onCheckedChange={setCropMarks} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={run} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            Generate PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintSheetDialog;
