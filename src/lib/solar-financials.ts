// Year-by-year financial model with degradation + tariff escalation.
// All currency math returns ₹ Cr (or ₹ Lakhs where noted).

export interface FinancialInputs {
  capacity_mw: number;
  annual_units_lakh: number;       // year-1 generation (Lakh kWh)
  tariff_rs_per_kwh: number;       // year-1 tariff
  tariff_escalation_pct: number;   // % per year
  degradation_pct: number;         // % per year
  project_cost_cr: number;
  om_cost_lakhs_per_year: number;
  life_years: number;
  discount_rate_pct?: number;      // for NPV; default 8
}

export interface FinancialOutput {
  annual: { year: number; units_kwh: number; gross_savings_cr: number; om_cr: number; net_cr: number; cumulative_cr: number; tariff: number }[];
  total_savings_cr: number;
  total_net_cr: number;
  payback_years: number;           // interpolated
  irr_pct: number;
  npv_cr: number;
  year1_savings_cr: number;
}

function irr(cashflows: number[], guess = 0.1): number {
  // Newton-Raphson IRR; falls back gracefully.
  let r = guess;
  for (let i = 0; i < 80; i++) {
    let npv = 0, d = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const f = Math.pow(1 + r, t);
      npv += cashflows[t] / f;
      if (t > 0) d += -t * cashflows[t] / (f * (1 + r));
    }
    if (Math.abs(d) < 1e-9) break;
    const next = r - npv / d;
    if (!isFinite(next)) break;
    if (Math.abs(next - r) < 1e-7) { r = next; break; }
    r = next;
  }
  return r * 100;
}

export function computeFinancials(inp: FinancialInputs): FinancialOutput {
  const life = Math.max(1, Math.round(inp.life_years));
  const escal = (inp.tariff_escalation_pct || 0) / 100;
  const degr = (inp.degradation_pct || 0) / 100;
  const omCr = (inp.om_cost_lakhs_per_year || 0) / 100;
  const units1 = (inp.annual_units_lakh || 0) * 1e5; // kWh

  const annual: FinancialOutput["annual"] = [];
  let cum = -inp.project_cost_cr;
  let payback = life;
  const cashflows: number[] = [-inp.project_cost_cr];

  for (let y = 1; y <= life; y++) {
    const units = units1 * Math.pow(1 - degr, y - 1);
    const tariff = (inp.tariff_rs_per_kwh || 0) * Math.pow(1 + escal, y - 1);
    const grossCr = (units * tariff) / 1e7; // ₹ → Cr
    const netCr = grossCr - omCr;
    const prevCum = cum;
    cum += netCr;
    if (prevCum < 0 && cum >= 0 && payback === life) {
      payback = (y - 1) + (-prevCum) / netCr;
    }
    annual.push({ year: y, units_kwh: Math.round(units), gross_savings_cr: +grossCr.toFixed(3), om_cr: +omCr.toFixed(3), net_cr: +netCr.toFixed(3), cumulative_cr: +cum.toFixed(3), tariff: +tariff.toFixed(2) });
    cashflows.push(netCr);
  }

  const total_savings_cr = annual.reduce((s, a) => s + a.gross_savings_cr, 0);
  const total_net_cr = annual.reduce((s, a) => s + a.net_cr, 0);
  const dr = (inp.discount_rate_pct ?? 8) / 100;
  const npv = cashflows.reduce((s, cf, t) => s + cf / Math.pow(1 + dr, t), 0);
  const irrPct = irr(cashflows);

  return {
    annual,
    total_savings_cr: +total_savings_cr.toFixed(2),
    total_net_cr: +total_net_cr.toFixed(2),
    payback_years: +payback.toFixed(2),
    irr_pct: +irrPct.toFixed(1),
    npv_cr: +npv.toFixed(2),
    year1_savings_cr: annual[0]?.gross_savings_cr ?? 0,
  };
}
