import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, Save, ArrowLeft, Calculator } from "lucide-react";
import { computeCost, loadPriceBook, inr, type PriceBook } from "@/lib/pricing";
import { downloadQuotationPDF } from "@/lib/quotation-pdf";

const SEGMENTS = ["residential", "commercial", "industrial"] as const;
const PROJECT_TYPES = ["Residential", "Commercial", "Industrial", "Hospital", "School", "Apartment", "Hotel", "Agriculture", "Open Access", "Ground Mounted", "Utility Scale"];
const CONNECTIONS = ["LT", "HT", "EHT"];

export default function QuotationBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [pb, setPb] = useState<PriceBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customer_name: "", company_name: "", mobile: "", email: "",
    address: "", city: "", state: "Telangana", pincode: "",
    project_type: "Residential", connection_type: "LT",
    segment: "residential" as typeof SEGMENTS[number],
    capacity_kw: 5, module_id: "", inverter_id: "",
    structure_type: "RCC Roof", floors: 0, tariff: 8,
  });

  useEffect(() => {
    (async () => {
      const book = await loadPriceBook();
      setPb(book);
      setForm((f) => ({
        ...f,
        module_id: f.module_id || book.modules[0]?.id || "",
        inverter_id: f.inverter_id || book.inverters[0]?.id || "",
      }));
      if (id && user) {
        const { data } = await supabase.from("quotations").select("*").eq("id", id).maybeSingle();
        if (data) setForm({
          customer_name: data.customer_name ?? "", company_name: data.company_name ?? "",
          mobile: data.mobile ?? "", email: data.email ?? "", address: data.address ?? "",
          city: data.city ?? "", state: data.state ?? "Telangana", pincode: data.pincode ?? "",
          project_type: data.project_type ?? "Residential", connection_type: data.connection_type ?? "LT",
          segment: (data.segment as any) ?? "residential",
          capacity_kw: Number(data.capacity_kw) || 5,
          module_id: data.module_id ?? book.modules[0]?.id ?? "",
          inverter_id: data.inverter_id ?? book.inverters[0]?.id ?? "",
          structure_type: data.structure_type ?? "RCC Roof",
          floors: data.floors ?? 0, tariff: Number(data.tariff) || 8,
        });
      }
      setLoading(false);
    })();
  }, [id, user]);

  const cost = useMemo(() => {
    if (!pb) return null;
    return computeCost({
      capacity_kw: form.capacity_kw, segment: form.segment,
      module_id: form.module_id, inverter_id: form.inverter_id,
      structure_type: form.structure_type, floors: form.floors, state: form.state,
    }, pb);
  }, [pb, form]);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!user || !cost) return;
    if (!form.customer_name.trim()) { toast.error("Customer name is required"); return; }
    setSaving(true);
    const payload = {
      user_id: user.id,
      ...form,
      costing: cost as any,
      subtotal: cost.subtotal,
      gst: cost.gst,
      final_price: cost.final_price,
      subsidy: cost.subsidy,
      net_to_customer: cost.net_to_customer,
    };
    const res = id
      ? await supabase.from("quotations").update(payload).eq("id", id)
      : await supabase.from("quotations").insert(payload).select().single();
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Quotation saved");
    if (!id && (res as any).data?.id) navigate(`/quotations/${(res as any).data.id}`, { replace: true });
  };

  const handleDownload = () => {
    if (!cost) return;
    downloadQuotationPDF({
      ...form, cost,
      quotation_no: id ? id.slice(0, 8).toUpperCase() : "DRAFT",
    });
  };

  if (loading || !pb || !cost) return (
    <div className="min-h-screen flex flex-col bg-background"><AppNav /><div className="flex-1 grid place-items-center text-muted-foreground">Loading price book…</div></div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/quotations")}><ArrowLeft className="w-4 h-4 mr-1" /> Quotations</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}><Download className="w-4 h-4 mr-1" /> PDF</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600"><Save className="w-4 h-4 mr-1" /> {saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                <Field label="Customer Name *"><Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} /></Field>
                <Field label="Company"><Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></Field>
                <Field label="Mobile"><Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} /></Field>
                <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
                <Field label="Address" className="sm:col-span-2"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
                <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
                <Field label="State">
                  <Select value={form.state} onValueChange={(v) => set("state", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{pb.states.map((s) => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Pincode"><Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} /></Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Project</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                <Field label="Project Type">
                  <Select value={form.project_type} onValueChange={(v) => set("project_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PROJECT_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Segment">
                  <Select value={form.segment} onValueChange={(v) => set("segment", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SEGMENTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Connection">
                  <Select value={form.connection_type} onValueChange={(v) => set("connection_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CONNECTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Tariff (₹/kWh)"><Input type="number" value={form.tariff} onChange={(e) => set("tariff", +e.target.value)} /></Field>
                <Field label="Capacity (kW)"><Input type="number" value={form.capacity_kw} onChange={(e) => set("capacity_kw", +e.target.value)} /></Field>
                <Field label="Floors (above ground)"><Input type="number" value={form.floors} onChange={(e) => set("floors", +e.target.value)} /></Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Equipment</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                <Field label="Solar Module">
                  <Select value={form.module_id} onValueChange={(v) => set("module_id", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{pb.modules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.brand} {m.wattage}Wp {m.technology} — ₹{m.price_per_wp}/Wp</SelectItem>
                    ))}</SelectContent>
                  </Select>
                </Field>
                <Field label="Inverter">
                  <Select value={form.inverter_id} onValueChange={(v) => set("inverter_id", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{pb.inverters.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.brand} {i.capacity_kw}kW {i.phase} — {inr(i.price)}</SelectItem>
                    ))}</SelectContent>
                  </Select>
                </Field>
                <Field label="Structure" className="sm:col-span-2">
                  <Select value={form.structure_type} onValueChange={(v) => set("structure_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{pb.structures.map((s) => (
                      <SelectItem key={s.id} value={s.type}>{s.type} — ₹{s.rate_per_wp}/Wp</SelectItem>
                    ))}</SelectContent>
                  </Select>
                </Field>
              </CardContent>
            </Card>
          </div>

          {/* Live cost */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calculator className="w-4 h-4 text-orange-500" /> Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {cost.lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between gap-2 border-b border-border/40 pb-1">
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{l.label}</div>
                      {l.detail && <div className="text-xs text-muted-foreground">{l.detail}</div>}
                    </div>
                    <div className="font-mono whitespace-nowrap">{inr(l.amount)}</div>
                  </div>
                ))}
                <Separator className="my-2" />
                <Row label="Subtotal" val={inr(cost.subtotal)} />
                <Row label={`GST (${pb.settings.gst_pct}%)`} val={inr(cost.gst)} />
                <Row label="Final Price" val={inr(cost.final_price)} bold />
                {cost.subsidy > 0 && <Row label="PM Surya Ghar Subsidy" val={"- " + inr(cost.subsidy)} className="text-green-600" />}
                <div className="bg-orange-500 text-white rounded-md p-3 flex justify-between mt-2">
                  <span className="font-bold">Net Payable</span>
                  <span className="font-bold">{inr(cost.net_to_customer)}</span>
                </div>
                <div className="text-xs text-muted-foreground text-right">{inr(cost.per_kw)} / kW</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="text-xs">{label}</Label>{children}</div>;
}
function Row({ label, val, bold, className = "" }: { label: string; val: string; bold?: boolean; className?: string }) {
  return <div className={`flex justify-between ${bold ? "font-bold" : ""} ${className}`}><span>{label}</span><span className="font-mono">{val}</span></div>;
}