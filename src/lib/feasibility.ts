// Solar feasibility computation engine (residential / commercial / industrial / agri).
// All values in INR, kWh, kW unless noted. Conservative India-tuned defaults.

export type Segment = "residential" | "commercial" | "industrial" | "agricultural";
export type SystemType = "on-grid" | "off-grid" | "hybrid";

export interface FeasibilityInput {
  segment: Segment;
  monthly_units: number;
  monthly_bill: number;
  energy_charge_per_unit?: number;
  sanction_load_kw?: number;
  state?: string;
  // Cost overrides
  cost_per_kw?: number; // ₹/kW installed
  subsidy_pct?: number; // 0-1
  loan_pct?: number;    // 0-1, share financed
  loan_rate_pct?: number; // annual
  loan_years?: number;
}

export interface FeasibilityReport {
  segment: Segment;
  recommended_capacity_kw: number;
  required_roof_area_sqft: number;
  required_roof_area_sqm: number;
  panel_count: number;          // 550 W panels
  inverter_capacity_kw: number;
  structure_type: string;
  system_type: SystemType;
  battery_recommendation: string;

  daily_generation_kwh: number;
  monthly_generation_kwh: number;
  annual_generation_kwh: number;
  monthly_breakup: { month: string; gen: number }[];

  tariff: number;
  monthly_savings: number;
  annual_savings: number;
  lifetime_savings_25y: number;
  co2_offset_tonnes_25y: number;

  project_cost: number;
  subsidy_amount: number;
  net_cost: number;
  loan_amount: number;
  loan_emi: number;
  payback_years: number;
  irr_pct: number;
  roi_pct_25y: number;
  depreciation_benefit?: number; // 40% accelerated for industrial/commercial yr1

  ai_tips: string[];
  net_metering_note: string;

  // State / regulatory
  state?: string;
  discom?: string;
  state_permission?: string;

  // BOOT (Build-Own-Operate-Transfer): client pays only rent
  boot: {
    rent_per_kw_per_month: number;
    period_years: number;
    monthly_rent: number;
    annual_rent: number;
    total_rent: number;
    handover_after: string;
  };

  // PPA: 25% discount on grid tariff for 25 years
  ppa: {
    discount_pct: number;
    grid_tariff: number;
    ppa_tariff: number;
    period_years: number;
    year1_savings: number;
    lifetime_savings_25y: number;
  };

