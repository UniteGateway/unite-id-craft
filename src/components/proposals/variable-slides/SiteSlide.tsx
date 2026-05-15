import React, { forwardRef, useEffect, useState } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import rooftopUrl from "@/assets/proposal-site-rooftop.jpg";
import mapUrl from "@/assets/proposal-site-map.jpg";
import { geocodeLocation, staticMapUrlFromSettings } from "@/lib/geocode";
import {
  MapPin,
  Home,
  Sun,
  Plug,
  SunMedium,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const ORANGE = "#F59E0B";
const NAVY = "#0A1B33";

const Row: React.FC<{
  Icon: LucideIcon;
  label: string;
  value: string;
}> = ({ Icon, label, value }) => (
  <div className="flex items-center gap-5 border-b border-[#E5E7EB] py-4 last:border-b-0">
    <div
      className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl"
      style={{ background: "rgba(245,158,11,0.12)" }}
    >
      <Icon size={40} color={ORANGE} strokeWidth={2.2} />
    </div>
    <div className="min-w-0 flex-1">
      <div
        className="text-[16px] font-extrabold uppercase tracking-[0.18em]"
        style={{ color: ORANGE }}
      >
        {label}
      </div>
      <div className="text-[26px] font-bold leading-tight" style={{ color: NAVY }}>
        {value}
      </div>
    </div>
    <CheckCircle2 size={36} color="#16A34A" strokeWidth={2.4} />
  </div>
);

interface Props { vars: ProposalVars; }

const SiteSlide = forwardRef<HTMLDivElement, Props>(({ vars }, ref) => {
  const [dynMap, setDynMap] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const lat = parseFloat(vars.LATITUDE);
    const lng = parseFloat(vars.LONGITUDE);
    if (isFinite(lat) && isFinite(lng) && (lat !== 0 || lng !== 0)) {
      setDynMap(staticMapUrlFromSettings({ lat, lng }, 760, 460, 18));
      return;
    }
    if (!vars.LOCATION) { setDynMap(null); return; }
    geocodeLocation(vars.LOCATION).then((p) => {
      if (cancelled) return;
      setDynMap(p ? staticMapUrlFromSettings(p, 760, 460, 18) : null);
    });
    return () => { cancelled = true; };
  }, [vars.LOCATION, vars.LATITUDE, vars.LONGITUDE]);
  return (
    <SlideFrame ref={ref} className="!bg-white !text-[#0A1B33]">
      {/* Logo */}
      <div className="absolute left-[60px] top-[50px]">
        <img src={logoUrl} alt="Unite Solar" style={{ height: 100 }} />
      </div>

      {/* Title block */}
      <div className="absolute left-[60px] top-[200px] right-[860px]">
        <div className="text-[28px] font-semibold tracking-[0.18em] uppercase" style={{ color: ORANGE }}>
          Slide 03
        </div>
        <div className="mt-2 text-[64px] font-extrabold leading-[1] tracking-tight" style={{ color: NAVY }}>
          SITE & FEASIBILITY
        </div>
        <div className="text-[64px] font-extrabold leading-[1] tracking-tight" style={{ color: ORANGE }}>
          ANALYSIS
        </div>
        <div className="mt-4" style={{ height: 5, width: 130, background: ORANGE }} />
        <p className="mt-5 text-[20px] leading-[1.5] text-[#1F2937] max-w-[760px]">
          A detailed pre-feasibility study confirms the site is well-suited for a
          high-yield {vars.CAPACITY} MW grid-connected solar PV installation.
        </p>
      </div>

      {/* Checklist */}
      <div className="absolute left-[60px] top-[560px] right-[860px]">
        <Row Icon={MapPin} label="Location" value={vars.LOCATION} />
        <Row Icon={Home} label="Rooftop Suitability" value="High" />
        <Row Icon={Sun} label="Shadow-Free Zones" value="Identified" />
        <Row Icon={Plug} label="Grid Connectivity" value="Available" />
        <Row Icon={SunMedium} label="Solar Potential" value="Optimal" />
      </div>

      {/* RIGHT COLUMN: Map card */}
      <div
        className="absolute overflow-hidden"
        style={{
          right: 60,
          top: 60,
          width: 760,
          height: 460,
          borderRadius: 18,
          border: `4px solid ${ORANGE}`,
        }}
      >
        <img
          src={dynMap || mapUrl}
          alt="Location map"
          className="absolute inset-0 h-full w-full object-cover"
          crossOrigin="anonymous"
        />
        {/* radial highlight */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.35) 0%, rgba(245,158,11,0) 70%)",
          }}
        />
        {/* Pin */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: "50%", top: "46%", transform: "translate(-50%,-100%)" }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 84,
              height: 84,
              borderRadius: "50% 50% 50% 0",
              transform: "rotate(-45deg)",
              background: ORANGE,
              boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                transform: "rotate(45deg)",
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#fff",
              }}
            />
          </div>
        </div>
        {/* Location label chip */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: 28 }}
        >
          <div
            className="px-6 py-2 text-[20px] font-bold tracking-wide text-white"
            style={{ background: NAVY, borderRadius: 999 }}
          >
            {vars.LOCATION}
          </div>
        </div>
      </div>

      {/* Rooftop image */}
      <div
        className="absolute overflow-hidden"
        style={{
          right: 60,
          top: 545,
          width: 760,
          height: 320,
          borderRadius: 18,
        }}
      >
        <img
          src={rooftopUrl}
          alt="Rooftop solar"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(10,27,51,0.85) 100%)",
          }}
        />
        <div className="absolute left-5 bottom-4 right-5 text-white text-[18px] font-semibold tracking-wide">
          Aerial assessment · shadow-free rooftop area validated
        </div>
      </div>

      {/* HIGHLIGHT BAR */}
      <div
        className="absolute flex items-center gap-5 px-8"
        style={{
          left: 60,
          right: 60,
          bottom: 80,
          height: 130,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${NAVY} 0%, #112952 100%)`,
          borderLeft: `8px solid ${ORANGE}`,
        }}
      >
        <div
          className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full"
          style={{ background: ORANGE }}
        >
          <Sparkles size={42} color="#fff" strokeWidth={2.4} />
        </div>
        <div className="min-w-0">
          <div className="text-[14px] font-bold tracking-[0.3em] uppercase" style={{ color: ORANGE }}>
            Conclusion
          </div>
          <div className="text-[34px] font-extrabold tracking-tight text-white leading-tight">
            Highly feasible for a{" "}
            <span style={{ color: ORANGE }}>{vars.CAPACITY} MW</span> solar installation
          </div>
        </div>
      </div>

      {/* Footer line */}
      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-10"
        style={{ height: 50, background: NAVY }}
      >
        <div className="text-[14px] tracking-[0.25em] text-white/80 uppercase">
          Unite Solar · Site & Feasibility
        </div>
        <div className="text-[14px] tracking-[0.25em] uppercase" style={{ color: ORANGE }}>
          www.unitesolar.in
        </div>
      </div>
    </SlideFrame>
  );
});
SiteSlide.displayName = "SiteSlide";
export default SiteSlide;