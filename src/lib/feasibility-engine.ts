// Feasibility engine — turns lead + bill data into recommended system sizing,
// net-metering vs behind-the-meter split, generation, and headline financials.
import { computeMonthlyYield } from "./solar-irradiance";
import { computeFinancials } from "./solar-financials";

export interface FeasibilityInput {
  state?: string | null;
  segment?: string | null;
  sanction_load_kw?: number | null;
  avg_units_kwh?: number | null;       // monthly
  monthly_bill_inr?: number | null;
  tariff_inr_per_kwh?: number | null;
  roof_area_sqm?: number | null;
  roof_type?: string | null;
  shadow_free_pct?: number | null;
  latitude?: number | null;
}

export interface FeasibilityOutput {
  recommended_kw: number;
  roof_capacity_kw: number;
  load_capacity_kw: number;
  nm_eligible_kw: number;          // ≤ 500 kW state cap
  btm_kw: number;                  // behind-the-meter balance
  btm_cap_kw: number;              // 50% of consumption baseline
  total_kw: number;
  annual_kwh: number;
  specific_yield: number;
  tariff: number;
  year1_savings_inr: number;
  payback_years: number;
  irr_pct: number;
  co2_tons_per_year: number;
  notes: string[];
}

const STATE_NM_CAP_KW = 500;     // pan-India regulatory cap used by the user
const BTM_CONSUMPTION_FRACTION = 0.5;

// Indian rule of thumb: 1 kWp needs ~100 sq.ft (≈9.3 m²) shadow-free area.
const SQM_PER_KW = 9.3;

export function runFeasibility(input: FeasibilityInput): FeasibilityOutput {
  const notes: string[] = [];
  const shadowPct = (input.shadow_free_pct ?? 90) / 100;
  const roofArea = Math.max(0, input.roof_area_sqm ?? 0);
  const roofCapacity = roofArea > 0 ? (roofArea * shadowPct) / SQM_PER_KW : Infinity;

  // Load-based sizing — 90% of sanctioned load is standard for safety margin.
  const loadCapacity = input.sanction_load_kw ? input.sanction_load_kw * 0.9 : Infinity;

  // Consumption-based sanity check using monthly units (assumes ~4 sun-hours).
  const avgUnits = input.avg_units_kwh ?? 0;
  const consumptionCap = avgUnits > 0 ? avgUnits / 120 : Infinity; // kWp needed to offset 100% of bill

  let recommended = Math.min(roofCapacity, loadCapacity, consumptionCap);
  if (!Number.isFinite(recommended) || recommended <= 0) recommended = input.sanction_load_kw ?? 5;
  recommended = Math.round(recommended * 10) / 10;

  // Net metering eligibility — capped per state policy (500 kW user rule).
  const nm_eligible = Math.min(recommended, STATE_NM_CAP_KW);
  const btmCap = avgUnits > 0
    ? (avgUnits * BTM_CONSUMPTION_FRACTION) / 120  // kWp that produces 50% of monthly consumption
    : Math.max(0, recommended - nm_eligible);
  const btm_kw = recommended > STATE_NM_CAP_KW
    ? Math.min(recommended - STATE_NM_CAP_KW, btmCap)
    : 0;
  const total_kw = +(nm_eligible + btm_kw).toFixed(1);

  if (recommended > STATE_NM_CAP_KW) {
    notes.push(`Net metering capped at ${STATE_NM_CAP_KW} kW per state policy.`);
    notes.push(`Balance ${(recommended - STATE_NM_CAP_KW).toFixed(1)} kW recommended as Behind-the-Meter (Zero-Export), limited to 50% of average consumption.`);
  }
  if (Number.isFinite(roofCapacity) && roofCapacity < (input.sanction_load_kw ?? 0)) {
    notes.push(`Roof area limits capacity to ~${roofCapacity.toFixed(1)} kW.`);
  }
  if (avgUnits > 0 && consumptionCap < recommended) {
    notes.push(`Sized to consumption (${avgUnits.toLocaleString("en-IN")} kWh/mo) — surplus export limited.`);
  }

  const lat = input.latitude ?? 17.4;
  const yld = computeMonthlyYield({
    capacity_kw: total_kw,
    latitude: lat,
    shading_loss_pct: 100 - (input.shadow_free_pct ?? 90),
  });

  const tariff = input.tariff_inr_per_kwh
    ?? (avgUnits > 0 && input.monthly_bill_inr ? input.monthly_bill_inr / avgUnits : 8);

  // Rough EPC cost (₹50/Wp blended; refined later in Quote step).
  const projectCostCr = (total_kw * 50000) / 1e7;
  const annualUnitsLakh = yld.annual_kwh / 1e5;

  const fin = computeFinancials({
    capacity_mw: total_kw / 1000,
    annual_units_lakh: annualUnitsLakh,
    tariff_rs_per_kwh: tariff,
    tariff_escalation_pct: 5,
    degradation_pct: 0.7,
    project_cost_cr: projectCostCr,
    om_cost_lakhs_per_year: total_kw * 0.015,
    life_years: 25,
  });

  return {
    recommended_kw: total_kw,
    roof_capacity_kw: Number.isFinite(roofCapacity) ? +roofCapacity.toFixed(1) : 0,
    load_capacity_kw: Number.isFinite(loadCapacity) ? +loadCapacity.toFixed(1) : 0,
    nm_eligible_kw: +nm_eligible.toFixed(1),
    btm_kw: +btm_kw.toFixed(1),
    btm_cap_kw: Number.isFinite(btmCap) ? +btmCap.toFixed(1) : 0,
    total_kw,
    annual_kwh: yld.annual_kwh,
    specific_yield: +yld.specific_yield.toFixed(0),
    tariff: +tariff.toFixed(2),
    year1_savings_inr: Math.round(fin.year1_savings_cr * 1e7),
    payback_years: fin.payback_years,
    irr_pct: fin.irr_pct,
    co2_tons_per_year: +(yld.annual_kwh * 0.00082).toFixed(0),
    notes,
  };
}