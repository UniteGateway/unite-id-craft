import React, { useEffect, useState } from "react";
import SolarShell from "@/components/solar/SolarShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/hooks/useBranding";
import { toast } from "sonner";
import { Loader2, Palette, Save } from "lucide-react";

const THEMES = ["Dark Premium", "Light Corporate", "Solar Gold"] as const;

const SolarBranding: React.FC = () => {
  const { user } = useAuth();
  const { branding, refresh } = useBranding();
  const [logoUrl, setLogoUrl] = useState("");
  const [color, setColor] = useState("#F59E0B");
  const [theme, setTheme] = useState<string>(THEMES[0]);
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLogoUrl(branding.brand_logo_url ?? "");
    setColor(branding.brand_primary_color ?? "#F59E0B");
    setTheme(branding.brand_theme ?? THEMES[0]);
    setCompany(branding.company ?? "");
  }, [branding]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        brand_logo_url: logoUrl || null,
        brand_primary_color: color || null,
        brand_theme: theme || null,
        company: company || null,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Branding saved");
    refresh();
  };

  return (
    <SolarShell title="Branding">
      <div className="mb-5 flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Branding & Theme</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
        These settings are applied across every proposal you generate.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-5">
        <Card className="p-5 space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Unite Solar Pvt. Ltd." />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…/logo.png" />
            <p className="text-xs text-muted-foreground mt-1">Paste a public image URL. Upload UI coming soon.</p>
          </div>
          <div>
            <Label>Primary Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 p-1"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
            </div>
          </div>
          <div>
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`text-sm px-3 py-2 rounded-md border transition-colors ${
                    theme === t
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Branding
            </Button>
          </div>
        </Card>

        <Card className="p-5 h-fit">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Preview</div>
          <div
            className="rounded-lg p-4 text-white"
            style={{ backgroundColor: color }}
          >
            <div className="flex items-center gap-2">
              {logoUrl
                ? <img src={logoUrl} alt="logo" className="h-8 w-8 object-contain bg-white/10 rounded" />
                : <div className="h-8 w-8 rounded bg-white/20" />}
              <div className="font-bold">{company || "Your Company"}</div>
            </div>
            <div className="mt-3 text-xs opacity-80">{theme}</div>
          </div>
        </Card>
      </div>
    </SolarShell>
  );
};

export default SolarBranding;