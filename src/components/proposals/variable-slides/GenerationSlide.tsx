import React, { forwardRef } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { Sun, TrendingUp, CalendarRange, Zap, Leaf } from "lucide-react";

const NAVY = "#0A1B33";
const ORANGE = "#F59E0B";
const BLUE = "#1E5FBF";
const BLUE_PEAK = "#0A3D91";

// Realistic monthly distribution (% of annual) for India / Hyderabad-ish.
// Sums to 100. Peak: Mar–May.
const MONTHLY_PCT: { m: string; pct: number; peak?: boolean }[] = [
  { m: "Jan", pct: 8.2 },
  { m: "Feb", pct: 8.6 },
  { m: "Mar", pct: 9.8, peak: true },
  { m: "Apr", pct: 10.2, peak: true },
  { m: "May", pct: 10.0, peak: true },
  { m: "Jun", pct: 7.6 },
  { m: "Jul", pct: 6.8 },
  { m: "Aug", pct: 6.9 },
  { m: "Sep", pct: 7.4 },
  { m: "Oct", pct: 8.0 },
  { m: "Nov", pct: 8.1 },
  { m: "Dec", pct: 8.4 },
];

const SectionTitle: React.FC<{ children: React.ReactNode; width?: number }> = ({
  children,
  width = 420,
}) => (
  <div
    className="inline-flex items-center justify-center text-white font-extrabold tracking-[0.16em] text-[20px]"
    style={{
      background: NAVY,
      borderRadius: "10px 10px 10px 0",
      padding: "10px 24px",
      minWidth: width,
    }}
  >
    {children}
  </div>
);

const StatCard: React.FC<{
  Icon: typeof Sun;
  label: string;
  value: string;
  sub?: string;
}> = ({ Icon, label, value, sub }) => (
  <div
    className="flex items-center gap-4 rounded-2xl bg-white"
    style={{
      padding: "18px 22px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 6px 18px rgba(10,27,51,0.06)",
    }}
  >
    <div
      className="flex items-center justify-center rounded-xl"
      style={{
        width: 56,
        height: 56,
        background: "rgba(245,158,11,0.12)",
        color: ORANGE,
      }}
    >
      <Icon size={30} />
    </div>
    <div className="flex flex-col">
      <span className="text-[13px] font-semibold tracking-[0.14em] uppercase" style={{ color: "#6B7280" }}>
        {label}
      </span>
      <span className="text-[26px] font-extrabold leading-tight" style={{ color: NAVY }}>
        {value}
      </span>
      {sub && (
        <span className="text-[12px] font-medium" style={{ color: "#6B7280" }}>
          {sub}
        </span>
      )}
    </div>
  </div>
);

