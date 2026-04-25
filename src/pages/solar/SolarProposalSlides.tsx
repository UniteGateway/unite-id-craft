import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";
import SolarShell from "@/components/solar/SolarShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, ArrowLeft, Save, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SlideStage from "@/components/proposals/variable-slides/SlideStage";
import {
  DEFAULT_VARS,
  ProposalVars,
  VAR_LABELS,
} from "@/components/proposals/variable-slides/types";
import { VARIABLE_SLIDE_REGISTRY } from "@/components/proposals/variable-slides/registry";
import {
  computeSolarProject,
  toProposalVars,
  type SolarComputed,
} from "@/lib/solar-proposal-calc";

const SolarProposalSlides: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialKey = params.get("slide") || "cover";

  const [activeKey, setActiveKey] = useState<string>(initialKey);
  const [vars, setVars] = useState<ProposalVars>(DEFAULT_VARS);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [row, setRow] = useState<{ project_name: string; capacity_mw: number; computed: SolarComputed; overrides: Partial<SolarComputed> } | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // Load proposal
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("solar_proposals")
        .select("project_name, location, project_type, capacity_mw, investment_model, computed, overrides")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast.error("Proposal not found");
        nav("/solar/proposals");
        return;
      }
      const merged: SolarComputed = { ...(data.computed as SolarComputed), ...((data.overrides as Partial<SolarComputed>) || {}) };
      setRow({
        project_name: data.project_name,
        capacity_mw: Number(data.capacity_mw),
        computed: data.computed as SolarComputed,
        overrides: (data.overrides as Partial<SolarComputed>) || {},
      });
      const v = toProposalVars(
        {
          project_name: data.project_name,
          location: data.location ?? "",
          project_type: data.project_type ?? "",
          capacity_mw: Number(data.capacity_mw),
          investment_model: data.investment_model ?? "",
        },
        merged,
      );
      setVars((s) => ({ ...s, ...v }));
    })();
  }, [id, nav]);

  // Allow direct hydration via sessionStorage (back-compat with /generate flow)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("unite-solar:incoming-vars");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProposalVars>;
        setVars((v) => ({ ...v, ...parsed }));
        sessionStorage.removeItem("unite-solar:incoming-vars");
      }
    } catch { /* ignore */ }
  }, []);

  const active = useMemo(
    () => VARIABLE_SLIDE_REGISTRY.find((s) => s.key === activeKey) ?? VARIABLE_SLIDE_REGISTRY[0],
    [activeKey]
  );
  const Comp = active.Component;

  const onPick = (key: string) => {
    setActiveKey(key);
    setParams({ slide: key });
  };

  const updateVar = (k: keyof ProposalVars, value: string) => {
    setVars((v) => ({ ...v, [k]: value }));
    setDirty(true);
  };

  const saveOverrides = async () => {
    if (!id) return;
    setSaving(true);
    // Map editable vars back into computed-style overrides
    const overrides: Partial<SolarComputed> = {
      project_cost_cr: parseFloat(vars.PROJECT_COST) || undefined,
      total_savings_cr: parseFloat(vars.TOTAL_SAVINGS) || undefined,
      annual_units_lakh: parseFloat(vars.ANNUAL_UNITS) || undefined,
      payback_years: vars.PAYBACK,
      om_cost_lakh_per_year: vars.OM_COST,
      co2_tons_per_year: parseInt(vars.CO2) || undefined,
      life_years: parseInt(vars.LIFE) || undefined,
    };
    const { error } = await supabase
      .from("solar_proposals")
      .update({ overrides: overrides as any })
      .eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setDirty(false);
  };

  const regenerateFromCapacity = () => {
    if (!row) return;
    const fresh = computeSolarProject({ project_name: row.project_name, capacity_mw: row.capacity_mw });
    const v = toProposalVars(
      { project_name: row.project_name, capacity_mw: row.capacity_mw },
      fresh,
    );
    setVars((s) => ({ ...s, ...v }));
    setDirty(true);
    toast.success("Reset to capacity-based defaults");
  };

  const exportPng = async () => {
    if (!slideRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(slideRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: 1920,
        height: 1080,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `unite-solar-${active.key}-${vars.PROJECT_NAME.replace(/\s+/g, "_")}.png`;
      a.click();
      toast.success("Slide exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const idx = VARIABLE_SLIDE_REGISTRY.findIndex((s) => s.key === activeKey);
  const prev = () => {
    for (let i = idx - 1; i >= 0; i--) if (VARIABLE_SLIDE_REGISTRY[i].Component) return onPick(VARIABLE_SLIDE_REGISTRY[i].key);
  };
  const next = () => {
    for (let i = idx + 1; i < VARIABLE_SLIDE_REGISTRY.length; i++) if (VARIABLE_SLIDE_REGISTRY[i].Component) return onPick(VARIABLE_SLIDE_REGISTRY[i].key);
  };

  return (
    <SolarShell
      title="Slides"
      fluid
      actions={
        <Button onClick={exportPng} disabled={exporting || !Comp} size="sm" className="gap-2">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span className="hidden sm:inline">Export PNG</span>
        </Button>
      }
    >
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/solar/proposals/${id}/summary`}><ArrowLeft className="h-4 w-4 mr-1" /> Summary</Link>
          </Button>
          <h1 className="text-base md:text-lg font-bold">
            {row?.project_name ?? "Loading…"} <span className="text-muted-foreground font-normal">— {active.title}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_320px] gap-4">
        {/* Slide list */}
        <Card className="p-2 h-fit">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-2 py-2 font-semibold">
            Slides
          </div>
          <div className="flex flex-col gap-1">
            {VARIABLE_SLIDE_REGISTRY.map((s) => {
              const ready = !!s.Component;
              const isActive = s.key === activeKey;
              return (
                <button
                  key={s.key}
                  onClick={() => ready && onPick(s.key)}
                  disabled={!ready}
                  className={`flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                    isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"
                  } ${!ready ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold">
                    {s.n}
                  </span>
                  <span className="truncate">{s.title}</span>
                  {!ready && <span className="ml-auto text-[10px] text-muted-foreground">soon</span>}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Preview */}
        <div className="min-w-0">
          <Card className="p-2 bg-neutral-900">
            {Comp ? (
              <SlideStage>
                <Comp ref={slideRef} vars={vars} />
              </SlideStage>
            ) : (
              <div className="h-[420px] grid place-items-center text-sm text-muted-foreground">
                Slide coming soon.
              </div>
            )}
          </Card>
          <div className="mt-2 text-xs text-muted-foreground text-right">
            Renders at 1920×1080 — exports as HD PNG.
          </div>
        </div>

        {/* Edit panel */}
        <Card className="p-3 h-fit">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Edit Slide Data
            </div>
            <Button variant="ghost" size="sm" onClick={regenerateFromCapacity} className="h-7 px-2 gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {(Object.keys(vars) as (keyof ProposalVars)[]).map((k) => (
              <div key={k}>
                <Label className="text-[11px]">{VAR_LABELS[k]}</Label>
                <Input
                  value={vars[k]}
                  onChange={(e) => updateVar(k, e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={saveOverrides}
            disabled={saving || !dirty}
            className="w-full mt-3 gap-2"
            size="sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {dirty ? "Save Changes" : "Saved"}
          </Button>
        </Card>
      </div>
    </SolarShell>
  );
};

export default SolarProposalSlides;