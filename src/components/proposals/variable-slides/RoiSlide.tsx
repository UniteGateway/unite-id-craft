import React, { forwardRef, useMemo } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import { computeFinancials } from "@/lib/solar-financials";
import logoUrl from "@/assets/unite-solar-logo.png";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Area,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  IndianRupee,
  Zap,
  TrendingUp,
  Leaf,
  CalendarRange,
  Wrench,
  PiggyBank,
  Percent,
  Timer,
} from "lucide-react";

const NAVY = "#0A1B33";
const NAVY_2 = "#13294B";
const ORANGE = "#F59E0B";
const GOLD = "#FFC527";
const GREEN = "#10B981";
const BLUE = "#1E5FBF";
const SLATE = "#475569";

const PIE_DATA = [
  { name: "Energy Savings", value: 60, color: ORANGE },
  { name: "Export to Grid", value: 25, color: BLUE },
  { name: "O&M", value: 10, color: SLATE },
  { name: "Carbon Credits", value: 5, color: GREEN },
];

const TopStat: React.FC<{ Icon: typeof Zap; label: string; value: string }> = ({
  Icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 flex-1">
    <div
      className="flex items-center justify-center rounded-lg shrink-0"
      style={{
        width: 44,
        height: 44,
        background: "rgba(245,158,11,0.18)",
        color: ORANGE,
      }}
    >
      <Icon size={22} />
    </div>
    <div className="flex flex-col leading-tight">
      <span
        className="text-[10px] font-bold tracking-[0.22em]"
        style={{ color: "#94A3B8" }}
      >
        {label}
      </span>
      <span className="text-white font-extrabold text-[18px]">{value}</span>
    </div>
  </div>
);

const KpiRow: React.FC<{
  Icon: typeof Zap;
  label: string;
  value: string;
  accent?: string;
}> = ({ Icon, label, value, accent = ORANGE }) => (
  <div
    className="flex items-center gap-3 rounded-xl"
    style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      padding: "12px 14px",
      boxShadow: "0 4px 12px rgba(10,27,51,0.05)",
    }}
  >
    <div
      className="flex items-center justify-center rounded-lg shrink-0"
      style={{
        width: 38,
        height: 38,
        background: `${accent}1F`,
        color: accent,
      }}
    >
      <Icon size={20} />
    </div>
    <div className="flex flex-col leading-tight flex-1 min-w-0">
      <span
        className="text-[10px] font-bold tracking-[0.18em] uppercase"
        style={{ color: "#6B7280" }}
      >
        {label}
      </span>
      <span
        className="font-extrabold text-[18px] truncate"
        style={{ color: NAVY }}
      >
        {value}
      </span>
    </div>
  </div>
);