  // EPC: turnkey at ₹40,000/kW incl. GST + insurance + cleaning
  epc: {
    rate_per_kw: number;
    total_cost: number;
    payment_terms: { milestone: string; pct: number; amount: number }[];
  };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// Relative monthly insolation factor for India (avg ~1.0)
const MONTH_FACTORS = [0.95,1.02,1.10,1.12,1.15,0.92,0.78,0.78,0.92,1.02,0.98,0.96];

const DEFAULT_COST_PER_KW: Record<Segment, number> = {
  residential: 60000,
  commercial: 52000,
  industrial: 48000,
  agricultural: 55000,
};
const DEFAULT_SUBSIDY_PCT: Record<Segment, number> = {
  residential: 0.30, commercial: 0, industrial: 0, agricultural: 0.30,
};

export function computeFeasibility(input: FeasibilityInput): FeasibilityReport {
  const seg = input.segment;
  const monthlyUnits = Math.max(1, input.monthly_units);
  const tariff = input.energy_charge_per_unit && input.energy_charge_per_unit > 0
    ? input.energy_charge_per_unit
    : input.monthly_bill / monthlyUnits;

  // 1 kW => ~4 kWh/day (CUF ~17%) => ~120 kWh/month in India
  const SPECIFIC_YIELD_DAILY = 4.0;
  const monthlyPerKw = SPECIFIC_YIELD_DAILY * 30; // 120

  // Target 90% offset for residential, 80% commercial/industrial, 100% agri
  const offset = seg === "residential" ? 0.9 : seg === "agricultural" ? 1.0 : 0.8;
  let capacityKw = (monthlyUnits * offset) / monthlyPerKw;
  // Cap by sanction load if known
  if (input.sanction_load_kw && input.sanction_load_kw > 0) {
    capacityKw = Math.min(capacityKw, input.sanction_load_kw);
  }
  capacityKw = Math.max(1, Math.round(capacityKw * 10) / 10);

  // Panel = 550 W bifacial, 2.58 m² area
  const panelCount = Math.ceil((capacityKw * 1000) / 550);
  const roofAreaSqm = Math.ceil(panelCount * 2.58 / 0.55); // 55% packing
  const roofAreaSqft = Math.ceil(roofAreaSqm * 10.7639);

  const dailyGen = capacityKw * SPECIFIC_YIELD_DAILY;
  const monthlyGen = dailyGen * 30;
  const annualGen = dailyGen * 365;
  const monthly_breakup = MONTHS.map((m, i) => ({ month: m, gen: Math.round(monthlyGen * MONTH_FACTORS[i]) }));

  // Cost
  const costPerKw = input.cost_per_kw ?? DEFAULT_COST_PER_KW[seg];
  const projectCost = Math.round(capacityKw * costPerKw);
  const subsidyPct = input.subsidy_pct ?? DEFAULT_SUBSIDY_PCT[seg];
  // Subsidy capped at 3 kW for residential per PM Surya Ghar
  let subsidyAmount = 0;
  if (seg === "residential") {
    if (capacityKw <= 2) subsidyAmount = 30000 * capacityKw;
    else if (capacityKw <= 3) subsidyAmount = 60000 + 18000 * (capacityKw - 2);
    else subsidyAmount = 78000;
  } else {
    subsidyAmount = Math.round(projectCost * subsidyPct);
  }
  const netCost = Math.max(0, projectCost - subsidyAmount);

  // Loan EMI
  const loanPct = input.loan_pct ?? (seg === "residential" ? 0.7 : 0.6);
  const loanRate = (input.loan_rate_pct ?? (seg === "residential" ? 9.5 : 10.5)) / 100 / 12;
  const loanYears = input.loan_years ?? (seg === "residential" ? 7 : 5);
  const loanAmount = Math.round(netCost * loanPct);
  const n = loanYears * 12;
  const emi = loanAmount > 0
    ? Math.round((loanAmount * loanRate * Math.pow(1 + loanRate, n)) / (Math.pow(1 + loanRate, n) - 1))
    : 0;

  // Savings (yr1) — capped at bill
  const yr1Savings = Math.min(annualGen * tariff, input.monthly_bill * 12);
  const monthlySavings = Math.round(yr1Savings / 12);
  const annualSavings = Math.round(yr1Savings);

  // 25-year savings: 5% tariff escalation, 0.7% module degradation
  let cum = 0;
  for (let y = 1; y <= 25; y++) {
    const gen = annualGen * Math.pow(1 - 0.007, y - 1);
    const tar = tariff * Math.pow(1.05, y - 1);
    cum += Math.min(gen * tar, input.monthly_bill * 12 * Math.pow(1.05, y - 1));
  }
  const lifetimeSavings = Math.round(cum);

  // Payback (simple, not discounted)
  let pay = 0, acc = 0;
  for (let y = 1; y <= 25; y++) {
    const gen = annualGen * Math.pow(1 - 0.007, y - 1);
    const tar = tariff * Math.pow(1.05, y - 1);
    const s = Math.min(gen * tar, input.monthly_bill * 12 * Math.pow(1.05, y - 1));
    acc += s;
    if (acc >= netCost) { pay = y - 1 + (netCost - (acc - s)) / s; break; }
  }
  if (pay === 0) pay = 25;

  // IRR (approx via simple iteration)
  const irr = approxIRR(netCost, annualGen, tariff, input.monthly_bill);

  const co2 = Math.round(annualGen * 25 * 0.82 / 1000); // 0.82 kg/kWh India grid

  const systemType: SystemType = seg === "agricultural" ? "hybrid" : "on-grid";
  const battery = seg === "agricultural"
    ? `${Math.round(dailyGen * 0.4)} kWh Li-ion recommended for evening pumping`
    : seg === "residential" && capacityKw >= 5
    ? `Optional ${Math.round(dailyGen * 0.3)} kWh battery for backup`
    : "Battery not required (grid-tied)";

  const depreciation = (seg === "industrial" || seg === "commercial")
    ? Math.round(projectCost * 0.4 * 0.30) // 40% accelerated dep × 30% tax
    : undefined;

  const tips = [
    `Best tilt: ${Math.round(20)}° south-facing for max yield in India.`,
    "Run heavy loads (AC, pumps) between 10 AM–3 PM to consume free solar.",
    "Clean panels every 15 days in dusty seasons to avoid 5–8% loss.",
    capacityKw < 10 ? "Future expansion: keep 25% extra roof free for Phase-2." : "Add string monitoring to catch underperforming arrays early.",
  ];

  return {
    segment: seg,
    recommended_capacity_kw: capacityKw,
    required_roof_area_sqft: roofAreaSqft,
    required_roof_area_sqm: roofAreaSqm,
    panel_count: panelCount,
    inverter_capacity_kw: Math.ceil(capacityKw * 0.9),
    structure_type: capacityKw >= 25 ? "Elevated GI module mounting structure (MMS) with walkways" : "Standard rooftop MMS, hot-dip galvanized",
    system_type: systemType,
    battery_recommendation: battery,
    daily_generation_kwh: Math.round(dailyGen),
    monthly_generation_kwh: Math.round(monthlyGen),
    annual_generation_kwh: Math.round(annualGen),
    monthly_breakup,
    tariff: Math.round(tariff * 100) / 100,
    monthly_savings: monthlySavings,
    annual_savings: annualSavings,
    lifetime_savings_25y: lifetimeSavings,
    co2_offset_tonnes_25y: co2,
    project_cost: projectCost,
    subsidy_amount: subsidyAmount,
    net_cost: netCost,
    loan_amount: loanAmount,
    loan_emi: emi,
    payback_years: Math.round(pay * 10) / 10,
    irr_pct: Math.round(irr * 10) / 10,
    roi_pct_25y: Math.round((lifetimeSavings / netCost) * 100),
    depreciation_benefit: depreciation,
    ai_tips: tips,
    net_metering_note: seg === "residential"
      ? "Eligible for net-metering up to sanction load under DISCOM policy."
      : "Net/Gross metering applicable; export tariff per state ERC order.",
    ...buildModels(capacityKw, annualGen, tariff, input),
  };
}

// ---- BOOT / PPA / EPC models ----
function buildModels(
  capacityKw: number,
  annualGen: number,
  tariff: number,
  input: FeasibilityInput,
) {
  // BOOT
  const RENT = 1000; // ₹ / kW / month
  const bootMonthly = Math.round(capacityKw * RENT);
  const bootAnnual = bootMonthly * 12;
  const bootYears = 6;
  const boot = {
    rent_per_kw_per_month: RENT,
    period_years: bootYears,
    monthly_rent: bootMonthly,
    annual_rent: bootAnnual,
    total_rent: bootAnnual * bootYears,
    handover_after: `Plant transferred FREE to client after ${bootYears} years.`,
  };

  // PPA
  const ppaDiscount = 0.25;
  const ppaTariff = Math.round(tariff * (1 - ppaDiscount) * 100) / 100;
  let ppaLife = 0;
  for (let y = 1; y <= 25; y++) {
    const gen = annualGen * Math.pow(1 - 0.007, y - 1);
    const grid = tariff * Math.pow(1.05, y - 1);
    const ppa = ppaTariff * Math.pow(1.05, y - 1);
    ppaLife += gen * (grid - ppa);
  }
  const ppa = {
    discount_pct: ppaDiscount * 100,
    grid_tariff: Math.round(tariff * 100) / 100,
    ppa_tariff: ppaTariff,
    period_years: 25,
    year1_savings: Math.round(annualGen * (tariff - ppaTariff)),
    lifetime_savings_25y: Math.round(ppaLife),
  };

  // EPC
  const EPC_RATE = 40000; // ₹/kW incl. GST, insurance, cleaning
  const epcTotal = Math.round(capacityKw * EPC_RATE);
  const epc = {
    rate_per_kw: EPC_RATE,
    total_cost: epcTotal,
    payment_terms: [
      { milestone: "Advance against Purchase Order", pct: 10, amount: Math.round(epcTotal * 0.10) },
      { milestone: "Material ready to dispatch",     pct: 70, amount: Math.round(epcTotal * 0.70) },
      { milestone: "Pre-installation",                pct: 15, amount: Math.round(epcTotal * 0.15) },
      { milestone: "Post-installation / Commissioning", pct: 5, amount: Math.round(epcTotal * 0.05) },
    ],
  };

  const reg = stateRegulatory(input.state);
  return { boot, ppa, epc, state: input.state, discom: reg.discom, state_permission: reg.permission };
}

// Indian state → DISCOM + rooftop solar approval authority
const STATE_REG: Record<string, { discom: string; permission: string }> = {
  "telangana":     { discom: "TSSPDCL / TSNPDCL", permission: "TS Transco / TSSPDCL net-metering approval (≤500 kW under PM Surya Ghar / TSREDCO empanelment)." },
  "andhra pradesh":{ discom: "APSPDCL / APEPDCL / APCPDCL", permission: "APERC / NREDCAP empanelment + DISCOM net-metering sanction." },
  "karnataka":     { discom: "BESCOM / MESCOM / HESCOM", permission: "BESCOM / KERC net-metering approval; KREDL empanelment for >10 kW." },
  "tamil nadu":    { discom: "TANGEDCO", permission: "TANGEDCO net-metering / gross-metering sanction; TEDA empanelled vendor." },
  "kerala":        { discom: "KSEB", permission: "KSEB net-metering approval under ANERT scheme." },
  "maharashtra":   { discom: "MSEDCL / BEST / Tata Power / Adani", permission: "MSEDCL net-metering portal sanction + MEDA listed vendor." },
  "gujarat":       { discom: "DGVCL / MGVCL / PGVCL / UGVCL", permission: "GUVNL / GEDA Surya Gujarat scheme net-metering approval." },
  "rajasthan":     { discom: "JVVNL / AVVNL / JdVVNL", permission: "RREC empanelment + DISCOM net-metering sanction." },
  "delhi":         { discom: "BRPL / BYPL / TPDDL", permission: "DERC net-metering sanction; SDMC / NDMC structural NOC if >25 kWp." },
  "uttar pradesh": { discom: "UPPCL (PuVVNL / DVVNL / MVVNL / PVVNL)", permission: "UPNEDA empanelment + UPPCL net-metering portal sanction." },
  "madhya pradesh":{ discom: "MPPKVVCL / MPMKVVCL / MPPaKVVCL", permission: "MPUVN empanelment + DISCOM net-metering approval." },
  "haryana":       { discom: "UHBVN / DHBVN", permission: "HAREDA empanelment + DISCOM net-metering sanction." },
  "punjab":        { discom: "PSPCL", permission: "PEDA empanelment + PSPCL net-metering sanction." },
  "west bengal":   { discom: "WBSEDCL / CESC", permission: "WBREDA empanelment + DISCOM net-metering approval." },
  "odisha":        { discom: "TPCODL / TPNODL / TPWODL / TPSODL", permission: "OREDA empanelment + DISCOM net-metering sanction." },
  "bihar":         { discom: "NBPDCL / SBPDCL", permission: "BREDA empanelment + DISCOM net-metering approval." },
  "chhattisgarh":  { discom: "CSPDCL", permission: "CREDA empanelment + DISCOM net-metering sanction." },
  "jharkhand":     { discom: "JBVNL", permission: "JREDA empanelment + JBVNL net-metering approval." },
  "assam":         { discom: "APDCL", permission: "AEDA empanelment + APDCL net-metering sanction." },
  "uttarakhand":   { discom: "UPCL", permission: "UREDA empanelment + UPCL net-metering approval." },
  "himachal pradesh": { discom: "HPSEBL", permission: "HIMURJA empanelment + HPSEBL net-metering sanction." },
  "goa":           { discom: "Goa Electricity Dept.", permission: "GEDA empanelment + Goa Electricity Dept. net-metering approval." },
};

export function stateRegulatory(state?: string): { discom: string; permission: string } {
  const k = (state || "").trim().toLowerCase();
  if (k && STATE_REG[k]) return STATE_REG[k];
  return {
    discom: "Local DISCOM",
    permission: "Net-metering / gross-metering approval as per State Electricity Regulatory Commission (SERC) and DISCOM policy.",
  };
}

function approxIRR(cost: number, gen: number, tariff: number, monthlyBill: number): number {
  // bisection 0%..40%
  let lo = 0, hi = 0.4;
  const flows = (r: number) => {
    let npv = -cost;
    for (let y = 1; y <= 25; y++) {
      const g = gen * Math.pow(1 - 0.007, y - 1);
      const t = tariff * Math.pow(1.05, y - 1);
      const cf = Math.min(g * t, monthlyBill * 12 * Math.pow(1.05, y - 1));
      npv += cf / Math.pow(1 + r, y);
    }
    return npv;
  };
  if (flows(0) < 0) return 0;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (flows(m) > 0) lo = m; else hi = m;
  }
  return ((lo + hi) / 2) * 100;
}

export const formatINR = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");