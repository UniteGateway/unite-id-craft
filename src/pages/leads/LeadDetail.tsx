import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SolarShell from "@/components/solar/SolarShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Loader2, Sparkles, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { runFeasibility, type FeasibilityOutput } from "@/lib/feasibility-engine";
import { runDesign, type DesignOutput } from "@/lib/design-engine";
import { loadPriceBook, type PriceBook, inr } from "@/lib/pricing";

interface Lead {
  id: string; owner_id: string; name: string; phone: string | null; email: string | null;
  segment: string; state: string | null; city: string | null; address: string | null;
  sanction_load_kw: number | null; contract_demand_kva: number | null;
  monthly_bill_inr: number | null; avg_units_kwh: number | null;
  tariff_inr_per_kwh: number | null; roof_area_sqm: number | null;
  roof_type: string | null; shadow_free_pct: number | null;
  discom: string | null; consumer_no: string | null;
  status: string; bill_extraction: any; feasibility: any; design: any;
}

const STATUS_FLOW = ["new", "feasibility", "design", "quoted", "won"] as const;

export default function LeadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [pb, setPb] = useState<PriceBook | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data }, book] = await Promise.all([
        supabase.from("leads").select("*").eq("id", id!).maybeSingle(),
        loadPriceBook(),
      ]);
      setLead(data as Lead | null);
      setPb(book);
      setLoading(false);
    })();
  }, [id]);

  const save = async (patch: Partial<Lead>) => {
    if (!lead) return;
    const { error } = await supabase.from("leads").update(patch).eq("id", lead.id);
    if (error) { toast.error(error.message); return; }
    setLead({ ...lead, ...patch });
  };

  const advance = async (status: typeof STATUS_FLOW[number]) => {
    if (!lead) return;
    const i = STATUS_FLOW.indexOf(lead.status as any);
    const j = STATUS_FLOW.indexOf(status);
    if (j > i) await save({ status });
  };

  if (loading) return <SolarShell title="Lead"><div className="text-sm text-muted-foreground">Loading…</div></SolarShell>;
  if (!lead) return <SolarShell title="Lead"><div className="text-sm text-muted-foreground">Not found.</div></SolarShell>;

  return (
    <SolarShell title={lead.name}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => nav("/leads")}><ArrowLeft className="h-4 w-4 mr-1" /> Leads</Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">{lead.status}</Badge>
        </div>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">{lead.name}</h1>
        <p className="text-sm text-muted-foreground">
          {lead.segment} · {[lead.city, lead.state].filter(Boolean).join(", ") || "Location TBD"}
          {lead.sanction_load_kw ? ` · ${lead.sanction_load_kw} kW sanctioned` : ""}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bill">Bill OCR</TabsTrigger>
          <TabsTrigger value="feasibility">Feasibility</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="quote">Quote</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab lead={lead} save={save} /></TabsContent>
        <TabsContent value="bill"><BillTab lead={lead} save={save} onApplied={() => advance("feasibility")} /></TabsContent>
        <TabsContent value="feasibility"><FeasibilityTab lead={lead} save={save} onComputed={() => advance("feasibility")} onNext={() => { setTab("design"); advance("design"); }} /></TabsContent>
        <TabsContent value="design"><DesignTab lead={lead} pb={pb} save={save} onComputed={() => advance("design")} onNext={() => { setTab("quote"); }} /></TabsContent>
        <TabsContent value="quote"><QuoteTab lead={lead} onSent={() => advance("quoted")} /></TabsContent>
      </Tabs>
    </SolarShell>
  );
}

