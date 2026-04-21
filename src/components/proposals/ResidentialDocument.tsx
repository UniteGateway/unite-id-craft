import React from "react";
import { BoqLine, ResidentialComputed, FinanceComputed, inr } from "@/lib/residential-presets";
import logoUrl from "@/assets/unite-solar-logo.png";
import { buildRoiSeries, generationFor } from "@/lib/india-solar";

export type BillSummary = {
  consumer_name?: string;
  state?: string;
  billing_month?: string;
  monthly_units?: number;
  monthly_bill?: number;
  energy_charge_per_unit?: number;
  sanction_load_kw?: number;
};

type Props = {
  title: string;
  proposalNumber?: string | null;
  client: { name?: string; location?: string; contact?: string; email?: string };
  capacityKw: number;
  panelCount: number;
  panelWattage: number;
  inverterCapacity: number;
  structureType: string;
  boq: BoqLine[];
  terms: string;
  computed: ResidentialComputed;
  coverUrl?: string | null;
  category?: string;
  finance?: FinanceComputed;
  paymentMode?: "cash" | "loan" | string;
  loanInterestRate?: number;
  loanTenureYears?: number;
  subsidyInLoan?: boolean;
  offerLabel?: string | null;
  offerDescription?: string | null;
  // New
  billSummary?: BillSummary | null;
  warranties?: string | null;
  serviceAmc?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  dailyGenerationKwhPerKw?: number | null;
};

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="pdf-page bg-white text-slate-900 mx-auto shadow-lg"
    style={{ width: "210mm", minHeight: "297mm", padding: "16mm", boxSizing: "border-box" }}
  >
    {children}
  </div>
);

const Logo: React.FC<{ small?: boolean }> = ({ small }) => (
  <div className="flex items-center gap-2">
    <img src={logoUrl} alt="Unite Solar" style={{ height: small ? 28 : 44 }} crossOrigin="anonymous" />
    <div className="leading-tight">
      <div className={small ? "text-sm font-bold" : "text-lg font-extrabold"} style={{ color: "#1a3c6e" }}>
        Unite Solar
      </div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">Powered by Unite Developers Global Inc</div>
    </div>
  </div>
);

const PageHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-between border-b-2 pb-3 mb-6" style={{ borderColor: "#f08c00" }}>
    <Logo small />
    <div className="text-xs text-slate-500">{label}</div>
  </div>
);

