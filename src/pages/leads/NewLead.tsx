import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SolarShell from "@/components/solar/SolarShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const Schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
});

const SEGMENTS = ["Residential", "Commercial", "Industrial", "Captive", "Open Access"];
const ROOF_TYPES = ["RCC", "Metal", "Asbestos", "Ground"];
const STATES = ["Telangana", "Andhra Pradesh", "Karnataka", "Tamil Nadu", "Maharashtra", "Gujarat", "Delhi", "Kerala", "Other"];

export default function NewLead() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    name: "", phone: "", email: "", segment: "Commercial",
    state: "Telangana", city: "", address: "",
    sanction_load_kw: "", monthly_bill_inr: "", avg_units_kwh: "",
    roof_area_sqm: "", roof_type: "RCC", shadow_free_pct: "90",
    notes: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    const parsed = Schema.safeParse(f);
    if (!parsed.success) { toast.error("Please enter name (and valid email if provided)"); return; }
    if (!user) { toast.error("Sign in first"); return; }
    setSaving(true);
    const { data, error } = await supabase.from("leads").insert({
      owner_id: user.id,
      name: f.name, phone: f.phone || null, email: f.email || null,
      segment: f.segment, state: f.state, city: f.city || null, address: f.address || null,
      sanction_load_kw: f.sanction_load_kw ? +f.sanction_load_kw : null,
      monthly_bill_inr: f.monthly_bill_inr ? +f.monthly_bill_inr : null,
      avg_units_kwh: f.avg_units_kwh ? +f.avg_units_kwh : null,
      roof_area_sqm: f.roof_area_sqm ? +f.roof_area_sqm : null,
      roof_type: f.roof_type,
      shadow_free_pct: f.shadow_free_pct ? +f.shadow_free_pct : 90,
      notes: f.notes || null,
    }).select("id").single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Lead created");
    nav(`/leads/${data.id}`);
  };

  return (
    <SolarShell title="New Lead">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => nav("/leads")}><ArrowLeft className="h-4 w-4 mr-1" /> Leads</Button>
        <Button onClick={submit} disabled={saving} className="gap-2 bg-orange-500 hover:bg-orange-600">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Create Lead"}
        </Button>
      </div>
      <Card className="p-5 max-w-3xl">
        <h2 className="font-semibold mb-3">Customer</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name *"><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Segment">
            <Select value={f.segment} onValueChange={(v) => set("segment", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SEGMENTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Phone"><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Email"><Input value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="State">
            <Select value={f.state} onValueChange={(v) => set("state", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="City"><Input value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
        </div>
        <h2 className="font-semibold mt-5 mb-3">Site & Bill (optional — bill OCR will fill these)</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Sanctioned Load (kW)"><Input type="number" value={f.sanction_load_kw} onChange={(e) => set("sanction_load_kw", e.target.value)} /></Field>
          <Field label="Avg Monthly Bill (₹)"><Input type="number" value={f.monthly_bill_inr} onChange={(e) => set("monthly_bill_inr", e.target.value)} /></Field>
          <Field label="Avg Units (kWh/mo)"><Input type="number" value={f.avg_units_kwh} onChange={(e) => set("avg_units_kwh", e.target.value)} /></Field>
          <Field label="Roof Area (m²)"><Input type="number" value={f.roof_area_sqm} onChange={(e) => set("roof_area_sqm", e.target.value)} /></Field>
          <Field label="Roof Type">
            <Select value={f.roof_type} onValueChange={(v) => set("roof_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ROOF_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Shadow-Free %"><Input type="number" value={f.shadow_free_pct} onChange={(e) => set("shadow_free_pct", e.target.value)} /></Field>
        </div>
        <div className="mt-3">
          <Label className="text-xs">Notes</Label>
          <Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
        </div>
      </Card>
    </SolarShell>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="text-xs">{label}</Label>{children}</div>;
}