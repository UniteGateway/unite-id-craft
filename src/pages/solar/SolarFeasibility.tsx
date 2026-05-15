import React, { useRef, useState } from "react";
import SolarShell from "@/components/solar/SolarShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Upload, FileImage, FileText, Sparkles, Sun,
  IndianRupee, Leaf, TrendingUp, BatteryCharging, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  computeFeasibility, formatINR, type FeasibilityReport, type Segment,
} from "@/lib/feasibility";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SEGMENT_LABEL: Record<Segment, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  agricultural: "Agricultural",
};

const COLORS = ["#16a34a", "#f59e0b", "#1a3c6e", "#0ea5e9", "#dc2626"];

const SolarFeasibility: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [segment, setSegment] = useState<Segment>("residential");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<any | null>(null);
  const [manual, setManual] = useState({
    monthly_units: "",
    monthly_bill: "",
    sanction_load_kw: "",
    energy_charge_per_unit: "",
    consumer_name: "",
    location: "",
  });
  const [report, setReport] = useState<FeasibilityReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const onUpload = async () => {
    if (!file) { toast.error("Please select a bill image or PDF first."); return; }
    setExtracting(true);
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1];
      const { data, error } = await supabase.functions.invoke("extract-power-bill", {
        body: { fileBase64: base64, mimeType: file.type },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setExtracted(data);
      setManual({
        monthly_units: String(data.monthly_units ?? ""),
        monthly_bill: String(data.monthly_bill ?? ""),
        sanction_load_kw: String(data.sanction_load_kw ?? ""),
        energy_charge_per_unit: String(data.energy_charge_per_unit ?? ""),
        consumer_name: data.consumer_name ?? "",
        location: data.location ?? "",
      });
      if (data.consumer_segment && data.consumer_segment !== "unknown") {
        setSegment(data.consumer_segment);
      }
      toast.success("Bill analysed successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyse bill");
    } finally { setExtracting(false); }
  };

  const generateReport = () => {
    const units = parseFloat(manual.monthly_units);
    const bill = parseFloat(manual.monthly_bill);
    if (!units || !bill) { toast.error("Monthly units & bill amount are required."); return; }
    const r = computeFeasibility({
      segment,
      monthly_units: units,
      monthly_bill: bill,
      sanction_load_kw: parseFloat(manual.sanction_load_kw) || undefined,
      energy_charge_per_unit: parseFloat(manual.energy_charge_per_unit) || undefined,
      state: extracted?.state,
    });
    setReport(r);
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const exportPNG = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#fff" });
    const link = document.createElement("a");
    link.download = `Solar-Feasibility-${manual.consumer_name || "Report"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#fff" });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = (canvas.height * pw) / canvas.width;
    let y = 0; const pageH = pdf.internal.pageSize.getHeight();
    if (ph <= pageH) { pdf.addImage(img, "PNG", 0, 0, pw, ph); }
    else {
      // simple multi-page
      let remaining = ph;
      while (remaining > 0) {
        pdf.addImage(img, "PNG", 0, y, pw, ph);
        remaining -= pageH;
        if (remaining > 0) { pdf.addPage(); y -= pageH; }
      }
    }
    pdf.save(`Solar-Feasibility-${manual.consumer_name || "Report"}.pdf`);
  };

  return (
    <SolarShell title="Feasibility Analysis">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> AI Solar Feasibility Analysis
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload an electricity bill — get an investor-ready feasibility report in seconds.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Upload */}
        <Card className="p-5 space-y-4">
          <div>
            <Label>Consumer Segment</Label>
            <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(SEGMENT_LABEL) as Segment[]).map((s) => (
                  <SelectItem key={s} value={s}>{SEGMENT_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Upload Electricity Bill (Image or PDF)</Label>
            <label className="mt-1 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-6 cursor-pointer hover:bg-muted/40 transition">
              {file ? (
                <>
                  {file.type.startsWith("image/")
                    ? <FileImage className="h-7 w-7 text-primary" />
                    : <FileText className="h-7 w-7 text-primary" />}
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</div>
                </>
              ) : (
                <>
                  <Upload className="h-7 w-7 text-muted-foreground" />
                  <div className="text-sm">Click to select bill</div>
                  <div className="text-xs text-muted-foreground">JPG, PNG, or PDF</div>
                </>
              )}
              <input
                type="file" className="hidden" accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <Button onClick={onUpload} disabled={!file || extracting} className="w-full gap-2">
            {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyse Bill with AI
          </Button>
        </Card>

        {/* Manual inputs / extracted preview */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Bill Details</h2>
            {extracted?.confidence && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                AI confidence: {extracted.confidence}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Consumer Name" value={manual.consumer_name}
              onChange={(v) => setManual({ ...manual, consumer_name: v })} />
            <Field label="Location" value={manual.location}
              onChange={(v) => setManual({ ...manual, location: v })} />
            <Field label="Monthly Units (kWh)" value={manual.monthly_units} type="number"
              onChange={(v) => setManual({ ...manual, monthly_units: v })} />
            <Field label="Monthly Bill (₹)" value={manual.monthly_bill} type="number"
              onChange={(v) => setManual({ ...manual, monthly_bill: v })} />
            <Field label="Tariff (₹/unit)" value={manual.energy_charge_per_unit} type="number"
              onChange={(v) => setManual({ ...manual, energy_charge_per_unit: v })} />
            <Field label="Sanction Load (kW)" value={manual.sanction_load_kw} type="number"
              onChange={(v) => setManual({ ...manual, sanction_load_kw: v })} />
          </div>
          <Button onClick={generateReport} className="w-full gap-2 bg-primary">
            <Sparkles className="h-4 w-4" /> Generate Feasibility Report
          </Button>
        </Card>
      </div>

      {report && (
        <div className="mt-8">
          <div className="flex items-center justify-end gap-2 mb-3">
            <Button onClick={exportPNG} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> PNG
            </Button>
            <Button onClick={exportPDF} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>

          <div ref={reportRef} className="bg-white text-[#0a1b33] rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg,#0a1b33 0%,#1a3c6e 100%)" }}>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-orange-400">Unite Solar</div>
                <div className="text-2xl md:text-3xl font-extrabold text-white">Solar Feasibility Report</div>
                <div className="text-sm text-white/80 mt-1">
                  {manual.consumer_name || "Customer"} · {manual.location || "—"} · {SEGMENT_LABEL[report.segment]}
                </div>
              </div>
              <Sun className="h-14 w-14 text-orange-400" />
            </div>

            <div className="p-6 space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KPI icon={<Sun className="h-4 w-4" />} label="Recommended Capacity" value={`${report.recommended_capacity_kw} kW`} />
                <KPI icon={<TrendingUp className="h-4 w-4" />} label="Annual Generation" value={`${report.annual_generation_kwh.toLocaleString("en-IN")} kWh`} />
                <KPI icon={<IndianRupee className="h-4 w-4" />} label="Year-1 Savings" value={formatINR(report.annual_savings)} />
                <KPI icon={<TrendingUp className="h-4 w-4" />} label="Payback" value={`${report.payback_years} yrs`} />
                <KPI icon={<IndianRupee className="h-4 w-4" />} label="25-yr Savings" value={formatINR(report.lifetime_savings_25y)} />
                <KPI icon={<TrendingUp className="h-4 w-4" />} label="IRR" value={`${report.irr_pct}%`} />
                <KPI icon={<Leaf className="h-4 w-4" />} label="CO₂ Offset (25y)" value={`${report.co2_offset_tonnes_25y} t`} />
                <KPI icon={<BatteryCharging className="h-4 w-4" />} label="System Type" value={report.system_type.toUpperCase()} />
              </div>

              {/* Generation chart */}
              <Card className="p-4">
                <div className="font-semibold mb-2">Monthly Solar Generation (kWh)</div>
                <div style={{ width: "100%", height: 240 }}>
                  <ResponsiveContainer>
                    <BarChart data={report.monthly_breakup}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="gen" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Cost breakdown + Cumulative savings */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="font-semibold mb-2">Project Cost Breakdown</div>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Subsidy", value: report.subsidy_amount },
                            { name: "Loan", value: report.loan_amount },
                            { name: "Self-funded", value: Math.max(0, report.net_cost - report.loan_amount) },
                          ].filter(x => x.value > 0)}
                          dataKey="value" nameKey="name" outerRadius={75} label
                        >
                          {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(v: number) => formatINR(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="font-semibold mb-2">25-Year Cumulative Savings</div>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={cumulative25(report)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" fontSize={11} />
                        <YAxis fontSize={11} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                        <Tooltip formatter={(v: number) => formatINR(v)} />
                        <Line type="monotone" dataKey="cum" stroke="#16a34a" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Technical + Financial tables */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="font-semibold mb-2">Technical Proposal</div>
                  <KV label="Solar Panels (550 W)" v={`${report.panel_count} nos`} />
                  <KV label="Inverter Capacity" v={`${report.inverter_capacity_kw} kW`} />
                  <KV label="Required Roof Area" v={`${report.required_roof_area_sqft} sqft (${report.required_roof_area_sqm} m²)`} />
                  <KV label="Structure Type" v={report.structure_type} />
                  <KV label="System Type" v={report.system_type.toUpperCase()} />
                  <KV label="Battery" v={report.battery_recommendation} />
                  <KV label="Tariff" v={`₹${report.tariff} / kWh`} />
                </Card>
                <Card className="p-4">
                  <div className="font-semibold mb-2">Financial Analysis</div>
                  <KV label="Project Cost" v={formatINR(report.project_cost)} />
                  <KV label="Subsidy" v={formatINR(report.subsidy_amount)} />
                  <KV label="Net Cost" v={formatINR(report.net_cost)} />
                  <KV label="Loan Amount" v={formatINR(report.loan_amount)} />
                  <KV label="Loan EMI" v={`${formatINR(report.loan_emi)} / month`} />
                  <KV label="Payback Period" v={`${report.payback_years} years`} />
                  <KV label="IRR" v={`${report.irr_pct}%`} />
                  <KV label="ROI (25y)" v={`${report.roi_pct_25y}%`} />
                  {report.depreciation_benefit && (
                    <KV label="Tax + Depreciation Benefit (Yr-1)" v={formatINR(report.depreciation_benefit)} />
                  )}
                </Card>
              </div>

              <Card className="p-4">
                <div className="font-semibold mb-2">AI Suggestions</div>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  {report.ai_tips.map((t, i) => <li key={i}>{t}</li>)}
                  <li>{report.net_metering_note}</li>
                </ul>
              </Card>

              <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                Powered by Unite Developers Global Inc · www.unitesolar.in
              </div>
            </div>
          </div>
        </div>
      )}
    </SolarShell>
  );
};

const Field: React.FC<{ label: string; value: string; type?: string; onChange: (v: string) => void }> = ({ label, value, type, onChange }) => (
  <div>
    <Label className="text-xs">{label}</Label>
    <Input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
  </div>
);
const KPI: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <Card className="p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">{icon}{label}</div>
    <div className="text-lg font-bold tabular-nums mt-0.5">{value}</div>
  </Card>
);
const KV: React.FC<{ label: string; v: string }> = ({ label, v }) => (
  <div className="flex justify-between gap-3 py-1.5 border-b border-border last:border-b-0 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-right">{v}</span>
  </div>
);

function cumulative25(r: FeasibilityReport) {
  const out: { year: number; cum: number }[] = [];
  let cum = 0;
  for (let y = 1; y <= 25; y++) {
    const factor = Math.pow(1.05, y - 1) * Math.pow(1 - 0.007, y - 1);
    cum += Math.round(r.annual_savings * factor);
    out.push({ year: y, cum });
  }
  return out;
}

export default SolarFeasibility;