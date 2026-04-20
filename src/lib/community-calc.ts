// Calculations for Community solar proposals (PPA / CAPEX / Hybrid).

export type CommunityModel = "PPA" | "CAPEX" | "Hybrid";
export type CommunityTheme = "Dark Premium" | "Corporate Blue" | "Green" | "Luxury Gold";

/** Indian states with solar rooftop capacity caps as % of sanctioned/contract demand. */
export const STATE_CMD_CAP: Record<string, number> = {
  "Telangana": 80,
  "Andhra Pradesh": 100,
  "Karnataka": 100,
  "Tamil Nadu": 100,
  "Maharashtra": 100,
  "Gujarat": 100,
  "Kerala": 100,
  "Delhi": 100,
  "Other": 100,
};

export interface CommunityInputs {
  community_name?: string;
  location?: string;
  /** State name — drives CMD cap (Telangana = 80%). */
  state?: string;
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
  /** ₹/unit energy charge actually offsettable by solar (excludes fixed/demand/taxes). If omitted, derived from bill. */
  energy_charge_per_unit?: number;
  /** Fixed (non-offsettable) monthly charges in ₹: demand charges, fixed charges, meter rent, etc. */
  fixed_monthly_charges?: number;
  /** Taxes & duties as % of energy charges (e.g. 5 for 5%). */
  tax_pct?: number;
  /** PPA tariff offered to community, ₹/unit. Default 7.25. */
  ppa_tariff?: number;

  // ─── BOOT model inputs ─────────────────────────────────────
  /** BOOT tariff charged to community ₹/unit (typically = current effective tariff). */
  boot_tariff?: number;
  /** BOOT lock-in period in years (5–7 typical). */
  boot_period_years?: number;

  // ─── PPA model inputs ──────────────────────────────────────
  /** Discount % off effective tariff in PPA model (default 25). */
  ppa_discount_pct?: number;
  /** PPA term in years (typical 15–25). */
  ppa_term_years?: number;

  // ─── Self-Invest (community SPV) inputs ───────────────────
  /** Number of investors within community SPV. */
  self_investor_count?: number;
  /** Average ticket size per investor in ₹. */
  self_ticket_size?: number;
  /** Target IRR % for investors. */
  self_target_irr?: number;
}

export interface CommunityComputed {
  recommendedCapacityKw: number;
  cmdCapKw: number;
  cmdCapPct: number;
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
  /** Average all-in tariff = bill / units (for reference only). */
  avgTariff: number;
  /** Effective offsettable energy charge ₹/unit including taxes. */
  effectiveEnergyCharge: number;
  /** Fixed (non-offsettable) monthly charges. */
  fixedMonthlyCharges: number;
  // ─── Per-model savings ─────────────────────────────────────
  bootMonthlySavings: number;
  bootTotalRevenue: number;
  bootTariff: number;
  bootPeriodYears: number;
  ppaMonthlySavings: number;
  ppaEffectiveTariff: number;
  ppaTermYears: number;
  ppaDiscountPct: number;
  selfMonthlySavings: number;
  selfAnnualReturn: number;
  selfTotalCapital: number;
  selfInvestorCount: number;
  selfTicketSize: number;
  selfTargetIrr: number;
}

const n = (v: any) => (Number.isFinite(+v) ? +v : 0);

