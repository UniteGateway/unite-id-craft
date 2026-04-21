// Approximate solar generation by Indian city (kWh per kW per day, annual avg).
// Sources: NIWE / MNRE 5-yr GHI averages, rounded to 0.05.
export type CityGen = { city: string; state: string; kWhPerKwPerDay: number };

export const INDIA_CITY_SOLAR: CityGen[] = [
  // South
  { city: "Hyderabad", state: "Telangana", kWhPerKwPerDay: 4.6 },
  { city: "Warangal", state: "Telangana", kWhPerKwPerDay: 4.7 },
  { city: "Karimnagar", state: "Telangana", kWhPerKwPerDay: 4.7 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", kWhPerKwPerDay: 4.6 },
  { city: "Vijayawada", state: "Andhra Pradesh", kWhPerKwPerDay: 4.7 },
  { city: "Tirupati", state: "Andhra Pradesh", kWhPerKwPerDay: 4.8 },
  { city: "Bengaluru", state: "Karnataka", kWhPerKwPerDay: 4.8 },
  { city: "Mysuru", state: "Karnataka", kWhPerKwPerDay: 4.8 },
  { city: "Mangaluru", state: "Karnataka", kWhPerKwPerDay: 4.4 },
  { city: "Chennai", state: "Tamil Nadu", kWhPerKwPerDay: 4.7 },
  { city: "Coimbatore", state: "Tamil Nadu", kWhPerKwPerDay: 4.8 },
  { city: "Madurai", state: "Tamil Nadu", kWhPerKwPerDay: 4.8 },
  { city: "Kochi", state: "Kerala", kWhPerKwPerDay: 4.4 },
  { city: "Thiruvananthapuram", state: "Kerala", kWhPerKwPerDay: 4.5 },
  // West
  { city: "Mumbai", state: "Maharashtra", kWhPerKwPerDay: 4.7 },
  { city: "Pune", state: "Maharashtra", kWhPerKwPerDay: 4.8 },
  { city: "Nagpur", state: "Maharashtra", kWhPerKwPerDay: 5.0 },
  { city: "Nashik", state: "Maharashtra", kWhPerKwPerDay: 4.9 },
  { city: "Ahmedabad", state: "Gujarat", kWhPerKwPerDay: 5.1 },
  { city: "Surat", state: "Gujarat", kWhPerKwPerDay: 5.0 },
  { city: "Vadodara", state: "Gujarat", kWhPerKwPerDay: 5.0 },
  { city: "Rajkot", state: "Gujarat", kWhPerKwPerDay: 5.2 },
  { city: "Bhopal", state: "Madhya Pradesh", kWhPerKwPerDay: 4.9 },
  { city: "Indore", state: "Madhya Pradesh", kWhPerKwPerDay: 4.9 },
  // North
  { city: "New Delhi", state: "Delhi", kWhPerKwPerDay: 4.9 },
  { city: "Gurugram", state: "Haryana", kWhPerKwPerDay: 4.9 },
  { city: "Noida", state: "Uttar Pradesh", kWhPerKwPerDay: 4.8 },
  { city: "Lucknow", state: "Uttar Pradesh", kWhPerKwPerDay: 4.7 },
  { city: "Kanpur", state: "Uttar Pradesh", kWhPerKwPerDay: 4.7 },
  { city: "Jaipur", state: "Rajasthan", kWhPerKwPerDay: 5.3 },
  { city: "Jodhpur", state: "Rajasthan", kWhPerKwPerDay: 5.5 },
  { city: "Udaipur", state: "Rajasthan", kWhPerKwPerDay: 5.3 },
  { city: "Chandigarh", state: "Chandigarh", kWhPerKwPerDay: 4.7 },
  { city: "Amritsar", state: "Punjab", kWhPerKwPerDay: 4.7 },
  { city: "Dehradun", state: "Uttarakhand", kWhPerKwPerDay: 4.6 },
  { city: "Shimla", state: "Himachal Pradesh", kWhPerKwPerDay: 4.4 },
  // East
  { city: "Kolkata", state: "West Bengal", kWhPerKwPerDay: 4.5 },
  { city: "Bhubaneswar", state: "Odisha", kWhPerKwPerDay: 4.7 },
  { city: "Patna", state: "Bihar", kWhPerKwPerDay: 4.6 },
  { city: "Ranchi", state: "Jharkhand", kWhPerKwPerDay: 4.7 },
  { city: "Guwahati", state: "Assam", kWhPerKwPerDay: 4.2 },
];

export const DEFAULT_KWH_PER_KW_PER_DAY = 4.6; // Hyderabad baseline
export const PERFORMANCE_RATIO = 0.78;          // applied on top to account for losses (already baked into table)

export function lookupCity(city?: string | null): CityGen | null {
  if (!city) return null;
  const c = city.trim().toLowerCase();
  return INDIA_CITY_SOLAR.find(e => e.city.toLowerCase() === c) || null;
}

export function citiesByState(state: string): CityGen[] {
  return INDIA_CITY_SOLAR.filter(c => c.state === state).sort((a, b) => a.city.localeCompare(b.city));
}

export const INDIAN_STATES = Array.from(new Set(INDIA_CITY_SOLAR.map(c => c.state))).sort();

export function generationFor(capacityKw: number, kWhPerKwPerDay: number) {
  const daily = capacityKw * kWhPerKwPerDay;
  const monthly = daily * 30;
  const annual = daily * 365;
  return { daily, monthly, annual };
}

/**
 * Cumulative ROI series: returns yearly cumulative net savings vs net cost,
 * with payback year. Uses 2.5% annual tariff escalation and 0.6%/yr panel
 * degradation by default. years defaults to 25.
 */
export function buildRoiSeries(opts: {
  netCost: number;
  monthlySavings: number;
  years?: number;
  tariffEscalationPct?: number;
  degradationPct?: number;
}) {
  const years = opts.years ?? 25;
  const esc = (opts.tariffEscalationPct ?? 2.5) / 100;
  const deg = (opts.degradationPct ?? 0.6) / 100;
  const annualBase = opts.monthlySavings * 12;
  let cumulative = 0;
  let paybackYear: number | null = null;
  const series: { year: number; yearly: number; cumulative: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const yearly = annualBase * Math.pow(1 + esc, y - 1) * Math.pow(1 - deg, y - 1);
    cumulative += yearly;
    if (paybackYear === null && cumulative >= opts.netCost && opts.netCost > 0) paybackYear = y;
    series.push({ year: y, yearly, cumulative });
  }
  return { series, paybackYear, lifetimeSavings: cumulative };
}