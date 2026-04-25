import React, { forwardRef } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import heroUrl from "@/assets/proposal-savings-hero.jpg";
import { TrendingUp, Zap, Battery, PiggyBank, Sparkles, IndianRupee } from "lucide-react";

const NAVY = "#0A1B33";
const ORANGE = "#F59E0B";
const GOLD = "#FFC527";

const Benefit: React.FC<{ Icon: typeof Zap; title: string; desc: string }> = ({
  Icon,
  title,
  desc,
}) => (
  <div
    className="flex items-start gap-4 rounded-2xl"
    style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)",
      padding: "18px 20px",
      backdropFilter: "blur(4px)",
    }}
  >
    <div
      className="flex items-center justify-center rounded-xl shrink-0"
      style={{
        width: 52,
        height: 52,
        background: "rgba(245,158,11,0.18)",
        color: ORANGE,
      }}
    >
      <Icon size={28} />
    </div>
    <div className="flex flex-col">
      <span className="text-white text-[18px] font-extrabold leading-tight">
        {title}
      </span>
      <span className="text-[13px] mt-1" style={{ color: "#CBD5E1" }}>
        {desc}
      </span>
    </div>
  </div>
);

const SavingsSlide = forwardRef<HTMLDivElement, { vars: ProposalVars }>(
  ({ vars }, ref) => {
    const totalSavings = vars.TOTAL_SAVINGS;
    const life = vars.LIFE;
    const annualLakh = parseFloat(vars.ANNUAL_UNITS) || 0;
    const co2Total =
      (parseFloat(vars.CO2) || 0) * (parseFloat(life) || 0);

    return (
      <SlideFrame ref={ref} className="bg-white text-[#0A1B33]">
        {/* Top brand bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-12 z-20"
          style={{ height: 88, background: NAVY }}
        >
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Unite Solar" style={{ height: 52 }} />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-extrabold tracking-[0.18em] text-[18px]">
                UNITE SOLAR
              </span>
              <span
                className="text-[12px] tracking-[0.22em]"
                style={{ color: ORANGE }}
              >
                ESTIMATED SAVINGS
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-[14px] tracking-[0.2em] font-semibold">
              {vars.PROJECT_NAME}
            </div>
            <div
              className="text-[12px] tracking-[0.18em]"
              style={{ color: "#94A3B8" }}
            >
              {vars.LOCATION} • {vars.CAPACITY} MW
            </div>
          </div>
        </div>

        {/* Hero background */}
        <div
          className="absolute"
          style={{ top: 88, left: 0, right: 0, bottom: 56 }}
        >
          <img
            src={heroUrl}
            alt="Solar panels at golden hour"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Dark overlay for legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(10,27,51,0.92) 0%, rgba(10,27,51,0.78) 45%, rgba(10,27,51,0.45) 75%, rgba(10,27,51,0.30) 100%)",
            }}
          />
          {/* Bottom golden glow */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 280,
              background:
                "linear-gradient(180deg, rgba(245,158,11,0) 0%, rgba(245,158,11,0.20) 100%)",
            }}
          />
        </div>

        {/* Section title chip */}
        <div
          className="absolute z-10"
          style={{ top: 130, left: 64 }}
        >
          <div
            className="inline-flex items-center gap-2 text-white font-extrabold tracking-[0.22em] text-[14px]"
            style={{
              background: ORANGE,
              padding: "10px 18px",
              borderRadius: "8px 8px 8px 0",
              color: NAVY,
            }}
          >
            <Sparkles size={16} /> ESTIMATED SAVINGS
          </div>
          <div
            className="mt-3 text-white font-extrabold tracking-[0.04em]"
            style={{ fontSize: 46, lineHeight: 1.05, maxWidth: 1100 }}
          >
            Powering {vars.PROJECT_NAME} into{" "}
            <span style={{ color: GOLD }}>decades of savings.</span>
          </div>
        </div>

        {/* MAIN HIGHLIGHT — Golden mega number */}
        <div
          className="absolute z-10"
          style={{ top: 320, left: 64, maxWidth: 1180 }}
        >
          <div
            className="text-[14px] font-bold tracking-[0.30em]"
            style={{ color: "#94A3B8" }}
          >
            TOTAL LIFETIME SAVINGS
          </div>
          <div
            className="font-black leading-none mt-3 flex items-baseline gap-3"
            style={{
              fontSize: 168,
              lineHeight: 0.95,
              background: `linear-gradient(180deg, ${GOLD} 0%, ${ORANGE} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              textShadow: "0 4px 30px rgba(245,158,11,0.25)",
            }}
          >
            ₹{totalSavings} CR+
          </div>
          <div
            className="mt-2 text-white font-bold tracking-[0.06em]"
            style={{ fontSize: 30 }}
          >
            OVER{" "}
            <span style={{ color: GOLD }}>{life} YEARS</span>{" "}
            OF SOLAR GENERATION
          </div>

          {/* Secondary line */}
          <div
            className="mt-6 inline-flex items-center gap-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "14px 22px",
              backdropFilter: "blur(6px)",
            }}
          >
            <IndianRupee size={22} color={GOLD} />
            <span className="text-white text-[20px] font-bold tracking-[0.04em]">
              <span style={{ color: GOLD }}>₹1.2 – ₹1.4 CR</span> per year
              (approx.)
            </span>
          </div>
        </div>

        {/* Right side benefit cards */}
        <div
          className="absolute z-10 flex flex-col gap-4"
          style={{ top: 320, right: 64, width: 520 }}
        >
          <Benefit
            Icon={Zap}
            title="Lower Electricity Bills"
            desc="Drastically reduce monthly grid consumption from day one."
          />
          <Benefit
            Icon={Battery}
            title="Energy Independence"
            desc="Generate your own clean power on-site, hedge against tariff hikes."
          />
          <Benefit
            Icon={PiggyBank}
            title="Long-Term Savings"
            desc={`Predictable, inflation-proof savings across the full ${life}-year project life.`}
          />
          <Benefit
            Icon={TrendingUp}
            title="Asset Appreciation"
            desc={`${annualLakh} Lakh Units/yr generation adds tangible value & sustainability credentials.`}
          />
        </div>

        {/* Bottom impact strip */}
        <div
          className="absolute z-10 flex items-stretch gap-0 rounded-2xl overflow-hidden"
          style={{
            left: 64,
            right: 64,
            bottom: 96,
            background: "rgba(10,27,51,0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(6px)",
          }}
        >
          {[
            { label: "ANNUAL SAVINGS", value: "₹1.2 – 1.4 Cr" },
            { label: "PAYBACK PERIOD", value: `${vars.PAYBACK} Years` },
            { label: "PROJECT LIFE", value: `${life} Years` },
            { label: "LIFETIME CO₂ AVOIDED", value: `${co2Total.toLocaleString("en-IN")} T` },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex-1 flex flex-col items-center justify-center"
              style={{
                padding: "20px 12px",
                borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span
                className="text-[11px] font-bold tracking-[0.24em]"
                style={{ color: "#94A3B8" }}
              >
                {s.label}
              </span>
              <span
                className="mt-1 font-extrabold"
                style={{ color: GOLD, fontSize: 28, letterSpacing: "0.02em" }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-12 z-20"
          style={{ height: 56, background: NAVY }}
        >
          <span
            className="text-[12px] tracking-[0.24em]"
            style={{ color: "#94A3B8" }}
          >
            UNITE SOLAR • ESTIMATED SAVINGS
          </span>
          <span
            className="text-[12px] tracking-[0.24em]"
            style={{ color: "#94A3B8" }}
          >
            POWERING COMMUNITIES • CREATING SUSTAINABLE VALUE
          </span>
        </div>
      </SlideFrame>
    );
  }
);
SavingsSlide.displayName = "SavingsSlide";
export default SavingsSlide;
