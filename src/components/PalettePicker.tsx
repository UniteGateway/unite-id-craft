// Reusable brand-palette picker. Loads palettes (admin-managed) and lets the
// user click a swatch to apply a colour. Falls back gracefully if no palettes
// exist yet.
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Palette, Loader2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface BrandPalette { id: string; name: string; colors: string[]; }

interface Props {
  /** Called with the chosen hex (e.g. "#f08c00"). */
  onPick: (color: string) => void;
  /** Optional label override for the trigger button. */
  label?: string;
  /** Compact icon-only trigger (for inside zone editors). */
  compact?: boolean;
}

const PalettePicker: React.FC<Props> = ({ onPick, label = "Brand palette", compact }) => {
  const [palettes, setPalettes] = useState<BrandPalette[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || palettes.length) return;
    setLoading(true);
    supabase
      .from("brand_palettes")
      .select("id,name,colors")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setPalettes((data ?? []).map((p: any) => ({ ...p, colors: Array.isArray(p.colors) ? p.colors : [] })));
        setLoading(false);
      });
  }, [open, palettes.length]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size={compact ? "icon" : "sm"} className={compact ? "h-8 w-8" : ""}>
          <Palette className="h-4 w-4" />
          {!compact && <span className="ml-2 text-xs">{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4 text-muted-foreground text-xs">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading palettes…
          </div>
        ) : palettes.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 text-center">
            No brand palettes yet. Ask an admin to add some on the Admin page.
          </p>
        ) : (
          palettes.map((p) => (
            <div key={p.id} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{p.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.colors.map((c, i) => (
                  <button
                    key={`${p.id}-${i}`}
                    onClick={() => { onPick(c); setOpen(false); }}
                    title={c}
                    className="h-7 w-7 rounded-md border border-border hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

export default PalettePicker;