const ResidentialDocument: React.FC<Props> = (props) => {
  const {
    title, proposalNumber, client, capacityKw, panelCount, panelWattage, inverterCapacity,
    structureType, boq, terms, computed, coverUrl, category, finance,
    paymentMode = "cash", loanInterestRate, loanTenureYears, subsidyInLoan, offerLabel, offerDescription,
    billSummary, warranties, serviceAmc,
    locationCity, locationState, dailyGenerationKwhPerKw,
  } = props;

  const isLoan = paymentMode === "loan";

  const hasBill = !!(billSummary && (billSummary.monthly_units || billSummary.monthly_bill));
  const generation = dailyGenerationKwhPerKw && capacityKw
    ? generationFor(capacityKw, dailyGenerationKwhPerKw)
    : null;
  const roi = finance
    ? buildRoiSeries({
        netCost: Math.max(0, finance.netCost - finance.subsidy),
        monthlySavings: finance.monthlySavings,
        years: 25,
      })
    : null;

  return (
    <div id="proposal-doc" className="space-y-6">
      {/* COVER */}
      <Page>
        <div
          className="relative w-full h-full rounded-md overflow-hidden flex flex-col justify-between"
          style={{
            minHeight: "265mm",
            backgroundImage: coverUrl ? `url(${coverUrl})` : "linear-gradient(135deg, #1a3c6e, #f08c00)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.75) 100%)" }} />
          <div className="relative p-6 flex items-center justify-between text-white">
            <Logo />
            <div className="text-right text-xs opacity-90">
              {proposalNumber && <div>Proposal #: {proposalNumber}</div>}
              <div>{new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
          </div>
          <div className="relative p-8 text-white">
            <div className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold mb-4">{(category || "RESIDENTIAL").toUpperCase()} SOLAR PROPOSAL</div>
            <h1 className="text-5xl font-extrabold leading-tight drop-shadow-lg">{title || `${capacityKw} kW Solar Solution`}</h1>
            <p className="mt-3 text-lg opacity-95">Prepared for <span className="font-bold">{client.name || "—"}</span></p>
            <p className="text-sm opacity-90">{client.location || ""}</p>
            {hasBill && (
              <div className="mt-5 inline-block rounded-lg bg-white/95 text-slate-900 p-4 shadow-lg max-w-md">
                <div className="text-[10px] uppercase tracking-wider font-bold text-orange-600 mb-1">
                  Based on customer's actual electricity bill
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  {billSummary?.consumer_name && (
                    <div className="col-span-2"><b>Consumer:</b> {billSummary.consumer_name}</div>
                  )}
                  {!!billSummary?.monthly_units && (
                    <div><b>Avg units / month:</b> {Math.round(billSummary.monthly_units)}</div>
                  )}
                  {!!billSummary?.energy_charge_per_unit && (
                    <div><b>Tariff:</b> ₹{billSummary.energy_charge_per_unit}/unit</div>
                  )}
                  {!!billSummary?.monthly_bill && (
                    <div><b>Monthly bill:</b> {inr(billSummary.monthly_bill)}</div>
                  )}
                  {!!billSummary?.sanction_load_kw && (
                    <div><b>Sanctioned load:</b> {billSummary.sanction_load_kw} kW</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Page>

      {/* OVERVIEW */}
      <Page>
        <PageHeader label="Project Overview" />
        <h2 className="text-2xl font-extrabold mb-4" style={{ color: "#1a3c6e" }}>Project Overview</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded border border-slate-200">
            <div className="text-xs uppercase text-slate-500 mb-2 font-semibold">Client Details</div>
            <div className="text-sm space-y-1">
              <div><b>Name:</b> {client.name || "—"}</div>
              <div><b>Location:</b> {client.location || "—"}</div>
              <div><b>Contact:</b> {client.contact || "—"}</div>
              <div><b>Email:</b> {client.email || "—"}</div>
            </div>
          </div>
          <div className="p-4 rounded border border-slate-200">
            <div className="text-xs uppercase text-slate-500 mb-2 font-semibold">System Specs</div>
            <div className="text-sm space-y-1">
              <div><b>Capacity:</b> {capacityKw} kW</div>
              <div><b>Modules:</b> {panelCount} × {panelWattage} Wp</div>
              <div><b>Inverter:</b> {inverterCapacity} kW</div>
              <div><b>Structure:</b> {structureType}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded text-white" style={{ background: "#1a3c6e" }}>
            <div className="text-xs opacity-90">System Subtotal</div>
            <div className="text-xl font-extrabold">{inr(computed.boqSubtotal)}</div>
          </div>
          <div className="p-4 rounded text-white" style={{ background: "#3a3a3a" }}>
            <div className="text-xs opacity-90">GST (Blended)</div>
            <div className="text-xl font-extrabold">{inr(computed.gstTotal)}</div>
          </div>
          <div className="p-4 rounded text-white" style={{ background: "#f08c00" }}>
            <div className="text-xs opacity-90">Total Investment</div>
            <div className="text-xl font-extrabold">{inr(computed.totalCost)}</div>
          </div>
        </div>

        {generation && (
          <div className="mb-6 p-4 rounded border-2" style={{ borderColor: "#f08c00", background: "#fff8e6" }}>
            <div className="text-xs uppercase font-bold mb-2" style={{ color: "#1a3c6e" }}>
              Estimated Solar Generation {locationCity ? `— ${locationCity}${locationState ? `, ${locationState}` : ""}` : ""}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-600">Daily</div>
                <div className="text-lg font-extrabold" style={{ color: "#1a3c6e" }}>{generation.daily.toFixed(1)} kWh</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Monthly</div>
                <div className="text-lg font-extrabold" style={{ color: "#1a3c6e" }}>{Math.round(generation.monthly).toLocaleString("en-IN")} kWh</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Annual</div>
                <div className="text-lg font-extrabold" style={{ color: "#10b981" }}>{Math.round(generation.annual).toLocaleString("en-IN")} kWh</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-600 mt-2">
              Based on local irradiance ~{dailyGenerationKwhPerKw} kWh/kW/day. Actual generation may vary ±10% with weather, shading, and tilt.
            </div>
          </div>
        )}

        <div className="text-xs text-slate-600 leading-relaxed">
          This proposal covers the design, supply, installation and commissioning of a {capacityKw} kW grid-connected residential rooftop solar system, with Tier-1 components, in compliance with MNRE & local DISCOM standards.
        </div>
      </Page>

      {/* BOQ */}
      <Page>
        <PageHeader label="Bill of Quantities" />
        <h2 className="text-2xl font-extrabold mb-4" style={{ color: "#1a3c6e" }}>Bill of Quantities</h2>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ background: "#1a3c6e", color: "white" }}>
              <th className="text-left p-2 w-8">#</th>
              <th className="text-left p-2">Item</th>
              <th className="text-right p-2 w-16">Qty</th>
              <th className="text-left p-2 w-16">Unit</th>
              <th className="text-right p-2 w-24">Rate (₹)</th>
              <th className="text-right p-2 w-28">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {boq.map((l, i) => (
              <tr key={i} className="border-b border-slate-200">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{l.item}{l.is_fixed ? <span className="ml-1 text-[9px] uppercase text-slate-500">(fixed)</span> : null}</td>
                <td className="p-2 text-right">{l.qty}</td>
                <td className="p-2">{l.unit}</td>
                <td className="p-2 text-right">{Math.round(l.rate).toLocaleString("en-IN")}</td>
                <td className="p-2 text-right">{Math.round(l.amount).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={5} className="p-2 text-right">Subtotal</td>
              <td className="p-2 text-right">{inr(computed.boqSubtotal)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="p-2 text-right">GST @ 5% (Goods 70%)</td>
              <td className="p-2 text-right">{inr(computed.gst5)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="p-2 text-right">GST @ 18% (Services 30%)</td>
              <td className="p-2 text-right">{inr(computed.gst18)}</td>
            </tr>
            <tr style={{ background: "#f08c00", color: "white" }} className="font-extrabold text-sm">
              <td colSpan={5} className="p-2 text-right">Total Investment</td>
              <td className="p-2 text-right">{inr(computed.totalCost)}</td>
            </tr>
          </tfoot>
        </table>
      </Page>

      {/* FINANCIAL SUMMARY + PAYMENT + SAVINGS + COMPARISON */}
      {finance && (
        <Page>
          <PageHeader label="Financial Summary" />
          <h2 className="text-2xl font-extrabold mb-4" style={{ color: "#1a3c6e" }}>Financial Summary</h2>

          {/* Section 1 */}
          <table className="w-full text-sm border-collapse mb-6">
            <thead>
              <tr style={{ background: "#1a3c6e", color: "white" }}>
                <th className="text-left p-2">System Size</th>
                <th className="text-right p-2">Total Cost</th>
                <th className="text-right p-2">Subsidy</th>
                <th className="text-right p-2">Offer Discount</th>
                <th className="text-right p-2">Net Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 font-semibold">{capacityKw} kW</td>
                <td className="p-2 text-right">{inr(finance.totalCost)}</td>
                <td className="p-2 text-right text-emerald-700">− {inr(finance.subsidy)}</td>
                <td className="p-2 text-right text-emerald-700">− {inr(finance.offerDiscount)}</td>
                <td className="p-2 text-right font-extrabold" style={{ color: "#1a3c6e" }}>{inr(Math.max(0, finance.netCost - finance.subsidy))}</td>
              </tr>
            </tbody>
          </table>

          {/* Offer */}
          {(offerLabel || offerDescription) && (
            <div className="mb-6 p-3 rounded border border-orange-300 bg-orange-50">
              <div className="text-xs uppercase text-orange-700 font-bold">Special Offer Applied</div>
              <div className="text-sm font-semibold">{offerLabel}</div>
              {offerDescription && <div className="text-xs text-slate-700">{offerDescription}</div>}
            </div>
          )}

          {/* Section 2 — Payment options */}
          <h3 className="text-lg font-bold mb-2" style={{ color: "#1a3c6e" }}>Payment Options</h3>

          {!isLoan ? (
            <div className="p-4 rounded border border-slate-200 mb-6">
              <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Option A — Cash Payment</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><div className="text-xs text-slate-500">Total Payable</div><div className="font-bold">{inr(finance.totalCost - finance.offerDiscount)}</div></div>
                <div><div className="text-xs text-slate-500">Subsidy Benefit (post)</div><div className="font-bold text-emerald-700">{inr(finance.subsidy)}</div></div>
                <div><div className="text-xs text-slate-500">Effective Net Outflow</div><div className="font-bold" style={{ color: "#1a3c6e" }}>{inr(Math.max(0, finance.netCost - finance.subsidy))}</div></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <div className="p-4 rounded border border-slate-200">
                <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Option B — Loan @ {loanInterestRate}% × {loanTenureYears} yrs</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded bg-slate-100">
                    <div className="text-xs uppercase font-semibold text-slate-600">Scenario 1 — Without Subsidy</div>
                    <div className="text-xs text-slate-500 mt-1">EMI</div>
                    <div className="text-lg font-extrabold">{inr(finance.emiFull)} / mo</div>
                    <div className="text-xs text-slate-500 mt-1">Total payment</div>
                    <div className="text-sm font-semibold">{inr(finance.totalPaymentFull)}</div>
                  </div>
                  <div className="p-3 rounded" style={{ background: "#fff3e0" }}>
                    <div className="text-xs uppercase font-semibold text-orange-700">Scenario 2 — After Subsidy</div>
                    <div className="text-xs text-slate-500 mt-1">EMI (reduced)</div>
                    <div className="text-lg font-extrabold" style={{ color: "#f08c00" }}>{inr(finance.emiAfterSubsidy)} / mo</div>
                    <div className="text-xs text-slate-500 mt-1">Loan adjusted to</div>
                    <div className="text-sm font-semibold">{inr(Math.max(0, finance.netCost - finance.subsidy))}</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 mt-2">
                  Month 1 EMI = full EMI ({inr(finance.emiFull)}). After subsidy credit (typically 30 days), {subsidyInLoan ? "principal is reduced and EMI is recalculated as shown." : "subsidy is paid to client; EMI continues at full amount."}
                </div>
              </div>
            </div>
          )}

          {/* Section 3 — Savings */}
          <h3 className="text-lg font-bold mb-2" style={{ color: "#1a3c6e" }}>Power Savings</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded text-white" style={{ background: "#10b981" }}>
              <div className="text-xs opacity-90">Monthly Savings</div>
              <div className="text-2xl font-extrabold">{inr(finance.monthlySavings)}</div>
            </div>
            <div className="p-3 rounded text-white" style={{ background: "#059669" }}>
              <div className="text-xs opacity-90">Annual Savings</div>
              <div className="text-2xl font-extrabold">{inr(finance.annualSavings)}</div>
            </div>
          </div>

          {/* Section 4 — Comparison */}
          {isLoan && (
            <>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#1a3c6e" }}>EMI vs Savings</h3>
              <table className="w-full text-sm border-collapse mb-4">
                <thead>
                  <tr style={{ background: "#3a3a3a", color: "white" }}>
                    <th className="text-left p-2">Scenario</th>
                    <th className="text-right p-2">EMI</th>
                    <th className="text-right p-2">Monthly Savings</th>
                    <th className="text-right p-2">Net Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2">Before Subsidy Adjustment</td>
                    <td className="p-2 text-right">{inr(finance.emiFull)}</td>
                    <td className="p-2 text-right">{inr(finance.monthlySavings)}</td>
                    <td className={`p-2 text-right font-bold ${finance.netImpactBefore >= 0 ? "text-emerald-700" : "text-red-600"}`}>{inr(finance.netImpactBefore)}</td>
                  </tr>
                  <tr>
                    <td className="p-2">After Subsidy Adjustment</td>
                    <td className="p-2 text-right">{inr(finance.emiAfterSubsidy)}</td>
                    <td className="p-2 text-right">{inr(finance.monthlySavings)}</td>
                    <td className={`p-2 text-right font-bold ${finance.netImpactAfter >= 0 ? "text-emerald-700" : "text-red-600"}`}>{inr(finance.netImpactAfter)}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          <div className="text-[11px] text-slate-600 leading-relaxed border-t pt-2">
            <b>Notes:</b> Subsidy is credited typically within ~30 days of net-meter approval. Monthly savings assumed at ₹{(finance.monthlySavings / Math.max(1, capacityKw)).toFixed(0)} per kW (DISCOM tariff dependent). EMI applicable from disbursement.
          </div>
        </Page>
      )}

      {/* ROI — Cumulative Savings vs Net Cost */}
      {roi && finance && finance.monthlySavings > 0 && (
        <Page>
          <PageHeader label="Return on Investment" />
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#1a3c6e" }}>Return on Investment</h2>
          <p className="text-xs text-slate-600 mb-4">
            Cumulative savings vs net system cost over 25 years. Assumes 2.5% annual tariff escalation and 0.6% panel degradation.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded text-white" style={{ background: "#1a3c6e" }}>
              <div className="text-xs opacity-90">Net Cost</div>
              <div className="text-lg font-extrabold">{inr(Math.max(0, finance.netCost - finance.subsidy))}</div>
            </div>
            <div className="p-3 rounded text-white" style={{ background: "#f08c00" }}>
              <div className="text-xs opacity-90">Payback Period</div>
              <div className="text-lg font-extrabold">{roi.paybackYear ? `${roi.paybackYear} years` : "> 25 yrs"}</div>
            </div>
            <div className="p-3 rounded text-white" style={{ background: "#10b981" }}>
              <div className="text-xs opacity-90">25-yr Lifetime Savings</div>
              <div className="text-lg font-extrabold">{inr(roi.lifetimeSavings)}</div>
            </div>
          </div>

          {/* Inline SVG chart — cumulative savings line, net cost as horizontal break-even */}
          {(() => {
            const W = 640, H = 280, padL = 60, padR = 20, padT = 20, padB = 36;
            const innerW = W - padL - padR;
            const innerH = H - padT - padB;
            const yMax = Math.max(roi.lifetimeSavings, Math.max(0, finance.netCost - finance.subsidy)) * 1.05;
            const xFor = (y: number) => padL + ((y - 1) / (roi.series.length - 1)) * innerW;
            const yFor = (v: number) => padT + innerH - (v / yMax) * innerH;
            const path = roi.series.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.year).toFixed(1)} ${yFor(p.cumulative).toFixed(1)}`).join(" ");
            const breakEvenY = yFor(Math.max(0, finance.netCost - finance.subsidy));
            const ticksX = [1, 5, 10, 15, 20, 25];
            const ticksY = 5;
            return (
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="280" style={{ background: "#f8fafc", borderRadius: 8 }}>
                {/* gridlines */}
                {Array.from({ length: ticksY + 1 }).map((_, i) => {
                  const v = (yMax / ticksY) * i;
                  const y = yFor(v);
                  return (
                    <g key={i}>
                      <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#e2e8f0" strokeWidth={1} />
                      <text x={padL - 6} y={y + 3} fontSize="9" textAnchor="end" fill="#64748b">
                        {v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v / 1000)}k`}
                      </text>
                    </g>
                  );
                })}
                {/* x ticks */}
                {ticksX.map((tk) => (
                  <g key={tk}>
                    <line x1={xFor(tk)} x2={xFor(tk)} y1={padT + innerH} y2={padT + innerH + 4} stroke="#94a3b8" />
                    <text x={xFor(tk)} y={padT + innerH + 16} fontSize="10" textAnchor="middle" fill="#64748b">Yr {tk}</text>
                  </g>
                ))}
                {/* break-even line */}
                <line x1={padL} x2={W - padR} y1={breakEvenY} y2={breakEvenY} stroke="#1a3c6e" strokeDasharray="4 4" strokeWidth={1.5} />
                <text x={W - padR - 4} y={breakEvenY - 4} fontSize="10" textAnchor="end" fill="#1a3c6e" fontWeight="bold">
                  Net Cost {inr(Math.max(0, finance.netCost - finance.subsidy))}
                </text>
                {/* cumulative area */}
                <path d={`${path} L ${xFor(roi.series.length).toFixed(1)} ${yFor(0).toFixed(1)} L ${xFor(1).toFixed(1)} ${yFor(0).toFixed(1)} Z`}
                      fill="#10b98122" />
                {/* cumulative line */}
                <path d={path} fill="none" stroke="#10b981" strokeWidth={2.5} />
                {/* payback marker */}
                {roi.paybackYear && (
                  <g>
                    <circle cx={xFor(roi.paybackYear)} cy={breakEvenY} r={5} fill="#f08c00" stroke="#fff" strokeWidth={2} />
                    <text x={xFor(roi.paybackYear)} y={breakEvenY - 12} fontSize="11" textAnchor="middle" fill="#f08c00" fontWeight="bold">
                      Payback: Year {roi.paybackYear}
                    </text>
                  </g>
                )}
                {/* axes */}
                <line x1={padL} x2={padL} y1={padT} y2={padT + innerH} stroke="#94a3b8" />
                <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} stroke="#94a3b8" />
              </svg>
            );
          })()}

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded border border-slate-200">
              <div className="font-bold mb-1" style={{ color: "#1a3c6e" }}>Year 1</div>
              <div>Savings: <b>{inr(roi.series[0].yearly)}</b></div>
            </div>
            <div className="p-3 rounded border border-slate-200">
              <div className="font-bold mb-1" style={{ color: "#10b981" }}>Year 25 cumulative</div>
              <div>Total: <b>{inr(roi.series[roi.series.length - 1].cumulative)}</b></div>
            </div>
          </div>
        </Page>
      )}

      {/* T&C */}
      <Page>
        <PageHeader label="Terms & Conditions" />
        <h2 className="text-2xl font-extrabold mb-4" style={{ color: "#1a3c6e" }}>Terms &amp; Conditions</h2>
        <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{terms}</pre>

        {warranties && (
          <>
            <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: "#1a3c6e" }}>Warranties</h3>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{warranties}</pre>
          </>
        )}

        {serviceAmc && (
          <>
            <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: "#1a3c6e" }}>Service &amp; AMC</h3>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{serviceAmc}</pre>
          </>
        )}

        <div className="mt-12 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="border-t border-slate-400 pt-2">For Unite Solar</div>
            <div className="text-slate-500">Authorised Signatory</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2">Client Acceptance</div>
            <div className="text-slate-500">{client.name || "—"}</div>
          </div>
        </div>

        <div className="mt-16 text-center text-[10px] text-slate-400">Powered by Unite Developers Global Inc</div>
      </Page>
    </div>
  );
};

export default ResidentialDocument;