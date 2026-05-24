import React from "react";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2, XCircle, Factory, Sun, Zap, Gauge, ShieldCheck,
  Battery, Cpu, Activity, Leaf, TrendingUp, ArrowRight, Building2,
  Plug, Network, AlertTriangle, Award,
} from "lucide-react";
import type { FeasibilityReport } from "@/lib/feasibility";

const NAVY = "#0a1b33";
const NAVY_SOFT = "#1a3c6e";
const GREEN = "#16a34a";
const ORANGE = "#f59e0b";

const SectionHeader: React.FC<{ eyebrow: string; title: string; subtitle?: string }> = ({
  eyebrow, title, subtitle,
}) => (
  <div className="mb-5">
    <div className="text-[10px] font-bold tracking-[0.28em]" style={{ color: ORANGE }}>{eyebrow}</div>
    <h2 className="text-xl md:text-2xl font-extrabold mt-1" style={{ color: NAVY }}>{title}</h2>
    {subtitle && <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>}
    <div className="h-[3px] w-16 rounded-full mt-3" style={{ background: ORANGE }} />
  </div>
);

const Yes: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
    <CheckCircle2 className="h-3.5 w-3.5" /> {children ?? "Allowed"}
  </span>
);
const No: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
    <XCircle className="h-3.5 w-3.5" /> {children ?? "Not Allowed"}
  </span>
);

/* Section 1 */
const STATE_ROWS: Array<{
  state: string; nm: "yes" | "no"; maxLoad: string; industrial: string; captive: string;
  status: "Active" | "Restricted" | "Open Access";
}> = [
  { state: "Telangana",      nm: "yes", maxLoad: "Up to 500 kW (LT/HT)",          industrial: "Eligible (HT)",       captive: "Group Captive Allowed", status: "Active" },
  { state: "Andhra Pradesh", nm: "yes", maxLoad: "Up to 1 MW (HT)",                industrial: "Eligible",            captive: "Captive & Open Access", status: "Active" },
  { state: "Karnataka",      nm: "yes", maxLoad: "Up to 1 MW",                     industrial: "HT Industrial OK",    captive: "Open Access Friendly",  status: "Open Access" },
  { state: "Tamil Nadu",     nm: "yes", maxLoad: "Up to 999 kW",                   industrial: "Eligible (Net Bill)", captive: "Captive Supported",     status: "Restricted" },
  { state: "Maharashtra",    nm: "yes", maxLoad: "Up to 500 kW (NM) / 5 MW (NB)",  industrial: "HT Industrial Eligible", captive: "Captive & Group Captive", status: "Active" },
];

