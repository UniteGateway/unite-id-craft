// Residential proposal helpers: BOQ math, INR formatter, and built-in cover library.
import coverGated from "@/assets/residential-cover-gated.jpg";
import coverVilla from "@/assets/residential-cover-villa.jpg";
import coverModern from "@/assets/residential-cover-modern.jpg";
import coverFamily from "@/assets/residential-cover-family.jpg";
import coverApartment from "@/assets/residential-cover-apartment.jpg";
import coverSunset from "@/assets/residential-cover-sunset.jpg";

export type BoqLine = {
  item: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  is_fixed?: boolean;
};

export const RESIDENTIAL_KW_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const PROPOSAL_CATEGORIES = ["Residential", "Community", "Industrial"] as const;
export type ProposalCategory = typeof PROPOSAL_CATEGORIES[number];

export const BUILTIN_RESIDENTIAL_COVERS: { id: string; name: string; url: string }[] = [
  { id: "gated", name: "Gated Community", url: coverGated },
  { id: "villa", name: "Villa Rooftop", url: coverVilla },
  { id: "modern", name: "Modern Home", url: coverModern },
  { id: "family", name: "Happy Family", url: coverFamily },
  { id: "apartment", name: "Apartment Block", url: coverApartment },
  { id: "sunset", name: "Sunset Rooftop", url: coverSunset },
];

const n = (v: any) => (Number.isFinite(+v) ? +v : 0);

export function recomputeBoqAmounts(boq: BoqLine[]): BoqLine[] {
  return (boq || []).map((l) => ({ ...l, amount: +(n(l.qty) * n(l.rate)).toFixed(2) }));
}

// ---- BOQ scaling: panels round-up, cables +10% buffer, labour proportional, fixed unchanged ----
const looksLike = (item: string, words: string[]) => {
  const s = (item || "").toLowerCase();
  return words.some((w) => s.includes(w));
};

export function scaleBoqLine(line: BoqLine, scale: number): BoqLine {
  if (line.is_fixed) return { ...line };
  const item = line.item || "";
  let nextQty = line.qty * scale;
  if (looksLike(item, ["panel", "module"])) {
    nextQty = Math.ceil(nextQty);
  } else if (looksLike(item, ["cable", "wire"])) {
    nextQty = +(nextQty * 1.1).toFixed(2);
  } else if (looksLike(item, ["labour", "labor", "installation", "manpower"])) {
    nextQty = +nextQty.toFixed(2);
  } else {
    nextQty = +nextQty.toFixed(2);
  }
  return { ...line, qty: nextQty, amount: +(nextQty * line.rate).toFixed(2) };
}

export function scaleBoq(boq: BoqLine[], baseKw: number, targetKw: number): BoqLine[] {
  if (!baseKw || baseKw <= 0) return boq;
  const scale = targetKw / baseKw;
  return (boq || []).map((l) => scaleBoqLine(l, scale));
}

// ---- Subsidy ----
export function computeResidentialSubsidy(capacityKw: number): number {
  const kw = Math.round(capacityKw);
  if (kw <= 0) return 0;
  if (kw === 1) return 30000;
  if (kw === 2) return 60000;
  return 78000;
}

// ---- EMI ----
export function emi(principal: number, annualRatePct: number, tenureYears: number): number {
  const P = n(principal);
  const r = n(annualRatePct) / 12 / 100;
  const nMonths = n(tenureYears) * 12;
  if (P <= 0 || nMonths <= 0) return 0;
  if (r === 0) return P / nMonths;
  const x = Math.pow(1 + r, nMonths);
  return (P * r * x) / (x - 1);
}

export interface FinanceComputed {
  totalCost: number;
  subsidy: number;
  offerDiscount: number;
  netCost: number;
  monthlySavings: number;
  annualSavings: number;
  // loan
  emiFull: number;          // loan = netCost (no subsidy adjustment)
  emiAfterSubsidy: number;  // loan = netCost - subsidy
  totalPaymentFull: number;
  totalPaymentAdjusted: number;
  netImpactBefore: number;  // savings - emiFull
  netImpactAfter: number;   // savings - emiAfterSubsidy
}

export function computeFinance(opts: {
  totalCost: number;
  subsidy: number;
  offerDiscount: number;
  capacityKw: number;
  monthlySavingsPerKw: number;
  loanInterestRate: number;
  loanTenureYears: number;
}): FinanceComputed {
  const totalCost = n(opts.totalCost);
  const subsidy = n(opts.subsidy);
  const offerDiscount = n(opts.offerDiscount);
  const netCost = Math.max(0, totalCost - offerDiscount);
  const monthlySavings = n(opts.capacityKw) * n(opts.monthlySavingsPerKw);
  const annualSavings = monthlySavings * 12;
  const emiFull = emi(netCost, opts.loanInterestRate, opts.loanTenureYears);
  const emiAfterSubsidy = emi(Math.max(0, netCost - subsidy), opts.loanInterestRate, opts.loanTenureYears);
  const months = n(opts.loanTenureYears) * 12;
  return {
    totalCost,
    subsidy,
    offerDiscount,
    netCost,
    monthlySavings,
    annualSavings,
    emiFull,
    emiAfterSubsidy,
    totalPaymentFull: emiFull * months,
    totalPaymentAdjusted: emiAfterSubsidy * months + emiFull, // first month at full EMI
    netImpactBefore: monthlySavings - emiFull,
    netImpactAfter: monthlySavings - emiAfterSubsidy,
  };
}

export interface ResidentialComputed {
  boqSubtotal: number;
  gst5: number;
  gst18: number;
  gstTotal: number;
  totalCost: number;
  effectiveCostPerKw: number;
}

export function computeResidential(boq: BoqLine[], capacityKw: number): ResidentialComputed {
  const boqSubtotal = (boq || []).reduce((s, l) => s + n(l.amount), 0);
  // Same GST split as industrial: 70% goods @ 5%, 30% service @ 18%
  const gst5 = boqSubtotal * 0.7 * 0.05;
  const gst18 = boqSubtotal * 0.3 * 0.18;
  const gstTotal = gst5 + gst18;
  const totalCost = boqSubtotal + gstTotal;
  const effectiveCostPerKw = capacityKw > 0 ? boqSubtotal / capacityKw : 0;
  return { boqSubtotal, gst5, gst18, gstTotal, totalCost, effectiveCostPerKw };
}

export const inr = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(v) ? v : 0);

export function blankBoqLine(): BoqLine {
  return { item: "", qty: 1, unit: "Nos", rate: 0, amount: 0 };
}

export const DEFAULT_RESIDENTIAL_TERMS = `1. Quotation valid for 15 days from date of issue.
2. 70% advance with PO; 20% on material delivery; 10% on commissioning.
3. Delivery & commissioning within 30 working days from advance + site readiness.
4. Civil work, scaffolding, shed/tree shadow removal in client scope unless quoted.
5. Net-meter / DISCOM liaison support included; govt fees at actuals.
6. Workmanship warranty: 5 years. Module 25 yrs (linear) / 12 yrs (product). Inverter 5–10 yrs as per OEM.
7. Insurance & taxes at actuals; GST 13.8% blended (5% goods, 18% services).
8. Force majeure & site-specific civil hindrances are not part of scope.`;