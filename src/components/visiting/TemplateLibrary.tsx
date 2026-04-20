import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Sparkles, Trash2, Loader2, LibraryBig } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BUILT_IN_TEMPLATES, type BuiltInTemplate } from "@/lib/builtin-templates";
import type { CardZone } from "@/lib/visiting-card-print";

export interface PickedTemplate {
  id?: string;
  name: string;
  imageUrl: string;
  zones: CardZone[];
}

interface Props {
  userId: string;
  savedTemplates: any[];
  onPick: (t: PickedTemplate) => void;
  onSavedChange: () => void;
}

const DEFAULT_ZONES: CardZone[] = [
  { role: "name", x: 5, y: 35, width: 60, height: 12, font_size_pct: 12, text_align: "left", color_hex: "#111111" },
  { role: "title", x: 5, y: 50, width: 60, height: 8, font_size_pct: 7, text_align: "left", color_hex: "#444444" },
  { role: "phone", x: 5, y: 70, width: 40, height: 6, font_size_pct: 5, text_align: "left", color_hex: "#222222" },
  { role: "email", x: 5, y: 78, width: 60, height: 6, font_size_pct: 5, text_align: "left", color_hex: "#222222" },
];

const TemplateLibrary: React.FC<Props> = ({ userId, savedTemplates, onPick, onSavedChange }) => {
  const [busy, setBusy] = useState("");
  const [aiPrompt, setAiPrompt] = useState("Modern minimalist business card with subtle blue accent");
  const fileRef = useRef<HTMLInputElement>(null);

  const pickBuiltIn = (t: BuiltInTemplate) => {
    onPick({ name: t.name, imageUrl: t.image, zones: t.zones });
    toast.success(`${t.name} loaded — fill in your data on the right`);
  };

  const pickSaved = (t: any) => {
    onPick({ id: t.id, name: t.name, imageUrl: t.image_url, zones: t.field_zones });
    toast.success(`${t.name} loaded`);
  };

  const deleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this template from your library?")) return;
    await supabase.from("visiting_card_templates").delete().eq("id", id);
    onSavedChange();
  };

  const uploadAndDetect = async (file: File) => {
    try {
      setBusy("Uploading...");
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("card-templates").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("card-templates").getPublicUrl(path);
      const url = pub.publicUrl;

      setBusy("AI detecting fields...");
      const { data, error } = await supabase.functions.invoke("detect-card-fields", { body: { imageUrl: url } });
      if (error) throw error;
      const detected: CardZone[] = (data?.zones as CardZone[]) || [];
      const finalZones = detected.length ? detected : DEFAULT_ZONES;

      setBusy("Saving to library...");
      const { data: tpl, error: tplErr } = await supabase
        .from("visiting_card_templates")
        .insert({ user_id: userId, name: file.name.replace(/\.[^.]+$/, ""), source: "upload", image_url: url, field_zones: finalZones as any })
        .select().single();
      if (tplErr) throw tplErr;
      onSavedChange();
      onPick({ id: tpl.id, name: tpl.name, imageUrl: url, zones: finalZones });
      toast.success(`Template added · ${finalZones.length} fields detected`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy("");
    }
  };

  const generateAi = async () => {
    try {
      setBusy("AI designing...");
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { prompt: aiPrompt + " — horizontal business card 3.5x2 in, leave clear zones for name, title, phone, email" },
      });
      if (error) throw error;
      const imgB64 = data?.image as string;
      if (!imgB64) throw new Error("No image returned");
      const url = imgB64.startsWith("data:") ? imgB64 : `data:image/png;base64,${imgB64}`;

      setBusy("Detecting fields...");
      const { data: det } = await supabase.functions.invoke("detect-card-fields", { body: { imageUrl: url } });
      const detected: CardZone[] = (det?.zones as CardZone[]) || DEFAULT_ZONES;

      setBusy("Saving to library...");
      const { data: tpl } = await supabase.from("visiting_card_templates")
        .insert({ user_id: userId, name: aiPrompt.slice(0, 60), source: "ai", image_url: url, field_zones: detected as any })
        .select().single();
      onSavedChange();
      if (tpl) onPick({ id: tpl.id, name: tpl.name, imageUrl: url, zones: detected });
      toast.success("AI template added to library");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setBusy("");
    }
  };

  return (
    <Tabs defaultValue="library">
      <TabsList>
        <TabsTrigger value="library"><LibraryBig className="h-4 w-4 mr-1" />Library</TabsTrigger>
        <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-1" />Upload</TabsTrigger>
        <TabsTrigger value="ai"><Sparkles className="h-4 w-4 mr-1" />AI Generate</TabsTrigger>
      </TabsList>

      <TabsContent value="library" className="space-y-4 pt-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Built-in</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUILT_IN_TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => pickBuiltIn(t)}
                className="group relative aspect-[3.5/2] rounded-lg border border-border overflow-hidden hover:border-primary hover:shadow-md transition-all">
                <img src={t.image} alt={t.name} className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">Use this design</span>
                </span>
                <span className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur px-2 py-1 text-[10px] font-medium truncate">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
        {savedTemplates.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Your saved templates</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {savedTemplates.map((t) => (
                <button key={t.id} onClick={() => pickSaved(t)}
                  className="group relative aspect-[3.5/2] rounded-lg border border-border overflow-hidden hover:border-primary hover:shadow-md transition-all">
                  <img src={t.image_url} alt={t.name} className="absolute inset-0 w-full h-full object-cover" />
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-background/80 text-[9px] uppercase font-semibold">{t.source}</span>
                  <span className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur px-2 py-1 text-[10px] font-medium truncate">{t.name}</span>
                  <span onClick={(e) => deleteSaved(t.id, e)}
                    className="absolute top-1 left-1 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload" className="pt-3">
        <div onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) uploadAndDetect(f); }}
          className="rounded-lg border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary transition-colors">
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm">Drop or click to upload your card design (PNG/JPG)</p>
          <p className="text-xs text-muted-foreground mt-1">AI auto-detects field positions and saves to your library</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadAndDetect(e.target.files[0])} />
        </div>
      </TabsContent>

      <TabsContent value="ai" className="pt-3 space-y-2">
        <Label>Describe your card</Label>
        <Input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
        <Button onClick={generateAi} disabled={!!busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate & save
        </Button>
      </TabsContent>

      {busy && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
          <Loader2 className="h-3 w-3 animate-spin" />{busy}
        </p>
      )}
    </Tabs>
  );
};

export default TemplateLibrary;
