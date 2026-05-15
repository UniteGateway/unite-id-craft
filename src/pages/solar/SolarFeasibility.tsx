import React, { useEffect, useRef, useState } from "react";
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
  MapPin, Building2, Banknote, FileCheck2, Handshake, Wrench,
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
import FeasibilityChatbot from "@/components/solar/FeasibilityChatbot";
import { geocodeLocation, staticMapUrlFromSettings, type GeoPoint } from "@/lib/geocode";

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
  const [epcRate, setEpcRate] = useState<string>("40000");
  const [epcLabels, setEpcLabels] = useState<[string, string, string, string]>([
    "Advance against Purchase Order",
    "Material ready to dispatch",
    "Pre-installation",
    "Post-installation / Commissioning",
  ]);
  const [geo, setGeo] = useState<GeoPoint | null>(null);
  const [mapUrl, setMapUrl] = useState<string>("");
  const [geoLoading, setGeoLoading] = useState(false);

  // Auto-geocode location whenever a report is generated
  useEffect(() => {
    if (!report || !manual.location) return;
    let cancelled = false;
    setGeoLoading(true);
    geocodeLocation(manual.location).then((p) => {
      if (cancelled) return;
      setGeo(p);
      if (p) setMapUrl(staticMapUrlFromSettings(p, 800, 420, 18));
      setGeoLoading(false);
    });
    return () => { cancelled = true; };
  }, [report, manual.location]);

  const findOnMap = async () => {
    if (!manual.location) { toast.error("Enter a location first"); return; }
    setGeoLoading(true);
    const p = await geocodeLocation(manual.location);
    setGeo(p);
    if (p) { setMapUrl(staticMapUrlFromSettings(p, 800, 420, 18)); toast.success("Location captured"); }
    else toast.error("Could not find that location");
    setGeoLoading(false);
  };

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
      epc_rate_per_kw: parseFloat(epcRate) || undefined,
      epc_milestone_labels: epcLabels,
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
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#fff", useCORS: true });
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();   // 595
    const pageH = pdf.internal.pageSize.getHeight();  // 842
    const margin = 28;                                 // ~10mm
    const contentW = pageW - margin * 2;
    const contentH = pageH - margin * 2;
    // pixels per pt at our render scale
    const pxPerPt = canvas.width / contentW;
    const sliceHpx = Math.floor(contentH * pxPerPt);
    const totalPx = canvas.height;
    let renderedPx = 0;
    let pageNum = 0;
    while (renderedPx < totalPx) {
      const remaining = totalPx - renderedPx;
      const thisSlicePx = Math.min(sliceHpx, remaining);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = thisSlicePx;
      const ctx = slice.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(
        canvas,
        0, renderedPx, canvas.width, thisSlicePx,
        0, 0, canvas.width, thisSlicePx,
      );
      if (pageNum > 0) pdf.addPage();
      const sliceHpt = thisSlicePx / pxPerPt;
      pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", margin, margin, contentW, sliceHpt);
      // footer
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text(
        `Unite Solar · Feasibility Report · Page ${pageNum + 1}`,
        pageW / 2, pageH - 12, { align: "center" },
      );
      renderedPx += thisSlicePx;
      pageNum++;
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
          <Button onClick={findOnMap} variant="outline" className="w-full gap-2" disabled={geoLoading}>
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            Find Location & Capture Map
          </Button>
        </Card>
      </div>

      {/* EPC settings */}
      <Card className="p-5 mt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-orange-600" />
          <h2 className="font-semibold">EPC Settings (editable)</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Field
            label="EPC Rate (₹ / kW, incl. GST + Insurance + Cleaning)"
            value={epcRate} type="number"
            onChange={(v) => setEpcRate(v)}
          />
          <div className="hidden md:block" />
          {epcLabels.map((lbl, i) => {
            const pcts = [10, 70, 15, 5];
            return (
              <Field
                key={i}
                label={`${pcts[i]}% Milestone Label`}
                value={lbl}
                onChange={(v) => {
                  const next = [...epcLabels] as [string, string, string, string];
                  next[i] = v;
                  setEpcLabels(next);
                }}
              />
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground">
          Default: <b>10%</b> advance against PO · <b>70%</b> material ready to dispatch · <b>15%</b> pre-installation · <b>5%</b> post-installation. Percentages are fixed; only the rate and milestone wording are editable. Regenerate the report to apply changes.
        </div>
      </Card>

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
            <div className="px-8 py-6 flex items-center justify-between gap-4"
              style={{ background: "linear-gradient(135deg,#0a1b33 0%,#1a3c6e 100%)" }}>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-orange-400">Unite Solar</div>
                <div className="text-2xl md:text-3xl font-extrabold text-white">Solar Feasibility Report</div>
                <div className="text-sm text-white/80 mt-1">
                  {manual.consumer_name || "Customer"} · {manual.location || "—"} · {SEGMENT_LABEL[report.segment]}
                </div>
              </div>
              <Sun className="h-14 w-14 text-orange-400 shrink-0" />
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

              {/* Location + satellite map */}
              {(mapUrl || manual.location) && (
                <Card className="p-4">
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Site Location
                  </div>
                  <div className="text-sm mb-2">
                    <span className="text-muted-foreground">Address: </span>
                    <span className="font-medium">{manual.location || "—"}</span>
                    {geo && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({geo.lat.toFixed(5)}°, {geo.lng.toFixed(5)}°)
                      </span>
                    )}
                  </div>
                  {mapUrl ? (
                    <img src={mapUrl} alt="Site satellite view"
                      crossOrigin="anonymous"
                      className="w-full rounded border border-border"
                      style={{ maxHeight: 380, objectFit: "cover" }} />
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Click "Find Location & Capture Map" to add satellite imagery.
                    </div>
                  )}
                </Card>
              )}

              {/* State regulatory / permission */}
              <Card className="p-4">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" /> Regulatory & Permissions
                </div>
                <KV label="State" v={extracted?.state || report.state || "Detect from bill"} />
                <KV label="DISCOM / Utility" v={report.discom || extracted?.utility_provider || "—"} />
                <KV label="Tariff Category" v={extracted?.tariff_category || "—"} />
                <div className="mt-2 text-sm bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="font-semibold text-amber-900 mb-1">Approval Pathway</div>
                  <div className="text-amber-900/90">{report.state_permission}</div>
                </div>
              </Card>

              {/* Investment Models */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* BOOT */}
                <Card className="p-4 border-green-200">
                  <div className="font-semibold mb-2 flex items-center gap-2 text-green-700">
                    <Handshake className="h-4 w-4" /> BOOT Model
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Build-Own-Operate-Transfer · Zero CapEx
                  </div>
                  <KV label="Rent" v={`₹${report.boot.rent_per_kw_per_month.toLocaleString("en-IN")}/kW/month`} />
                  <KV label="Period" v={`${report.boot.period_years} years`} />
                  <KV label="Monthly Rent" v={formatINR(report.boot.monthly_rent)} />
                  <KV label="Annual Rent" v={formatINR(report.boot.annual_rent)} />
                  <KV label={`Total (${report.boot.period_years} yrs)`} v={formatINR(report.boot.total_rent)} />
                  <div className="mt-2 text-xs bg-green-50 border border-green-200 rounded p-2 text-green-800">
                    {report.boot.handover_after}
                  </div>
                </Card>

                {/* PPA */}
                <Card className="p-4 border-blue-200">
                  <div className="font-semibold mb-2 flex items-center gap-2 text-blue-700">
                    <IndianRupee className="h-4 w-4" /> PPA Model
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Power Purchase Agreement · 25-year long term
                  </div>
                  <KV label="Grid Tariff" v={`₹${report.ppa.grid_tariff} / kWh`} />
                  <KV label="Discount" v={`${report.ppa.discount_pct}%`} />
                  <KV label="PPA Tariff" v={`₹${report.ppa.ppa_tariff} / kWh`} />
                  <KV label="Term" v={`${report.ppa.period_years} years`} />
                  <KV label="Year-1 Saving" v={formatINR(report.ppa.year1_savings)} />
                  <KV label="25-yr Saving" v={formatINR(report.ppa.lifetime_savings_25y)} />
                </Card>

                {/* EPC */}
                <Card className="p-4 border-orange-200">
                  <div className="font-semibold mb-2 flex items-center gap-2 text-orange-700">
                    <Wrench className="h-4 w-4" /> EPC Model
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Turnkey · Incl. GST, Insurance & Module Cleaning
                  </div>
                  <KV label="Rate" v={`₹${report.epc.rate_per_kw.toLocaleString("en-IN")} / kW`} />
                  <KV label="Capacity" v={`${report.recommended_capacity_kw} kW`} />
                  <KV label="Total EPC Cost" v={formatINR(report.epc.total_cost)} />
                  <div className="mt-2 text-xs font-semibold text-orange-900">Payment Milestones</div>
                  <div className="mt-1 space-y-1 text-xs">
                    {report.epc.payment_terms.map((p, i) => (
                      <div key={i} className="flex justify-between border-b border-orange-100 py-1">
                        <span>{p.pct}% · {p.milestone}</span>
                        <span className="font-semibold">{formatINR(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Bank Details */}
              <Card className="p-4">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-primary" /> Bank Details (for EPC payments)
                </div>
                <div className="grid md:grid-cols-2 gap-x-6">
                  <KV label="Beneficiary" v="Unite Developers Global Inc" />
                  <KV label="Bank Name" v="Axis Bank Ltd." />
                  <KV label="Account No." v="925020025300736" />
                  <KV label="IFSC" v="UTIB0000030" />
                  <KV label="Branch" v="Jubilee Hills" />
                  <KV label="Customer ID" v="975232560" />
                  <KV label="Account Type" v="Current" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Update these from Solar → Branding → Bank Details before sharing the report.
                </div>
              </Card>

              <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                Powered by Unite Developers Global Inc · www.unitesolar.in
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <FeasibilityChatbot
          enabled={!!report}
          context={{
            customer: {
              name: manual.consumer_name,
              location: manual.location,
              segment,
            },
            bill: {
              monthly_units: manual.monthly_units,
              monthly_bill: manual.monthly_bill,
              tariff_per_unit: manual.energy_charge_per_unit,
              sanction_load_kw: manual.sanction_load_kw,
              tariff_category: extracted?.tariff_category,
              utility_provider: extracted?.utility_provider,
              state: extracted?.state,
            },
            feasibility: report,
          }}
        />
      </div>
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