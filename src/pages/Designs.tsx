import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import AppNav from "@/components/AppNav";
import PageBanner, { BANNERS } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Sparkles, Save, Download, Plus, LibraryBig, Trash2, FileImage, BookOpen, Presentation, Mail, Receipt, Ticket } from "lucide-react";
import { toast } from "sonner";
import DesignPreview from "@/components/designs/DesignPreview";
import ZoneEditor from "@/components/visiting/ZoneEditor";
import type { CardZone } from "@/lib/visiting-card-print";
import { FORMATS, type DesignKind, exportDesignPDF, exportDesignPNG } from "@/lib/design-export";
import { useUndoableState } from "@/hooks/useUndoableState";

const KIND_META: Record<DesignKind, { title: string; subtitle: string; icon: React.ElementType; bucket: string; defaultPrompt: string }> = {
  flyer: {
    title: "Flyers", subtitle: "Single-page A4 promos — pick a template, edit text, export.",
    icon: FileImage, bucket: "design-templates",
    defaultPrompt: "Modern A4 flyer for a solar EPC company, sun gradient, headline space top",
  },
  brochure: {
    title: "Brochures", subtitle: "A4 landscape brochure pages — multi-page support coming soon.",
    icon: BookOpen, bucket: "design-templates",
    defaultPrompt: "Clean tri-fold brochure panel, solar imagery, plenty of white space",
  },
  presentation: {
    title: "Presentations", subtitle: "16:9 slide templates — pick, edit, export PNG/PDF.",
    icon: Presentation, bucket: "design-templates",
    defaultPrompt: "Modern 16:9 pitch deck slide background, blue solar accent, headline area",
  },
  letterhead: {
    title: "Letterheads", subtitle: "A4 corporate stationery — header, footer, body area.",
    icon: Mail, bucket: "design-templates",
    defaultPrompt: "Professional A4 letterhead for a solar company, logo top-left, slim footer band, plenty of white space for body text",
  },
  envelope: {
    title: "Envelopes", subtitle: "#10 business envelope (9.5\" x 4.125\") — return address, recipient block.",
    icon: Mail, bucket: "design-templates",
    defaultPrompt: "Clean #10 business envelope design, return address top-left, subtle solar accent strip on right edge",
  },
  billbook: {
    title: "Billbooks", subtitle: "A4 invoice / bill template — header, line items area, totals.",
    icon: Receipt, bucket: "design-templates",
    defaultPrompt: "Professional A4 invoice template for a solar company, header with logo, table area for line items, totals block at bottom-right",
  },
  voucher: {
    title: "Vouchers", subtitle: "Coupon / gift voucher (8\" x 3.5\") — bold offer, terms strip.",
    icon: Ticket, bucket: "design-templates",
    defaultPrompt: "Premium gift voucher for a solar company, bold offer area on left, decorative pattern on right, terms strip at bottom",
  },
};

const DEFAULT_ZONES: CardZone[] = [
  { role: "headline", x: 6, y: 10, width: 60, height: 12, font_size_pct: 60, text_align: "left", color_hex: "#111111" },
  { role: "subhead", x: 6, y: 24, width: 60, height: 8, font_size_pct: 45, text_align: "left", color_hex: "#444444" },
  { role: "body", x: 6, y: 38, width: 60, height: 30, font_size_pct: 28, text_align: "left", color_hex: "#222222" },
  { role: "cta", x: 6, y: 86, width: 50, height: 6, font_size_pct: 50, text_align: "left", color_hex: "#1a3c6e" },
];

