import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Loader2, Save, Sparkles, Upload, Plus, Trash2, ArrowLeft } from "lucide-react";
import ProposalDocument, { type ProposalDoc } from "@/components/proposals/ProposalDocument";
import { computeProposal, inr } from "@/lib/proposal-calc";
import { exportProposalPdf } from "@/lib/proposal-export";

const empty: ProposalDoc = {
  title: "Untitled Solar Proposal",
  client_name: "", client_location: "", client_contact: "", client_email: "",
  project_type: "Ground", capacity_kw: 100, soil_type: "Moram",
  panel_count: 182, panel_wattage: 550, inverter_capacity: 100, structure_type: "MS Hot-Dip Galvanised",
  boundary_length_rmt: 120, wall_type: "RCC", footing_count: 60,
  cost_per_kw: 42000, civil_cost_per_rmt: 1800, footing_cost: 2500, electricity_tariff: 9,
  addons: [],
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

const ProposalEditor: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState<ProposalDoc>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProposalDoc>(k: K, v: ProposalDoc[K]) => setDoc((d) => ({ ...d, [k]: v }));
  const setNum = (k: keyof ProposalDoc) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, (e.target.value === "" ? undefined : +e.target.value) as any);

  // Load
  useEffect(() => {
    if (!id || id === "new" || !user) return;
    setLoading(true);
    supabase.from("proposals").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      if (!data) { toast.error("Proposal not found"); nav("/proposals"); return; }
      setDoc({
        ...empty, ...data,
        addons: Array.isArray(data.addons) ? (data.addons as any) : [],
      } as ProposalDoc);
    });
  }, [id, user, nav]);

  const computed = useMemo(() => computeProposal(doc), [doc]);

  const save = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    setSaving(true);
    const payload: any = {
      user_id: user.id,
      title: doc.title || "Untitled Proposal",
      proposal_number: doc.proposal_number || null,
      cover_image_url: doc.cover_image_url || null,
      cover_source: (doc as any).cover_source || null,
      client_name: doc.client_name || null,
      client_location: doc.client_location || null,
      client_contact: doc.client_contact || null,
      client_email: doc.client_email || null,
      project_type: doc.project_type || null,
      capacity_kw: doc.capacity_kw ?? null,
      soil_type: doc.soil_type || null,
      panel_count: doc.panel_count ?? null,
      panel_wattage: doc.panel_wattage ?? null,
      inverter_capacity: doc.inverter_capacity ?? null,
      structure_type: doc.structure_type || null,
      boundary_length_rmt: doc.boundary_length_rmt ?? null,
      wall_type: doc.wall_type || null,
      footing_count: doc.footing_count ?? null,
      cost_per_kw: doc.cost_per_kw ?? null,
      civil_cost_per_rmt: doc.civil_cost_per_rmt ?? null,
      footing_cost: doc.footing_cost ?? null,
      electricity_tariff: doc.electricity_tariff ?? null,
      addons: doc.addons || [],
      computed,
    };
    const op = id && id !== "new"
      ? supabase.from("proposals").update(payload).eq("id", id).select().single()
      : supabase.from("proposals").insert(payload).select().single();
    const { data, error } = await op;
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    if (data && (!id || id === "new")) nav(`/proposals/${data.id}`, { replace: true });
  };

  const generateCover = async () => {
    setGeneratingCover(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-proposal-cover", {
        body: {
          clientName: doc.client_name,
          location: doc.client_location,
          capacity: doc.capacity_kw,
          projectType: doc.project_type,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const imgUrl = (data as any).image as string;
      // Persist to storage so it survives PDF export
      if (user && imgUrl?.startsWith("data:")) {
        const blob = await (await fetch(imgUrl)).blob();
        const path = `${user.id}/covers/${Date.now()}.png`;
        const { error: upErr } = await supabase.storage.from("proposals").upload(path, blob, { contentType: blob.type, upsert: true });
        if (!upErr) {
          const { data: pub } = supabase.storage.from("proposals").getPublicUrl(path);
          setDoc((d) => ({ ...d, cover_image_url: pub.publicUrl, ...({ cover_source: "ai" } as any) }));
          toast.success("Cover generated");
          return;
        }
      }
      setDoc((d) => ({ ...d, cover_image_url: imgUrl, ...({ cover_source: "ai" } as any) }));
      toast.success("Cover generated");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate cover");
    } finally {
      setGeneratingCover(false);
    }
  };

  const onUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !user) return;
    const path = `${user.id}/covers/${Date.now()}-${f.name}`;
    const { error } = await supabase.storage.from("proposals").upload(path, f, { contentType: f.type, upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data: pub } = supabase.storage.from("proposals").getPublicUrl(path);
    setDoc((d) => ({ ...d, cover_image_url: pub.publicUrl, ...({ cover_source: "upload" } as any) }));
    toast.success("Cover uploaded");
  };

  const downloadPdf = async () => {
    setExporting(true);
    try {
      const fname = `${(doc.title || "proposal").replace(/[^a-z0-9]+/gi, "_")}.pdf`;
      await exportProposalPdf(fname);
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const addAddon = () => set("addons", [...(doc.addons || []), { label: "AMC (1 yr)", amount: 25000 }]);
  const updAddon = (i: number, k: "label" | "amount", v: string) => {
    const next = [...(doc.addons || [])];
    (next[i] as any)[k] = k === "amount" ? +v || 0 : v;
    set("addons", next);
  };
  const delAddon = (i: number) => set("addons", (doc.addons || []).filter((_, j) => j !== i));

  if (loading) return (
    <div className="min-h-screen bg-background"><AppNav />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => nav("/proposals")}><ArrowLeft className="h-4 w-4" /> All proposals</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
            <Button onClick={downloadPdf} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left: form */}
          <Card className="lg:sticky lg:top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <CardContent className="p-4 space-y-4">
              <Field label="Proposal title">
                <Input value={doc.title || ""} onChange={(e) => set("title", e.target.value)} />
              </Field>

              <Tabs defaultValue="cover">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="cover">Cover</TabsTrigger>
                  <TabsTrigger value="client">Client</TabsTrigger>
                  <TabsTrigger value="tech">Tech</TabsTrigger>
                  <TabsTrigger value="civil">Civil</TabsTrigger>
                  <TabsTrigger value="money">₹</TabsTrigger>
                </TabsList>

                <TabsContent value="cover" className="space-y-3 pt-3">
                  {doc.cover_image_url && (
                    <img src={doc.cover_image_url} alt="cover" className="w-full aspect-[210/297] object-cover rounded-md border" />
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={generateCover} disabled={generatingCover} className="w-full">
                      {generatingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} AI cover
                    </Button>
                    <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full">
                      <Upload className="h-4 w-4" /> Upload
                    </Button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUploadCover} />
                  </div>
                  {doc.cover_image_url && (
                    <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={() => set("cover_image_url", "")}>
                      Remove cover
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="client" className="space-y-3 pt-3">
                  <Field label="Client name"><Input value={doc.client_name || ""} onChange={(e) => set("client_name", e.target.value)} /></Field>
                  <Field label="Location"><Input value={doc.client_location || ""} onChange={(e) => set("client_location", e.target.value)} /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Contact"><Input value={doc.client_contact || ""} onChange={(e) => set("client_contact", e.target.value)} /></Field>
                    <Field label="Email"><Input value={doc.client_email || ""} onChange={(e) => set("client_email", e.target.value)} /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Project type">
                      <Select value={doc.project_type} onValueChange={(v) => set("project_type", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ground">Ground</SelectItem>
                          <SelectItem value="Rooftop">Rooftop</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Capacity (kW)"><Input type="number" value={doc.capacity_kw ?? ""} onChange={setNum("capacity_kw")} /></Field>
                  </div>
                  <Field label="Soil type">
                    <Select value={doc.soil_type} onValueChange={(v) => set("soil_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Moram">Moram</SelectItem>
                        <SelectItem value="Rock">Rock</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </TabsContent>

                <TabsContent value="tech" className="space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Panel count"><Input type="number" value={doc.panel_count ?? ""} onChange={setNum("panel_count")} /></Field>
                    <Field label="Panel Wp"><Input type="number" value={doc.panel_wattage ?? ""} onChange={setNum("panel_wattage")} /></Field>
                  </div>
                  <Field label="Inverter (kW)"><Input type="number" value={doc.inverter_capacity ?? ""} onChange={setNum("inverter_capacity")} /></Field>
                  <Field label="Structure type"><Input value={doc.structure_type || ""} onChange={(e) => set("structure_type", e.target.value)} /></Field>
                </TabsContent>

                <TabsContent value="civil" className="space-y-3 pt-3">
                  <Field label="Boundary (RMT)"><Input type="number" value={doc.boundary_length_rmt ?? ""} onChange={setNum("boundary_length_rmt")} /></Field>
                  <Field label="Wall type">
                    <Select value={doc.wall_type} onValueChange={(v) => set("wall_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RCC">RCC</SelectItem>
                        <SelectItem value="AAC">AAC</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Footing count"><Input type="number" value={doc.footing_count ?? ""} onChange={setNum("footing_count")} /></Field>
                </TabsContent>

                <TabsContent value="money" className="space-y-3 pt-3">
                  <Field label="Cost per kW (₹)"><Input type="number" value={doc.cost_per_kw ?? ""} onChange={setNum("cost_per_kw")} /></Field>
                  <Field label="Civil cost / RMT (₹)"><Input type="number" value={doc.civil_cost_per_rmt ?? ""} onChange={setNum("civil_cost_per_rmt")} /></Field>
                  <Field label="Footing cost (₹)"><Input type="number" value={doc.footing_cost ?? ""} onChange={setNum("footing_cost")} /></Field>
                  <Field label="Electricity tariff (₹/unit)"><Input type="number" step="0.01" value={doc.electricity_tariff ?? ""} onChange={setNum("electricity_tariff")} /></Field>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs">Add-ons</Label>
                      <Button variant="ghost" size="sm" onClick={addAddon}><Plus className="h-3.5 w-3.5" /> Add</Button>
                    </div>
                    <div className="space-y-2">
                      {(doc.addons || []).map((a, i) => (
                        <div key={i} className="flex gap-1.5">
                          <Input value={a.label} onChange={(e) => updAddon(i, "label", e.target.value)} className="text-xs" />
                          <Input type="number" value={a.amount} onChange={(e) => updAddon(i, "amount", e.target.value)} className="text-xs w-28" />
                          <Button variant="ghost" size="icon" onClick={() => delAddon(i)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{inr(computed.subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span className="font-medium">{inr(computed.gstTotal)}</span></div>
                    <div className="flex justify-between text-sm pt-1 border-t"><span className="font-bold">Total</span><span className="font-bold text-primary">{inr(computed.totalCost)}</span></div>
                    <div className="flex justify-between text-emerald-600"><span>Suggested (+20%)</span><span className="font-medium">{inr(computed.suggestedSellingPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">ROI</span><span className="font-medium">{computed.roiMonths.toFixed(1)} mo</span></div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right: live preview (also the source for PDF export) */}
          <div className="overflow-x-auto">
            <div className="min-w-[210mm] origin-top-left scale-[0.78] sm:scale-90 lg:scale-100">
              <ProposalDocument doc={doc} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProposalEditor;
