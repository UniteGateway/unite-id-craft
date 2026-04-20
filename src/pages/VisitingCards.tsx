import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import PageBanner, { BANNERS } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Download, Pencil, Copy, Trash2, FileStack, LibraryBig } from "lucide-react";
import { toast } from "sonner";
import VisitingCardPreview from "@/components/visiting/VisitingCardPreview";
import CardDataForm from "@/components/visiting/CardDataForm";
import TemplateLibrary, { type PickedTemplate } from "@/components/visiting/TemplateLibrary";
import PrintSheetDialog from "@/components/visiting/PrintSheetDialog";
import { type CardZone, exportSingleCard, loadCard } from "@/lib/visiting-card-print";

type Mode = "library" | "edit" | "mine";

const VisitingCards: React.FC = () => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const editId = params.get("edit");
  const initialTab = (params.get("tab") as Mode) || (editId ? "edit" : "library");

  const [mode, setMode] = useState<Mode>(initialTab);
  const [imageUrl, setImageUrl] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [zones, setZones] = useState<CardZone[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("Untitled card");
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [busy, setBusy] = useState("");
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [myCards, setMyCards] = useState<any[]>([]);
  const [savedCardId, setSavedCardId] = useState<string | null>(editId);

  useEffect(() => { if (!loading && !user) nav("/auth"); }, [user, loading, nav]);

  const reloadTemplates = () => {
    if (!user) return;
    supabase.from("visiting_card_templates")
      .select("id, name, image_url, field_zones, source")
      .order("created_at", { ascending: false })
      .then(({ data }) => setSavedTemplates(data || []));
  };
  const reloadCards = () => {
    if (!user) return;
    supabase.from("visiting_cards")
      .select("id, title, field_values, updated_at, template_id, visiting_card_templates(image_url, field_zones, name)")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setMyCards(data || []));
  };
  useEffect(() => { reloadTemplates(); reloadCards(); }, [user]);

  // Load card if ?edit=
  useEffect(() => {
    if (!editId || !user) return;
    (async () => {
      const { data } = await supabase.from("visiting_cards")
        .select("*, visiting_card_templates(*)").eq("id", editId).maybeSingle();
      if (data) {
        setTitle(data.title);
        setValues(data.field_values as any);
        setSavedCardId(data.id);
        const tpl = (data as any).visiting_card_templates;
        if (tpl) {
          setTemplateId(tpl.id);
          setImageUrl(tpl.image_url);
          setZones(tpl.field_zones as any);
        }
        setMode("edit");
      }
    })();
  }, [editId, user]);

  const pickTemplate = (t: PickedTemplate) => {
    setImageUrl(t.imageUrl);
    setZones(t.zones);
    setTemplateId(t.id || null);
    setTitle(t.name + " — my card");
    setValues({});
    setSavedCardId(null);
    setParams({ tab: "edit" }, { replace: true });
    setMode("edit");
  };

  const cloneCard = (c: any) => {
    const tpl = c.visiting_card_templates;
    if (!tpl) { toast.error("Template missing for this card"); return; }
    setImageUrl(tpl.image_url);
    setZones(tpl.field_zones as any);
    setTemplateId(tpl.id);
    setTitle(c.title + " (copy)");
    setValues({ ...(c.field_values || {}) });
    setSavedCardId(null);
    setParams({ tab: "edit" }, { replace: true });
    setMode("edit");
    toast.success("Cloned — edit and save as a new card");
  };

  const openCard = (c: any) => {
    setParams({ edit: c.id, tab: "edit" }, { replace: true });
  };

  const deleteCard = async (id: string) => {
    if (!confirm("Delete this card?")) return;
    await supabase.from("visiting_cards").delete().eq("id", id);
    reloadCards();
    if (savedCardId === id) {
      setSavedCardId(null);
      setMode("mine");
    }
  };

  const ensureTemplateInDb = async (): Promise<string | null> => {
    if (!user) return null;
    if (templateId) return templateId;
    if (!imageUrl) return null;
    setBusy("Importing template...");
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const ext = (blob.type.split("/")[1] || "png").split("+")[0];
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("card-templates").upload(path, blob);
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from("card-templates").getPublicUrl(path);
    const { data: tpl, error: tplErr } = await supabase.from("visiting_card_templates")
      .insert({ user_id: user.id, name: title || "Imported template", source: "upload", image_url: pub.publicUrl, field_zones: zones as any })
      .select().single();
    if (tplErr) throw tplErr;
    setTemplateId(tpl.id);
    setImageUrl(pub.publicUrl);
    reloadTemplates();
    return tpl.id;
  };

  const saveCard = async () => {
    if (!user || !imageUrl) { toast.error("Pick a template first"); return; }
    try {
      const tplId = await ensureTemplateInDb();
      if (!tplId) return;
      // Persist any per-zone font/typography tweaks back to the template
      await supabase.from("visiting_card_templates").update({ field_zones: zones as any }).eq("id", tplId);

      setBusy("Saving...");
      const payload = { user_id: user.id, template_id: tplId, title, field_values: values };
      if (savedCardId) {
        await supabase.from("visiting_cards").update(payload).eq("id", savedCardId);
      } else {
        const { data } = await supabase.from("visiting_cards").insert(payload).select().single();
        if (data) {
          setSavedCardId(data.id);
          setParams({ edit: data.id, tab: "edit" }, { replace: true });
        }
      }
      reloadCards();
      toast.success("Saved");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally { setBusy(""); }
  };

  const downloadSingle = async () => {
    if (!imageUrl) return;
    setBusy("Building PDF...");
    try {
      const card = await loadCard(imageUrl, zones, values);
      await exportSingleCard(card, `${title || "card"}.pdf`);
    } catch (e: any) { toast.error(e.message); }
    setBusy("");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <PageBanner
          image={BANNERS.visiting}
          eyebrow="Business Cards"
          title="Design your visiting card"
          subtitle="Pick a design from the library, fill in your data, and export print-ready sheets with bleed and crop marks."
          height="sm"
        />
      </div>

      <main className="mx-auto max-w-7xl p-4">
        <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setParams({ tab: v }, { replace: true }); }}>
          <TabsList>
            <TabsTrigger value="library"><LibraryBig className="h-4 w-4 mr-1" />Templates</TabsTrigger>
            <TabsTrigger value="edit" disabled={!imageUrl}><Pencil className="h-4 w-4 mr-1" />Edit Card</TabsTrigger>
            <TabsTrigger value="mine"><FileStack className="h-4 w-4 mr-1" />My Cards ({myCards.length})</TabsTrigger>
          </TabsList>

          {/* LIBRARY ========================= */}
          <TabsContent value="library" className="pt-4">
            {user && (
              <TemplateLibrary
                userId={user.id}
                savedTemplates={savedTemplates}
                onPick={pickTemplate}
                onSavedChange={reloadTemplates}
              />
            )}
          </TabsContent>

          {/* EDIT ============================ */}
          <TabsContent value="edit" className="pt-4">
            <div className="grid lg:grid-cols-[1fr,360px] gap-6">
              <section className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-sm font-semibold" />
                  <Button onClick={saveCard} disabled={!!busy || !imageUrl}>
                    <Save className="h-4 w-4" /> {savedCardId ? "Update" : "Save"}
                  </Button>
                  <Button variant="outline" onClick={downloadSingle} disabled={!imageUrl || !!busy}>
                    <Download className="h-4 w-4" /> Single PDF
                  </Button>
                  <PrintSheetDialog imageUrl={imageUrl} zones={zones} values={values} filename={`${title || "card"}-sheet.pdf`} />
                </div>

                {imageUrl ? (
                  <VisitingCardPreview
                    imageUrl={imageUrl} zones={zones} values={values}
                    selectedZone={selectedZone} onZoneClick={setSelectedZone}
                    onValueChange={(role, next) => setValues((v) => ({ ...v, [role]: next }))}
                    onZoneChange={(idx, nz) => setZones((prev) => prev.map((p, i) => i === idx ? nz : p))}
                  />
                ) : (
                  <div className="aspect-[3.5/2] rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground bg-muted/30">
                    Pick a template from the Templates tab to begin
                  </div>
                )}
                {busy && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />{busy}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Tip: drag a field to reposition it, drag the corner handle to resize. Double-click to edit text inline.
                </p>
              </section>

              <aside>
                {imageUrl ? (
                  <CardDataForm
                    imageUrl={imageUrl}
                    zones={zones}
                    values={values}
                    onValueChange={(role, v) => setValues((prev) => ({ ...prev, [role]: v }))}
                    onZoneChange={(idx, z) => setZones((prev) => prev.map((p, i) => i === idx ? z : p))}
                    selectedZone={selectedZone}
                    setSelectedZone={setSelectedZone}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">No template selected.</p>
                )}
              </aside>
            </div>
          </TabsContent>

          {/* MY CARDS ======================== */}
          <TabsContent value="mine" className="pt-4">
            {myCards.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border p-12 text-center text-muted-foreground">
                You haven't saved any cards yet. Pick a template and save your first card.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCards.map((c) => {
                  const tpl = c.visiting_card_templates;
                  return (
                    <div key={c.id} className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
                      <button onClick={() => openCard(c)} className="block w-full aspect-[3.5/2] relative bg-muted">
                        {tpl?.image_url && <img src={tpl.image_url} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />}
                      </button>
                      <div className="p-2 space-y-2">
                        <p className="text-sm font-semibold truncate">{c.title}</p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => openCard(c)}>
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => cloneCard(c)} title="Clone with same data">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteCard(c.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default VisitingCards;
