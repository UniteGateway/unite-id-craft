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
};

export const RESIDENTIAL_KW_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

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