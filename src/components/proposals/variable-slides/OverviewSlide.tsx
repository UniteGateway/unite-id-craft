import React, { forwardRef } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import rooftopUrl from "@/assets/proposal-overview-rooftop.jpg";
import farmUrl from "@/assets/proposal-overview-solarfarm.jpg";
import {
  SunMedium,
  Zap,
  MapPin,
  CalendarDays,
  HandCoins,
  Cloud,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Building2,
  Globe,
  IndianRupee,
} from "lucide-react";

const ORANGE = "#F59E0B";

const Stat: React.FC<{
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  primary: string;
  secondary?: string;
}> = ({ Icon, label, primary, secondary }) => (
  <div className="flex items-start gap-4">
    <div
      className="flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-md"
      style={{ background: "rgba(245,158,11,0.12)" }}
    >
      <Icon size={44} color={ORANGE} strokeWidth={2.2} />
    </div>
    <div className="min-w-0">
      <div
        className="text-[18px] font-extrabold uppercase tracking-[0.12em]"
        style={{ color: ORANGE }}
      >
        {label}
      </div>
      <div className="mt-1 text-[26px] font-bold leading-[1.15] text-[#0A1B33]">
        {primary}
      </div>
      {secondary && (
        <div className="text-[18px] text-[#475569] leading-tight">{secondary}</div>
      )}
    </div>
  </div>
);

const Benefit: React.FC<{
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
}> = ({ Icon, title, desc }) => (
  <div className="flex items-start gap-3">
    <div
      className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full"
      style={{ background: ORANGE }}
    >
      <Icon size={24} color="#fff" strokeWidth={2.4} />
    </div>
    <div className="min-w-0">
      <div className="text-[15px] font-extrabold uppercase tracking-wider text-[#0A1B33] leading-tight">
        {title}
      </div>
      <div className="text-[14px] text-[#475569] leading-snug mt-0.5">{desc}</div>
    </div>
  </div>
);

const FootChip: React.FC<{
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
}> = ({ Icon, label }) => (
  <div className="flex items-center gap-3">
    <div
      className="flex h-[44px] w-[44px] items-center justify-center rounded-full"
      style={{ background: ORANGE }}
    >
      <Icon size={22} color="#fff" strokeWidth={2.4} />
    </div>
    <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-white whitespace-pre-line leading-[1.1]">
      {label}
    </div>
  </div>
);

interface Props { vars: ProposalVars; }

