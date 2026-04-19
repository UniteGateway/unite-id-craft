// Unite Solar proposal calculations + helpers.
// All currency is in INR. All numbers are kept loose (any falsy → 0).

export type Addon = { label: string; amount: number };

export interface ProposalInputs {
  // client
  client_name?: string;
  client_location?: string;
  project_type?: "Ground" | "Rooftop" | string;
  capacity_kw?: number;
  soil_type?: "Moram" | "Rock" | "Mixed" | string;
  // technical
  panel_count?: number;
  panel_wattage?: number;
  inverter_capacity?: number;
  structure_type?: string;
  // civil
  boundary_length_rmt?: number;
  wall_type?: string;
  footing_count?: number;
  // financial
  cost_per_kw?: number;
  civil_cost_per_rmt?: number;
  footing_cost?: number;
  electricity_tariff?: number;
  addons?: Addon[];
}

export interface ProposalComputed {
  systemCost: number;
  civilCost: number;
  footingTotal: number;
  addonsTotal: number;
  subtotal: number;
  gst5: number;
  gst18: number;
  gstTotal: number;
  totalCost: number;
  // contractor / margin
  contractorBenchmarkPerKw: number;
  contractorEstimate: number;
  suggestedSellingPrice: number; // +20% margin on subtotal
  profitPerProject: number;
  // ROI
  monthlyUnits: number;
  monthlySavings: number;
  annualSavings: number;
  roiMonths: number;
  savings25y: number;
  // Environment
  co2TonsYear: number;
  treesEquivalent: number;
  // Risk alerts
  riskAlerts: string[];
}

const n = (v: any) => (Number.isFinite(+v) ? +v : 0);

// India avg ~4 peak sun hours; ~30 days; with derating 0.78
const PEAK_SUN_HOURS = 4;
const DAYS = 30;
const PERFORMANCE_RATIO = 0.78;

// Static benchmark from market avg for ground-mount EPC; tweak in code.
const CONTRACTOR_BENCHMARK_PER_KW = 38000;
const MARGIN_PCT = 0.2;

export function computeProposal(input: ProposalInputs): ProposalComputed {
  const capacity = n(input.capacity_kw);
  const costPerKw = n(input.cost_per_kw);
  const civilPerRmt = n(input.civil_cost_per_rmt);
  const rmt = n(input.boundary_length_rmt);
  const footingCost = n(input.footing_cost);
  const footingCount = n(input.footing_count);
  const tariff = n(input.electricity_tariff);

  const systemCost = capacity * costPerKw;
  const civilCost = rmt * civilPerRmt;
  const footingTotal = footingCount * footingCost;
  const addonsTotal = (input.addons || []).reduce((s, a) => s + n(a.amount), 0);
  const subtotal = systemCost + civilCost + footingTotal + addonsTotal;

  // GST split: 70% @ 5% (goods/solar device), 30% @ 18% (service).
  const gst5 = subtotal * 0.7 * 0.05;
  const gst18 = subtotal * 0.3 * 0.18;
  const gstTotal = gst5 + gst18;
  const totalCost = subtotal + gstTotal;

  // ROI
  const monthlyUnits = capacity * PEAK_SUN_HOURS * DAYS * PERFORMANCE_RATIO;
  const monthlySavings = monthlyUnits * tariff;
  const annualSavings = monthlySavings * 12;
  const roiMonths = annualSavings > 0 ? totalCost / monthlySavings : 0;
  const savings25y = annualSavings * 25;

  // Environment (~0.82 kg CO2 per kWh in India grid mix; tree absorbs ~21 kg/yr)
  const co2TonsYear = (monthlyUnits * 12 * 0.82) / 1000;
  const treesEquivalent = Math.round((co2TonsYear * 1000) / 21);

  // Pricing intelligence (hardcoded rules)
  const contractorEstimate = capacity * CONTRACTOR_BENCHMARK_PER_KW;
  const suggestedSellingPrice = subtotal * (1 + MARGIN_PCT);
  const profitPerProject = suggestedSellingPrice - contractorEstimate;

  const riskAlerts: string[] = [];
  if ((input.soil_type || "").toLowerCase() === "rock") {
    riskAlerts.push("Rocky soil: footing & excavation cost may rise 15–25%. Confirm with site survey.");
  } else if ((input.soil_type || "").toLowerCase() === "mixed") {
    riskAlerts.push("Mixed soil: budget a 10% contingency on footing works.");
  }
  if (capacity >= 100) {
    riskAlerts.push("Capacity ≥ 100 kW: lock module/inverter rates with vendor — prices fluctuate ±8% quarterly.");
  }
  if (rmt > 0 && (input.wall_type || "").toUpperCase() === "RCC") {
    riskAlerts.push("RCC wall: cement & steel sensitive to commodity prices, validate civil quote in 30 days.");
  }
  if (costPerKw > 0 && costPerKw < CONTRACTOR_BENCHMARK_PER_KW * 0.85) {
    riskAlerts.push("Cost/kW is below market benchmark — verify margin before committing.");
  }

  return {
    systemCost, civilCost, footingTotal, addonsTotal, subtotal,
    gst5, gst18, gstTotal, totalCost,
    contractorBenchmarkPerKw: CONTRACTOR_BENCHMARK_PER_KW,
    contractorEstimate, suggestedSellingPrice, profitPerProject,
    monthlyUnits, monthlySavings, annualSavings, roiMonths, savings25y,
    co2TonsYear, treesEquivalent, riskAlerts,
  };
}

export const inr = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isFinite(v) ? v : 0,
  );

export const num = (v: number, d = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: d }).format(Number.isFinite(v) ? v : 0);
