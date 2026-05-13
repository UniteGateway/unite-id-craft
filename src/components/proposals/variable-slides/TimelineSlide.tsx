import React, { forwardRef } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import {
  ClipboardList,
  FileSignature,
  Truck,
  Wrench,
  PlugZap,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

const NAVY = "#0A1B33";
const ORANGE = "#F59E0B";
const GOLD = "#FFC527";
const SLATE = "#475569";

interface Phase {
  n: number;
  Icon: typeof ClipboardList;
  title: string;
  week: string;
  bullets: string[];
}

const PHASES: Phase[] = [
  {
    n: 1,
    Icon: ClipboardList,
    title: "Site Survey & Design",
    week: "Week 1 – 2",
    bullets: ["Detailed site survey", "Shadow & load analysis", "Final system design"],
  },
  {
    n: 2,
    Icon: FileSignature,
    title: "Approvals & Agreement",
    week: "Week 2 – 3",
    bullets: ["DISCOM application", "Net-metering approval", "Contract sign-off"],
  },
  {
    n: 3,
    Icon: Truck,
    title: "Procurement & Logistics",
    week: "Week 3 – 5",
    bullets: ["Tier-1 modules dispatched", "Inverters & BoS sourced", "Material at site"],
  },
  {
    n: 4,
    Icon: Wrench,
    title: "Installation & Wiring",
    week: "Week 5 – 7",
    bullets: ["Mounting structure erection", "Module installation", "DC + AC cabling"],
  },
  {
    n: 5,
    Icon: PlugZap,
    title: "Testing & Commissioning",
    week: "Week 7 – 8",
    bullets: ["DISCOM inspection", "Net-meter installation", "System energization"],
  },
  {
    n: 6,
    Icon: CheckCircle2,
    title: "Handover & O&M",
    week: "Week 8+",
    bullets: ["Performance verification", "Owner training", "Ongoing O&M support"],
  },
];

const TimelineSlide = forwardRef<HTMLDivElement, { vars: ProposalVars }>(
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
              <span className="text-[11px] tracking-[0.22em]" style={{ color: ORANGE }}>
                IMPLEMENTATION TIMELINE
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-[13px] tracking-[0.2em] font-semibold">
              {vars.PROJECT_NAME}
            </div>
            <div className="text-[11px] tracking-[0.18em]" style={{ color: "#94A3B8" }}>
              {vars.LOCATION} • {vars.CAPACITY} MW
            </div>
          </div>
        </div>

        {/* Title row */}
        <div className="absolute" style={{ top: 100, left: 64, right: 64 }}>
          <div
            className="inline-flex items-center text-white font-extrabold tracking-[0.18em] text-[14px]"
            style={{ background: NAVY, padding: "8px 18px", borderRadius: "8px 8px 8px 0" }}
          >
            IMPLEMENTATION TIMELINE
          </div>
          <div className="flex items-end justify-between gap-6 mt-3">
            <div
              className="font-extrabold tracking-[0.02em]"
              style={{ color: NAVY, fontSize: 36, lineHeight: 1.1, maxWidth: 1100 }}
            >
              From <span style={{ color: ORANGE }}>kick-off</span> to{" "}
              <span style={{ color: ORANGE }}>energization</span> — a structured{" "}
              <span style={{ color: ORANGE }}>8-week</span> execution plan.
            </div>
            <div
              className="flex items-center gap-3 rounded-xl"
              style={{ background: NAVY, padding: "12px 18px" }}
            >
              <CalendarDays size={22} color={GOLD} />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold tracking-[0.22em]" style={{ color: "#94A3B8" }}>
                  TOTAL DURATION
                </span>
                <span className="font-extrabold text-[20px]" style={{ color: GOLD }}>
                  45 – 60 Days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline rail + cards */}
        <div className="absolute" style={{ top: 320, left: 64, right: 64, height: 560 }}>
          {/* horizontal rail */}
          <div
            className="absolute"
            style={{
              top: 70,
              left: 30,
              right: 30,
              height: 6,
              background: `linear-gradient(90deg, ${ORANGE} 0%, ${GOLD} 100%)`,
              borderRadius: 999,
            }}
          />
          <div className="grid grid-cols-6 gap-4 h-full">
            {PHASES.map((p) => (
              <div key={p.n} className="flex flex-col items-center">
                {/* node */}
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 64,
                    height: 64,
                    background: "white",
                    border: `4px solid ${ORANGE}`,
                    boxShadow: "0 8px 18px rgba(245,158,11,0.25)",
                    color: NAVY,
                    marginTop: 38,
                  }}
                >
                  <p.Icon size={28} />
                </div>
                {/* week pill */}
                <div
                  className="mt-3 rounded-full text-white font-extrabold tracking-[0.12em] text-[11px]"
                  style={{ background: NAVY, padding: "6px 12px" }}
                >
                  {p.week.toUpperCase()}
                </div>
                {/* card */}
                <div
                  className="mt-3 rounded-2xl bg-white w-full flex-1"
                  style={{
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 8px 22px rgba(10,27,51,0.06)",
                    padding: "16px 16px",
                  }}
                >
                  <span
                    className="text-[11px] font-bold tracking-[0.22em]"
                    style={{ color: ORANGE }}
                  >
                    PHASE 0{p.n}
                  </span>
                  <div
                    className="font-extrabold text-[16px] mt-1 leading-tight"
                    style={{ color: NAVY }}
                  >
                    {p.title}
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {p.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-[12px] font-semibold"
                        style={{ color: SLATE }}
                      >
                        <span
                          className="inline-block rounded-full mt-1.5"
                          style={{ width: 6, height: 6, background: ORANGE }}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-12"
          style={{ height: 56, background: NAVY }}
        >
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>
            UNITE SOLAR • IMPLEMENTATION TIMELINE
          </span>
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>
            ON-TIME • ON-BUDGET • ON-SPEC
          </span>
        </div>
      </SlideFrame>
    );
  }
);

TimelineSlide.displayName = "TimelineSlide";
export default TimelineSlide;