const GenerationSlide = forwardRef<HTMLDivElement, { vars: ProposalVars }>(
  ({ vars }, ref) => {
    const annualLakh = parseFloat(vars.ANNUAL_UNITS) || 0; // in Lakh units
    const annualUnits = annualLakh * 100000; // raw kWh

    // Build chart data in Lakh units, 2 decimals.
    const data = MONTHLY_PCT.map(({ m, pct, peak }) => {
      const lakh = (annualLakh * pct) / 100;
      return {
        month: m,
        units: parseFloat(lakh.toFixed(2)),
        peak: !!peak,
      };
    });

    const peakMonths = data.filter((d) => d.peak);
    const peakAvg =
      peakMonths.reduce((s, d) => s + d.units, 0) / Math.max(1, peakMonths.length);

    // CO2 dynamic
    const co2 = vars.CO2;

    return (
      <SlideFrame ref={ref} className="bg-white text-[#0A1B33]">
        {/* Top brand bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-12"
          style={{ height: 88, background: NAVY }}
        >
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Unite Solar" style={{ height: 52 }} />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-extrabold tracking-[0.18em] text-[18px]">
                UNITE SOLAR
              </span>
              <span className="text-[12px] tracking-[0.22em]" style={{ color: "#F59E0B" }}>
                ENERGY GENERATION ANALYSIS
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-[14px] tracking-[0.2em] font-semibold">
              {vars.PROJECT_NAME}
            </div>
            <div className="text-[12px] tracking-[0.18em]" style={{ color: "#94A3B8" }}>
              {vars.LOCATION} • {vars.CAPACITY} MW
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="absolute" style={{ top: 120, left: 64 }}>
          <SectionTitle width={520}>MONTHLY ENERGY GENERATION</SectionTitle>
          <div
            className="mt-3 text-[15px] font-medium max-w-[1100px]"
            style={{ color: "#475569" }}
          >
            Estimated month-wise solar generation profile for a{" "}
            <span style={{ color: NAVY, fontWeight: 700 }}>
              {vars.CAPACITY} MW
            </span>{" "}
            grid-connected PV plant — totaling{" "}
            <span style={{ color: ORANGE, fontWeight: 800 }}>
              {vars.ANNUAL_UNITS} Lakh Units
            </span>{" "}
            annually. Peak generation observed during{" "}
            <span style={{ color: NAVY, fontWeight: 700 }}>March – May</span>.
          </div>
        </div>

        {/* Stat cards row */}
        <div
          className="absolute flex gap-5"
          style={{ top: 224, left: 64, right: 64 }}
        >
          <div className="flex-1">
            <StatCard
              Icon={Zap}
              label="ANNUAL GENERATION"
              value={`${vars.ANNUAL_UNITS} Lakh`}
              sub={`${annualUnits.toLocaleString("en-IN")} kWh / year`}
            />
          </div>
          <div className="flex-1">
            <StatCard
              Icon={Sun}
              label="PEAK MONTHS"
              value="Mar – May"
              sub={`Avg ${peakAvg.toFixed(2)} Lakh units / month`}
            />
          </div>
          <div className="flex-1">
            <StatCard
              Icon={TrendingUp}
              label="PERFORMANCE RATIO"
              value="80 – 85%"
              sub="Tier-1 modules + premium inverters"
            />
          </div>
          <div className="flex-1">
            <StatCard
              Icon={Leaf}
              label="CO₂ OFFSET"
              value={`${co2} Tons`}
              sub="per year"
            />
          </div>
        </div>

        {/* Chart panel */}
        <div
          className="absolute rounded-2xl bg-white"
          style={{
            top: 360,
            left: 64,
            width: 1240,
            height: 600,
            border: "1px solid #E5E7EB",
            boxShadow: "0 12px 30px rgba(10,27,51,0.08)",
            padding: "28px 32px 20px",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <CalendarRange size={22} color={ORANGE} />
              <span
                className="font-extrabold tracking-[0.14em] text-[18px]"
                style={{ color: NAVY }}
              >
                MONTH-WISE GENERATION (LAKH UNITS)
              </span>
            </div>
            <div className="flex items-center gap-5 text-[13px]" style={{ color: "#475569" }}>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block rounded-sm"
                  style={{ width: 14, height: 14, background: BLUE }}
                />
                Standard Month
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block rounded-sm"
                  style={{ width: 14, height: 14, background: BLUE_PEAK }}
                />
                Peak Month (Mar–May)
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 30, right: 20, left: 10, bottom: 10 }}
                barCategoryGap="22%"
              >
                <CartesianGrid strokeDasharray="3 6" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: NAVY, fontSize: 16, fontWeight: 600 }}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 14 }}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={false}
                  label={{
                    value: "Lakh Units",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#475569", fontSize: 14, fontWeight: 600 },
                  }}
                />
                <Bar dataKey="units" radius={[8, 8, 0, 0]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.peak ? BLUE_PEAK : BLUE} />
                  ))}
                  <LabelList
                    dataKey="units"
                    position="top"
                    style={{ fill: NAVY, fontSize: 13, fontWeight: 700 }}
                    formatter={(v: number) => v.toFixed(2)}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right side highlights */}
        <div
          className="absolute"
          style={{ top: 360, left: 1336, width: 520, height: 600 }}
        >
          <div
            className="rounded-2xl h-full flex flex-col"
            style={{
              background: NAVY,
              padding: "28px 28px",
              boxShadow: "0 12px 30px rgba(10,27,51,0.18)",
            }}
          >
            <span
              className="text-[12px] font-bold tracking-[0.22em]"
              style={{ color: ORANGE }}
            >
              KEY HIGHLIGHTS
            </span>
            <div className="mt-2 text-white font-extrabold text-[26px] leading-tight">
              Strong, predictable solar yield year-round.
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {[
                {
                  label: "Annual Generation",
                  value: `${vars.ANNUAL_UNITS} Lakh Units`,
                },
                {
                  label: "Peak Months",
                  value: "March – May",
                },
                {
                  label: "Avg. Daily Generation",
                  value: `${(annualUnits / 365 / 1000).toFixed(2)} MWh/day`,
                },
                {
                  label: "Capacity Utilization",
                  value: "≈ 17 – 19% CUF",
                },
                {
                  label: "System Life",
                  value: `${vars.LIFE} Years`,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "12px 16px",
                  }}
                >
                  <span
                    className="text-[12px] font-semibold tracking-[0.16em] uppercase"
                    style={{ color: "#94A3B8" }}
                  >
                    {row.label}
                  </span>
                  <span className="text-white text-[16px] font-extrabold">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="mt-auto rounded-xl flex items-center gap-3"
              style={{
                background: ORANGE,
                padding: "14px 16px",
                color: NAVY,
              }}
            >
              <TrendingUp size={22} />
              <span className="font-extrabold text-[15px] tracking-[0.04em]">
                Reliable generation supports {vars.PAYBACK} yr payback
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-12"
          style={{ height: 56, background: NAVY }}
        >
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>
            UNITE SOLAR • ENERGY GENERATION ANALYSIS
          </span>
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>
            POWERING COMMUNITIES • CREATING SUSTAINABLE VALUE
          </span>
        </div>
      </SlideFrame>
    );
  }
);
GenerationSlide.displayName = "GenerationSlide";
export default GenerationSlide;