function OverviewTab({ lead, save }: { lead: Lead; save: (p: Partial<Lead>) => void }) {
  const [f, setF] = useState({
    sanction_load_kw: String(lead.sanction_load_kw ?? ""),
    avg_units_kwh: String(lead.avg_units_kwh ?? ""),
    monthly_bill_inr: String(lead.monthly_bill_inr ?? ""),
    tariff_inr_per_kwh: String(lead.tariff_inr_per_kwh ?? ""),
    roof_area_sqm: String(lead.roof_area_sqm ?? ""),
    shadow_free_pct: String(lead.shadow_free_pct ?? 90),
  });
  return (
    <Card className="p-5 mt-4">
      <div className="grid sm:grid-cols-3 gap-3">
        {Object.entries(f).map(([k, v]) => (
          <div key={k}>
            <Label className="text-xs capitalize">{k.replace(/_/g, " ")}</Label>
            <Input type="number" value={v} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
          </div>
        ))}
      </div>
      <Button className="mt-4" onClick={() => save({
        sanction_load_kw: f.sanction_load_kw ? +f.sanction_load_kw : null,
        avg_units_kwh: f.avg_units_kwh ? +f.avg_units_kwh : null,
        monthly_bill_inr: f.monthly_bill_inr ? +f.monthly_bill_inr : null,
        tariff_inr_per_kwh: f.tariff_inr_per_kwh ? +f.tariff_inr_per_kwh : null,
        roof_area_sqm: f.roof_area_sqm ? +f.roof_area_sqm : null,
        shadow_free_pct: f.shadow_free_pct ? +f.shadow_free_pct : 90,
      })}>Save</Button>
    </Card>
  );
}

