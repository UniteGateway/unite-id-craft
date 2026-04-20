import React from "react";
import { THEME_STYLES, type CommunityTheme, inr, num, type CommunityComputed, type CommunityInputs } from "@/lib/community-calc";

export interface SlideContent {
  title: string;
  subtitle?: string;
  bullets: string[];
  highlight?: { label: string; value: string };
}

interface Props {
  inputs: CommunityInputs;
  computed: CommunityComputed;
  recommendation: string;
  slides: SlideContent[];
  coverImageUrl?: string | null;
}

/** Renders 16 themed A4-landscape slides into one #community-deck container.
 *  Used both for on-screen preview and for html2canvas → jsPDF export. */
const CommunitySlideDeck: React.FC<Props> = ({ inputs, computed, recommendation, slides, coverImageUrl }) => {
  const theme = (inputs.theme || "Dark Premium") as CommunityTheme;
  const t = THEME_STYLES[theme];

  const slideStyle: React.CSSProperties = {
    width: "297mm",
    height: "210mm",
    background: t.bg,
    color: t.text,
    fontFamily: "Inter, system-ui, sans-serif",
    padding: "14mm 16mm",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    pageBreakAfter: "always",
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: t.fontHeading,
    color: t.heading,
    fontSize: 32,
    fontWeight: 700,
    margin: 0,
    letterSpacing: 0.3,
  };

  const subtitleStyle: React.CSSProperties = {
    color: t.accent,
    fontSize: 14,
    fontWeight: 600,
    marginTop: 4,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  };

  const Footer = () => (
    <div style={{
      position: "absolute", bottom: "8mm", left: "16mm", right: "16mm",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontSize: 10, color: t.text, opacity: 0.7, borderTop: `1px solid ${t.border}`, paddingTop: 6,
    }}>
      <span>UNITE SOLAR · A Division of Unite Developers Global Inc</span>
      <span>{inputs.community_name || "Community"} · {inputs.location || ""}</span>
    </div>
  );

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      background: t.panel, border: `1px solid ${t.border}`, borderRadius: 10,
      padding: "12px 16px", minWidth: 140,
    }}>
      <div style={{ fontSize: 10, opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: t.heading, marginTop: 4 }}>{value}</div>
    </div>
  );

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <li style={{
      display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0",
      borderBottom: `1px dashed ${t.border}`,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: 999, background: t.accent,
        marginTop: 8, flexShrink: 0, boxShadow: `0 0 8px ${t.accent}`,
      }} />
      <span style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</span>
    </li>
  );

  const Highlight = ({ h }: { h?: SlideContent["highlight"] }) => {
    if (!h) return null;
    return (
      <div style={{
        marginTop: 16, padding: "16px 20px", background: t.accentSoft,
        border: `1px solid ${t.border}`, borderRadius: 12, alignSelf: "flex-start",
      }}>
        <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: 1.2, textTransform: "uppercase" }}>{h.label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: t.heading, fontFamily: t.fontHeading }}>{h.value}</div>
      </div>
    );
  };

  const SlideShell: React.FC<{ slide: SlideContent; idx: number; children?: React.ReactNode }> = ({ slide, idx, children }) => (
    <div className="pdf-page" style={slideStyle}>
      <div style={subtitleStyle}>Slide {idx + 1} · {slide.subtitle || ""}</div>
      <h1 style={{ ...headingStyle, marginTop: 6 }}>{slide.title}</h1>
      <div style={{ height: 3, width: 64, background: t.accent, margin: "10px 0 18px", borderRadius: 2 }} />
      <div style={{ flex: 1, display: "flex", gap: 24 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
          {slide.bullets.slice(0, 6).map((b, i) => <Bullet key={i}>{b}</Bullet>)}
          <Highlight h={slide.highlight} />
        </ul>
        {children && <div style={{ flex: 1 }}>{children}</div>}
      </div>
      <Footer />
    </div>
  );

  // Cover slide gets its own treatment.
  const Cover = () => (
    <div className="pdf-page" style={{ ...slideStyle, justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.8 }}>UNITE SOLAR · COMMUNITY PROPOSAL</div>
        <div style={{ fontSize: 11, opacity: 0.8 }}>{theme}</div>
      </div>
      <div>
        <div style={{ ...subtitleStyle, color: t.accent }}>SOLAR TRANSFORMATION PROPOSAL</div>
        <h1 style={{ ...headingStyle, fontSize: 56, marginTop: 6 }}>{inputs.community_name || "Community Name"}</h1>
        <div style={{ fontSize: 18, opacity: 0.85, marginTop: 8 }}>{inputs.location || ""}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <Stat label="Recommended" value={`${num(computed.recommendedCapacityKw)} kW`} />
          <Stat label="Monthly Bill" value={inr(inputs.monthly_bill || 0)} />
          <Stat label="Solar Offset" value={`${num(computed.solarOffsetPct, 1)} %`} />
          <Stat label="Model" value={recommendation} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 11, opacity: 0.85 }}>
        <div>
          PRESENTED BY UNITESOLAR<br />
          A Division of Unite Developers Global Inc<br />
          www.unitesolar.in
        </div>
        <div style={{ textAlign: "right", color: t.accent }}>
          Sustainable Power · Investor Income · Community Savings
        </div>
      </div>
    </div>
  );

  // A simple inline "current consumption" bar visualisation for slide 3.
  const ConsumptionViz = () => {
    const bill = inputs.monthly_bill || 0;
    const flats = bill * 0.6;
    const common = bill * 0.35;
    const club = bill * 0.05;
    const max = Math.max(flats, common, club, 1);
    const Bar = ({ label, val }: { label: string; val: number }) => (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
          <span>{label}</span>
          <span style={{ color: t.accent, fontWeight: 700 }}>{inr(val)}</span>
        </div>
        <div style={{ height: 14, background: t.panel, borderRadius: 7, overflow: "hidden", border: `1px solid ${t.border}` }}>
          <div style={{ width: `${(val / max) * 100}%`, height: "100%", background: t.accent }} />
        </div>
      </div>
    );
    return (
      <div style={{ background: t.panel, padding: 16, borderRadius: 12, border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>Estimated split (illustrative)</div>
        <Bar label="Flats" val={flats} />
        <Bar label="Common Areas" val={common} />
        <Bar label="Clubhouse" val={club} />
      </div>
    );
  };

  // ROI mini-table for slide 9.
  const RoiPanel = () => (
    <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Key Financials</div>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <tbody>
          {[
            ["Project Cost", inr(computed.projectCost)],
            ["Monthly Savings", inr(computed.monthlySavings)],
            ["Annual Savings", inr(computed.annualSavings)],
            ["Payback Period", `${computed.paybackYears} yrs`],
            ["Lifetime Savings (25y)", inr(computed.lifetimeSavings)],
            ["IRR (PPA)", `${computed.irrPctMin}% – ${computed.irrPctMax}%`],
          ].map(([k, v]) => (
            <tr key={k as string} style={{ borderBottom: `1px dashed ${t.border}` }}>
              <td style={{ padding: "8px 4px", opacity: 0.85 }}>{k}</td>
              <td style={{ padding: "8px 4px", textAlign: "right", color: t.heading, fontWeight: 700 }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div id="community-deck">
      {slides.map((s, i) => {
        if (i === 0) return <Cover key={i} />;
        if (i === 2) return <SlideShell key={i} slide={s} idx={i}><ConsumptionViz /></SlideShell>;
        if (i === 7 || i === 8) return <SlideShell key={i} slide={s} idx={i}><RoiPanel /></SlideShell>;
        return <SlideShell key={i} slide={s} idx={i} />;
      })}
    </div>
  );
};

export default CommunitySlideDeck;