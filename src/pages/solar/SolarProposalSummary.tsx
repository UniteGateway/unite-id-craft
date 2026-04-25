import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SolarShell from "@/components/solar/SolarShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Sun,
  Zap,
  TrendingUp,
  Leaf,
  Calendar,
  IndianRupee,
  Wrench,
} from "lucide-react";
import {
  computeSolarProject,
  toProposalVars,
  type SolarComputed,
} from "@/lib/solar-proposal-calc";

interface ProposalRow {
  id: string;
  project_name: string;
  location: string | null;
  project_type: string | null;
  capacity_mw: number;
  investment_model: string | null;
  approx_budget: string | null;
  custom_notes: string | null;
  computed: SolarComputed;
  overrides: Partial<SolarComputed> | null;
  ai_recommendation: { model: string; reasoning: string; confidence: string } | null;
}

const SolarProposalSummary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [row, setRow] = useState<ProposalRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("solar_proposals")
        .select("id, project_name, location, project_type, capacity_mw, investment_model, approx_budget, custom_notes, computed, overrides, ai_recommendation")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast.error("Proposal not found");
        nav("/solar/proposals");
        return;
      }
      setRow(data as unknown as ProposalRow);
      setLoading(false);
    })();
  }, [id, nav]);

  const merged = useMemo<SolarComputed | null>(() => {
    if (!row) return null;
    return { ...row.computed, ...(row.overrides || {}) };
  }, [row]);

  const openSlides = () => {
    if (!row || !merged) return;
    const vars = toProposalVars(
      {
        project_name: row.project_name,
        location: row.location ?? "",
        project_type: row.project_type ?? "",
        capacity_mw: row.capacity_mw,
        investment_model: row.investment_model ?? "",
      },
      merged,
    );
    sessionStorage.setItem("unite-solar:incoming-vars", JSON.stringify(vars));
    sessionStorage.setItem("unite-solar:active-proposal-id", row.id);
    nav(`/solar/proposals/${row.id}/slides?slide=cover`);
  };

  if (loading || !row || !merged) {
    return <SolarShell title="Summary"><div className="text-sm text-muted-foreground">Loading…</div></SolarShell>;
  }

  return (
    <SolarShell title="Summary">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/solar/proposals"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{row.project_name}</h1>
            <div className="text-sm text-muted-foreground">
              {row.location ?? "—"} • {row.project_type ?? "—"} • {row.capacity_mw} MW
            </div>
          </div>
        </div>
        <Button onClick={openSlides} className="gap-2" size="lg">
          <Sparkles className="h-4 w-4" /> Generate Slides <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="font-semibold mb-3">Key Financials</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Metric icon={<IndianRupee className="h-4 w-4" />} label="Project Cost" value={`₹${merged.project_cost_cr} Cr`} />
              <Metric icon={<TrendingUp className="h-4 w-4" />} label="Total Savings" value={`₹${merged.total_savings_cr} Cr+`} />
              <Metric icon={<TrendingUp className="h-4 w-4" />} label="Annual Savings" value={`₹${merged.annual_savings_cr} Cr/yr`} />
              <Metric icon={<Calendar className="h-4 w-4" />} label="Payback" value={`${merged.payback_years} yrs`} />
              <Metric icon={<Wrench className="h-4 w-4" />} label="O&M" value={`₹${merged.om_cost_lakh_per_year} L/yr`} />
              <Metric icon={<Calendar className="h-4 w-4" />} label="Project Life" value={`${merged.life_years} yrs`} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold mb-3">Generation & Environment</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Metric icon={<Zap className="h-4 w-4" />} label="Annual Generation" value={`${merged.annual_units_lakh} Lakh units`} />
              <Metric icon={<Sun className="h-4 w-4" />} label="Capacity" value={`${merged.capacity_mw} MW`} />
              <Metric icon={<Leaf className="h-4 w-4" />} label="CO₂ Avoided" value={`${merged.co2_tons_per_year.toLocaleString("en-IN")} T/yr`} />
            </div>
          </Card>

          {row.custom_notes && (
            <Card className="p-5">
              <h2 className="font-semibold mb-2">Notes</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{row.custom_notes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
              Investment Model
            </div>
            <div className="text-lg font-bold">{row.investment_model ?? "—"}</div>
            {row.ai_recommendation && (
              <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> AI Recommended: {row.ai_recommendation.model}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">{row.ai_recommendation.reasoning}</p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
              Next Step
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Open the live slide deck to review, edit any slide, and export.
            </p>
            <Button onClick={openSlides} className="w-full gap-2">
              <Sparkles className="h-4 w-4" /> Generate Slides
            </Button>
          </Card>

          <Card className="p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
              Re-compute
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                const fresh = computeSolarProject({
                  project_name: row.project_name,
                  capacity_mw: row.capacity_mw,
                });
                const { error } = await supabase
                  .from("solar_proposals")
                  .update({ computed: fresh as any, overrides: {} })
                  .eq("id", row.id);
                if (error) return toast.error(error.message);
                toast.success("Recomputed from capacity");
                setRow({ ...row, computed: fresh, overrides: {} });
              }}
            >
              Reset to defaults
            </Button>
          </Card>
        </div>
      </div>
    </SolarShell>
  );
};

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-lg border border-border bg-card/50 p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
      {icon} {label}
    </div>
    <div className="text-base font-bold mt-1 tabular-nums">{value}</div>
  </div>
);

export default SolarProposalSummary;