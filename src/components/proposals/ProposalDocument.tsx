// 12-page Unite Solar proposal document. Each .pdf-page is A4 portrait
// (210x297mm). The PDF exporter rasterizes each page in order.
import React from "react";
import { Sun, Zap, Leaf, ShieldCheck, Award, Users, TrendingUp, Mail, Phone, MapPin, CheckCircle2, AlertTriangle, Wallet } from "lucide-react";
import { computeProposal, inr, num, type ProposalInputs } from "@/lib/proposal-calc";

export interface ProposalDoc extends ProposalInputs {
  id?: string;
  title?: string;
  proposal_number?: string;
  cover_image_url?: string;
  client_contact?: string;
  client_email?: string;
}

const NAVY = "#0b1f3a";
const GREEN = "#16a34a";

const Page: React.FC<{ children: React.ReactNode; pageNo: number; totalPages: number; title?: string }> = ({
  children, pageNo, totalPages, title,
}) => (
  <div
    className="pdf-page relative bg-white text-[#0b1f3a] mx-auto shadow-lg"
    style={{ width: "210mm", minHeight: "297mm", maxHeight: "297mm", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif" }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-10 py-4 border-b-2" style={{ borderColor: GREEN }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{ background: NAVY }}>
          <Sun className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-extrabold tracking-wide" style={{ color: NAVY }}>UNITE SOLAR</div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-emerald-600">Powering Tomorrow</div>
        </div>
      </div>
      {title && <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>}
    </div>

    {/* Body — fixed height so content cannot push into the footer */}
    <div className="px-10 py-5 overflow-hidden" style={{ height: "calc(297mm - 28mm)" }}>
      {children}
    </div>

    {/* Footer — fixed height band */}
    <div className="absolute bottom-0 left-0 right-0 h-[14mm] px-10 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 bg-white">
      <span>Unite Solar · contact@unitesolar.in · +91 00000 00000</span>
      <span>Page {pageNo} / {totalPages}</span>
    </div>
  </div>
);

const Stat: React.FC<{ label: string; value: string; icon: React.ElementType; color?: string }> = ({ label, value, icon: I, color = NAVY }) => (
  <div className="rounded-xl border-2 p-4 flex items-center gap-3" style={{ borderColor: color + "20", background: color + "08" }}>
    <div className="w-10 h-10 rounded-lg text-white flex items-center justify-center" style={{ background: color }}>
      <I className="h-5 w-5" />
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="text-base font-extrabold" style={{ color: NAVY }}>{value}</div>
    </div>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode; accent?: string }> = ({ children, accent = GREEN }) => (
  <h2 className="text-2xl font-black mb-3 flex items-center gap-3" style={{ color: NAVY }}>
    <span className="inline-block w-1.5 h-6 rounded-full" style={{ background: accent }} />
    {children}
  </h2>
);

const TH: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = (p) => (
  <th {...p} className={`text-left text-[11px] font-bold uppercase tracking-wider px-3 py-2 text-white ${p.className || ""}`} style={{ background: NAVY }} />
);
const TD: React.FC<React.TdHTMLAttributes<HTMLTableCellElement> & { mono?: boolean }> = ({ mono, ...p }) => (
  <td {...p} className={`px-3 py-2 text-[12px] border-b border-slate-100 ${mono ? "font-mono tabular-nums" : ""} ${p.className || ""}`} />
);

// ────────────────────────────────────────────────────────────────────────────────
const ProposalDocument: React.FC<{ doc: ProposalDoc }> = ({ doc }) => {
  const c = computeProposal(doc);
  const total = 12;
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const proposalNo = doc.proposal_number || `USP-${(doc.id || "DRAFT").slice(0, 6).toUpperCase()}`;

  return (
    <div id="proposal-doc" className="space-y-6 py-6 bg-slate-100">
      {/* PAGE 1 — COVER */}
      <div className="pdf-page relative mx-auto shadow-2xl overflow-hidden" style={{ width: "210mm", height: "297mm", background: NAVY }}>
        {doc.cover_image_url ? (
          <img src={doc.cover_image_url} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0e3a5e 60%, ${GREEN} 130%)` }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,31,58,0.55) 0%, rgba(11,31,58,0.15) 40%, rgba(11,31,58,0.85) 100%)" }} />
        <div className="relative h-full flex flex-col px-14 py-16 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Sun className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-wide">UNITE SOLAR</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-300">Powering Tomorrow</div>
            </div>
          </div>

          <div className="flex-1" />

          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300 mb-2">Solar Project Proposal</div>
            <h1 className="text-5xl font-black leading-tight mb-2 max-w-[80%]">{doc.title || "Solar Power Solution"}</h1>
            <div className="text-xl font-light text-white/90 mb-6">Prepared for <span className="font-semibold">{doc.client_name || "—"}</span></div>

            <div className="grid grid-cols-3 gap-3 max-w-[80%]">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                <div className="text-[9px] uppercase tracking-wider text-emerald-300">Capacity</div>
                <div className="text-2xl font-black">{num(c.systemCost > 0 ? doc.capacity_kw || 0 : doc.capacity_kw || 0)} kW</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                <div className="text-[9px] uppercase tracking-wider text-emerald-300">Type</div>
                <div className="text-2xl font-black">{doc.project_type || "—"}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                <div className="text-[9px] uppercase tracking-wider text-emerald-300">Location</div>
                <div className="text-base font-bold leading-tight pt-1">{doc.client_location || "—"}</div>
              </div>
            </div>

            <div className="flex justify-between items-end mt-10 pt-6 border-t border-white/20 text-[11px] text-white/80">
              <div><span className="text-emerald-300 font-semibold">Proposal No.</span> {proposalNo}</div>
              <div><span className="text-emerald-300 font-semibold">Date</span> {today}</div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2 — PROPOSAL SUMMARY */}
      <Page pageNo={2} totalPages={total} title="Proposal Summary">
        <SectionTitle>Project at a Glance</SectionTitle>
        <p className="text-[12.5px] text-slate-700 mb-5 leading-relaxed">
          This proposal outlines a turnkey solar power solution for <strong>{doc.client_name || "the client"}</strong> at{" "}
          <strong>{doc.client_location || "the project site"}</strong>. The plant is designed for{" "}
          <strong>{num(doc.capacity_kw || 0)} kW</strong> capacity, <strong>{doc.project_type || "—"}</strong> mounted, with full EPC
          execution and 25-year performance assurance from Unite Solar.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Plant Capacity" value={`${num(doc.capacity_kw || 0)} kW`} icon={Zap} color={NAVY} />
          <Stat label="System Type" value={doc.project_type || "—"} icon={Sun} color={GREEN} />
          <Stat label="Monthly Generation" value={`${num(c.monthlyUnits)} units`} icon={TrendingUp} color="#0ea5e9" />
          <Stat label="Annual Savings" value={inr(c.annualSavings)} icon={Wallet} color="#f59e0b" />
          <Stat label="ROI Period" value={`${num(c.roiMonths, 1)} months`} icon={Award} color="#8b5cf6" />
          <Stat label="25-Year Savings" value={inr(c.savings25y)} icon={Leaf} color={GREEN} />
        </div>

        <div className="mt-6 rounded-xl p-4 border-2" style={{ borderColor: GREEN, background: `${GREEN}10` }}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Investment Summary</div>
          <div className="text-3xl font-black" style={{ color: NAVY }}>{inr(c.totalCost)}</div>
          <div className="text-[11px] text-slate-600 mt-1">Inclusive of all GST · turnkey delivery</div>
        </div>
      </Page>

      {/* PAGE 3 — COMPANY OVERVIEW */}
      <Page pageNo={3} totalPages={total} title="Company Overview">
        <SectionTitle>About Unite Solar</SectionTitle>
        <p className="text-[12.5px] text-slate-700 leading-relaxed mb-4">
          Unite Solar is an end-to-end solar EPC company committed to clean energy adoption across India.
          With a track record of <strong>50+ MW commissioned</strong> across rooftop and ground-mount projects, we deliver
          design, supply, installation, commissioning and long-term O&M under one roof.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { k: "50+ MW", v: "Commissioned" },
            { k: "200+", v: "Happy Clients" },
            { k: "12+ States", v: "Active Operations" },
          ].map((s) => (
            <div key={s.k} className="rounded-xl p-4 text-center text-white" style={{ background: NAVY }}>
              <div className="text-3xl font-black">{s.k}</div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 mt-1">{s.v}</div>
            </div>
          ))}
        </div>

        <SectionTitle accent="#f59e0b">Vision · Mission · Values</SectionTitle>
        <div className="grid grid-cols-3 gap-3 text-[11.5px]">
          <div className="rounded-xl border-2 border-slate-200 p-4">
            <div className="font-bold text-amber-600 uppercase tracking-wider text-[10px] mb-1">Vision</div>
            <p>To accelerate India's transition to clean, distributed solar energy in every district.</p>
          </div>
          <div className="rounded-xl border-2 border-slate-200 p-4">
            <div className="font-bold text-amber-600 uppercase tracking-wider text-[10px] mb-1">Mission</div>
            <p>Deliver bankable, performance-guaranteed solar plants that pay back in under 5 years.</p>
          </div>
          <div className="rounded-xl border-2 border-slate-200 p-4">
            <div className="font-bold text-amber-600 uppercase tracking-wider text-[10px] mb-1">Values</div>
            <p>Integrity · Engineering excellence · Customer-first · Sustainability at scale.</p>
          </div>
        </div>
      </Page>

      {/* PAGE 4 — WHY UNITE SOLAR */}
      <Page pageNo={4} totalPages={total} title="Why Unite Solar">
        <SectionTitle>Why Choose Us</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {[
            { i: ShieldCheck, t: "Bankable Quality", d: "Tier-1 panels, IEC-certified inverters, 25-yr performance warranty." },
            { i: Award, t: "Proven EPC Track Record", d: "50+ MW commissioned across India with zero safety incidents." },
            { i: Users, t: "In-house Engineering", d: "Dedicated design + project teams — no subcontracting of critical works." },
            { i: TrendingUp, t: "Bankable ROI", d: "Plants designed to deliver 4–5 year payback with 25-year savings horizon." },
            { i: Leaf, t: "Sustainable Operations", d: "Lean civil + smart logistics reduce embodied CO₂ of every project." },
            { i: Sun, t: "Lifetime Support", d: "Local O&M presence + 24/7 remote monitoring on every plant." },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border-2 border-slate-200 p-4 flex gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: GREEN }}>
                <f.i className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-[13px]" style={{ color: NAVY }}>{f.t}</div>
                <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </Page>

      {/* PAGE 5 — PROJECT SCOPE */}
      <Page pageNo={5} totalPages={total} title="Scope of Work">
        <SectionTitle>Scope of Work</SectionTitle>
        <p className="text-[12px] text-slate-700 mb-4">Turnkey delivery covering EPC + civil works:</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4" style={{ background: `${NAVY}08`, border: `1px solid ${NAVY}30` }}>
            <div className="font-bold mb-2 flex items-center gap-2" style={{ color: NAVY }}>
              <Zap className="h-4 w-4" /> EPC Scope
            </div>
            <ul className="space-y-1.5 text-[11.5px] text-slate-700">
              {["Detailed engineering & design", "Supply of solar panels & inverters", "Mounting structure fabrication", "DC & AC cabling, junction boxes", "Earthing & lightning protection", "SCADA / monitoring system", "Commissioning & grid synchronisation"].map((x) => (
                <li key={x} className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-4" style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}40` }}>
            <div className="font-bold mb-2 flex items-center gap-2" style={{ color: NAVY }}>
              <ShieldCheck className="h-4 w-4" /> Civil Scope
            </div>
            <ul className="space-y-1.5 text-[11.5px] text-slate-700">
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />Boundary wall — {doc.wall_type || "RCC"} ({num(doc.boundary_length_rmt || 0)} RMT)</li>
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />Foundation footings — {num(doc.footing_count || 0)} nos</li>
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />Site grading & access road</li>
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />Inverter / control room civil</li>
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />Cable trenching</li>
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />Soil type considered: {doc.soil_type || "—"}</li>
            </ul>
          </div>
        </div>

        <SectionTitle accent="#0ea5e9">Client Details</SectionTitle>
        <div className="rounded-xl border-2 border-slate-200 overflow-hidden">
          <table className="w-full">
            <tbody>
              {[
                ["Client Name", doc.client_name || "—"],
                ["Location", doc.client_location || "—"],
                ["Contact", doc.client_contact || "—"],
                ["Email", doc.client_email || "—"],
                ["Project Type", doc.project_type || "—"],
                ["Capacity", `${num(doc.capacity_kw || 0)} kW`],
                ["Soil Type", doc.soil_type || "—"],
              ].map(([k, v]) => (
                <tr key={k as string} className="even:bg-slate-50">
                  <td className="px-3 py-1.5 text-[11.5px] text-slate-500 w-1/3 font-semibold">{k}</td>
                  <td className="px-3 py-1.5 text-[12px] font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Page>

      {/* PAGE 6 — TECHNICAL BOQ */}
      <Page pageNo={6} totalPages={total} title="Technical BOQ">
        <SectionTitle>Bill of Quantities</SectionTitle>
        <table className="w-full border-collapse rounded-xl overflow-hidden">
          <thead><tr><TH>Item</TH><TH>Specification</TH><TH className="text-right">Qty</TH></tr></thead>
          <tbody>
            <tr><TD>Solar Panels</TD><TD>Mono PERC, Tier-1, {num(doc.panel_wattage || 0)}Wp</TD><TD className="text-right" mono>{num(doc.panel_count || 0)} nos</TD></tr>
            <tr><TD>Inverter</TD><TD>String / Central, MPPT, IP65</TD><TD className="text-right" mono>{num(doc.inverter_capacity || 0)} kW</TD></tr>
            <tr><TD>Mounting Structure</TD><TD>{doc.structure_type || "Hot-dip galvanised MS"}</TD><TD className="text-right" mono>{num(doc.capacity_kw || 0)} kW set</TD></tr>
            <tr><TD>DC Cables</TD><TD>4 sq.mm, UV-resistant copper</TD><TD className="text-right" mono>Lot</TD></tr>
            <tr><TD>AC Cables</TD><TD>Aluminium / copper as per design</TD><TD className="text-right" mono>Lot</TD></tr>
            <tr><TD>Earthing Kit</TD><TD>Chemical earthing pits, GI strip</TD><TD className="text-right" mono>3 sets</TD></tr>
            <tr><TD>Lightning Arrestor</TD><TD>ESE type</TD><TD className="text-right" mono>As required</TD></tr>
            <tr><TD>Monitoring System</TD><TD>Wi-Fi / GSM data logger</TD><TD className="text-right" mono>1 no</TD></tr>
            <tr><TD>Boundary Wall</TD><TD>{doc.wall_type || "RCC"}</TD><TD className="text-right" mono>{num(doc.boundary_length_rmt || 0)} RMT</TD></tr>
            <tr><TD>Foundation Footings</TD><TD>RCC pedestal</TD><TD className="text-right" mono>{num(doc.footing_count || 0)} nos</TD></tr>
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <Stat label="Panels" value={`${num(doc.panel_count || 0)}`} icon={Sun} color={NAVY} />
          <Stat label="Inverter" value={`${num(doc.inverter_capacity || 0)} kW`} icon={Zap} color={GREEN} />
          <Stat label="Structure" value={doc.structure_type || "MS Galv"} icon={ShieldCheck} color="#f59e0b" />
        </div>
      </Page>

      {/* PAGE 7 — COSTING */}
      <Page pageNo={7} totalPages={total} title="Project Costing">
        <SectionTitle>Cost Breakdown</SectionTitle>
        <table className="w-full border-collapse">
          <thead><tr><TH>Description</TH><TH className="text-right">Calculation</TH><TH className="text-right">Amount</TH></tr></thead>
          <tbody>
            <tr><TD>System Cost</TD><TD className="text-right" mono>{num(doc.capacity_kw || 0)} kW × {inr(doc.cost_per_kw || 0)}</TD><TD className="text-right" mono>{inr(c.systemCost)}</TD></tr>
            <tr><TD>Civil — Boundary Wall</TD><TD className="text-right" mono>{num(doc.boundary_length_rmt || 0)} RMT × {inr(doc.civil_cost_per_rmt || 0)}</TD><TD className="text-right" mono>{inr(c.civilCost)}</TD></tr>
            <tr><TD>Civil — Footings</TD><TD className="text-right" mono>{num(doc.footing_count || 0)} × {inr(doc.footing_cost || 0)}</TD><TD className="text-right" mono>{inr(c.footingTotal)}</TD></tr>
            {(doc.addons || []).map((a, i) => (
              <tr key={i}><TD>Add-on — {a.label}</TD><TD className="text-right" mono>—</TD><TD className="text-right" mono>{inr(a.amount)}</TD></tr>
            ))}
            <tr style={{ background: `${NAVY}08` }}>
              <TD className="font-bold">Subtotal</TD><TD></TD><TD className="text-right font-bold" mono>{inr(c.subtotal)}</TD>
            </tr>
            <tr><TD>GST @ 5% (70% of value)</TD><TD className="text-right" mono>5% × 70%</TD><TD className="text-right" mono>{inr(c.gst5)}</TD></tr>
            <tr><TD>GST @ 18% (30% of value)</TD><TD className="text-right" mono>18% × 30%</TD><TD className="text-right" mono>{inr(c.gst18)}</TD></tr>
            <tr style={{ background: `${GREEN}15` }}>
              <TD className="font-black text-base">TOTAL PROJECT COST</TD><TD></TD>
              <TD className="text-right font-black text-base" mono style={{ color: NAVY }}>{inr(c.totalCost)}</TD>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 border-2" style={{ borderColor: "#f59e0b40", background: "#fef3c7" }}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Suggested Selling (+20%)</div>
            <div className="text-lg font-extrabold" style={{ color: NAVY }}>{inr(c.suggestedSellingPrice)}</div>
          </div>
          <div className="rounded-xl p-3 border-2" style={{ borderColor: "#94a3b840", background: "#f1f5f9" }}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Contractor Benchmark</div>
            <div className="text-lg font-extrabold" style={{ color: NAVY }}>{inr(c.contractorEstimate)}</div>
            <div className="text-[9px] text-slate-500">@ {inr(c.contractorBenchmarkPerKw)}/kW</div>
          </div>
          <div className="rounded-xl p-3 border-2" style={{ borderColor: `${GREEN}40`, background: `${GREEN}15` }}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Profit per Project</div>
            <div className="text-lg font-extrabold" style={{ color: GREEN }}>{inr(c.profitPerProject)}</div>
          </div>
        </div>

        {c.riskAlerts.length > 0 && (
          <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
            <div className="flex items-center gap-2 font-bold text-amber-800 mb-1 text-[11px]">
              <AlertTriangle className="h-4 w-4" /> Risk Alerts
            </div>
            <ul className="text-[10.5px] text-amber-900 space-y-0.5 list-disc pl-5">
              {c.riskAlerts.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </Page>

      {/* PAGE 8 — ROI */}
      <Page pageNo={8} totalPages={total} title="ROI Analysis">
        <SectionTitle>Return on Investment</SectionTitle>
        <table className="w-full border-collapse">
          <thead><tr><TH>Parameter</TH><TH className="text-right">Value</TH></tr></thead>
          <tbody>
            <tr><TD>Plant Capacity</TD><TD className="text-right" mono>{num(doc.capacity_kw || 0)} kW</TD></tr>
            <tr><TD>Avg. Generation</TD><TD className="text-right" mono>{num(c.monthlyUnits)} units / month</TD></tr>
            <tr><TD>Electricity Tariff</TD><TD className="text-right" mono>{inr(doc.electricity_tariff || 0)} / unit</TD></tr>
            <tr><TD>Monthly Savings</TD><TD className="text-right font-bold" mono>{inr(c.monthlySavings)}</TD></tr>
            <tr><TD>Annual Savings</TD><TD className="text-right font-bold" mono>{inr(c.annualSavings)}</TD></tr>
            <tr style={{ background: `${GREEN}15` }}><TD className="font-black">Payback Period</TD><TD className="text-right font-black" mono style={{ color: GREEN }}>{num(c.roiMonths, 1)} months</TD></tr>
            <tr style={{ background: `${NAVY}08` }}><TD className="font-bold">25-Year Net Savings</TD><TD className="text-right font-black" mono style={{ color: NAVY }}>{inr(c.savings25y)}</TD></tr>
          </tbody>
        </table>

        <SectionTitle accent={GREEN}>Environmental Impact</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-5 text-white" style={{ background: GREEN }}>
            <Leaf className="h-8 w-8 mb-2" />
            <div className="text-[10px] uppercase tracking-wider text-emerald-100">CO₂ avoided / year</div>
            <div className="text-3xl font-black">{num(c.co2TonsYear, 1)} tons</div>
          </div>
          <div className="rounded-xl p-5 text-white" style={{ background: NAVY }}>
            <Sun className="h-8 w-8 mb-2" />
            <div className="text-[10px] uppercase tracking-wider text-emerald-300">Equivalent trees / year</div>
            <div className="text-3xl font-black">{num(c.treesEquivalent)}</div>
          </div>
        </div>
      </Page>

      {/* PAGE 9 — PAYMENT TERMS */}
      <Page pageNo={9} totalPages={total} title="Payment Terms">
        <SectionTitle>Payment Schedule</SectionTitle>
        <table className="w-full border-collapse">
          <thead><tr><TH>Stage</TH><TH>Milestone</TH><TH className="text-right">% of Total</TH><TH className="text-right">Amount</TH></tr></thead>
          <tbody>
            {[
              ["1", "Advance on order confirmation", 30],
              ["2", "Material delivery at site", 40],
              ["3", "Installation completion", 20],
              ["4", "Commissioning & handover", 10],
            ].map(([s, m, p]) => (
              <tr key={s as string}>
                <TD className="font-bold">{s}</TD><TD>{m}</TD>
                <TD className="text-right" mono>{p}%</TD>
                <TD className="text-right font-bold" mono>{inr((c.totalCost * (p as number)) / 100)}</TD>
              </tr>
            ))}
            <tr style={{ background: `${GREEN}15` }}>
              <TD className="font-black" colSpan={2}>Total</TD>
              <TD className="text-right font-black" mono>100%</TD>
              <TD className="text-right font-black" mono style={{ color: NAVY }}>{inr(c.totalCost)}</TD>
            </tr>
          </tbody>
        </table>

        <p className="text-[10.5px] text-slate-600 mt-4">
          Payments via NEFT/RTGS only. Tax invoices issued at each milestone. Project execution begins upon advance receipt.
        </p>
      </Page>

      {/* PAGE 10 — TERMS & CONDITIONS */}
      <Page pageNo={10} totalPages={total} title="Terms & Conditions">
        <SectionTitle>Terms & Conditions</SectionTitle>
        <ol className="list-decimal pl-5 space-y-2 text-[11.5px] text-slate-700 leading-relaxed">
          <li>Quotation validity: 15 days from date of issue.</li>
          <li>Project completion timeline: 45–60 days from advance receipt and site readiness.</li>
          <li>Site readiness, water, power and storage during execution to be provided by client.</li>
          <li>Statutory approvals (DISCOM, net-meter, MNRE) under client's account; Unite Solar will assist with documentation.</li>
          <li>Module performance warranty: 25 years (linear); inverter warranty: 5 years standard, extendable.</li>
          <li>Workmanship warranty: 5 years from commissioning date.</li>
          <li>Force majeure events (natural disaster, strikes, govt restrictions) shall extend timelines proportionately.</li>
          <li>Price variation of more than ±5% in raw materials may be passed through with documentation.</li>
          <li>Disputes subject to jurisdiction of courts at Unite Solar registered office.</li>
          <li>Insurance (transit + erection-all-risk) included unless otherwise stated.</li>
        </ol>
      </Page>

      {/* PAGE 11 — SIGNATURES */}
      <Page pageNo={11} totalPages={total} title="Acceptance & Signatures">
        <SectionTitle>Acceptance</SectionTitle>
        <p className="text-[12px] text-slate-700 mb-12">
          We hereby accept the terms, scope and pricing detailed in this proposal and authorise Unite Solar to commence
          execution upon receipt of the advance payment.
        </p>
        <div className="grid grid-cols-2 gap-12 mt-20">
          <div>
            <div className="border-b-2 border-slate-300 h-16" />
            <div className="mt-2 text-[12px] font-bold" style={{ color: NAVY }}>For {doc.client_name || "Client"}</div>
            <div className="text-[10.5px] text-slate-500">Authorised Signatory · Name · Designation · Date · Seal</div>
          </div>
          <div>
            <div className="border-b-2 border-slate-300 h-16" />
            <div className="mt-2 text-[12px] font-bold" style={{ color: NAVY }}>For Unite Solar</div>
            <div className="text-[10.5px] text-slate-500">Authorised Signatory · Date · Seal</div>
          </div>
        </div>
      </Page>

      {/* PAGE 12 — CONTACT */}
      <Page pageNo={12} totalPages={total} title="Contact Details">
        <div className="h-full flex flex-col">
          <SectionTitle>Get in Touch</SectionTitle>
          <p className="text-[12px] text-slate-700 mb-6">
            We're excited to power your transition to clean energy. Reach out for any clarification or site visit.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <Stat label="Phone" value="+91 00000 00000" icon={Phone} color={NAVY} />
            <Stat label="Email" value="contact@unitesolar.in" icon={Mail} color={GREEN} />
            <Stat label="Office" value="Pune, Maharashtra" icon={MapPin} color="#f59e0b" />
          </div>

          <div className="rounded-2xl text-white p-8 text-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${GREEN})` }}>
            <Sun className="h-10 w-10 mx-auto mb-3" />
            <div className="text-2xl font-black mb-1">UNITE SOLAR</div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200 mb-4">Powering Tomorrow</div>
            <p className="text-[11.5px] max-w-md mx-auto opacity-90">
              Designed, engineered and delivered with pride by Unite Solar — a Unite Developers Global Inc. company.
            </p>
          </div>

          <div className="mt-auto pt-6 text-center text-[10px] text-slate-500">
            Powered by <span className="font-bold text-slate-700">Unite Developers Global Inc.</span>
          </div>
        </div>
      </Page>
    </div>
  );
};

export default ProposalDocument;
