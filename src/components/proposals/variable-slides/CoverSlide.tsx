import React, { forwardRef } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import bgUrl from "@/assets/proposal-cover-bg.jpg";

interface Props {
  vars: ProposalVars;
}

const CoverSlide = forwardRef<HTMLDivElement, Props>(({ vars }, ref) => {
  return (
    <SlideFrame ref={ref}>
      {/* Background image */}
      <img
        src={bgUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      {/* Navy gradient overlay (left → transparent) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #061229 0%, rgba(6,18,41,0.92) 38%, rgba(6,18,41,0.55) 55%, rgba(6,18,41,0.0) 75%)",
        }}
      />
      {/* Diagonal orange accent line */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <line
          x1="1080"
          y1="0"
          x2="780"
          y2="1080"
          stroke="#F59E0B"
          strokeWidth="3"
          opacity="0.85"
        />
      </svg>

      {/* LEFT BLOCK */}
      <div className="absolute left-[90px] top-[80px] right-[1000px]">
        <img src={logoUrl} alt="Unite Solar" style={{ height: 130 }} />
        <div
          className="mt-3 text-[18px] font-semibold tracking-[0.28em] text-white/90"
          style={{ borderTop: "2px solid #F59E0B", paddingTop: 10, width: 360 }}
        >
          CLEAN ENERGY. BETTER TOMORROW.
        </div>
      </div>

      {/* TITLE */}
      <div className="absolute left-[90px] top-[330px] right-[900px]">
        <div className="text-[26px] font-medium tracking-[0.32em] text-white/85 mb-3">
          PROPOSAL FOR
        </div>
        <div
          className="font-extrabold leading-[0.95] text-[#F59E0B]"
          style={{ fontSize: 150, letterSpacing: "-0.02em" }}
        >
          {vars.CAPACITY} MW
        </div>
        <div
          className="font-extrabold leading-[0.95] text-white mt-1"
          style={{ fontSize: 140, letterSpacing: "-0.02em" }}
        >
          SOLAR POWER
        </div>
        <div
          className="mt-6"
          style={{ height: 5, width: 110, background: "#F59E0B" }}
        />
      </div>

      {/* PROJECT NAME / LOCATION */}
      <div className="absolute left-[90px] top-[820px] right-[900px]">
        <div className="text-[36px] font-bold uppercase tracking-wider text-white">
          {vars.PROJECT_NAME}
        </div>
        <div className="text-[24px] font-semibold tracking-wider text-[#F59E0B] mt-1">
          {vars.LOCATION}
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute left-[90px] bottom-[60px] right-[900px]">
        <div className="text-[22px] font-bold tracking-wider text-white">
          UNITE DEVELOPERS GLOBAL INC
        </div>
        <div className="text-[18px] font-semibold tracking-[0.25em] text-[#F59E0B] mt-2">
          INDIA &nbsp;•&nbsp; USA &nbsp;•&nbsp; UK &nbsp;•&nbsp; UAE
        </div>
        <div className="text-[16px] tracking-wider text-white/80 mt-2">
          www.unitesolar.in
        </div>
      </div>

      {/* RIGHT SAVINGS HIGHLIGHT BADGE */}
      <div className="absolute right-[90px] top-[420px] w-[760px]">
        <div
          className="rounded-2xl p-10 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #F59E0B 0%, #EA580C 60%, #B45309 100%)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          }}
        >
          <div className="text-[22px] font-semibold tracking-[0.25em] text-white/95 uppercase">
            Up To Savings
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-[150px] font-extrabold leading-none text-white drop-shadow-md">
              ₹{vars.TOTAL_SAVINGS}
            </span>
            <span className="text-[60px] font-bold text-white">Cr+</span>
          </div>
          <div className="mt-2 text-[28px] font-semibold tracking-wider text-white/95">
            in {vars.LIFE} Years
          </div>
          <div
            className="mt-6 pt-5 grid grid-cols-2 gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.4)" }}
          >
            <div>
              <div className="text-[14px] tracking-widest text-white/85 uppercase">
                Payback
              </div>
              <div className="text-[36px] font-extrabold text-white">
                {vars.PAYBACK} yrs
              </div>
            </div>
            <div>
              <div className="text-[14px] tracking-widest text-white/85 uppercase">
                Annual Generation
              </div>
              <div className="text-[36px] font-extrabold text-white">
                {vars.ANNUAL_UNITS} Lakh kWh
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-right text-[18px] italic text-white/85 tracking-wider">
          “Powering Communities. Creating Sustainable Value.”
        </div>
      </div>
    </SlideFrame>
  );
});
CoverSlide.displayName = "CoverSlide";
export default CoverSlide;