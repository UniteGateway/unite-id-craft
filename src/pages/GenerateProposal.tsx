import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Wand2, ArrowRight, Save, History } from "lucide-react";
import { toast } from "sonner";
import {
  PROJECT_TYPES,
  INVESTMENT_MODELS,
  computeSolarProject,
  toProposalVars,
  type SolarComputed,
} from "@/lib/solar-proposal-calc";

const InputSchema = z.object({
  project_name: z.string().trim().min(2, "Project name is required").max(120),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  project_type: z.string().optional(),
  capacity_mw: z.coerce.number().positive("Capacity must be > 0").max(500),
  investment_model: z.string().optional(),
  approx_budget: z.string().trim().max(60).optional().or(z.literal("")),
  custom_notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

interface SavedRow {
  id: string;
  project_name: string;
  location: string | null;
  capacity_mw: number;
  created_at: string;
  computed: SolarComputed;
  investment_model: string | null;
  project_type: string | null;
  custom_notes: string | null;
  approx_budget: string | null;
}

const GenerateProposal: React.FC = () => {
  const nav = useNavigate();
  const [projectName, setProjectName] = useState("SMR Vinay Iconia");
  const [location, setLocation] = useState("Gachibowli / Kondapur");
  const [projectType, setProjectType] = useState<string>("Gated Community");
  const [capacityMw, setCapacityMw] = useState<string>("1");
  const [investmentModel, setInvestmentModel] = useState<string>("PPA");
  const [approxBudget, setApproxBudget] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  const [recommending, setRecommending] = useState(false);
  const [aiRec, setAiRec] = useState<{ model: string; reasoning: string; confidence: string } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const computed = useMemo(
    () =>
      computeSolarProject({
        project_name: projectName,
        location,
        project_type: projectType,
        capacity_mw: Number(capacityMw) || 0,
        investment_model: investmentModel,
        approx_budget: approxBudget,
        custom_notes: customNotes,
      }),
    [projectName, location, projectType, capacityMw, investmentModel, approxBudget, customNotes],
  );

  const loadSaved = async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from("solar_proposals")
      .select("id,project_name,location,capacity_mw,created_at,computed,investment_model,project_type,custom_notes,approx_budget")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      toast.error("Could not load saved proposals");
    } else {
      setSaved((data ?? []) as unknown as SavedRow[]);
    }
    setLoadingList(false);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const validate = () => {
    const parsed = InputSchema.safeParse({
      project_name: projectName,
      location,
      project_type: projectType,
      capacity_mw: capacityMw,
      investment_model: investmentModel,
      approx_budget: approxBudget,
      custom_notes: customNotes,
    });
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(first || "Please review the form");
      return null;
    }
    return parsed.data;
  };

  const recommend = async () => {
    const v = validate();
    if (!v) return;
    setRecommending(true);
    setAiRec(null);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-investment-model", {
        body: {
          project_name: v.project_name,
          location: v.location,
          project_type: v.project_type,
          capacity_mw: v.capacity_mw,
          approx_budget: v.approx_budget,
          custom_notes: v.custom_notes,
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      const rec = data as { model: string; reasoning: string; confidence: string };
      setAiRec(rec);
      setInvestmentModel(rec.model);
      toast.success(`AI suggests: ${rec.model}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Recommendation failed";
      toast.error(msg);
    } finally {
      setRecommending(false);
    }
  };

  const generate = async (opts: { save: boolean }) => {
    const v = validate();
    if (!v) return;

    if (opts.save) {
      setSaving(true);
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;
      if (!userId) {
        toast.error("Please sign in to save proposals");
        setSaving(false);
        return;
      }
      const { error } = await supabase.from("solar_proposals").insert([
        {
          user_id: userId,
          project_name: v.project_name,
          location: v.location || null,
          project_type: v.project_type || null,
          capacity_mw: v.capacity_mw,
          investment_model: v.investment_model || null,
          approx_budget: v.approx_budget || null,
          custom_notes: v.custom_notes || null,
          computed: computed as unknown as Record<string, unknown>,
          ai_recommendation: (aiRec ?? null) as unknown as Record<string, unknown> | null,
        },
      ]);
      setSaving(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Proposal saved");
      loadSaved();
    }

    const vars = toProposalVars(
      {
        project_name: v.project_name,
        location: v.location,
        project_type: v.project_type,
        capacity_mw: v.capacity_mw,
        investment_model: v.investment_model,
      },
      computed,
    );
    sessionStorage.setItem("unite-solar:incoming-vars", JSON.stringify(vars));
    nav("/proposal-variable-slides?slide=cover");
  };

  const openSaved = (row: SavedRow) => {
    const vars = toProposalVars(
      {
        project_name: row.project_name,
        location: row.location ?? "",
        project_type: row.project_type ?? "",
        capacity_mw: row.capacity_mw,
        investment_model: row.investment_model ?? "",
      },
      row.computed,
    );
    sessionStorage.setItem("unite-solar:incoming-vars", JSON.stringify(vars));
    nav("/proposal-variable-slides?slide=cover");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-[env(safe-area-inset-bottom)]">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Generate Proposal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter project details — we&apos;ll auto-calculate financials and open the live slide deck.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Form */}
          <Card className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Project Name *</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. SMR Vinay Iconia"
                  maxLength={120}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Gachibowli / Kondapur"
                  maxLength={120}
                />
              </div>
              <div>
                <Label>Project Type</Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capacity (MW) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={capacityMw}
                  onChange={(e) => setCapacityMw(e.target.value)}
                />
              </div>
              <div>
                <Label>Investment Model</Label>
                <div className="flex gap-2">
                  <Select value={investmentModel} onValueChange={setInvestmentModel}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INVESTMENT_MODELS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={recommend}
                    disabled={recommending}
                    title="AI recommend"
                  >
                    {recommending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label>Approx Budget (optional)</Label>
                <Input
                  value={approxBudget}
                  onChange={(e) => setApproxBudget(e.target.value)}
                  placeholder="e.g. ₹4 Cr"
                  maxLength={60}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Custom Notes (optional)</Label>
                <Textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Anything specific about this project…"
                  rows={3}
                  maxLength={2000}
                />
              </div>
            </div>

            {aiRec && (
              <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  AI Recommendation: {aiRec.model}
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                    {aiRec.confidence}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{aiRec.reasoning}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => generate({ save: true })} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save & Open Deck
              </Button>
              <Button variant="secondary" onClick={() => generate({ save: false })} className="gap-2">
                Open Deck without Saving <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Computed preview */}
          <Card className="p-5 h-fit">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
              Auto-calculated
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="Capacity" value={`${computed.capacity_mw} MW`} />
              <Row label="Project Cost" value={`₹${computed.project_cost_cr} Cr`} />
              <Row label="Annual Generation" value={`${computed.annual_units_lakh} Lakh units`} />
              <Row label="Annual Savings" value={`₹${computed.annual_savings_cr} Cr`} />
              <Row label="Total Savings (life)" value={`₹${computed.total_savings_cr} Cr+`} />
              <Row label="Payback" value={`${computed.payback_years} Years`} />
              <Row label="O&M Cost" value={`₹${computed.om_cost_lakh_per_year} L/yr`} />
              <Row label="CO₂ Avoided" value={`${computed.co2_tons_per_year.toLocaleString("en-IN")} T/yr`} />
              <Row label="Project Life" value={`${computed.life_years} Years`} />
            </dl>
          </Card>
        </div>

        {/* Saved proposals */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Recent Proposals</h2>
          </div>
          {loadingList ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : saved.length === 0 ? (
            <div className="text-sm text-muted-foreground">No saved proposals yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {saved.map((row) => (
                <button
                  key={row.id}
                  onClick={() => openSaved(row)}
                  className="text-left rounded-xl border border-border bg-card hover:border-primary/50 transition-colors p-4"
                >
                  <div className="font-semibold truncate">{row.project_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {row.location ?? "—"} • {row.capacity_mw} MW
                  </div>
                  <div className="mt-2 text-xs">
                    ₹{row.computed?.project_cost_cr ?? "—"} Cr •{" "}
                    ₹{row.computed?.total_savings_cr ?? "—"} Cr savings
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-1.5 last:border-0">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-semibold tabular-nums">{value}</dd>
  </div>
);

export default GenerateProposal;