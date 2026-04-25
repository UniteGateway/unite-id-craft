import React, { forwardRef } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import heroUrl from "@/assets/proposal-tech-hero.jpg";
import modulesUrl from "@/assets/proposal-tech-modules.jpg";
import inverterUrl from "@/assets/proposal-tech-inverter.jpg";
import mountUrl from "@/assets/proposal-tech-mount.jpg";
import monitorUrl from "@/assets/proposal-tech-monitor.jpg";
import netmeterUrl from "@/assets/proposal-tech-netmeter.jpg";
import layoutUrl from "@/assets/proposal-tech-layout.jpg";
import {
  SunMedium,
  Zap,
  MapPin,
  CalendarDays,
  Gauge,
  ShieldCheck,
  Cloud,
  TrendingUp,
  Wrench,
  MonitorSmartphone,
  Repeat,
  Leaf,
  IndianRupee,
  Globe,
  HandshakeIcon,
  Building2,
  type LucideIcon,
} from "lucide-react";

const ORANGE = "#F59E0B";
const NAVY = "#0A1B33";

const SectionTitle: React.FC<{ children: React.ReactNode; width?: number }> = ({ children, width = 360 }) => (
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

const SpecRow: React.FC<{ Icon: LucideIcon; label: string; value: string; sub?: string }> = ({
  Icon,
  label,
  value,
  sub,
}) => (
  <div className="flex items-center gap-5 py-[14px] border-b border-[#E5E7EB] last:border-b-0">
    <div
      className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-md"
      style={{ background: "rgba(245,158,11,0.12)" }}
    >
      <Icon size={32} color={ORANGE} strokeWidth={2.2} />
    </div>
    <div className="flex-1 text-[18px] font-extrabold tracking-[0.1em] text-[#0A1B33] uppercase">
      {label}
    </div>
    <div className="text-right min-w-[210px]">
      <div className="text-[20px] font-bold text-[#0A1B33] leading-tight">{value}</div>
      {sub && <div className="text-[14px] text-[#475569] leading-tight">{sub}</div>}
    </div>
  </div>
);

const Component: React.FC<{ img: string; title: string; desc: string }> = ({ img, title, desc }) => (
  <div className="flex items-center gap-4 py-[10px]">
    <img
      src={img}
      alt={title}
      className="object-cover rounded-md shrink-0"
      style={{ width: 100, height: 70, border: `2px solid #E5E7EB` }}
    />
    <div className="min-w-0">
      <div className="text-[17px] font-extrabold tracking-wider uppercase" style={{ color: ORANGE }}>
        {title}
      </div>
      <div className="text-[14px] text-[#1F2937] leading-snug">{desc}</div>
    </div>
  </div>
);

const LayoutLegend: React.FC<{ n: number; title: string; desc: string }> = ({ n, title, desc }) => (
  <div className="flex items-start gap-3 py-1.5">
    <div
      className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-white text-[15px] font-extrabold"
      style={{ background: ORANGE }}
    >
      {n}
    </div>
    <div className="min-w-0">
      <div className="text-[15px] font-extrabold uppercase tracking-wider text-[#0A1B33] leading-tight">
        {title}
      </div>
      <div className="text-[13px] text-[#475569] leading-tight">{desc}</div>
    </div>
  </div>
);

const Highlight: React.FC<{ Icon: LucideIcon; title: string; desc: string }> = ({ Icon, title, desc }) => (
  <div className="flex items-start gap-3">
    <Icon size={34} color={ORANGE} strokeWidth={2.3} className="shrink-0 mt-0.5" />
    <div className="min-w-0">
      <div className="text-[14px] font-extrabold uppercase tracking-wider text-[#0A1B33] leading-tight">
        {title}
      </div>
      <div className="text-[12px] text-[#475569] leading-snug mt-0.5">{desc}</div>
    </div>
  </div>
);

const FootChip: React.FC<{ Icon: LucideIcon; label: string; desc: string }> = ({ Icon, label, desc }) => (
  <div className="flex items-center gap-3">
    <div
      className="flex h-[44px] w-[44px] items-center justify-center rounded-full"
      style={{ background: ORANGE }}
    >
      <Icon size={22} color="#fff" strokeWidth={2.4} />
    </div>
    <div className="min-w-0">
      <div className="text-[14px] font-extrabold uppercase tracking-[0.14em] text-white leading-tight">
        {label}
      </div>
      <div className="text-[11px] text-white/80 leading-tight">{desc}</div>
    </div>
  </div>
);

interface Props { vars: ProposalVars; }

const TechnicalSlide = forwardRef<HTMLDivElement, Props>(({ vars }, ref) => {
  const projectUpper = vars.PROJECT_NAME.toUpperCase();
  const annualKwh = Number(vars.ANNUAL_UNITS) || 14;
  const lowerRange = annualKwh - 1;

  return (
    <SlideFrame ref={ref} className="!bg-white !text-[#0A1B33]">
      {/* HERO IMAGE TOP-RIGHT */}
      <div
        className="absolute"
        style={{
          right: 0,
          top: 0,
          width: 880,
          height: 230,
          overflow: "hidden",
        }}
      >
        <img src={heroUrl} alt="Rooftop solar" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0) 35%)",
          }}
        />
        {/* Project banner */}
        <div
          className="absolute right-0 top-[24px] flex items-center px-7"
          style={{
            background: ORANGE,
            height: 56,
            borderRadius: "0 0 0 28px",
          }}
        >
          <div className="text-white text-[22px] font-extrabold tracking-[0.14em]">
            {projectUpper}
          </div>
        </div>
      </div>

      {/* LOGO + TITLE */}
      <div className="absolute left-[48px] top-[40px] flex items-center gap-5">
        <img src={logoUrl} alt="Unite Solar" style={{ height: 90 }} />
        <div>
          <div className="text-[34px] font-extrabold tracking-tight text-[#0A1B33] leading-[1.05]">
            {vars.CAPACITY} MW SOLAR POWER SYSTEM
          </div>
          <div className="text-[34px] font-extrabold tracking-tight leading-[1.05]" style={{ color: ORANGE }}>
            TECHNICAL OVERVIEW
          </div>
          <div className="mt-2" style={{ height: 4, width: 110, background: ORANGE }} />
        </div>
      </div>

      <p className="absolute left-[48px] top-[210px] text-[18px] text-[#1F2937] leading-snug max-w-[820px]">
        A high-performance, grid-connected solar PV system engineered for maximum
        generation, reliability, and efficiency.
      </p>

      {/* ===== LEFT: SYSTEM SPECIFICATIONS ===== */}
      <div className="absolute left-[40px] top-[280px]" style={{ width: 540 }}>
        <SectionTitle width={360}>SYSTEM SPECIFICATIONS</SectionTitle>
        <div
          className="mt-3 px-5"
          style={{
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
          }}
        >
          <SpecRow Icon={SunMedium} label="Capacity" value={`${vars.CAPACITY} MW`} sub={`(${Number(vars.CAPACITY) * 1000} kW)`} />
          <SpecRow Icon={Zap} label="System Type" value="Grid Connected" sub="Solar PV System" />
          <SpecRow Icon={MapPin} label="Installation Type" value="Rooftop / Ground Mounted" sub="(Based on Site Feasibility)" />
          <SpecRow Icon={TrendingUp} label="Annual Generation" value={`${lowerRange} – ${annualKwh + 1} Lakh Units`} />
          <SpecRow Icon={Gauge} label="Performance Ratio" value="80 – 85%" />
          <SpecRow Icon={ShieldCheck} label="System Life" value={`${vars.LIFE} Years`} />
          <SpecRow Icon={Cloud} label={`CO\u2082 Reduction`} value={`~${vars.CO2} Tons / Year`} />
        </div>
      </div>

      {/* ===== MIDDLE: SYSTEM COMPONENTS ===== */}
      <div className="absolute" style={{ left: 600, top: 280, width: 410 }}>
        <SectionTitle width={300}>SYSTEM COMPONENTS</SectionTitle>
        <div
          className="mt-3 px-4 py-1"
          style={{
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
          }}
        >
          <Component img={modulesUrl} title="Solar Modules" desc="Tier-1 High Efficiency Mono PERC / TOPCon Modules" />
          <div style={{ borderTop: "1px solid #E5E7EB" }} />
          <Component img={inverterUrl} title="Inverters" desc="String / Central Inverters from Global Top Brands" />
          <div style={{ borderTop: "1px solid #E5E7EB" }} />
          <Component img={mountUrl} title="Mounting Structure" desc="Hot-Dip Galvanized / Aluminum Structures Designed for Long Life" />
          <div style={{ borderTop: "1px solid #E5E7EB" }} />
          <Component img={monitorUrl} title="Monitoring System" desc="Real-time Monitoring with Smart App & Web Dashboard" />
          <div style={{ borderTop: "1px solid #E5E7EB" }} />
          <Component img={netmeterUrl} title="Net Metering" desc="Seamless Integration with DISCOM" />
        </div>
      </div>

      {/* ===== RIGHT: TYPICAL LAYOUT ===== */}
      <div className="absolute" style={{ left: 1030, top: 280, width: 850 }}>
        <SectionTitle width={520}>TYPICAL SYSTEM LAYOUT – {vars.CAPACITY} MW</SectionTitle>
        <div
          className="mt-3 flex gap-4 p-4"
          style={{
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
          }}
        >
          <div className="relative" style={{ width: 540, height: 470, borderRadius: 12, overflow: "hidden" }}>
            <img src={layoutUrl} alt="Solar farm layout" className="h-full w-full object-cover" />
            {/* Numbered pins */}
            {[
              { n: 1, x: 30, y: 18 },
              { n: 2, x: 78, y: 36 },
              { n: 3, x: 80, y: 56 },
              { n: 4, x: 35, y: 60 },
              { n: 5, x: 76, y: 80 },
            ].map((p) => (
              <div
                key={p.n}
                className="absolute flex items-center justify-center rounded-full text-white font-extrabold"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: "translate(-50%,-50%)",
                  width: 34,
                  height: 34,
                  background: ORANGE,
                  border: "3px solid #fff",
                  fontSize: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                {p.n}
              </div>
            ))}
          </div>
          <div className="flex-1">
            <LayoutLegend n={1} title="Solar PV Arrays" desc="High efficiency solar modules" />
            <LayoutLegend n={2} title="Inverter Station" desc="High performance inverters" />
            <LayoutLegend n={3} title="Transformer" desc="Step-up transformer for grid connection" />
            <LayoutLegend n={4} title="Net Metering" desc="Export / Import energy meter" />
            <LayoutLegend n={5} title="Monitoring Room" desc="Monitoring & control system" />
          </div>
        </div>
      </div>

      {/* ===== KEY HIGHLIGHTS ===== */}
      <div className="absolute left-[40px] right-[40px]" style={{ top: 880 }}>
        <SectionTitle width={260}>KEY HIGHLIGHTS</SectionTitle>
        <div
          className="mt-3 px-6 py-4 grid grid-cols-6 gap-5"
          style={{
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
          }}
        >
          <Highlight Icon={TrendingUp} title={"High Energy\nYield"} desc="Maximizing power generation" />
          <Highlight Icon={ShieldCheck} title={"Reliable & Safe System"} desc="International standard equipment" />
          <Highlight Icon={Wrench} title="Low Maintenance" desc="Advanced technology ensures low O&M cost" />
          <Highlight Icon={MonitorSmartphone} title="Smart Monitoring" desc="24/7 remote monitoring & performance tracking" />
          <Highlight Icon={Repeat} title={"Scalable & Future Ready"} desc="Expandable for future energy needs" />
          <Highlight Icon={Leaf} title="Sustainable Impact" desc="Clean energy for a greener tomorrow" />
        </div>
      </div>

      {/* BOTTOM STRIP */}
      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-10"
        style={{ height: 88, background: NAVY }}
      >
        <div className="flex items-center gap-7">
          <FootChip Icon={IndianRupee} label="Lower Electricity Bills" desc="Save up to 70 – 80%" />
          <FootChip Icon={Zap} label="Energy Independence" desc="Reduce reliance on the grid" />
          <FootChip Icon={HandshakeIcon} label="Asset Value Enhancement" desc="Increase property & community value" />
          <FootChip Icon={Globe} label="Green & Sustainable Future" desc="Contribute to a cleaner planet" />
        </div>
        <div className="flex items-center gap-3">
          <Building2 size={36} color={ORANGE} strokeWidth={2} />
          <div>
            <div className="text-[18px] font-extrabold tracking-[0.12em] text-white leading-tight">
              {projectUpper}
            </div>
            <div className="text-[12px] tracking-[0.18em]" style={{ color: ORANGE }}>
              POWERING A SUSTAINABLE TOMORROW
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
});
TechnicalSlide.displayName = "TechnicalSlide";
export default TechnicalSlide;
