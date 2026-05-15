import React, { forwardRef, useMemo } from "react";
import SlideFrame from "./SlideFrame";
import { ProposalVars } from "./types";
import logoUrl from "@/assets/unite-solar-logo.png";
import { computeMonthlyYield, sunArcs } from "@/lib/solar-irradiance";
import { Sun, Activity, Layers, Gauge } from "lucide-react";

const NAVY = "#0A1B33";
const ORANGE = "#F59E0B";
const SLATE = "#475569";

const PvsystSlide = forwardRef<HTMLDivElement, { vars: ProposalVars }>(
  ({ vars }, ref) => {
    const cap_mw = parseFloat(vars.CAPACITY) || 1;
    const cap_kw = cap_mw * 1000;
    const lat = parseFloat(vars.LATITUDE) || 20;
    const shading = parseFloat(vars.SHADING_LOSS_PCT) || 3;

    const yieldRes = useMemo(
      () => computeMonthlyYield({ capacity_kw: cap_kw, latitude: lat, shading_loss_pct: shading }),
      [cap_kw, lat, shading]
    );
    const arcs = useMemo(() => sunArcs(lat, 600, 220), [lat]);
    const maxMonth = Math.max(...yieldRes.monthly.map((m) => m.units_kwh));

    const lossRows = [
      { label: "Soiling", v: yieldRes.losses_pct.soiling },
      { label: "Temperature", v: yieldRes.losses_pct.temp },
      { label: "Shading", v: yieldRes.losses_pct.shading },
      { label: "Wiring (DC+AC)", v: yieldRes.losses_pct.wiring },
      { label: "Inverter", v: yieldRes.losses_pct.inverter },
    ];

    return (
      <SlideFrame ref={ref} className="!bg-white !text-[#0A1B33]">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-12" style={{ height: 88, background: NAVY }}>
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Unite Solar" style={{ height: 52 }} />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-extrabold tracking-[0.18em] text-[18px]">UNITE SOLAR</span>
              <span className="text-[12px] tracking-[0.22em]" style={{ color: ORANGE }}>YIELD & SHADOW ANALYSIS</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-[14px] tracking-[0.2em] font-semibold">{vars.PROJECT_NAME}</div>
            <div className="text-[12px] tracking-[0.18em]" style={{ color: "#94A3B8" }}>
              Lat {lat.toFixed(2)}° • {cap_mw} MW
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="absolute" style={{ top: 110, left: 64, right: 64 }}>
          <div className="inline-flex items-center gap-2 text-white font-extrabold tracking-[0.22em] text-[14px]"
               style={{ background: ORANGE, padding: "8px 16px", borderRadius: "8px 8px 8px 0", color: NAVY }}>
            <Activity size={16}/> PVSYST-STYLE PERFORMANCE REPORT
          </div>
          <div className="mt-2 font-extrabold tracking-tight" style={{ color: NAVY, fontSize: 36, lineHeight: 1.1 }}>
            {(yieldRes.annual_kwh / 1e5).toFixed(1)} Lakh kWh / yr
            <span style={{ color: ORANGE, marginLeft: 12 }}>· {yieldRes.specific_yield.toFixed(0)} kWh / kWp</span>
          </div>
        </div>

        {/* Sun-path diagram */}
        <div className="absolute rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]"
             style={{ top: 220, left: 64, width: 720, height: 320, padding: 16 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sun size={18} color={ORANGE} />
            <span className="font-extrabold tracking-[0.16em] text-[14px]" style={{ color: NAVY }}>SUN PATH @ {lat.toFixed(1)}°N</span>
          </div>
          <svg width="100%" height="240" viewBox="0 0 600 240">
            {/* horizon */}
            <line x1="0" y1="220" x2="600" y2="220" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="0" y="236" fontSize="10" fill={SLATE}>E (sunrise)</text>
            <text x="278" y="236" fontSize="10" fill={SLATE}>S (noon)</text>
            <text x="552" y="236" fontSize="10" fill={SLATE}>W (sunset)</text>
            {arcs.map((a) => (
              <g key={a.name}>
                <polyline
                  points={a.pts.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none" stroke={a.color} strokeWidth="2.5"
                />
              </g>
            ))}
            {/* Legend */}
            {arcs.map((a, i) => (
              <g key={a.name+"l"} transform={`translate(${10 + i * 180}, 10)`}>
                <rect width="14" height="14" fill={a.color} rx="2" />
                <text x="20" y="12" fontSize="11" fontWeight={700} fill={NAVY}>{a.name}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Loss waterfall */}
        <div className="absolute rounded-2xl bg-white border border-[#E5E7EB]"
             style={{ top: 220, right: 64, width: 1072, height: 320, padding: 18 }}>
          <div className="flex items-center gap-2 mb-3">
            <Layers size={18} color={ORANGE} />
            <span className="font-extrabold tracking-[0.16em] text-[14px]" style={{ color: NAVY }}>LOSS BREAKDOWN — PERFORMANCE RATIO</span>
            <span className="ml-auto font-extrabold text-[18px]" style={{ color: ORANGE }}>
              PR = {(100 - yieldRes.losses_pct.total).toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            {lossRows.map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <div className="text-[13px] font-semibold w-[150px]" style={{ color: NAVY }}>{r.label}</div>
                <div className="flex-1 h-[18px] rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div style={{ width: `${Math.min(100, r.v * 8)}%`, height: "100%", background: ORANGE }} />
                </div>
                <div className="text-[13px] font-extrabold w-[60px] text-right" style={{ color: NAVY }}>−{r.v}%</div>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#E5E7EB]">
              <div className="text-[14px] font-extrabold w-[150px]" style={{ color: NAVY }}>Total Losses</div>
              <div className="flex-1" />
              <div className="text-[14px] font-extrabold w-[60px] text-right" style={{ color: "#DC2626" }}>−{yieldRes.losses_pct.total}%</div>
            </div>
          </div>
        </div>

        {/* Monthly generation bars */}
        <div className="absolute rounded-2xl bg-white border border-[#E5E7EB]"
             style={{ top: 560, left: 64, right: 64, height: 380, padding: 20 }}>
          <div className="flex items-center gap-2 mb-3">
            <Gauge size={18} color={ORANGE} />
            <span className="font-extrabold tracking-[0.16em] text-[14px]" style={{ color: NAVY }}>MONTHLY GENERATION (kWh)</span>
            <span className="ml-auto text-[12px]" style={{ color: SLATE }}>
              Based on irradiance @ {lat.toFixed(1)}°N · capacity {cap_mw} MW · shading {shading}%
            </span>
          </div>
          <div className="flex items-end gap-3 h-[260px]">
            {yieldRes.monthly.map((m) => {
              const h = (m.units_kwh / maxMonth) * 240;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center">
                  <div className="text-[11px] font-bold mb-1" style={{ color: NAVY }}>
                    {(m.units_kwh / 1000).toFixed(0)}k
                  </div>
                  <div style={{ height: h, width: "100%", background: `linear-gradient(180deg, ${ORANGE}, #fbbf24)`, borderRadius: 6 }} />
                  <div className="text-[12px] font-bold mt-2" style={{ color: NAVY }}>{m.month}</div>
                  <div className="text-[10px]" style={{ color: SLATE }}>{m.ghi.toFixed(1)} kWh/m²</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-12" style={{ height: 56, background: NAVY }}>
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>UNITE SOLAR · YIELD & SHADING</span>
          <span className="text-[12px] tracking-[0.24em]" style={{ color: "#94A3B8" }}>PVSYST-STYLE MONTHLY MODEL · ±5% ACCURACY</span>
        </div>
      </SlideFrame>
    );
  }
);
PvsystSlide.displayName = "PvsystSlide";
export default PvsystSlide;