const RoiSlide = forwardRef<HTMLDivElement, { vars: ProposalVars }>(
  ({ vars }, ref) => {
    const projectCost = parseFloat(vars.PROJECT_COST) || 0;
    const lifeYrs = parseInt(vars.LIFE) || 25;
    const omCostLakhsYr = parseFloat(vars.OM_COST) || 0;
    const fin = useMemo(
      () => computeFinancials({
        capacity_mw: parseFloat(vars.CAPACITY) || 0,
        annual_units_lakh: parseFloat(vars.ANNUAL_UNITS) || 0,
        tariff_rs_per_kwh: parseFloat(vars.TARIFF) || 8,
        tariff_escalation_pct: parseFloat(vars.ESCALATION_PCT) || 5,
        degradation_pct: parseFloat(vars.DEGRADATION_PCT) || 0.7,
        project_cost_cr: projectCost,
        om_cost_lakhs_per_year: omCostLakhsYr,
        life_years: lifeYrs,
      }),
      [vars.CAPACITY, vars.ANNUAL_UNITS, vars.TARIFF, vars.ESCALATION_PCT, vars.DEGRADATION_PCT, projectCost, omCostLakhsYr, lifeYrs]
    );
    const totalSavings = fin.total_savings_cr;
    const netLifetime = fin.total_net_cr;
    const netPct = totalSavings > 0 ? Math.round((netLifetime / totalSavings) * 100) : 82;
    const payback = fin.payback_years;
    const cashFlow = [{ year: 0, cum: +(-projectCost).toFixed(2) }, ...fin.annual.map((a) => ({ year: a.year, cum: a.cumulative_cr }))];
    const breakEvenY = payback;
    const breakEvenCum = 0;

    return (
      <SlideFrame ref={ref} className="bg-white text-[#0A1B33]">
        {/* Top brand bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-12"
          style={{ height: 80, background: NAVY }}
        >
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Unite Solar" style={{ height: 48 }} />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-extrabold tracking-[0.18em] text-[16px]">
                UNITE SOLAR
              </span>
              <span
                className="text-[11px] tracking-[0.22em]"
                style={{ color: ORANGE }}
              >
                ROI & FINANCIAL ANALYSIS
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-[13px] tracking-[0.2em] font-semibold">
              {vars.PROJECT_NAME}
            </div>
            <div
              className="text-[11px] tracking-[0.18em]"
              style={{ color: "#94A3B8" }}
            >
              {vars.LOCATION} • {vars.CAPACITY} MW
            </div>
          </div>
        </div>

        {/* Top stats strip */}
        <div
          className="absolute flex items-center gap-6 px-8"
          style={{
            top: 96,
            left: 64,
            right: 64,
            height: 84,
            background: NAVY_2,
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(10,27,51,0.18)",
          }}
        >
          <TopStat Icon={IndianRupee} label="PROJECT COST" value={`₹${vars.PROJECT_COST} Cr`} />
          <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.12)" }} />
          <TopStat Icon={Zap} label="ANNUAL GENERATION" value={`${vars.ANNUAL_UNITS} Lakh Units`} />
          <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.12)" }} />
          <TopStat Icon={PiggyBank} label="TOTAL SAVINGS" value={`₹${vars.TOTAL_SAVINGS} Cr+`} />
          <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.12)" }} />
          <TopStat Icon={Leaf} label="CO₂ AVOIDED" value={`${vars.CO2} T/yr`} />
          <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.12)" }} />
          <TopStat Icon={CalendarRange} label="PROJECT LIFE" value={`${vars.LIFE} Years`} />
        </div>

        {/* LEFT PANEL — Financial KPIs */}
        <div
          className="absolute"
          style={{ top: 210, left: 64, width: 380 }}
        >
          <div
            className="inline-flex items-center text-white font-extrabold tracking-[0.18em] text-[14px]"
            style={{
              background: NAVY,
              padding: "8px 18px",
              borderRadius: "8px 8px 8px 0",
            }}
          >
            FINANCIAL KPIs
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <KpiRow Icon={PiggyBank} label="Total Savings (Lifetime)" value={`₹${vars.TOTAL_SAVINGS} Cr+`} accent={ORANGE} />
            <KpiRow Icon={Wrench} label="O&M Cost" value={`₹${vars.OM_COST} L / yr`} accent={SLATE} />
            <KpiRow
              Icon={TrendingUp}
              label={`Net Savings (~${netPct}%)`}
              value={`₹${netLifetime.toFixed(1)} Cr`}
              accent={GREEN}
            />
            <KpiRow Icon={Percent} label="IRR" value="18% – 24%" accent={BLUE} />
            <KpiRow Icon={Timer} label="Payback Period" value={`${vars.PAYBACK} Years`} accent={ORANGE} />
          </div>

          {/* Bottom callout */}
          <div
            className="mt-4 rounded-xl flex items-center gap-3"
            style={{
              background: NAVY,
              padding: "14px 16px",
              color: "white",
            }}
          >
            <TrendingUp size={22} color={GOLD} />
            <span className="font-extrabold text-[14px] tracking-[0.04em]">
              Strong returns, low risk over {vars.LIFE} years
            </span>
          </div>
        </div>

        {/* CENTER — Cash flow chart */}
        <div
          className="absolute rounded-2xl bg-white"
          style={{
            top: 210,
            left: 472,
            width: 868,
            height: 760,
            border: "1px solid #E5E7EB",
            boxShadow: "0 12px 30px rgba(10,27,51,0.08)",
            padding: "20px 24px 12px",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <CalendarRange size={20} color={ORANGE} />
              <span
                className="font-extrabold tracking-[0.14em] text-[16px]"
                style={{ color: NAVY }}
              >
                CUMULATIVE CASH FLOW — {vars.LIFE} YEARS
              </span>
            </div>
            <div className="flex items-center gap-4 text-[12px]" style={{ color: SLATE }}>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block rounded-sm"
                  style={{ width: 12, height: 12, background: ORANGE }}
                />
                Cumulative Cash Flow (₹ Cr)
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block rounded-sm"
                  style={{ width: 12, height: 12, background: GREEN }}
                />
                Break-even @ {vars.PAYBACK} yrs
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={cashFlow}
                margin={{ top: 30, right: 30, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="cfFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ORANGE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: NAVY, fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={false}
                  label={{
                    value: "Year",
                    position: "insideBottom",
                    offset: -2,
                    style: { fill: SLATE, fontSize: 12, fontWeight: 600 },
                  }}
                />
                <YAxis
                  tick={{ fill: SLATE, fontSize: 12 }}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={false}
                  label={{
                    value: "₹ Cr",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: SLATE, fontSize: 12, fontWeight: 600 },
                  }}
                />
                <ReferenceLine y={0} stroke="#94A3B8" strokeDasharray="4 4" />
                <ReferenceLine
                  x={breakEvenY}
                  stroke={GREEN}
                  strokeDasharray="6 4"
                  label={{
                    value: `Break-even ${vars.PAYBACK} yrs`,
                    position: "top",
                    fill: GREEN,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cum"
                  stroke="none"
                  fill="url(#cfFill)"
                />
                <Line
                  type="monotone"
                  dataKey="cum"
                  stroke={ORANGE}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <ReferenceDot
                  x={breakEvenY}
                  y={parseFloat(breakEvenCum.toFixed(2))}
                  r={7}
                  fill={GREEN}
                  stroke="white"
                  strokeWidth={2}
                />
                <ReferenceDot
                  x={lifeYrs}
                  y={parseFloat((-projectCost + netAnnual * lifeYrs).toFixed(2))}
                  r={7}
                  fill={ORANGE}
                  stroke="white"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 3 mini summaries below chart */}
          <div className="mt-2 grid grid-cols-3 gap-3">
            {[
              {
                label: "Initial Investment",
                value: `₹${vars.PROJECT_COST} Cr`,
                color: SLATE,
              },
              {
                label: `Net @ Year ${vars.PAYBACK}`,
                value: "≈ ₹0 (Recovered)",
                color: GREEN,
              },
              {
                label: `Net @ Year ${vars.LIFE}`,
                value: `+ ₹${netLifetime.toFixed(1)} Cr`,
                color: ORANGE,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl flex flex-col items-center justify-center"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E5E7EB",
                  padding: "12px 8px",
                }}
              >
                <span
                  className="text-[10px] font-bold tracking-[0.20em]"
                  style={{ color: "#6B7280" }}
                >
                  {s.label}
                </span>
                <span
                  className="font-extrabold text-[20px] mt-1"
                  style={{ color: s.color }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Pie chart */}
        <div
          className="absolute rounded-2xl"
          style={{
            top: 210,
            right: 64,
            width: 432,
            height: 760,
            background: NAVY,
            boxShadow: "0 12px 30px rgba(10,27,51,0.18)",
            padding: "22px 22px",
          }}
        >
          <span
            className="text-[11px] font-bold tracking-[0.22em]"
            style={{ color: ORANGE }}
          >
            VALUE DISTRIBUTION
          </span>
          <div className="mt-1 text-white font-extrabold text-[20px] leading-tight">
            Where Returns Come From
          </div>

          <div style={{ width: "100%", height: 280 }} className="mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {PIE_DATA.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-2 flex flex-col gap-2">
            {PIE_DATA.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "10px 12px",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block rounded-sm"
                    style={{ width: 14, height: 14, background: d.color }}
                  />
                  <span className="text-white text-[13px] font-semibold">
                    {d.name}
                  </span>
                </div>
                <span
                  className="text-[14px] font-extrabold"
                  style={{ color: GOLD }}
                >
                  {d.value}%
                </span>
              </div>
            ))}
          </div>

          {/* Bottom callout */}
          <div
            className="mt-4 rounded-xl flex items-center gap-3"
            style={{
              background: ORANGE,
              padding: "12px 14px",
              color: NAVY,
            }}
          >
            <TrendingUp size={20} />
            <span className="font-extrabold text-[13px] tracking-[0.04em]">
              IRR 18–24% • Payback {vars.PAYBACK} yrs
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-12"
          style={{ height: 56, background: NAVY }}
        >
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>
            UNITE SOLAR • ROI & FINANCIAL ANALYSIS
          </span>
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>
            POWERING COMMUNITIES • CREATING SUSTAINABLE VALUE
          </span>
        </div>
      </SlideFrame>
    );
  }
);
RoiSlide.displayName = "RoiSlide";
export default RoiSlide;