function BillTab({ lead, save, onApplied }: { lead: Lead; save: (p: Partial<Lead>) => void; onApplied: () => void }) {
  const [busy, setBusy] = useState(false);
  const [extracted, setExtracted] = useState<any>(lead.bill_extraction);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setBusy(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((res, rej) => {
        reader.onload = () => res(String(reader.result).split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke("extract-power-bill", {
        body: { fileBase64: base64, mimeType: file.type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setExtracted(data);
      await save({ bill_extraction: data });
      toast.success("Bill extracted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Extraction failed");
    } finally { setBusy(false); }
  };

  const apply = async () => {
    if (!extracted) return;
    await save({
      avg_units_kwh: extracted.monthly_units ?? lead.avg_units_kwh,
      monthly_bill_inr: extracted.monthly_bill ?? lead.monthly_bill_inr,
      tariff_inr_per_kwh: extracted.energy_charge_per_unit ?? lead.tariff_inr_per_kwh,
      sanction_load_kw: extracted.sanction_load_kw ?? lead.sanction_load_kw,
      discom: extracted.utility_provider ?? lead.discom,
      consumer_no: extracted.service_number ?? lead.consumer_no,
      state: extracted.state ?? lead.state,
    });
    toast.success("Applied to lead");
    onApplied();
  };

  return (
    <Card className="p-5 mt-4">
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
        <Button onClick={() => fileRef.current?.click()} disabled={busy} className="gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload Power Bill
        </Button>
        {extracted && <Button variant="secondary" onClick={apply} className="gap-2"><CheckCircle2 className="h-4 w-4" /> Apply to Lead</Button>}
      </div>
      {extracted && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
          {Object.entries(extracted).filter(([, v]) => v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border/40 py-1">
              <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
              <span className="font-mono">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function FeasibilityTab({ lead, save, onComputed, onNext }: { lead: Lead; save: (p: Partial<Lead>) => void; onComputed: () => void; onNext: () => void }) {
  const result: FeasibilityOutput = useMemo(() => runFeasibility({
    state: lead.state, segment: lead.segment,
    sanction_load_kw: lead.sanction_load_kw, avg_units_kwh: lead.avg_units_kwh,
    monthly_bill_inr: lead.monthly_bill_inr, tariff_inr_per_kwh: lead.tariff_inr_per_kwh,
    roof_area_sqm: lead.roof_area_sqm, roof_type: lead.roof_type,
    shadow_free_pct: lead.shadow_free_pct,
  }), [lead]);

  useEffect(() => { save({ feasibility: result }); onComputed(); /* eslint-disable-next-line */ }, [result.total_kw]);

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Recommended" value={`${result.total_kw} kW`} />
        <Stat label="Net Metering" value={`${result.nm_eligible_kw} kW`} />
        <Stat label="Behind the Meter" value={`${result.btm_kw} kW`} />
        <Stat label="Annual Generation" value={`${(result.annual_kwh / 1000).toFixed(0)}k kWh`} />
        <Stat label="Specific Yield" value={`${result.specific_yield} kWh/kWp`} />
        <Stat label="Year-1 Savings" value={inr(result.year1_savings_inr)} />
        <Stat label="Payback" value={`${result.payback_years} yrs`} />
        <Stat label="IRR" value={`${result.irr_pct}%`} />
      </div>
      {result.notes.length > 0 && (
        <Card className="p-4 bg-amber-500/5 border-amber-500/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">Engineering Notes</div>
          <ul className="text-sm space-y-1 list-disc pl-5">
            {result.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </Card>
      )}
      <div className="flex gap-2">
        <Button onClick={onNext} className="gap-2 bg-orange-500 hover:bg-orange-600">
          Continue to Design <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DesignTab({ lead, pb, save, onComputed, onNext }: { lead: Lead; pb: PriceBook | null; save: (p: Partial<Lead>) => void; onComputed: () => void; onNext: () => void }) {
  const kw = (lead.feasibility?.total_kw as number) ?? lead.sanction_load_kw ?? 5;
  const segmentKey: "residential" | "commercial" | "industrial" =
    lead.segment.toLowerCase() === "residential" ? "residential"
    : lead.segment.toLowerCase() === "industrial" ? "industrial" : "commercial";

  const design: DesignOutput | null = useMemo(() => pb ? runDesign({
    capacity_kw: kw, roof_type: lead.roof_type, segment: segmentKey, budget_tier: "standard",
  }, pb) : null, [pb, kw, lead.roof_type, segmentKey]);

  useEffect(() => { if (design) { save({ design }); onComputed(); } /* eslint-disable-next-line */ }, [design?.module?.id, design?.inverter?.id]);

  if (!pb) return <div className="text-sm text-muted-foreground mt-4">Loading price book…</div>;
  if (!design) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Modules" value={`${design.module_count} × ${design.module?.wattage ?? 0}Wp`} />
        <Stat label="Inverters" value={`${design.inverter_count} × ${design.inverter?.capacity_kw ?? 0}kW`} />
        <Stat label="DC/AC Ratio" value={String(design.dc_ac_ratio)} />
        <Stat label="Strings" value={`${design.total_strings} × ${design.panels_per_string}p`} />
      </div>
      <Card className="p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bill of Quantities</div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr><th className="text-left py-1">Item</th><th className="text-right">Qty</th><th className="text-right">Unit</th></tr>
          </thead>
          <tbody>
            {design.boq.map((b, i) => (
              <tr key={i} className="border-t border-border/40"><td className="py-1.5">{b.item}</td><td className="text-right font-mono">{b.qty}</td><td className="text-right text-muted-foreground">{b.unit}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Button onClick={onNext} className="gap-2 bg-orange-500 hover:bg-orange-600">
        Continue to Quote <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function QuoteTab({ lead, onSent }: { lead: Lead; onSent: () => void }) {
  const nav = useNavigate();
  const kw = (lead.feasibility?.total_kw as number) ?? lead.sanction_load_kw ?? 5;
  const goQuote = () => {
    onSent();
    nav(`/quotations/new?leadId=${lead.id}`);
  };
  return (
    <Card className="p-5 mt-4">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-orange-500" />
        <div className="flex-1">
          <div className="font-semibold">Open Quotation Builder pre-filled with this lead</div>
          <div className="text-xs text-muted-foreground">{kw} kW · {lead.segment} · {lead.state ?? "—"}</div>
        </div>
        <Button onClick={goQuote} className="gap-2 bg-orange-500 hover:bg-orange-600">
          <FileText className="h-4 w-4" /> Open Quote
        </Button>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-bold mt-1 tabular-nums">{value}</div>
    </Card>
  );
}