const PolicyTable: React.FC = () => (
  <Card className="p-5">
    <SectionHeader
      eyebrow="SECTION 01 · POLICY"
      title="Statewise Solar Net Metering Policy Assessment"
      subtitle="Industrial Solar Adoption & Regulatory Feasibility"
    />
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: NAVY, color: "white" }}>
            {["STATE","NET METERING","MAX PERMITTED LOAD","INDUSTRIAL ELIGIBILITY","CAPTIVE / GROUP CAPTIVE","POLICY STATUS"].map(h => (
              <th key={h} className="text-left px-3 py-3 text-[11px] tracking-widest font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STATE_ROWS.map((r, i) => (
            <tr key={r.state} className={i % 2 ? "bg-muted/30" : "bg-white"}>
              <td className="px-3 py-3 font-bold" style={{ color: NAVY }}>
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4" style={{ color: ORANGE }} />{r.state}
                </span>
              </td>
              <td className="px-3 py-3">{r.nm === "yes" ? <Yes /> : <No />}</td>
              <td className="px-3 py-3">{r.maxLoad}</td>
              <td className="px-3 py-3"><span className="inline-flex items-center gap-1"><Factory className="h-3.5 w-3.5 text-slate-500" />{r.industrial}</span></td>
              <td className="px-3 py-3"><span className="inline-flex items-center gap-1"><Network className="h-3.5 w-3.5 text-slate-500" />{r.captive}</span></td>
              <td className="px-3 py-3">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{
                  background: r.status === "Active" ? "#dcfce7" : r.status === "Open Access" ? "#dbeafe" : "#fef3c7",
                  color: r.status === "Active" ? "#166534" : r.status === "Open Access" ? "#1e40af" : "#92400e",
                }}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Policy approved</span>
      <span className="inline-flex items-center gap-1"><Plug className="h-3 w-3 text-blue-600" /> HT consumers</span>
      <span className="inline-flex items-center gap-1"><Sun className="h-3 w-3 text-orange-500" /> Solar rooftop</span>
      <span className="inline-flex items-center gap-1"><Factory className="h-3 w-3 text-slate-600" /> Industrial loads</span>
      <span className="inline-flex items-center gap-1"><Leaf className="h-3 w-3 text-green-600" /> Green energy</span>
    </div>
  </Card>
);

/* Section 2 */
const EngineCard: React.FC<{ icon: React.ReactNode; title: string; value: string; sub: string; accent: string }> = ({ icon, title, value, sub, accent }) => (
  <div className="rounded-xl p-4 bg-white border" style={{ borderColor: `${accent}33`, boxShadow: "0 6px 16px rgba(10,27,51,0.05)" }}>
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${accent}1A`, color: accent }}>{icon}</div>
      <div className="text-[11px] font-bold tracking-widest uppercase" style={{ color: accent }}>{title}</div>
    </div>
    <div className="mt-2 text-xl font-extrabold" style={{ color: NAVY }}>{value}</div>
    <div className="text-xs text-muted-foreground">{sub}</div>
  </div>
);

const AutoEngine: React.FC<{ r: FeasibilityReport; sanction?: string }> = ({ r, sanction }) => {
  const monthlyUnits = Math.round(r.annual_generation_kwh / 12);
  const peakKw = Math.round((parseFloat(sanction || "0") || r.recommended_capacity_kw) * 0.8);
  const oaFeasible = r.recommended_capacity_kw > 500;
  return (
    <Card className="p-5">
      <SectionHeader
        eyebrow="SECTION 02 · ENGINE"
        title="Automatic Solar Capacity Recommendation Engine"
        subtitle="Live computation from bill inputs · powered by Unite Solar AI"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <EngineCard icon={<Plug className="h-5 w-5" />} title="Connected Load" value={`${sanction || "—"} kW`} sub="Sanctioned demand" accent={NAVY_SOFT} />
        <EngineCard icon={<Activity className="h-5 w-5" />} title="Avg Consumption" value={`${monthlyUnits.toLocaleString("en-IN")} kWh/mo`} sub="Derived from generation" accent={ORANGE} />
        <EngineCard icon={<Gauge className="h-5 w-5" />} title="Peak Demand Est." value={`${peakKw} kW`} sub="≈ 80% of sanction" accent="#dc2626" />
        <EngineCard icon={<Sun className="h-5 w-5" />} title="Recommended Rooftop" value={`${r.recommended_capacity_kw} kW`} sub="Auto-sized" accent={GREEN} />
        <EngineCard icon={<Network className="h-5 w-5" />} title="Open Access" value={oaFeasible ? "Feasible" : "Not Required"} sub=">500 kW threshold" accent="#0ea5e9" />
        <EngineCard icon={<Battery className="h-5 w-5" />} title="BTM Recommendation" value={`${r.behind_the_meter_kw} kW`} sub="Self-consumption" accent="#7c3aed" />
      </div>
    </Card>
  );
};

/* Section 3 */
const BTMStrategy: React.FC = () => (
  <Card className="p-6 overflow-hidden relative" style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 60%, #fffbeb 100%)", borderColor: "#86efac" }}>
    <SectionHeader eyebrow="SECTION 03 · STRATEGY" title="Recommended Behind-the-Meter Solar Strategy" />
    <div className="rounded-xl p-5 border-2 border-green-500/40 bg-white">
      <div className="flex items-start gap-3">
        <Award className="h-6 w-6 text-green-600 shrink-0 mt-1" />
        <p className="text-[15px] md:text-base font-semibold leading-relaxed" style={{ color: NAVY }}>
          “Based on total annual consumption analysis, approximately <span className="text-green-700 font-extrabold">30% of average energy demand</span> is recommended under <span className="text-green-700 font-extrabold">Behind-the-Meter / Zero Export Solar Architecture</span> for optimal industrial savings and grid stability.”
        </p>
      </div>
    </div>
    <div className="grid md:grid-cols-3 gap-3 mt-4">
      {[
        { i: <Zap className="h-4 w-4" />, t: "Minimizes grid dependency" },
        { i: <TrendingUp className="h-4 w-4" />, t: "Reduces peak tariff exposure" },
        { i: <ShieldCheck className="h-4 w-4" />, t: "Improves power reliability" },
        { i: <Sun className="h-4 w-4" />, t: "Maximizes rooftop utilization" },
        { i: <Leaf className="h-4 w-4" />, t: "Supports ESG compliance" },
        { i: <Activity className="h-4 w-4" />, t: "Reduces transmission losses" },
      ].map((b, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-white border border-green-200 px-3 py-2 text-sm">
          <span className="text-green-700">{b.i}</span>
          <span className="font-medium" style={{ color: NAVY }}>{b.t}</span>
        </div>
      ))}
    </div>
    <div className="mt-5 rounded-xl bg-white border border-green-200 p-4">
      <div className="text-[11px] font-bold tracking-widest uppercase text-green-700 mb-3">Energy Flow · Factory rooftop → internal load</div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        {[
          { i: <Sun className="h-5 w-5" />, t: "Rooftop PV", c: ORANGE },
          { i: <Cpu className="h-5 w-5" />, t: "Zero-Export EMS", c: NAVY_SOFT },
          { i: <Factory className="h-5 w-5" />, t: "Plant Loads", c: GREEN },
          { i: <Battery className="h-5 w-5" />, t: "BESS Buffer", c: "#7c3aed" },
        ].map((n, i, arr) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white" style={{ borderColor: `${n.c}55` }}>
              <span style={{ color: n.c }}>{n.i}</span>
              <span className="font-bold" style={{ color: NAVY }}>{n.t}</span>
            </div>
            {i < arr.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  </Card>
);

/* Section 4 */
const COMPARE: Array<[string, string, string]> = [
  ["Grid Export", "Allowed", "Not Allowed"],
  ["Grid Dependency", "Medium", "Low"],
  ["Policy Dependency", "Higher", "Lower"],
  ["Internal Consumption", "Partial", "Maximum"],
  ["Savings Potential", "High", "Very High"],
  ["Grid Stability", "Medium", "Excellent"],
  ["Industrial Suitability", "Good", "Excellent"],
  ["HT Consumer Compatibility", "Moderate", "High"],
];

const Compare: React.FC = () => (
  <Card className="p-5">
    <SectionHeader eyebrow="SECTION 04 · COMPARISON" title="Industrial Solar Operating Models" subtitle="Net Metering vs Zero Export — at a glance" />
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: NAVY, color: "white" }}>
            <th className="text-left px-3 py-3 text-[11px] tracking-widest font-bold">PARAMETER</th>
            <th className="text-left px-3 py-3 text-[11px] tracking-widest font-bold">NET METERING</th>
            <th className="text-left px-3 py-3 text-[11px] tracking-widest font-bold" style={{ background: "#0f2a5c" }}>ZERO EXPORT</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE.map(([p, a, b], i) => (
            <tr key={p} className={i % 2 ? "bg-muted/30" : "bg-white"}>
              <td className="px-3 py-3 font-semibold" style={{ color: NAVY }}>{p}</td>
              <td className="px-3 py-3">{a}</td>
              <td className="px-3 py-3 font-bold text-green-700">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

/* Section 5 */
const SavingsCards: React.FC<{ r: FeasibilityReport }> = ({ r }) => {
  const nmAnnual = Math.round(r.annual_savings);
  const hybridAnnual = Math.round(r.annual_savings * 1.18);
  return (
    <div>
      <SectionHeader eyebrow="SECTION 05 · SAVINGS" title="Projected Savings Analysis" subtitle="Net Metering vs Hybrid (NM + Zero Export) — annualised view" />
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 border-blue-200">
          <div className="text-[11px] tracking-widest font-bold text-blue-700">SAVINGS · NET METERING</div>
          <div className="text-2xl font-extrabold mt-1" style={{ color: NAVY }}>
            ₹ {(nmAnnual / 100000).toFixed(1)} L <span className="text-sm font-semibold text-muted-foreground">/ year</span>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" /> Export credits offset night-time draw</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" /> Reduced monthly electricity bill</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" /> Peak shaving on TOD slabs</li>
            <li className="flex gap-2"><Leaf className="h-4 w-4 text-green-600 mt-0.5" /> CO₂ reduction ~ {Math.round(r.co2_offset_tonnes_25y / 25)} t/yr</li>
          </ul>
        </Card>
        <Card className="p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0a1b33 0%,#1a3c6e 100%)", color: "white" }}>
          <div className="absolute top-3 right-3 text-[10px] font-bold tracking-widest bg-orange-500 text-white px-2 py-1 rounded-full">RECOMMENDED</div>
          <div className="text-[11px] tracking-widest font-bold text-orange-300">HYBRID · NM + ZERO EXPORT</div>
          <div className="text-2xl font-extrabold mt-1">
            ₹ {(hybridAnnual / 100000).toFixed(1)} L <span className="text-sm font-semibold text-white/70">/ year</span>
          </div>
          <div className="text-xs text-white/70 mt-0.5">~18% higher savings vs pure NM</div>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-orange-300 mt-0.5" /> Maximum internal utilization</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-orange-300 mt-0.5" /> Reduced grid stress</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-orange-300 mt-0.5" /> Improved ROI & shorter payback</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-orange-300 mt-0.5" /> Stable industrial energy cost</li>
            <li className="flex gap-2"><Leaf className="h-4 w-4 text-green-300 mt-0.5" /> Higher sustainability score</li>
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/10 p-3">
              <div className="text-[10px] tracking-widest text-white/70">ROI (25y)</div>
              <div className="font-extrabold text-lg">{r.roi_pct_25y}%</div>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <div className="text-[10px] tracking-widest text-white/70">PAYBACK</div>
              <div className="font-extrabold text-lg">{r.payback_years} yrs</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* Section 6 */
const ArchNode: React.FC<{ icon: React.ReactNode; title: string; sub: string; accent: string }> = ({ icon, title, sub, accent }) => (
  <div className="rounded-xl p-3 bg-white border text-center min-w-[120px]" style={{ borderColor: `${accent}55` }}>
    <div className="mx-auto h-10 w-10 rounded-full flex items-center justify-center mb-2" style={{ background: `${accent}1A`, color: accent }}>{icon}</div>
    <div className="text-[12px] font-extrabold" style={{ color: NAVY }}>{title}</div>
    <div className="text-[10px] text-muted-foreground">{sub}</div>
  </div>
);

const Architecture: React.FC = () => (
  <Card className="p-5">
    <SectionHeader eyebrow="SECTION 06 · ARCHITECTURE" title="Recommended Industrial Solar Architecture" subtitle="Solar Rooftop + Open Access + BTM + Grid + BESS" />
    <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ArchNode icon={<Sun className="h-5 w-5" />} title="Rooftop PV" sub="Primary gen" accent={ORANGE} />
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <ArchNode icon={<Network className="h-5 w-5" />} title="Open Access" sub="Wheeled energy" accent="#0ea5e9" />
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <ArchNode icon={<Cpu className="h-5 w-5" />} title="Smart EMS" sub="SCADA + controls" accent={NAVY_SOFT} />
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <ArchNode icon={<ShieldCheck className="h-5 w-5" />} title="Zero-Export" sub="Grid protect" accent="#dc2626" />
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <ArchNode icon={<Battery className="h-5 w-5" />} title="BESS" sub="Storage buffer" accent="#7c3aed" />
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <ArchNode icon={<Factory className="h-5 w-5" />} title="Plant Loads" sub="Internal use" accent={GREEN} />
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <ArchNode icon={<Plug className="h-5 w-5" />} title="Utility Grid" sub="Backup only" accent="#475569" />
      </div>
      <div className="mt-4 grid md:grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-orange-500" /> SCADA monitoring for inverter & string-level analytics</div>
        <div className="flex items-center gap-1"><Cpu className="h-3.5 w-3.5 text-blue-600" /> EMS optimizes generation, storage & load dispatch</div>
        <div className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-red-600" /> Zero-Export Controller ensures statutory compliance</div>
      </div>
    </div>
  </Card>
);

/* Section 7 */
const StatBubble: React.FC<{ value: string; label: string; accent: string }> = ({ value, label, accent }) => (
  <div className="rounded-xl p-4 bg-white/10 border border-white/15 text-center backdrop-blur-sm">
    <div className="text-2xl md:text-3xl font-extrabold" style={{ color: accent }}>{value}</div>
    <div className="text-[10px] tracking-widest font-bold text-white/80 uppercase mt-1">{label}</div>
  </div>
);

const ExecutiveRecommendation: React.FC<{ r: FeasibilityReport }> = ({ r }) => {
  const btmShare = Math.round((r.behind_the_meter_kw / Math.max(1, r.recommended_capacity_kw)) * 100);
  const nmShare = 100 - btmShare;
  return (
    <Card className="p-6 relative overflow-hidden border-0" style={{ background: "linear-gradient(135deg,#0a1b33 0%, #13294b 60%, #0a1b33 100%)", color: "white" }}>
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.25), transparent 70%)" }} />
      <div className="text-[10px] font-bold tracking-[0.28em] text-orange-400">SECTION 07 · EXECUTIVE SUMMARY</div>
      <h2 className="text-2xl md:text-3xl font-extrabold mt-1">Unite Solar Recommendation</h2>
      <div className="h-[3px] w-16 rounded-full mt-3 bg-orange-400" />
      <p className="mt-4 text-[15px] leading-relaxed text-white/90 max-w-4xl">
        “For industrial consumers, a <span className="font-extrabold text-orange-300">hybrid strategy</span> combining
        <span className="font-extrabold text-white"> Open Access Solar</span>,
        <span className="font-extrabold text-white"> Behind-the-Meter systems</span>, and
        <span className="font-extrabold text-white"> Zero Export architecture</span> is recommended for achieving
        maximum long-term savings, energy security, ESG compliance, and operational stability.”
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
        <StatBubble value={`${nmShare}%`} label="Recommended Solar (NM)" accent="#fde68a" />
        <StatBubble value={`${btmShare}%`} label="Recommended BTM" accent="#86efac" />
        <StatBubble value={`${Math.max(10, 100 - btmShare)}%`} label="Grid Dependency" accent="#93c5fd" />
        <StatBubble value={`${r.roi_pct_25y}%`} label="Estimated Savings (25y)" accent="#fcd34d" />
        <StatBubble value={`${Math.round(r.co2_offset_tonnes_25y / 25)}t/yr`} label="Carbon Reduction" accent="#86efac" />
      </div>
    </Card>
  );
};

const FeasibilityNetMeteringSections: React.FC<{ r: FeasibilityReport; sanctionLoad?: string }> = ({ r, sanctionLoad }) => (
  <div className="space-y-6">
    <PolicyTable />
    <AutoEngine r={r} sanction={sanctionLoad} />
    <BTMStrategy />
    <Compare />
    <SavingsCards r={r} />
    <Architecture />
    <ExecutiveRecommendation r={r} />
  </div>
);

export default FeasibilityNetMeteringSections;