const Designs: React.FC = () => {
  const { kind: kindParam } = useParams<{ kind: DesignKind }>();
  const kind = (kindParam && (kindParam in KIND_META) ? kindParam : "flyer") as DesignKind;
  const meta = KIND_META[kind];
  const fmt = FORMATS[kind];
  const { user, loading } = useAuth();
  const { isAdmin } = useUserRole();
  const nav = useNavigate();

  const [imageUrl, setImageUrl] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);
  const [zones, setZones] = useState<CardZone[]>(DEFAULT_ZONES);
  const { value: values, setValue: setValues } = useUndoableState<Record<string, string>>({});
  const [title, setTitle] = useState(`Untitled ${meta.title.slice(0, -1)}`);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [busy, setBusy] = useState("");
  const [aiPrompt, setAiPrompt] = useState(meta.defaultPrompt);
  const [templates, setTemplates] = useState<any[]>([]);
  const [myDesigns, setMyDesigns] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!loading && !user) nav("/auth"); }, [user, loading, nav]);

  // Reset on kind change
  useEffect(() => {
    setImageUrl(""); setZones(DEFAULT_ZONES); setValues({}); setTemplateId(null);
    setDesignId(null); setTitle(`Untitled ${KIND_META[kind].title.slice(0, -1)}`);
    setAiPrompt(KIND_META[kind].defaultPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const loadAll = async () => {
    const [tpl, des] = await Promise.all([
      supabase.from("design_templates").select("*").eq("kind", kind).order("created_at", { ascending: false }),
      user ? supabase.from("designs").select("*").eq("kind", kind).order("updated_at", { ascending: false }) : Promise.resolve({ data: [] } as any),
    ]);
    setTemplates(tpl.data || []);
    setMyDesigns((des as any).data || []);
  };
  useEffect(() => { if (user) loadAll(); /* eslint-disable-next-line */ }, [user, kind, busy]);

  const pickTemplate = (t: any) => {
    setImageUrl(t.image_url);
    setZones((t.field_zones?.length ? t.field_zones : DEFAULT_ZONES) as CardZone[]);
    setTemplateId(t.id);
    setTitle(t.name);
    toast.success(`${t.name} loaded`);
  };

  const openDesign = (d: any) => {
    setDesignId(d.id); setTitle(d.title);
    const page = (d.pages?.[0]) || {};
    setImageUrl(page.imageUrl || "");
    setZones((page.zones?.length ? page.zones : DEFAULT_ZONES) as CardZone[]);
    setValues(page.values || d.field_values || {});
    setTemplateId(d.template_id || null);
    toast.success(`${d.title} opened`);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy("upload");
    try {
      if (isAdmin) {
        const path = `${kind}/${Date.now()}-${f.name}`;
        const { error: upErr } = await supabase.storage.from(meta.bucket).upload(path, f, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from(meta.bucket).getPublicUrl(path);
        await supabase.from("design_templates").insert({
          kind, name: f.name.replace(/\.[^.]+$/, ""), image_url: publicUrl, storage_path: path,
          source: "upload", field_zones: DEFAULT_ZONES as any,
        });
        toast.success("Template added to library");
      } else {
        // non-admins: load locally only
        const reader = new FileReader();
        reader.onload = (ev) => { setImageUrl(ev.target?.result as string); setZones(DEFAULT_ZONES); };
        reader.readAsDataURL(f);
        toast.success("Template loaded locally");
      }
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(""); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleAI = async () => {
    setBusy("ai");
    try {
      const { data, error } = await supabase.functions.invoke("generate-design-template", {
        body: { prompt: aiPrompt, kind },
      });
      if (error) throw error;
      if (!data?.image) throw new Error("No image");
      setImageUrl(data.image);
      setZones(DEFAULT_ZONES);
      toast.success("AI background generated");
      if (isAdmin) {
        // optional: save to library for everyone
        await supabase.from("design_templates").insert({
          kind, name: `AI: ${aiPrompt.slice(0, 40)}`, image_url: data.image,
          source: "ai", field_zones: DEFAULT_ZONES as any,
        });
      }
    } catch (e: any) { toast.error(e.message || "Failed to generate"); }
    finally { setBusy(""); }
  };

  const saveDesign = async () => {
    if (!user) return;
    setBusy("save");
    try {
      const page = { imageUrl, zones, values };
      const payload = {
        user_id: user.id, kind, title, template_id: templateId,
        pages: [page] as any, field_values: values as any,
      };
      if (designId) {
        const { error } = await supabase.from("designs").update(payload).eq("id", designId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("designs").insert(payload).select().single();
        if (error) throw error;
        setDesignId(data.id);
      }
      toast.success("Design saved");
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(""); }
  };

  const deleteDesign = async (id: string) => {
    if (!confirm("Delete this design?")) return;
    await supabase.from("designs").delete().eq("id", id);
    if (designId === id) setDesignId(null);
    setMyDesigns((d) => d.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  const deleteTemplate = async (t: any) => {
    if (!isAdmin) return;
    if (!confirm("Delete this template from library?")) return;
    await supabase.from("design_templates").delete().eq("id", t.id);
    if (t.storage_path) await supabase.storage.from(meta.bucket).remove([t.storage_path]);
    setTemplates((x) => x.filter((y) => y.id !== t.id));
    toast.success("Template removed");
  };

  const exportPng = () => exportDesignPNG([{ imageUrl, zones, values }], fmt, title);
  const exportPdf = () => exportDesignPDF([{ imageUrl, zones, values }], fmt, title);

  const Icon = meta.icon;
  const banner = kind === "presentation" ? BANNERS.social : kind === "brochure" ? BANNERS.proposals : BANNERS.studio;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <PageBanner image={banner} eyebrow={meta.title} icon={<Icon className="h-3.5 w-3.5" />}
          title={meta.title} subtitle={meta.subtitle} height="md" />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: editor */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-md" />
            <Button onClick={saveDesign} disabled={!!busy}>
              {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
            <Button variant="outline" onClick={exportPng}><Download className="h-4 w-4" /> PNG</Button>
            <Button variant="outline" onClick={exportPdf}><Download className="h-4 w-4" /> PDF</Button>
          </div>

          {imageUrl ? (
            <DesignPreview
              imageUrl={imageUrl} aspect={fmt.aspectCss} zones={zones} values={values}
              selectedZone={selectedZone} onZoneClick={setSelectedZone}
              onValueChange={(role, v) => setValues({ ...values, [role]: v })}
              onZoneChange={(idx, nz) => setZones(zones.map((x, j) => j === idx ? nz : x))}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground"
              style={{ aspectRatio: fmt.aspectCss }}>
              Pick a template from the library or generate one with AI to start →
            </div>
          )}

          {imageUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Text Zones</Label>
                <Button size="sm" variant="outline" onClick={() => setZones([...zones, {
                  role: `field_${zones.length + 1}`, x: 10, y: 50, width: 40, height: 8,
                  font_size_pct: 40, text_align: "left", color_hex: "#111111",
                }])}><Plus className="h-3 w-3" /> Zone</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {zones.map((z, i) => (
                  <div key={i} onClick={() => setSelectedZone(i)}>
                    <ZoneEditor zone={z}
                      onChange={(nz) => setZones(zones.map((x, j) => j === i ? nz : x))}
                      onDelete={() => setZones(zones.filter((_, j) => j !== i))} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT: gallery */}
        <aside className="space-y-4">
          <Tabs defaultValue="library">
            <TabsList className="w-full">
              <TabsTrigger value="library" className="flex-1"><LibraryBig className="h-3.5 w-3.5" /> Library</TabsTrigger>
              <TabsTrigger value="mine" className="flex-1">My designs</TabsTrigger>
              <TabsTrigger value="new" className="flex-1"><Sparkles className="h-3.5 w-3.5" /> New</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-2 mt-3">
              {templates.length === 0 && (
                <p className="text-xs text-muted-foreground">No templates yet. {isAdmin ? "Add one in the New tab." : "Ask an admin to add some."}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => (
                  <div key={t.id} className="group relative rounded-md overflow-hidden border border-border">
                    <button onClick={() => pickTemplate(t)} className="block w-full">
                      <img src={t.image_url} alt={t.name} className="w-full object-cover" style={{ aspectRatio: fmt.aspectCss }} />
                      <div className="text-xs p-1 truncate bg-card">{t.name}</div>
                    </button>
                    {isAdmin && (
                      <button onClick={() => deleteTemplate(t)}
                        className="absolute top-1 right-1 hidden group-hover:flex bg-background/90 rounded p-1">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mine" className="space-y-2 mt-3">
              {myDesigns.length === 0 && <p className="text-xs text-muted-foreground">No saved designs yet.</p>}
              <div className="grid grid-cols-2 gap-2">
                {myDesigns.map((d) => {
                  const thumb = d.pages?.[0]?.imageUrl;
                  return (
                    <div key={d.id} className="group relative rounded-md overflow-hidden border border-border">
                      <button onClick={() => openDesign(d)} className="block w-full">
                        {thumb ? (
                          <img src={thumb} alt={d.title} className="w-full object-cover" style={{ aspectRatio: fmt.aspectCss }} />
                        ) : (
                          <div className="bg-muted" style={{ aspectRatio: fmt.aspectCss }} />
                        )}
                        <div className="text-xs p-1 truncate bg-card">{d.title}</div>
                      </button>
                      <button onClick={() => deleteDesign(d.id)}
                        className="absolute top-1 right-1 hidden group-hover:flex bg-background/90 rounded p-1">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-3 mt-3">
              <div className="space-y-1">
                <Label className="text-xs">Upload background</Label>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
                <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()} disabled={!!busy}>
                  {busy === "upload" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isAdmin ? " Upload to library" : " Use locally"}
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">AI generate</Label>
                <Input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe the background…" />
                <Button className="w-full" onClick={handleAI} disabled={!!busy}>
                  {busy === "ai" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate
                </Button>
                {!isAdmin && <p className="text-[11px] text-muted-foreground">AI results stay on this design. Admins can publish them to the library.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </main>
    </div>
  );
};

export default Designs;
