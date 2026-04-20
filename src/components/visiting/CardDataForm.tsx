import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Type } from "lucide-react";
import type { CardZone } from "@/lib/visiting-card-print";
import { GOOGLE_FONTS, injectGoogleFont } from "@/lib/google-fonts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PalettePicker from "@/components/PalettePicker";

interface Props {
  imageUrl: string;
  zones: CardZone[];
  values: Record<string, string>;
  onValueChange: (role: string, v: string) => void;
  onZoneChange: (idx: number, z: CardZone) => void;
  selectedZone: number | null;
  setSelectedZone: (i: number | null) => void;
}

interface Pairing { heading: string; body: string; mood: string; rationale: string; }

const CardDataForm: React.FC<Props> = ({
  imageUrl, zones, values, onValueChange, onZoneChange, selectedZone, setSelectedZone,
}) => {
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(false);

  const suggestFonts = async () => {
    if (!imageUrl) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-fonts", { body: { imageUrl } });
      if (error) throw error;
      const ps = (data?.pairings || []) as Pairing[];
      ps.forEach((p) => { injectGoogleFont(p.heading); injectGoogleFont(p.body); });
      setPairings(ps);
      toast.success("Font recommendations ready");
    } catch (e: any) {
      toast.error(e.message || "Suggestion failed");
    } finally {
      setLoading(false);
    }
  };

  const applyPairing = (p: Pairing) => {
    zones.forEach((z, i) => {
      const isHead = /name|company|title|tagline/i.test(z.role);
      onZoneChange(i, { ...z, font_family: isHead ? p.heading : p.body });
    });
    toast.success(`Applied ${p.heading} / ${p.body}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Your information</h3>
        <div className="space-y-2">
          {zones.map((z, i) => (
            <div key={i} className="space-y-1">
              <Label className="text-xs text-muted-foreground capitalize">{z.role}</Label>
              <Input
                value={values[z.role] || ""}
                onChange={(e) => onValueChange(z.role, e.target.value)}
                onFocus={() => setSelectedZone(i)}
                placeholder={`Enter ${z.role}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-1"><Type className="h-4 w-4" /> Typography</h3>
          <Button size="sm" variant="outline" onClick={suggestFonts} disabled={loading || !imageUrl}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Suggest
          </Button>
        </div>

        {pairings.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {pairings.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPairing(p)}
                className="w-full text-left rounded-md border border-border bg-card hover:border-primary p-2 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span style={{ fontFamily: `"${p.heading}"`, fontWeight: 700 }} className="text-sm">{p.heading}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{p.mood}</span>
                </div>
                <div style={{ fontFamily: `"${p.body}"` }} className="text-xs text-muted-foreground">
                  with {p.body} — {p.rationale}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedZone !== null && zones[selectedZone] && (
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Editing: {zones[selectedZone].role}
            </p>
            <div className="space-y-1">
              <Label className="text-xs">Font</Label>
              <Select
                value={zones[selectedZone].font_family || "Inter"}
                onValueChange={(v) => {
                  injectGoogleFont(v);
                  onZoneChange(selectedZone, { ...zones[selectedZone], font_family: v });
                }}
              >
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOOGLE_FONTS.map((f) => (
                    <SelectItem key={f} value={f}>
                      <span style={{ fontFamily: `"${f}"` }}>{f}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Size: {zones[selectedZone].font_size_pct}%</Label>
                <Slider
                  min={3} max={25} step={0.5}
                  value={[zones[selectedZone].font_size_pct]}
                  onValueChange={([v]) => onZoneChange(selectedZone, { ...zones[selectedZone], font_size_pct: v })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Weight</Label>
                <Select
                  value={String(zones[selectedZone].font_weight || 600)}
                  onValueChange={(v) => onZoneChange(selectedZone, { ...zones[selectedZone], font_weight: Number(v) })}
                >
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[400, 500, 600, 700].map((w) => (
                      <SelectItem key={w} value={String(w)}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={zones[selectedZone].text_align}
                onValueChange={(v) => onZoneChange(selectedZone, { ...zones[selectedZone], text_align: v as any })}
              >
                <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="color"
                value={zones[selectedZone].color_hex || "#111111"}
                onChange={(e) => onZoneChange(selectedZone, { ...zones[selectedZone], color_hex: e.target.value })}
                className="h-8 w-12 rounded border border-input"
              />
              <PalettePicker
                compact
                onPick={(c) => onZoneChange(selectedZone, { ...zones[selectedZone], color_hex: c })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDataForm;
