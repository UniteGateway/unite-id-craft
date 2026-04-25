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
  Cpu,
  Activity,
  Layers,
  Cable,
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
  const capMW = Number(vars.CAPACITY) || 1;
  const capKW = capMW * 1000;
  // Component sizing rules of thumb (per MW)
  const moduleQty = Math.round((capKW * 1000) / 580); // ~580 Wp per module
  const inverterQty = Math.max(1, Math.round(capMW / 0.1)); // ~100 kW string inverters
  const stringMonitorQty = inverterQty;
  const transformerQty = Math.max(1, Math.ceil(capMW / 1));
  const dcCableM = Math.round(capKW * 12); // ~12 m DC cable per kW
  const acCableM = Math.round(capKW * 6);

  const componentRows: Array<{
    Icon: LucideIcon;
    component: string;
    makeType: string;
    qty: string;
    specs: string;
  }> = [
    {
      Icon: SunMedium,
      component: "Solar PV Modules",
      makeType: "Tier-1 Mono PERC / TOPCon (Bifacial)",
      qty: `${moduleQty.toLocaleString("en-IN")} Nos.`,
      specs: "560–600 Wp • 21%+ efficiency • IEC 61215 / 61730 • 25-yr linear power warranty",
    },
    {
      Icon: Cpu,
      component: "String Inverters",
      makeType: "Sungrow / SMA / Huawei / equivalent",
      qty: `${inverterQty} Nos. (~100 kW)`,
      specs: "98.5%+ efficiency • IP66 • Integrated MPPT, AFCI & SPD • 5-yr standard warranty",
    },
    {
      Icon: Layers,
      component: "Mounting Structure",
      makeType: "Hot-Dip Galvanized MS / Aluminium",
      qty: `For ${capMW} MW array`,
      specs: "80 µm galvanization • Wind load 150 km/h • 25-yr design life • Pre-engineered",
    },
    {
      Icon: Cable,
      component: "DC & AC Cabling",
      makeType: "Polycab / Lapp / Havells – Solar grade",
      qty: `~${dcCableM.toLocaleString("en-IN")} m DC + ~${acCableM.toLocaleString("en-IN")} m AC`,
      specs: "XLPE insulated • UV & weather resistant • Copper / Aluminium • TUV certified",
    },
    {
      Icon: Zap,
      component: "Transformer & LT/HT Panels",
      makeType: "ABB / Schneider / Siemens",
      qty: `${transformerQty} Nos.`,
      specs: "Step-up transformer • VCB / ACB switchgear • Protection relays • IS/IEC compliant",
    },
    {
      Icon: Activity,
      component: "Net / ABT Metering",
      makeType: "DISCOM-approved bi-directional meter",
      qty: "1 Set",
      specs: "Class 0.5S accuracy • Remote read • Compliant with state DISCOM regulations",
    },
    {
      Icon: MonitorSmartphone,
      component: "SCADA & Monitoring",
      makeType: "Cloud + On-site SCADA",
      qty: `${stringMonitorQty} Data loggers`,
      specs: "Real-time generation • String-level monitoring • Mobile + Web dashboard • Alerts",
    },
    {
      Icon: ShieldCheck,
      component: "Safety & Earthing",
      makeType: "LA + Chemical earthing kits",
      qty: "As per IS/IEC norms",
      specs: "Lightning arrestors • DC/AC SPDs • Dedicated earth pits • Fire-safety compliant",
    },
  ];

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

      {/* ===== DETAILED COMPONENTS TABLE ===== */}
      <div className="absolute left-[40px] right-[40px]" style={{ top: 800 }}>
        <SectionTitle width={620}>
          DETAILED BILL OF MATERIALS – {vars.CAPACITY} MW
        </SectionTitle>
        <div
          className="mt-3 overflow-hidden"
          style={{
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
          }}
        >
          {/* Table header */}
          <div
            className="grid items-center px-5 py-3 text-white text-[14px] font-extrabold tracking-[0.16em] uppercase"
            style={{
              gridTemplateColumns: "330px 430px 260px 1fr",
              background: NAVY,
              gap: 16,
            }}
          >
            <div>Component</div>
            <div>Make / Type</div>
            <div>Quantity / Sizing</div>
            <div>Key Specifications</div>
          </div>
          {/* Rows */}
          {componentRows.map((row, i) => (
            <div
              key={row.component}
              className="grid items-center px-5 py-[10px]"
              style={{
                gridTemplateColumns: "330px 430px 260px 1fr",
                gap: 16,
                background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                borderBottom: i === componentRows.length - 1 ? "none" : "1px solid #E5E7EB",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md"
                  style={{ background: "rgba(245,158,11,0.14)" }}
                >
                  <row.Icon size={22} color={ORANGE} strokeWidth={2.3} />
                </div>
                <div className="text-[15px] font-extrabold tracking-wider uppercase text-[#0A1B33] leading-tight">
                  {row.component}
                </div>
              </div>
              <div className="text-[14px] text-[#1F2937] leading-snug">{row.makeType}</div>
              <div className="text-[14px] font-bold text-[#0A1B33] leading-snug">{row.qty}</div>
              <div className="text-[13px] text-[#475569] leading-snug">{row.specs}</div>
            </div>
          ))}
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
