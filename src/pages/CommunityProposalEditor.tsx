import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Download, Image as ImageIcon, Loader2, Save, Sparkles } from "lucide-react";
import {
  computeCommunity, recommendModel, type CommunityInputs, type CommunityComputed,
  type CommunityTheme, inr,
} from "@/lib/community-calc";
import CommunitySlideDeck, { type SlideContent } from "@/components/community/CommunitySlideDeck";
import SlideEditor from "@/components/community/SlideEditor";
import { exportCommunityDeckPdf } from "@/lib/community-export";

const empty: CommunityInputs = {
  community_name: "", location: "", blocks: 4,
  rooftop_area_sft: 80000, monthly_units: 271236, monthly_bill: 3036352,
  sanction_load_kw: 0, roof_type: "Flat",
  preferred_model: "Hybrid", target_savings_pct: 75,
  investor_required: true, theme: "Dark Premium",
  energy_charge_per_unit: undefined,
  fixed_monthly_charges: 0,
  tax_pct: 5,
  ppa_tariff: 7.25,
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

const CommunityProposalEditor: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [inputs, setInputs] = useState<CommunityInputs>(empty);
  const [title, setTitle] = useState("Untitled Community Proposal");
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [regenIdx, setRegenIdx] = useState<number | null>(null);

  const set = <K extends keyof CommunityInputs>(k: K, v: CommunityInputs[K]) =>
    setInputs((d) => ({ ...d, [k]: v }));
  const setNum = (k: keyof CommunityInputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, (e.target.value === "" ? undefined : +e.target.value) as any);

  const computed: CommunityComputed = useMemo(() => computeCommunity(inputs), [inputs]);
  const recommendation = useMemo(() => recommendModel(inputs), [inputs]);

  // Load
  useEffect(() => {
    if (!id || id === "new" || !user) return;
    setLoading(true);
    supabase.from("community_proposals").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      if (!data) { toast.error("Not found"); nav("/proposals"); return; }
      setTitle(data.title || "Untitled");
      setInputs({
        community_name: data.community_name || "",
        location: data.location || "",
        blocks: data.blocks || 0,
        rooftop_area_sft: Number(data.rooftop_area_sft) || 0,
        monthly_units: Number(data.monthly_units) || 0,
        monthly_bill: Number(data.monthly_bill) || 0,
        sanction_load_kw: Number(data.sanction_load_kw) || 0,
        roof_type: data.roof_type || "Flat",
        preferred_model: (data.preferred_model as any) || "Hybrid",
        target_savings_pct: Number(data.target_savings_pct) || 75,
        investor_required: !!data.investor_required,
        theme: (data.theme as CommunityTheme) || "Dark Premium",
        energy_charge_per_unit: (data.computed as any)?.energyChargeInput || undefined,
        fixed_monthly_charges: (data.computed as any)?.fixedMonthlyCharges ?? 0,
        tax_pct: (data.computed as any)?.taxPctInput ?? 5,
        ppa_tariff: (data.computed as any)?.solarTariff || 7.25,
      });
      setSlides(Array.isArray(data.slides) ? (data.slides as any) : []);
      setCoverImageUrl(data.cover_image_url || null);
    });
  }, [id, user, nav]);

  const validate = (): string | null => {
    if (!inputs.community_name?.trim()) return "Community name is required";
    if (!inputs.location?.trim()) return "Location is required";
    if (!inputs.monthly_units || inputs.monthly_units <= 0) return "Monthly units must be > 0";
    if (!inputs.monthly_bill || inputs.monthly_bill <= 0) return "Monthly bill must be > 0";
    if (!inputs.rooftop_area_sft || inputs.rooftop_area_sft <= 0) return "Rooftop area must be > 0";
    return null;
  };

  const generate = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-community-proposal", {
        body: { inputs, computed, recommendation },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const arr = (data as any).slides as SlideContent[];
      if (!Array.isArray(arr) || arr.length === 0) throw new Error("AI returned no slides");
      setSlides(arr);
      toast.success(`Generated ${arr.length} slides`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const generateCover = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setGeneratingCover(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-community-cover", {
        body: {
          theme: inputs.theme,
          communityName: inputs.community_name,
          location: inputs.location,
          capacityKw: computed.recommendedCapacityKw,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setCoverImageUrl((data as any).image);
      toast.success("Cover image generated");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate cover");
    } finally {
      setGeneratingCover(false);
    }
  };

  const regenerateSlide = async (index: number, instruction?: string) => {
    setRegenIdx(index);
    try {
      const { data, error } = await supabase.functions.invoke("regenerate-community-slide", {
        body: {
          inputs, computed, recommendation,
          slideTitle: slides[index]?.title || `Slide ${index + 1}`,
          currentSlide: slides[index],
          instruction,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const slide = (data as any).slide as SlideContent;
      setSlides((prev) => prev.map((s, i) => (i === index ? slide : s)));
      toast.success(`Slide ${index + 1} regenerated`);
    } catch (e: any) {
      toast.error(e.message || "Failed to regenerate slide");
    } finally {
      setRegenIdx(null);
    }
  };

  const save = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    const err = validate();
    if (err) { toast.error(err); return; }
    setSaving(true);
    const payload: any = {
      user_id: user.id,
      title: title || "Untitled Community Proposal",
      community_name: inputs.community_name || null,
      location: inputs.location || null,
      blocks: inputs.blocks ?? null,
      rooftop_area_sft: inputs.rooftop_area_sft ?? null,
      monthly_units: inputs.monthly_units ?? null,
      monthly_bill: inputs.monthly_bill ?? null,
      sanction_load_kw: inputs.sanction_load_kw ?? null,
      roof_type: inputs.roof_type || null,
      preferred_model: inputs.preferred_model || null,
      target_savings_pct: inputs.target_savings_pct ?? null,
      investor_required: !!inputs.investor_required,
      theme: inputs.theme || "Dark Premium",
      computed,
      slides,
      cover_image_url: coverImageUrl,
    };
    const op = id && id !== "new"
      ? supabase.from("community_proposals").update(payload).eq("id", id).select().single()
      : supabase.from("community_proposals").insert(payload).select().single();
    const { data, error } = await op;
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    if (data && (!id || id === "new")) nav(`/proposals/community/${data.id}`, { replace: true });
  };

  const downloadPdf = async () => {
    if (slides.length === 0) { toast.error("Generate the deck first"); return; }
    setExporting(true);
    try {
      const fname = `${(title || "community-proposal").replace(/[^a-z0-9]+/gi, "_")}.pdf`;
      await exportCommunityDeckPdf(fname);
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background"><AppNav />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => nav("/proposals")}>
            <ArrowLeft className="h-4 w-4" /> All proposals
          </Button>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={generateCover} disabled={generatingCover}>
              {generatingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />} {coverImageUrl ? "Regenerate cover" : "Generate cover"}
            </Button>
            <Button variant="outline" onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate slides (AI)
            </Button>
            <Button variant="outline" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
            <Button onClick={downloadPdf} disabled={exporting || slides.length === 0}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Inputs */}
          <Card className="lg:sticky lg:top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <CardContent className="p-4 space-y-3">
              <Field label="Proposal title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Community name *">
                <Input value={inputs.community_name || ""} onChange={(e) => set("community_name", e.target.value)} />
              </Field>
              <Field label="Location *">
                <Input value={inputs.location || ""} onChange={(e) => set("location", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Blocks"><Input type="number" value={inputs.blocks ?? ""} onChange={setNum("blocks")} /></Field>
                <Field label="Roof type">
                  <Select value={inputs.roof_type} onValueChange={(v) => set("roof_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Rooftop area (SFT) *">
                <Input type="number" value={inputs.rooftop_area_sft ?? ""} onChange={setNum("rooftop_area_sft")} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Monthly units *"><Input type="number" value={inputs.monthly_units ?? ""} onChange={setNum("monthly_units")} /></Field>
                <Field label="Monthly bill (₹) *"><Input type="number" value={inputs.monthly_bill ?? ""} onChange={setNum("monthly_bill")} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Sanction load (kW)"><Input type="number" value={inputs.sanction_load_kw ?? ""} onChange={setNum("sanction_load_kw")} /></Field>
                <Field label="Target savings %"><Input type="number" value={inputs.target_savings_pct ?? ""} onChange={setNum("target_savings_pct")} /></Field>
              </div>
              <Field label="Preferred model">
                <Select value={inputs.preferred_model} onValueChange={(v) => set("preferred_model", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PPA">PPA (Zero Investment)</SelectItem>
                    <SelectItem value="CAPEX">CAPEX (Self Investment)</SelectItem>
                    <SelectItem value="Hybrid">Hybrid (SPV)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center justify-between rounded-md border p-2.5">
                <Label className="text-xs">Investor option required</Label>
                <Switch checked={!!inputs.investor_required} onCheckedChange={(v) => set("investor_required", v)} />
              </div>
              <Field label="Theme">
                <Select value={inputs.theme} onValueChange={(v) => set("theme", v as CommunityTheme)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dark Premium">Dark Premium</SelectItem>
                    <SelectItem value="Corporate Blue">Corporate Blue</SelectItem>
                    <SelectItem value="Green">Green Sustainability</SelectItem>
                    <SelectItem value="Luxury Gold">Luxury Gold</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="rounded-md border p-3 space-y-1.5 bg-muted/30 mt-3">
                <div className="text-xs font-semibold text-muted-foreground">Live Computed</div>
                <div className="text-xs flex justify-between"><span>Recommended capacity</span><span className="font-bold">{computed.recommendedCapacityKw} kW</span></div>
                <div className="text-xs flex justify-between"><span>Solar offset</span><span className="font-bold">{computed.solarOffsetPct}%</span></div>
                <div className="text-xs flex justify-between"><span>Project cost</span><span className="font-bold">{inr(computed.projectCost)}</span></div>
                <div className="text-xs flex justify-between"><span>Monthly savings</span><span className="font-bold">{inr(computed.monthlySavings)}</span></div>
                <div className="text-xs flex justify-between"><span>Payback</span><span className="font-bold">{computed.paybackYears} yrs</span></div>
                <div className="text-xs flex justify-between"><span>Recommended model</span><span className="font-bold text-primary">{recommendation}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="space-y-4">
            {slides.length === 0 ? (
              <Card><CardContent className="py-16 text-center space-y-3">
                <Sparkles className="h-10 w-10 mx-auto text-primary" />
                <h3 className="font-bold text-lg">No slides yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Fill in community details on the left, then click <b>Generate slides (AI)</b> to produce
                  a 16-slide investor-ready deck themed in <b>{inputs.theme}</b>.
                </p>
                <Button onClick={generate} disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate slides
                </Button>
              </CardContent></Card>
            ) : (
              <>
                <SlideEditor
                  slides={slides}
                  onChange={setSlides}
                  onRegenerate={regenerateSlide}
                  regeneratingIndex={regenIdx}
                />
                <div className="overflow-auto rounded-lg border bg-muted p-4">
                  <div style={{ transform: "scale(0.55)", transformOrigin: "top left", width: "fit-content" }}>
                    <CommunitySlideDeck inputs={inputs} computed={computed} recommendation={recommendation} slides={slides} coverImageUrl={coverImageUrl} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityProposalEditor;