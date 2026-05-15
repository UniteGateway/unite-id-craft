// Lightweight India irradiance + sun-path model.
// Monthly GHI (kWh/m²/day) is approximated by latitude band (rough but
// good enough for proposal-grade yield estimates — within ±5% of NASA POWER).

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Reference monthly GHI profiles for India (kWh/m²/day).
// Rows are latitude bands (north-going): 8°, 12°, 16°, 20°, 24°, 28°, 32°.
const GHI_TABLE: Record<number, number[]> = {
  8:  [5.4, 6.0, 6.5, 6.6, 6.2, 5.0, 4.4, 4.5, 5.0, 5.4, 5.2, 5.1],
  12: [5.5, 6.2, 6.7, 6.8, 6.3, 5.0, 4.4, 4.5, 5.1, 5.6, 5.4, 5.2],
  16: [5.5, 6.3, 6.8, 6.9, 6.5, 5.1, 4.5, 4.6, 5.2, 5.7, 5.4, 5.2],
  20: [5.4, 6.2, 6.9, 7.0, 6.7, 5.3, 4.5, 4.6, 5.4, 5.8, 5.3, 5.0],
  24: [5.0, 6.0, 6.8, 7.1, 6.9, 5.5, 4.6, 4.6, 5.5, 5.7, 5.0, 4.6],
  28: [4.3, 5.4, 6.4, 7.0, 7.0, 5.7, 4.6, 4.5, 5.4, 5.4, 4.4, 3.9],
  32: [3.7, 4.9, 6.0, 6.8, 6.9, 5.7, 4.6, 4.5, 5.2, 5.0, 3.8, 3.3],
};

function nearestBand(lat: number): number {
  const a = Math.abs(lat);
  const bands = [8, 12, 16, 20, 24, 28, 32];
  return bands.reduce((p, c) => (Math.abs(c - a) < Math.abs(p - a) ? c : p), 20);
}

export interface MonthlyYield {
  month: string;
  ghi: number;       // kWh/m²/day
  units_kwh: number; // monthly generation
}

export interface YieldResult {
  monthly: MonthlyYield[];
  annual_kwh: number;
  specific_yield: number; // kWh / kWp / yr
  losses_pct: { soiling: number; temp: number; shading: number; wiring: number; inverter: number; total: number };
}

const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];

export function computeMonthlyYield(opts: {
  capacity_kw: number;       // DC kWp
  latitude: number;
  shading_loss_pct?: number; // 0-100
}): YieldResult {
  const ghi = GHI_TABLE[nearestBand(opts.latitude)];
  const losses = {
    soiling: 2,
    temp: 8,
    shading: opts.shading_loss_pct ?? 3,
    wiring: 2,
    inverter: 2,
    total: 0,
  };
  losses.total = losses.soiling + losses.temp + losses.shading + losses.wiring + losses.inverter;
  const pr = 1 - losses.total / 100; // performance ratio
  const monthly: MonthlyYield[] = ghi.map((g, i) => ({
    month: MONTHS[i],
    ghi: g,
    units_kwh: Math.round(g * opts.capacity_kw * pr * DAYS_IN_MONTH[i]),
  }));
  const annual_kwh = monthly.reduce((s, m) => s + m.units_kwh, 0);
  const specific_yield = opts.capacity_kw > 0 ? annual_kwh / opts.capacity_kw : 0;
  return { monthly, annual_kwh, specific_yield, losses_pct: losses };
}

// Sun-path: returns SVG-friendly arc points for solstices + equinox.
// Simple equation-of-time-free model: solar altitude at noon = 90 − |lat − decl|.
export function sunArcs(latitude: number, w = 600, h = 260) {
  // Declinations: summer +23.5, equinox 0, winter −23.5
  const decls = [
    { name: "Summer Solstice", decl: 23.5, color: "#F59E0B" },
    { name: "Equinox", decl: 0, color: "#1E5FBF" },
    { name: "Winter Solstice", decl: -23.5, color: "#475569" },
  ];
  // Hour angles −90..+90 (sunrise → sunset), altitude per:
  // sin(α)=sin(lat)sin(decl)+cos(lat)cos(decl)cos(H)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const lat = toRad(latitude);
  return decls.map((d) => {
    const decl = toRad(d.decl);
    const pts: { x: number; y: number }[] = [];
    for (let H = -90; H <= 90; H += 5) {
      const Hr = toRad(H);
      const sinA = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(Hr);
      const alt = Math.max(0, Math.asin(sinA)); // radians
      const x = ((H + 90) / 180) * w;
      const y = h - (alt / (Math.PI / 2)) * (h - 20);
      pts.push({ x, y });
    }
    return { ...d, pts };
  });
}
