import React, { forwardRef } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import {
  Cog,
  IndianRupee,
  Leaf,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Award,
  Check,
} from "lucide-react";

const NAVY = "#0A1B33";
const ORANGE = "#F59E0B";
const GOLD = "#FFC527";
const GREEN = "#10B981";
const SLATE = "#475569";

interface SectionProps {
  n: number;
  Icon: typeof Cog;
  title: string;
  subtitle: string;
  bullets: { k: string; v: string }[];
  status: string;
  accent?: string;
}

const FeasCard: React.FC<SectionProps> = ({
  n,
  Icon,
  title,
  subtitle,
  bullets,
  status,
  accent = ORANGE,
}) => (
  <div
    className="rounded-2xl bg-white flex flex-col"
    style={{
      border: "1px solid #E5E7EB",
      boxShadow: "0 8px 22px rgba(10,27,51,0.06)",
      padding: "22px 22px",
      height: "100%",
    }}
  >
    <div className="flex items-start gap-3">
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{
          width: 54,
          height: 54,
          background: `${accent}1F`,
          color: accent,
        }}
      >
        <Icon size={28} />
      </div>
      <div className="flex flex-col leading-tight flex-1 min-w-0">
        <span
          className="text-[11px] font-bold tracking-[0.22em]"
          style={{ color: accent }}
        >
          0{n} • {subtitle}
        </span>
        <span
          className="font-extrabold text-[20px] mt-1"
          style={{ color: NAVY }}
        >
          {title}
        </span>
      </div>
    </div>

    <div className="mt-4 flex flex-col gap-2 flex-1">
      {bullets.map((b) => (
        <div
          key={b.k}
          className="flex items-center justify-between rounded-lg"
          style={{
            background: "#F8FAFC",
            border: "1px solid #EEF2F7",
            padding: "10px 12px",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Check size={14} color={accent} />
            <span
              className="text-[12px] font-semibold"
              style={{ color: SLATE }}
            >
              {b.k}
            </span>
          </div>
          <span
            className="text-[13px] font-extrabold ml-2 truncate"
            style={{ color: NAVY }}
          >
            {b.v}
          </span>
        </div>
      ))}
    </div>

    <div
      className="mt-3 inline-flex items-center gap-2 rounded-lg self-start"
      style={{
        background: `${accent}14`,
        color: accent,
        padding: "8px 12px",
      }}
    >
      <CheckCircle2 size={16} />
      <span className="text-[12px] font-extrabold tracking-[0.06em]">
        {status}
      </span>
    </div>
  </div>
);

const FeasibilitySlide = forwardRef<HTMLDivElement, { vars: ProposalVars }>(
  ({ vars }, ref) => {
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
                FEASIBILITY REPORT
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

        {/* Title row */}
        <div className="absolute" style={{ top: 100, left: 64, right: 64 }}>
          <div
            className="inline-flex items-center text-white font-extrabold tracking-[0.18em] text-[14px]"
            style={{
              background: NAVY,
              padding: "8px 18px",
              borderRadius: "8px 8px 8px 0",
            }}
          >
            FEASIBILITY REPORT
          </div>
          <div className="flex items-end justify-between gap-6 mt-3">
            <div
              className="font-extrabold tracking-[0.02em]"
              style={{ color: NAVY, fontSize: 36, lineHeight: 1.1, maxWidth: 1100 }}
            >
              A {vars.CAPACITY} MW solar project — assessed across{" "}
              <span style={{ color: ORANGE }}>technical</span>,{" "}
              <span style={{ color: ORANGE }}>financial</span> and{" "}
              <span style={{ color: ORANGE }}>environmental</span> dimensions.
            </div>

            {/* Key data chips */}
            <div className="flex items-center gap-3">
              {[
                { label: "INVESTMENT", value: `₹${vars.PROJECT_COST} Cr` },
                { label: "SAVINGS", value: `₹${vars.TOTAL_SAVINGS} Cr+` },
                { label: "PAYBACK", value: `${vars.PAYBACK} Yrs` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center rounded-xl"
                  style={{
                    background: NAVY,
                    padding: "12px 18px",
                    minWidth: 140,
                  }}
                >
                  <span
                    className="text-[10px] font-bold tracking-[0.22em]"
                    style={{ color: "#94A3B8" }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="font-extrabold text-[20px] mt-1"
                    style={{ color: GOLD }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4-card grid */}
        <div
          className="absolute grid grid-cols-4 gap-5"
          style={{ top: 290, left: 64, right: 64, height: 580 }}
        >
          <FeasCard
            n={1}
            Icon={Cog}
            subtitle="TECHNICAL"
            title="Technical Feasibility"
            accent={BLUE_OR_ORANGE("blue")}
            bullets={[
              { k: "Rooftop Suitability", v: "High" },
              { k: "Shadow-Free Zones", v: "Identified" },
              { k: "Grid Connectivity", v: "Available" },
              { k: "System Type", v: "Grid-Connected PV" },
              { k: "Performance Ratio", v: "80 – 85%" },
            ]}
            status="TECHNICALLY VIABLE"
          />
          <FeasCard
            n={2}
            Icon={IndianRupee}
            subtitle="FINANCIAL"
            title="Financial Feasibility"
            accent={ORANGE}
            bullets={[
              { k: "Project Investment", v: `₹${vars.PROJECT_COST} Cr` },
              { k: "Lifetime Savings", v: `₹${vars.TOTAL_SAVINGS} Cr+` },
              { k: "Payback Period", v: `${vars.PAYBACK} Yrs` },
              { k: "IRR", v: "18% – 24%" },
              { k: "O&M Cost", v: `₹${vars.OM_COST} L/yr` },
            ]}
            status="FINANCIALLY STRONG"
          />
          <FeasCard
            n={3}
            Icon={Leaf}
            subtitle="ENVIRONMENT"
            title="Environmental Impact"
            accent={GREEN}
            bullets={[
              { k: "CO₂ Reduction", v: `${vars.CO2} T/yr` },
              { k: "Lifetime CO₂ Avoided", v: `${(
                (parseFloat(vars.CO2) || 0) * (parseFloat(vars.LIFE) || 0)
              ).toLocaleString("en-IN")} T` },
              { k: "Equiv. Trees Planted", v: `${Math.round(
                (parseFloat(vars.CO2) || 0) * 45
              ).toLocaleString("en-IN")}/yr` },
              { k: "Clean Energy", v: `${vars.ANNUAL_UNITS} L Units/yr` },
              { k: "Project Life", v: `${vars.LIFE} Years` },
            ]}
            status="HIGHLY SUSTAINABLE"
          />
          <FeasCard
            n={4}
            Icon={Award}
            subtitle="CONCLUSION"
            title="Overall Assessment"
            accent={ORANGE}
            bullets={[
              { k: "Technical Risk", v: "Low" },
              { k: "Financial Return", v: "Strong" },
              { k: "Environmental Value", v: "High" },
              { k: "Regulatory Clearance", v: "Standard" },
              { k: "Execution Confidence", v: "High" },
            ]}
            status="RECOMMENDED FOR EXECUTION"
          />
        </div>

        {/* FINAL BOX */}
        <div
          className="absolute flex items-center justify-between rounded-2xl"
          style={{
            left: 64,
            right: 64,
            bottom: 84,
            height: 96,
            background: `linear-gradient(90deg, ${NAVY} 0%, #13294B 60%, ${NAVY} 100%)`,
            boxShadow: "0 12px 30px rgba(10,27,51,0.25)",
            padding: "0 28px",
            border: `1px solid rgba(245,158,11,0.35)`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 56,
                height: 56,
                background: ORANGE,
                color: NAVY,
              }}
            >
              <ShieldCheck size={30} />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className="text-[11px] font-bold tracking-[0.26em]"
                style={{ color: ORANGE }}
              >
                FINAL VERDICT
              </span>
              <span
                className="font-extrabold text-[22px] tracking-[0.02em]"
                style={{ color: "white" }}
              >
                Technically Viable{" "}
                <span style={{ color: GOLD }}>|</span> Financially Strong{" "}
                <span style={{ color: GOLD }}>|</span> Recommended for Execution
              </span>
            </div>
          </div>
          <div
            className="hidden md:flex items-center gap-2 rounded-xl"
            style={{
              background: ORANGE,
              color: NAVY,
              padding: "12px 18px",
            }}
          >
            <TrendingUp size={20} />
            <span className="font-extrabold text-[14px] tracking-[0.06em]">
              GO • EXECUTE
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-12"
          style={{ height: 56, background: NAVY }}
        >
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>
            UNITE SOLAR • FEASIBILITY REPORT
          </span>
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>
            POWERING COMMUNITIES • CREATING SUSTAINABLE VALUE
          </span>
        </div>
      </SlideFrame>
    );
  }
);

// Helper to keep the Technical card tinted blue without polluting top constants
function BLUE_OR_ORANGE(c: "blue" | "orange") {
  return c === "blue" ? "#1E5FBF" : ORANGE;
}

FeasibilitySlide.displayName = "FeasibilitySlide";
export default FeasibilitySlide;
