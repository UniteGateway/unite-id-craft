import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2, Plus, Save, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import {
  BoqLine,
  BUILTIN_RESIDENTIAL_COVERS,
  DEFAULT_RESIDENTIAL_TERMS,
  blankBoqLine,
  computeResidential,
  inr,
  recomputeBoqAmounts,
} from "@/lib/residential-presets";
import ResidentialDocument from "@/components/proposals/ResidentialDocument";
import { exportProposalPdf } from "@/lib/proposal-export";

type Row = {
  id: string;
  title: string;
  proposal_number: string | null;
  is_customised: boolean;
  preset_id: string | null;
  client_name: string | null;
  client_location: string | null;
  client_contact: string | null;
  client_email: string | null;
  capacity_kw: number | null;
  panel_wattage: number | null;
  panel_count: number | null;
  inverter_capacity: number | null;
  structure_type: string | null;
  cost_per_kw: number | null;
  boq: BoqLine[];
  terms_and_conditions: string | null;
  cover_image_url: string | null;
  cover_source: string | null;
};

const ResidentialProposalEditor: React.FC = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const presetKw = params.get("kw"); // "2".."10" or "custom"
  const nav = useNavigate();
  const { user } = useAuth();

  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- bootstrap ----------
  useEffect(() => {
    if (!user) return;
    if (id !== "new") {
      load(id!);
    } else {
      bootstrapNew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const load = async (rid: string) => {
    setLoading(true);
    const { data, error } = await supabase.from("residential_proposals").select("*").eq("id", rid).maybeSingle();
    setLoading(false);
    if (error || !data) { toast.error(error?.message || "Not found"); nav("/proposals"); return; }
    setRow({ ...(data as any), boq: ((data as any).boq || []) as BoqLine[] });
  };

  const bootstrapNew = async () => {
    if (!user) return;
    setLoading(true);
    let preset: any = null;
    const isCustom = !presetKw || presetKw === "custom";
    if (!isCustom) {
      const { data } = await supabase.from("residential_presets").select("*").eq("capacity_kw", Number(presetKw)).maybeSingle();
      preset = data;
    }
    const insert = {
      user_id: user.id,
      title: isCustom ? "Custom Residential Proposal" : `${presetKw} kW Residential Solar Proposal`,
      is_customised: isCustom,
      preset_id: preset?.id || null,
      capacity_kw: preset?.capacity_kw ?? (isCustom ? 5 : Number(presetKw)),
      panel_wattage: preset?.panel_wattage ?? 550,
      panel_count: preset?.panel_count ?? 0,
      inverter_capacity: preset?.inverter_capacity ?? (isCustom ? 5 : Number(presetKw)),
      structure_type: preset?.structure_type ?? "GI elevated rooftop structure",
      cost_per_kw: preset?.cost_per_kw ?? 55000,
      boq: preset?.boq ?? [],
      terms_and_conditions: preset?.terms_and_conditions ?? DEFAULT_RESIDENTIAL_TERMS,
    };
    const { data: created, error } = await supabase.from("residential_proposals").insert(insert).select("*").single();
    setLoading(false);
    if (error) { toast.error(error.message); nav("/proposals"); return; }
    nav(`/proposals/residential/${created.id}`, { replace: true });
  };

  // ---------- computed ----------
  const computed = useMemo(() => {
    if (!row) return computeResidential([], 0);
    return computeResidential(row.boq || [], Number(row.capacity_kw) || 0);
  }, [row]);

  // ---------- helpers ----------
  const update = (patch: Partial<Row>) => setRow((r) => (r ? { ...r, ...patch } : r));
  const updateBoqLine = (i: number, patch: Partial<BoqLine>) => {
    if (!row) return;
    const next = [...row.boq];
    next[i] = { ...next[i], ...patch };
    update({ boq: recomputeBoqAmounts(next) });
  };
  const addBoqLine = () => row && update({ boq: [...row.boq, blankBoqLine()] });
  const removeBoqLine = (i: number) => row && update({ boq: row.boq.filter((_, idx) => idx !== i) });

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase.from("residential_proposals").update({
      title: row.title,
      proposal_number: row.proposal_number,
      client_name: row.client_name,
      client_location: row.client_location,
      client_contact: row.client_contact,
      client_email: row.client_email,
      capacity_kw: row.capacity_kw,
      panel_wattage: row.panel_wattage,
      panel_count: row.panel_count,
      inverter_capacity: row.inverter_capacity,
      structure_type: row.structure_type,
      cost_per_kw: row.cost_per_kw,
      boq: row.boq as any,
      terms_and_conditions: row.terms_and_conditions,
      cover_image_url: row.cover_image_url,
      cover_source: row.cover_source,
      computed: computed as any,
    }).eq("id", row.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const onPickCover = (url: string, source: string) => update({ cover_image_url: url, cover_source: source });

  const onUploadCover = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/residential-covers/${row?.id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("proposals").upload(path, file, { upsert: true, contentType: file.type });
    if (error) return toast.error(error.message);
    const { data: pub } = supabase.storage.from("proposals").getPublicUrl(path);
    onPickCover(pub.publicUrl, "upload");
    toast.success("Cover uploaded");
  };

  const exportPdf = async () => {
    if (!row) return;
    setExporting(true);
    try {
      const fname = `${(row.title || "Residential-Proposal").replace(/\s+/g, "_")}.pdf`;
      await exportProposalPdf(fname);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !row) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => nav("/proposals")}><ArrowLeft className="h-4 w-4" /> Back</Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
            <Button size="sm" onClick={exportPdf} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          {/* LEFT: editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Proposal</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Title</Label><Input value={row.title} onChange={(e) => update({ title: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Proposal #</Label><Input value={row.proposal_number || ""} onChange={(e) => update({ proposal_number: e.target.value })} placeholder="US-RES-001" /></div>
                  <div><Label>Capacity (kW)</Label><Input type="number" value={row.capacity_kw || 0} onChange={(e) => update({ capacity_kw: +e.target.value })} disabled={!row.is_customised} /></div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="client">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="client">Client</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="boq">BOQ</TabsTrigger>
                <TabsTrigger value="cover">Cover</TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-3 mt-3">
                <div><Label>Client name</Label><Input value={row.client_name || ""} onChange={(e) => update({ client_name: e.target.value })} /></div>
                <div><Label>Location</Label><Input value={row.client_location || ""} onChange={(e) => update({ client_location: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Contact</Label><Input value={row.client_contact || ""} onChange={(e) => update({ client_contact: e.target.value })} /></div>
                  <div><Label>Email</Label><Input value={row.client_email || ""} onChange={(e) => update({ client_email: e.target.value })} /></div>
                </div>
              </TabsContent>

              <TabsContent value="system" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Panel wattage (Wp)</Label><Input type="number" value={row.panel_wattage || 0} onChange={(e) => update({ panel_wattage: +e.target.value })} /></div>
                  <div><Label>Panel count</Label><Input type="number" value={row.panel_count || 0} onChange={(e) => update({ panel_count: +e.target.value })} /></div>
                  <div><Label>Inverter (kW)</Label><Input type="number" value={row.inverter_capacity || 0} onChange={(e) => update({ inverter_capacity: +e.target.value })} /></div>
                  <div><Label>Cost / kW (₹)</Label><Input type="number" value={row.cost_per_kw || 0} onChange={(e) => update({ cost_per_kw: +e.target.value })} /></div>
                </div>
                <div><Label>Structure</Label><Input value={row.structure_type || ""} onChange={(e) => update({ structure_type: e.target.value })} /></div>
                <div>
                  <Label>Terms & Conditions</Label>
                  <Textarea rows={10} value={row.terms_and_conditions || ""} onChange={(e) => update({ terms_and_conditions: e.target.value })} />
                </div>
              </TabsContent>

              <TabsContent value="boq" className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Edit each line. Amount auto = qty × rate.</div>
                  <Button size="sm" variant="outline" onClick={addBoqLine}><Plus className="h-3.5 w-3.5" /> Add</Button>
                </div>
                <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                  {row.boq.map((l, i) => (
                    <div key={i} className="rounded border p-2 space-y-1">
                      <div className="flex gap-2">
                        <Input className="text-xs" value={l.item} onChange={(e) => updateBoqLine(i, { item: e.target.value })} placeholder="Item description" />
                        <Button size="icon" variant="ghost" onClick={() => removeBoqLine(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        <Input className="text-xs" type="number" value={l.qty} onChange={(e) => updateBoqLine(i, { qty: +e.target.value })} placeholder="Qty" />
                        <Input className="text-xs" value={l.unit} onChange={(e) => updateBoqLine(i, { unit: e.target.value })} placeholder="Unit" />
                        <Input className="text-xs" type="number" value={l.rate} onChange={(e) => updateBoqLine(i, { rate: +e.target.value })} placeholder="Rate" />
                        <div className="text-xs text-right self-center font-bold">{inr(l.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded bg-muted p-3 text-xs space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><b>{inr(computed.boqSubtotal)}</b></div>
                  <div className="flex justify-between"><span>GST</span><b>{inr(computed.gstTotal)}</b></div>
                  <div className="flex justify-between text-sm"><span>Total</span><b className="text-primary">{inr(computed.totalCost)}</b></div>
                </div>
              </TabsContent>

              <TabsContent value="cover" className="space-y-3 mt-3">
                <div>
                  <Label className="text-xs">Built-in covers</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {BUILTIN_RESIDENTIAL_COVERS.map((c) => (
                      <button key={c.id} onClick={() => onPickCover(c.url, `builtin:${c.id}`)} className={`relative rounded overflow-hidden border-2 transition ${row.cover_image_url === c.url ? "border-primary" : "border-transparent hover:border-muted-foreground/30"}`}>
                        <img src={c.url} alt={c.name} className="aspect-[210/297] object-cover w-full" loading="lazy" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 text-center">{c.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Or upload your own (A4 portrait recommended)</Label>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUploadCover(e.target.files[0])} />
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Upload cover image
                  </Button>
                </div>
                {row.cover_image_url && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => onPickCover("", "")}>
                    <ImageIcon className="h-3.5 w-3.5" /> Remove cover
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT: live document */}
          <div className="bg-muted/40 rounded-lg p-4 overflow-auto">
            <div style={{ transform: "scale(0.72)", transformOrigin: "top center" }}>
              <ResidentialDocument
                title={row.title}
                proposalNumber={row.proposal_number}
                client={{ name: row.client_name || "", location: row.client_location || "", contact: row.client_contact || "", email: row.client_email || "" }}
                capacityKw={Number(row.capacity_kw) || 0}
                panelCount={Number(row.panel_count) || 0}
                panelWattage={Number(row.panel_wattage) || 0}
                inverterCapacity={Number(row.inverter_capacity) || 0}
                structureType={row.structure_type || ""}
                boq={row.boq}
                terms={row.terms_and_conditions || DEFAULT_RESIDENTIAL_TERMS}
                computed={computed}
                coverUrl={row.cover_image_url || undefined}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResidentialProposalEditor;