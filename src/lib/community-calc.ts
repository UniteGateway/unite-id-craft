// Calculations for Community solar proposals (PPA / CAPEX / Hybrid).

export type CommunityModel = "PPA" | "CAPEX" | "Hybrid";
export type CommunityTheme = "Dark Premium" | "Corporate Blue" | "Green" | "Luxury Gold";

export interface CommunityInputs {
  community_name?: string;
  location?: string;
  blocks?: number;
  rooftop_area_sft?: number;
  monthly_units?: number;
  monthly_bill?: number;
  sanction_load_kw?: number;
  roof_type?: "Flat" | "Mixed" | string;
  preferred_model?: CommunityModel;
  target_savings_pct?: number;
  investor_required?: boolean;
  theme?: CommunityTheme;
}

export interface CommunityComputed {
  recommendedCapacityKw: number;
  monthlyGenerationUnits: number;
  solarOffsetPct: number;
  projectCost: number;
  ebTariff: number;
  solarTariff: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  monthlyRevenuePpa: number;
  irrPctMin: number;
  irrPctMax: number;
  lifespanYears: number;
  lifetimeSavings: number;
  co2TonsYear: number;
  treesEquivalent: number;
}

const n = (v: any) => (Number.isFinite(+v) ? +v : 0);

export function computeCommunity(input: CommunityInputs): CommunityComputed {
  const sft = n(input.rooftop_area_sft);
  const monthlyUnits = n(input.monthly_units);
  const monthlyBill = n(input.monthly_bill);
  const targetPct = Math.min(Math.max(n(input.target_savings_pct) || 75, 30), 100) / 100;

  const ebTariff = monthlyUnits > 0 ? monthlyBill / monthlyUnits : 9;
  const solarTariff = 7.25; // mid of ₹6.5–₹8 PPA tariff

  // Capacity: prefer the smaller of (rooftop-derived) and (consumption-derived * targetPct buffer)
  const capacityFromRoof = sft / 100; // 1 kW / 100 sft
  const capacityFromLoad = (monthlyUnits * targetPct) / 130; // 130 units/kW/month
  let recommendedCapacityKw = Math.min(
    capacityFromRoof || capacityFromLoad,
    capacityFromLoad || capacityFromRoof,
  );
  if (!recommendedCapacityKw) recommendedCapacityKw = capacityFromRoof || capacityFromLoad || 0;
  recommendedCapacityKw = Math.round(recommendedCapacityKw / 5) * 5; // round to nearest 5 kW

  const monthlyGenerationUnits = Math.round(recommendedCapacityKw * 130);
  const solarOffsetPct = monthlyUnits > 0 ? Math.min(100, (monthlyGenerationUnits / monthlyUnits) * 100) : 0;

  const projectCost = Math.round(recommendedCapacityKw * 45000); // mid ₹40k–₹50k/kW
  const monthlySavings = Math.round(monthlyGenerationUnits * (ebTariff - solarTariff));
  const annualSavings = monthlySavings * 12;
  const paybackYears = annualSavings > 0 ? +(projectCost / annualSavings).toFixed(1) : 0;

  const monthlyRevenuePpa = Math.round(monthlyGenerationUnits * solarTariff);
  const lifespanYears = 25;
  const lifetimeSavings = annualSavings * lifespanYears;

  const co2TonsYear = +(monthlyGenerationUnits * 12 * 0.82 / 1000).toFixed(1);
  const treesEquivalent = Math.round((co2TonsYear * 1000) / 21);

  return {
    recommendedCapacityKw,
    monthlyGenerationUnits,
    solarOffsetPct: +solarOffsetPct.toFixed(1),
    projectCost,
    ebTariff: +ebTariff.toFixed(2),
    solarTariff,
    monthlySavings,
    annualSavings,
    paybackYears,
    monthlyRevenuePpa,
    irrPctMin: 18,
    irrPctMax: 24,
    lifespanYears,
    lifetimeSavings,
    co2TonsYear,
    treesEquivalent,
  };
}

export function recommendModel(input: CommunityInputs): CommunityModel {
  if (input.preferred_model === "PPA" || input.preferred_model === "CAPEX" || input.preferred_model === "Hybrid") {
    return input.preferred_model;
  }
  if (input.investor_required) return "PPA";
  return "Hybrid";
}

export const inr = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isFinite(v) ? v : 0,
  );

export const num = (v: number, d = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: d }).format(Number.isFinite(v) ? v : 0);

// Theme palettes for slide rendering (HSL tokens kept dark-bg friendly).
export const THEME_STYLES: Record<CommunityTheme, {
  bg: string;             // slide background
  panel: string;          // card background
  text: string;           // body text color
  heading: string;        // heading color
  accent: string;         // accent color
  accentSoft: string;
  border: string;
  fontHeading: string;
}> = {
  "Dark Premium": {
    bg: "linear-gradient(135deg, #0b0d12 0%, #161a23 100%)",
    panel: "rgba(255,255,255,0.06)",
    text: "#e8eaf0",
    heading: "#f5d77a",
    accent: "#f5b942",
    accentSoft: "rgba(245,185,66,0.15)",
    border: "rgba(245,215,122,0.25)",
    fontHeading: "Georgia, 'Times New Roman', serif",
  },
  "Corporate Blue": {
    bg: "linear-gradient(135deg, #0d1b3a 0%, #1c3b7a 100%)",
    panel: "rgba(255,255,255,0.08)",
    text: "#e6ecf5",
    heading: "#ffffff",
    accent: "#5aa9ff",
    accentSoft: "rgba(90,169,255,0.18)",
    border: "rgba(255,255,255,0.18)",
    fontHeading: "'Helvetica Neue', Arial, sans-serif",
  },
  "Green": {
    bg: "linear-gradient(135deg, #0e2a1a 0%, #1a4d2e 100%)",
    panel: "rgba(255,255,255,0.06)",
    text: "#e6f3ea",
    heading: "#a8e6a3",
    accent: "#5fd068",
    accentSoft: "rgba(95,208,104,0.18)",
    border: "rgba(168,230,163,0.25)",
    fontHeading: "'Trebuchet MS', sans-serif",
  },
  "Luxury Gold": {
    bg: "linear-gradient(135deg, #1a1208 0%, #3a2a10 100%)",
    panel: "rgba(255,255,255,0.05)",
    text: "#f3ead4",
    heading: "#ffd87a",
    accent: "#e6b450",
    accentSoft: "rgba(230,180,80,0.18)",
    border: "rgba(255,216,122,0.3)",
    fontHeading: "'Palatino Linotype', Palatino, serif",
  },
};