const OverviewSlide = forwardRef<HTMLDivElement, Props>(({ vars }, ref) => {
  const projectUpper = vars.PROJECT_NAME.toUpperCase();
  const [firstWord, ...restArr] = projectUpper.split(" ");
  const restWord = restArr.join(" ");

  return (
    <SlideFrame ref={ref} className="!bg-white !text-[#0A1B33]">
      {/* ========== LEFT COLUMN ========== */}
      <div className="absolute left-[60px] top-[50px] right-[820px]">
        <img src={logoUrl} alt="Unite Solar" style={{ height: 110 }} />
      </div>

      <div className="absolute left-[60px] top-[200px] right-[820px]">
        <div className="text-[36px] font-extrabold tracking-wide text-[#0A1B33]">
          PROJECT OVERVIEW
        </div>
        <div className="mt-2 text-[64px] font-extrabold leading-[1] tracking-tight">
          <span className="text-[#0A1B33]">{firstWord}</span>
          {restWord && <span style={{ color: ORANGE }}> {restWord}</span>}
        </div>
        <div
          className="mt-4"
          style={{ height: 5, width: 130, background: ORANGE }}
        />
        <p className="mt-6 text-[22px] leading-[1.45] text-[#1F2937] max-w-[760px]">
          This {vars.CAPACITY} MW solar power project is designed to meet the
          energy needs of {vars.PROJECT_NAME}, reduce energy costs, ensure
          energy independence, and contribute to a greener and more sustainable
          community.
        </p>
      </div>

      {/* Stats grid */}
      <div className="absolute left-[60px] top-[610px] right-[820px] grid grid-cols-3 gap-x-6 gap-y-7">
        <Stat Icon={SunMedium} label="Capacity" primary={`${vars.CAPACITY} MW`} secondary={`(${Number(vars.CAPACITY) * 1000} kW)`} />
        <Stat Icon={Zap} label="System Type" primary="Grid Connected" secondary="Solar PV System" />
        <Stat Icon={MapPin} label="Location" primary={vars.PROJECT_NAME} secondary={vars.LOCATION} />
        <Stat Icon={CalendarDays} label="Project Life" primary={`${vars.LIFE} Years`} />
        <Stat Icon={HandCoins} label="Annual Generation" primary={`${vars.ANNUAL_UNITS} Lakh`} secondary="Units" />
        <Stat Icon={Cloud} label="CO₂ Reduction" primary={`~${vars.CO2}`} secondary="Tons / Year" />
      </div>

      {/* Key Benefits panel */}
      <div
        className="absolute left-[40px] right-[480px]"
        style={{
          top: 940,
          height: 0,
        }}
      />
      {/* (panel below) */}

      {/* ========== RIGHT COLUMN IMAGES ========== */}
      <div
        className="absolute"
        style={{
          right: 40,
          top: 30,
          width: 760,
          height: 540,
          borderRadius: "0 0 0 80px",
          overflow: "hidden",
          border: `4px solid ${ORANGE}`,
        }}
      >
        <img src={rooftopUrl} alt="Rooftop solar community" className="h-full w-full object-cover" />
      </div>

      <div
        className="absolute"
        style={{
          right: 40,
          top: 595,
          width: 760,
          height: 290,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <img src={farmUrl} alt="Solar farm" className="h-full w-full object-cover" />
      </div>

      {/* Right project banner */}
      <div
        className="absolute flex items-center gap-6 px-7"
        style={{
          right: 40,
          top: 905,
          width: 760,
          height: 130,
          background: "#0A1B33",
          borderRadius: "60px 0 0 14px",
          borderLeft: `5px solid ${ORANGE}`,
        }}
      >
        <Building2 size={56} color={ORANGE} strokeWidth={2} />
        <div className="min-w-0">
          <div className="text-[24px] font-extrabold tracking-wide text-white leading-tight">
            {projectUpper}
          </div>
          <div className="text-[13px] tracking-[0.2em] text-white/80 mt-0.5">
            A STEP TOWARDS ENERGY INDEPENDENCE
          </div>
          <div className="text-[13px] tracking-[0.2em] mt-0.5" style={{ color: ORANGE }}>
            POWERING A SUSTAINABLE FUTURE
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-10"
        style={{ height: 80, background: "#0A1B33" }}
      >
        <div className="flex items-center gap-9">
          <FootChip Icon={Leaf} label="CLEAN ENERGY" />
          <FootChip Icon={ShieldCheck} label={"SUSTAINABLE\nCOMMUNITY"} />
          <FootChip Icon={IndianRupee} label={"LONG TERM\nSAVINGS"} />
          <FootChip Icon={Globe} label={"BETTER\nTOMORROW"} />
        </div>
        <div className="text-[22px] font-semibold tracking-wide text-white">
          <span style={{ color: ORANGE, fontWeight: 800 }}>Powering</span> Communities. Creating{" "}
          <span style={{ color: ORANGE, fontWeight: 800 }}>Wealth.</span>
        </div>
      </div>

      {/* KEY BENEFITS panel (placed above bottom strip) */}
      <div
        className="absolute"
        style={{
          left: 40,
          bottom: 100,
          width: 1080,
          background: "#FEF3E0",
          borderRadius: 18,
          padding: "18px 26px 20px",
        }}
      >
        <div className="text-[16px] font-extrabold tracking-[0.2em] text-[#0A1B33] mb-3">
          KEY BENEFITS
        </div>
        <div className="grid grid-cols-4 gap-5">
          <Benefit Icon={IndianRupee} title="Reduce Energy Costs" desc="Lower electricity bills" />
          <Benefit Icon={ShieldCheck} title="Energy Security" desc="Reliable & uninterrupted power supply" />
          <Benefit Icon={Leaf} title="Sustainable Living" desc="Clean energy for a greener tomorrow" />
          <Benefit Icon={TrendingUp} title="Increase Asset Value" desc="Enhances property value and community appeal" />
        </div>
      </div>
    </SlideFrame>
  );
});
OverviewSlide.displayName = "OverviewSlide";
export default OverviewSlide;