export function computeCommunity(input: CommunityInputs): CommunityComputed {
  const sft = n(input.rooftop_area_sft);
  const monthlyUnits = n(input.monthly_units);
  const monthlyBill = n(input.monthly_bill);
  const targetPct = Math.min(Math.max(n(input.target_savings_pct) || 75, 30), 100) / 100;

  const avgTariff = monthlyUnits > 0 ? monthlyBill / monthlyUnits : 0;
  const fixedMonthlyCharges = Math.max(0, n(input.fixed_monthly_charges));
  const taxPct = Math.max(0, n(input.tax_pct)); // %

  // Energy charge per unit (offsettable). Either explicit, or derived from bill minus fixed & taxes.
  let baseEnergyCharge = n(input.energy_charge_per_unit);
  if (!baseEnergyCharge) {
    // bill = energyCharges*(1+tax) + fixed  =>  energyCharges = (bill - fixed) / (1+tax)
    const energyOnlyBill = Math.max(0, monthlyBill - fixedMonthlyCharges) / (1 + taxPct / 100);
    baseEnergyCharge = monthlyUnits > 0 ? energyOnlyBill / monthlyUnits : 0;
  }
  // Effective ₹/unit savings includes taxes solar will avoid.
  const effectiveEnergyCharge = +(baseEnergyCharge * (1 + taxPct / 100)).toFixed(2);
  const ebTariff = effectiveEnergyCharge || avgTariff || 9;
  const solarTariff = n(input.ppa_tariff) || 7.25;

  // ─── Capacity recommendation ────────────────────────────────
  // 1. Roof-area cap: ~1 kW per 100 sft
  // 2. Consumption-derived: monthly units * targetPct / 130 units/kW/month
  // 3. CMD cap: state-driven % of sanctioned load (Telangana = 80%)
  const capacityFromRoof = sft / 100; // 1 kW / 100 sft
  const capacityFromLoad = (monthlyUnits * targetPct) / 130; // 130 units/kW/month
  const cmdCapPct = STATE_CMD_CAP[input.state || "Other"] ?? 100;
  const sanctionLoad = n(input.sanction_load_kw);
  const cmdCapKw = sanctionLoad > 0 ? +(sanctionLoad * (cmdCapPct / 100)).toFixed(1) : 0;

  const candidates = [capacityFromRoof, capacityFromLoad, cmdCapKw].filter((v) => v > 0);
  let recommendedCapacityKw = candidates.length ? Math.min(...candidates) : 0;
  recommendedCapacityKw = Math.round(recommendedCapacityKw / 5) * 5; // round to nearest 5 kW

  const monthlyGenerationUnits = Math.round(recommendedCapacityKw * 130);
  const solarOffsetPct = monthlyUnits > 0 ? Math.min(100, (monthlyGenerationUnits / monthlyUnits) * 100) : 0;

  const projectCost = Math.round(recommendedCapacityKw * 45000); // mid ₹40k–₹50k/kW
  // CAPEX: every offset unit saves the full effective energy charge.
  // PPA: community pays solarTariff, so saves (effectiveEnergyCharge - solarTariff) per unit.
  // We report PPA-style savings (more conservative) when a PPA tariff is implied.
  const perUnitSaving = Math.max(0, ebTariff - solarTariff);
  const monthlySavings = Math.round(monthlyGenerationUnits * perUnitSaving);
  const annualSavings = monthlySavings * 12;
  const paybackYears = annualSavings > 0 ? +(projectCost / annualSavings).toFixed(1) : 0;

  const monthlyRevenuePpa = Math.round(monthlyGenerationUnits * solarTariff);
  const lifespanYears = 25;
  const lifetimeSavings = annualSavings * lifespanYears;

  const co2TonsYear = +(monthlyGenerationUnits * 12 * 0.82 / 1000).toFixed(1);
  const treesEquivalent = Math.round((co2TonsYear * 1000) / 21);

  // ─── BOOT model: investor charges 100% current tariff for boot period ─────
  const bootTariff = n(input.boot_tariff) || ebTariff;
  const bootPeriodYears = n(input.boot_period_years) || 6;
  const bootMonthlySavings = 0; // community pays same tariff during BOOT
  const bootTotalRevenue = Math.round(monthlyGenerationUnits * bootTariff * 12 * bootPeriodYears);

  // ─── PPA model: 25% discount on current tariff over long term ────────────
  const ppaDiscountPct = n(input.ppa_discount_pct) || 25;
  const ppaTermYears = n(input.ppa_term_years) || 20;
  const ppaEffectiveTariff = +(ebTariff * (1 - ppaDiscountPct / 100)).toFixed(2);
  const ppaMonthlySavings = Math.round(monthlyGenerationUnits * (ebTariff - ppaEffectiveTariff));

  // ─── Self-Invest (community SPV) ────────────────────────────────────────
  const selfInvestorCount = n(input.self_investor_count) || 10;
  const selfTicketSize = n(input.self_ticket_size) || (projectCost && selfInvestorCount ? Math.round(projectCost / selfInvestorCount) : 0);
  const selfTargetIrr = n(input.self_target_irr) || 18;
  const selfTotalCapital = selfInvestorCount * selfTicketSize;
  const selfMonthlySavings = Math.round(monthlyGenerationUnits * ebTariff); // community gets full benefit
  const selfAnnualReturn = Math.round(selfTotalCapital * (selfTargetIrr / 100));

  return {
    recommendedCapacityKw,
    cmdCapKw,
    cmdCapPct,
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
    avgTariff: +avgTariff.toFixed(2),
    effectiveEnergyCharge,
    fixedMonthlyCharges,
    bootMonthlySavings,
    bootTotalRevenue,
    bootTariff: +bootTariff.toFixed(2),
    bootPeriodYears,
    ppaMonthlySavings,
    ppaEffectiveTariff,
    ppaTermYears,
    ppaDiscountPct,
    selfMonthlySavings,
    selfAnnualReturn,
    selfTotalCapital,
    selfInvestorCount,
    selfTicketSize,
    selfTargetIrr,
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