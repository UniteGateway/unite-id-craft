// Solar SaaS proposal auto-calculation.
// Scaling per spec: PROJECT_COST = capacity * 4 Cr,
// ANNUAL_UNITS = capacity * 15 Lakh, TOTAL_SAVINGS = capacity * 40 Cr,
// ANNUAL_SAVINGS = capacity * 1.2 Cr, CO2 = capacity * 1200 T/yr.

export interface SolarProjectInput {
  project_name: string;
  location?: string;
  project_type?: "Gated Community" | "Industrial" | "Commercial" | string;
  capacity_mw: number;
  investment_model?: "PPA" | "BOOT" | "Self Investment" | "Community Investment" | string;
  approx_budget?: string;
  custom_notes?: string;
  overrides?: Partial<SolarComputed>;
}

export interface SolarComputed {
  capacity_mw: number;
  project_cost_cr: number;       // Cr
  annual_units_lakh: number;     // Lakh units
  annual_savings_cr: number;     // Cr / year
  total_savings_cr: number;      // Cr lifetime
  payback_years: string;         // e.g. "5-6"
  om_cost_lakh_per_year: string; // e.g. "5-7"
  co2_tons_per_year: number;
  life_years: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeSolarProject(input: SolarProjectInput): SolarComputed {
  const cap = Number(input.capacity_mw) || 0;
  const base: SolarComputed = {
    capacity_mw: cap,
    project_cost_cr: round1(cap * 4),
    annual_units_lakh: round1(cap * 15),
    annual_savings_cr: round1(cap * 1.2),
    total_savings_cr: round1(cap * 40),
    payback_years: "5-6",
    om_cost_lakh_per_year: cap <= 1 ? "5-7" : `${round1(cap * 5)}-${round1(cap * 7)}`,
    co2_tons_per_year: Math.round(cap * 1200),
    life_years: 25,
  };
  return { ...base, ...(input.overrides || {}) };
}

/**
 * Map computed values to the variables the existing variable slides
 * (CoverSlide, OverviewSlide, RoiSlide, …) expect.
 */
export function toProposalVars(input: SolarProjectInput, c: SolarComputed) {
  return {
    PROJECT_NAME: input.project_name || "Untitled Project",
    LOCATION: input.location || "",
    CAPACITY: String(c.capacity_mw),
    PROJECT_COST: String(c.project_cost_cr),
    TOTAL_SAVINGS: String(c.total_savings_cr),
    PAYBACK: String(c.payback_years).split("-")[0],
    ANNUAL_UNITS: String(c.annual_units_lakh),
    OM_COST: String(c.om_cost_lakh_per_year).split("-")[0],
    CO2: String(c.co2_tons_per_year),
    LIFE: String(c.life_years),
  };
}

export const PROJECT_TYPES = ["Gated Community", "Industrial", "Commercial"] as const;
export const INVESTMENT_MODELS = ["PPA", "BOOT", "Self Investment", "Community Investment"] as const;