import React, { forwardRef, useMemo } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import {
  SunMedium,
  Cpu,
  Zap,
  Activity,
  MonitorSmartphone,
  Compass,
  Ruler,
  Building2,
  Leaf,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const ORANGE = "#F59E0B";
const NAVY = "#0A1B33";

const SectionTitle: React.FC<{ children: React.ReactNode; width?: number }> = ({
  children,
  width = 360,
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

interface LegendItem {
  n: number;
  Icon: LucideIcon;
  title: string;
  desc: string;
  // Pin position on diagram (% of container)
  x: number;
  y: number;
}

interface Props {
  vars: ProposalVars;
}

const LayoutSlide = forwardRef<HTMLDivElement, Props>(({ vars }, ref) => {
  const projectUpper = vars.PROJECT_NAME.toUpperCase();
  const layout = useMemo(() => {
    const area = parseFloat(vars.ROOF_AREA_SQM) || 0;
    const PANEL_W = 1.13, PANEL_H = 2.28; // m (550W)
    const PANEL_AREA = PANEL_W * PANEL_H;
    const PACKING = 0.55;
    const usable = area * PACKING;
    const panels = Math.max(0, Math.floor(usable / PANEL_AREA));
    const side = Math.sqrt(Math.max(area, 1));
    const cols = Math.max(1, Math.floor(side / (PANEL_W + 0.3)));
    const rows = Math.max(1, Math.ceil(panels / Math.max(cols, 1)));
    const dcKw = (panels * 550) / 1000;
    const targetMw = parseFloat(vars.CAPACITY) || 0;
    return { area, panels, rows, cols, dcKw, targetMw };
  }, [vars.ROOF_AREA_SQM, vars.CAPACITY]);

  const items: LegendItem[] = [
    {
      n: 1,
      Icon: SunMedium,
      title: "Solar PV Arrays",
      desc: "Tier-1 modules in shade-free, optimally tilted rows",
      x: 32,
      y: 42,
    },
    {
      n: 2,
      Icon: Cpu,
      title: "Inverter Stations",
      desc: "Distributed string inverters between array blocks",
      x: 56,
      y: 56,
    },
    {
      n: 3,
      Icon: Zap,
      title: "Step-Up Transformer",
      desc: "Fenced HT yard for grid-level voltage step-up",
      x: 82,
      y: 70,
    },
    {
      n: 4,
      Icon: Activity,
      title: "Net Metering Room",
      desc: "Bi-directional ABT meter & DISCOM interface",
      x: 24,
      y: 78,
    },
    {
      n: 5,
      Icon: MonitorSmartphone,
      title: "Monitoring & Control Room",
      desc: "SCADA, real-time monitoring & operations",
      x: 90,
      y: 50,
    },
  ];

  return (
    <SlideFrame ref={ref} className="!bg-white !text-[#0A1B33]">
      {/* HEADER: logo + title */}
      <div className="absolute left-[48px] top-[40px] flex items-center gap-5">
        <img src={logoUrl} alt="Unite Solar" style={{ height: 90 }} />
        <div>
          <div className="text-[34px] font-extrabold tracking-tight text-[#0A1B33] leading-[1.05]">
            TYPICAL SYSTEM LAYOUT
          </div>
          <div
            className="text-[34px] font-extrabold tracking-tight leading-[1.05]"
            style={{ color: ORANGE }}
          >
            {vars.CAPACITY} MW SOLAR POWER PLANT
          </div>
          <div
            className="mt-2"
            style={{ height: 4, width: 110, background: ORANGE }}
          />
        </div>
      </div>

      {/* PROJECT BANNER (top-right) */}
      <div
        className="absolute right-0 top-[40px] flex items-center px-7"
        style={{
          background: ORANGE,
          height: 56,
          borderRadius: "28px 0 0 28px",
        }}
      >
        <Building2 size={24} color="#fff" strokeWidth={2.4} className="mr-3" />
        <div className="text-white text-[22px] font-extrabold tracking-[0.14em]">
          {projectUpper}
        </div>
      </div>

      <p className="absolute left-[48px] top-[200px] text-[18px] text-[#1F2937] leading-snug max-w-[1300px]">
        Indicative top-view plant layout showing the optimum placement of solar
        arrays, power conversion equipment, evacuation infrastructure and
        monitoring facilities for a {vars.CAPACITY} MW grid-connected solar power
        plant.
      </p>

      {/* MAIN LAYOUT GRID */}
      <div
        className="absolute"
        style={{ left: 40, right: 40, top: 270, bottom: 110 }}
      >
        <div className="flex gap-6 h-full">
          {/* DIAGRAM */}
          <div style={{ width: 1240 }}>
            <SectionTitle width={420}>PLANT LAYOUT – TOP VIEW</SectionTitle>
            <div
              className="relative mt-3"
              style={{
                background: "#F8FAFC",
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                height: 600,
                overflow: "hidden",
              }}
            >
              {/* Diagram image (cropped to hide garbled labels) */}
              <div
                className="absolute"
                style={{ left: 0, right: 0, top: 0, height: 540, overflow: "hidden" }}
              >
                <img
                  src={diagramUrl}
                  alt={`${vars.CAPACITY} MW solar plant layout top view`}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center top" }}
                />
                {/* Subtle wash for readability */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.0) 35%, rgba(248,250,252,0.85) 100%)",
                  }}
                />
                {/* Numbered pins */}
                {items.map((p) => (
                  <div
                    key={p.n}
                    className="absolute flex items-center justify-center rounded-full text-white font-extrabold"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: "translate(-50%,-50%)",
                      width: 44,
                      height: 44,
                      background: ORANGE,
                      border: "4px solid #fff",
                      fontSize: 20,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.45)",
                    }}
                  >
                    {p.n}
                  </div>
                ))}
              </div>

              {/* Bottom info strip (covers any garbled text) */}
              <div
                className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-6"
                style={{
                  height: 60,
                  background: NAVY,
                  color: "#fff",
                }}
              >
                <div className="flex items-center gap-2">
                  <Compass size={22} color={ORANGE} strokeWidth={2.3} />
                  <span className="text-[14px] tracking-[0.16em] font-extrabold uppercase">
                    North
                  </span>
                </div>
                <div className="text-[13px] tracking-[0.18em] uppercase opacity-90">
                  Indicative Layout • Not to Scale • Final Design as per Site Survey
                </div>
                <div className="flex items-center gap-2">
                  <Ruler size={22} color={ORANGE} strokeWidth={2.3} />
                  <span className="text-[14px] tracking-[0.16em] font-extrabold uppercase">
                    Scale Reference
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LEGEND */}
          <div className="flex-1">
            <SectionTitle width={260}>KEY COMPONENTS</SectionTitle>
            <div
              className="mt-3 px-5 py-4"
              style={{
                background: "#F8FAFC",
                border: "1px solid #E5E7EB",
                borderRadius: 14,
              }}
            >
              {items.map((it) => (
                <div
                  key={it.n}
                  className="flex items-start gap-4 py-[14px] border-b border-[#E5E7EB] last:border-b-0"
                >
                  <div
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full text-white font-extrabold"
                    style={{
                      background: ORANGE,
                      fontSize: 18,
                      border: "3px solid #fff",
                      boxShadow: "0 0 0 1px #E5E7EB",
                    }}
                  >
                    {it.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <it.Icon size={20} color={ORANGE} strokeWidth={2.3} />
                      <div className="text-[16px] font-extrabold uppercase tracking-wider text-[#0A1B33] leading-tight">
                        {it.title}
                      </div>
                    </div>
                    <div className="text-[13px] text-[#475569] leading-snug mt-1">
                      {it.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini benefits card */}
            <div
              className="mt-4 px-5 py-4"
              style={{
                background: "#FFF7ED",
                border: `1px solid ${ORANGE}`,
                borderRadius: 14,
              }}
            >
              <div
                className="text-[14px] font-extrabold uppercase tracking-[0.16em] mb-2"
                style={{ color: ORANGE }}
              >
                Layout Advantages
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 text-[13px] text-[#0A1B33]">
                  <TrendingUp size={16} color={ORANGE} /> Maximum generation per
                  acre
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#0A1B33]">
                  <ShieldCheck size={16} color={ORANGE} /> Safe & compliant
                  evacuation
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#0A1B33]">
                  <Leaf size={16} color={ORANGE} /> Low O&M, easy access
                  pathways
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STRIP */}
      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-10"
        style={{ height: 88, background: NAVY }}
      >
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Unite Solar" style={{ height: 50 }} />
          <div>
            <div className="text-[16px] font-extrabold tracking-[0.16em] text-white leading-tight">
              UNITE SOLAR
            </div>
            <div
              className="text-[11px] tracking-[0.18em]"
              style={{ color: ORANGE }}
            >
              ENGINEERED FOR PERFORMANCE
            </div>
          </div>
        </div>
        <div className="text-[14px] tracking-[0.18em] uppercase text-white/85">
          {vars.CAPACITY} MW Grid-Connected Solar PV Plant • {vars.LOCATION}
        </div>
        <div className="flex items-center gap-3">
          <Building2 size={32} color={ORANGE} strokeWidth={2} />
          <div>
            <div className="text-[16px] font-extrabold tracking-[0.12em] text-white leading-tight">
              {projectUpper}
            </div>
            <div
              className="text-[11px] tracking-[0.18em]"
              style={{ color: ORANGE }}
            >
              POWERING A SUSTAINABLE TOMORROW
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
});
LayoutSlide.displayName = "LayoutSlide";
export default LayoutSlide;
