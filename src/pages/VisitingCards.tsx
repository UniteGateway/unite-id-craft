import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Sparkles, Save, Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import VisitingCardPreview from "@/components/visiting/VisitingCardPreview";
import ZoneEditor from "@/components/visiting/ZoneEditor";
import {
  type CardZone,
  exportSingleCard,
  exportPrintSheet,
  loadCard,
} from "@/lib/visiting-card-print";

const DEFAULT_ZONES: CardZone[] = [
  { role: "name", x: 5, y: 35, width: 60, height: 12, font_size_pct: 12, text_align: "left", color_hex: "#111111" },
  { role: "title", x: 5, y: 50, width: 60, height: 8, font_size_pct: 7, text_align: "left", color_hex: "#444444" },
  { role: "phone", x: 5, y: 70, width: 40, height: 6, font_size_pct: 5, text_align: "left", color_hex: "#222222" },
  { role: "email", x: 5, y: 78, width: 60, height: 6, font_size_pct: 5, text_align: "left", color_hex: "#222222" },
];

const VisitingCards: React.FC = () => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");

  const [imageUrl, setImageUrl] = useState<string>("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [zones, setZones] = useState<CardZone[]>(DEFAULT_ZONES);
  const [values, setValues] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("Untitled card");
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [busy, setBusy] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState("Modern minimalist business card with subtle blue accent");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) nav("/auth");
  }, [user, loading, nav]);

  // Load existing card if editing
  useEffect(() => {
    if (!editId || !user) return;
    (async () => {
      const { data } = await supabase
        .from("visiting_cards")
        .select("*, visiting_card_templates(*)")
        .eq("id", editId)
        .maybeSingle();
      if (data) {
        setTitle(data.title);
        setValues(data.field_values as any);
        const tpl = (data as any).visiting_card_templates;
        if (tpl) {
          setTemplateId(tpl.id);
          setImageUrl(tpl.image_url);
          setZones(tpl.field_zones as any);
        }
      }
    })();
  }, [editId, user]);

  const uploadAndDetect = async (file: File) => {
    if (!user) return;
    try {
      setBusy("Uploading template...");
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("card-templates").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("card-templates").getPublicUrl(path);
      const url = pub.publicUrl;
      setImageUrl(url);

      setBusy("AI detecting fields...");
      const { data, error } = await supabase.functions.invoke("detect-card-fields", {
        body: { imageUrl: url },
      });
      if (error) throw error;
      const detected: CardZone[] = (data?.zones as CardZone[]) || [];
      const finalZones = detected.length ? detected : DEFAULT_ZONES;
      setZones(finalZones);

      setBusy("Saving template...");
      const { data: tpl, error: tplErr } = await supabase
        .from("visiting_card_templates")
        .insert({
          user_id: user.id,
          name: file.name,
          source: "upload",
          image_url: url,
          field_zones: finalZones as any,
        })
        .select()
        .single();
      if (tplErr) throw tplErr;
      setTemplateId(tpl.id);
      toast.success(`Template ready · ${finalZones.length} fields detected`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy("");
    }
  };

  const generateAiTemplate = async () => {
    if (!user) return;
    try {
      setBusy("AI designing template...");
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { prompt: aiPrompt + " — horizontal business card layout 3.5x2 inches, leave clear zones for name, title, phone, email" },
      });
      if (error) throw error;
      const imgB64 = data?.image as string;
      if (!imgB64) throw new Error("No image returned");
      const url = imgB64.startsWith("data:") ? imgB64 : `data:image/png;base64,${imgB64}`;

      setBusy("AI detecting fields...");
      const { data: det } = await supabase.functions.invoke("detect-card-fields", {
        body: { imageUrl: url },
      });
      const detected: CardZone[] = (det?.zones as CardZone[]) || DEFAULT_ZONES;
      setImageUrl(url);
      setZones(detected);

      setBusy("Saving template...");
      const { data: tpl } = await supabase
        .from("visiting_card_templates")
        .insert({
          user_id: user.id,
          name: aiPrompt.slice(0, 60),
          source: "ai",
          image_url: url,
          field_zones: detected as any,
        })
        .select()
        .single();
      if (tpl) setTemplateId(tpl.id);
      toast.success("AI template ready");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setBusy("");
    }
  };

  const saveCard = async () => {
    if (!user || !templateId) {
      toast.error("Upload or generate a template first");
      return;
    }
    setBusy("Saving...");
    const payload = { user_id: user.id, template_id: templateId, title, field_values: values };
    if (editId) {
      await supabase.from("visiting_cards").update(payload).eq("id", editId);
    } else {
      const { data } = await supabase.from("visiting_cards").insert(payload).select().single();
      if (data) nav(`/visiting-cards?edit=${data.id}`, { replace: true });
    }
    setBusy("");
    toast.success("Saved to dashboard");
  };

  const downloadSingle = async () => {
    if (!imageUrl) return;
    setBusy("Building PDF...");
    const card = await loadCard(imageUrl, zones, values);
    await exportSingleCard(card, `${title || "card"}.pdf`);
    setBusy("");
  };

  const downloadSheet = async () => {
    if (!imageUrl) return;
    setBusy("Building 13x19 sheet...");
    try {
      const card = await loadCard(imageUrl, zones, values);
      const result = await exportPrintSheet([card], `${title || "card"}-sheet-13x19.pdf`);
      toast.success(`Sheet ready · ${result.cols}×${result.rows} = ${result.perSheet} cards/sheet`);
    } catch (e: any) {
      toast.error(e.message);
    }
    setBusy("");
  };

  const updateValue = (role: string, v: string) => setValues((prev) => ({ ...prev, [role]: v }));

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl p-4 grid lg:grid-cols-[1fr,360px] gap-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-sm font-semibold" />
            <Button onClick={saveCard} disabled={!!busy || !templateId}>
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button variant="outline" onClick={downloadSingle} disabled={!imageUrl || !!busy}>
              <Download className="h-4 w-4" /> Single PDF
            </Button>
            <Button variant="outline" onClick={downloadSheet} disabled={!imageUrl || !!busy}>
              <Printer className="h-4 w-4" /> 13×19 Sheet
            </Button>
          </div>

          {imageUrl ? (
            <VisitingCardPreview
              imageUrl={imageUrl}
              zones={zones}
              values={values}
              selectedZone={selectedZone}
              onZoneClick={setSelectedZone}
            />
          ) : (
            <div className="aspect-[3.5/2] rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground bg-muted/30">
              Upload or generate a template to begin
            </div>
          )}

          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {busy}
            </div>
          )}

          <Tabs defaultValue="upload">
            <TabsList>
              <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-1" />Upload</TabsTrigger>
              <TabsTrigger value="ai"><Sparkles className="h-4 w-4 mr-1" />AI Generate</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-2">
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) uploadAndDetect(f);
                }}
                className="rounded-lg border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drop or click to upload your card design (PNG/JPG)</p>
                <p className="text-xs text-muted-foreground mt-1">AI will auto-detect text field positions</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadAndDetect(e.target.files[0])}
                />
              </div>
            </TabsContent>
            <TabsContent value="ai" className="space-y-2">
              <Label>Describe your card</Label>
              <Input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
              <Button onClick={generateAiTemplate} disabled={!!busy}>
                <Sparkles className="h-4 w-4" /> Generate
              </Button>
            </TabsContent>
          </Tabs>
        </section>

        <aside className="space-y-3">
          <h3 className="text-sm font-semibold">Field values</h3>
          {zones.map((z, i) => (
            <div key={i} className="space-y-1">
              <Label className="text-xs text-muted-foreground capitalize">{z.role}</Label>
              <Input
                value={values[z.role] || ""}
                onChange={(e) => updateValue(z.role, e.target.value)}
                onFocus={() => setSelectedZone(i)}
                placeholder={`Enter ${z.role}`}
              />
            </div>
          ))}

          <h3 className="text-sm font-semibold pt-4">Field positions</h3>
          {zones.map((z, i) => (
            <ZoneEditor
              key={i}
              zone={z}
              onChange={(nz) => setZones((prev) => prev.map((p, idx) => (idx === i ? nz : p)))}
              onDelete={() => setZones((prev) => prev.filter((_, idx) => idx !== i))}
            />
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              setZones((prev) => [
                ...prev,
                { role: "field" + (prev.length + 1), x: 10, y: 10, width: 40, height: 8, font_size_pct: 6, text_align: "left", color_hex: "#111111" },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Add field
          </Button>
        </aside>
      </main>
    </div>
  );
};

export default VisitingCards;
