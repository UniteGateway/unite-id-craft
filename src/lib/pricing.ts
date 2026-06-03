// Unite Solar pricing engine — combines admin price book with project inputs
// to produce a full EPC cost breakdown.
import { supabase } from "@/integrations/supabase/client";

export interface PriceModule { id: string; brand: string; technology: string; wattage: number; price_per_wp: number; }
export interface PriceInverter { id: string; brand: string; model: string | null; capacity_kw: number; phase: string; price: number; }
export interface PriceStructure { id: string; type: string; rate_per_wp: number; height_premium_per_floor_pct: number; }
export interface PriceBosItem { id: string; category: string; item: string; unit: string; rate: number; per_kw_qty: number | null; }
export interface PriceLabour { segment: string; rate_per_wp: number; installation_per_kw: number; }
export interface PriceStatePolicy { state: string; net_metering_charge_per_kw: number; statutory_charge_per_kw: number; }
export interface SubsidySlab { kw_min: number; kw_max: number; amount: number; scheme: string; }
export interface PricingSettings {
  company_margin_pct: number; sales_margin_pct: number; channel_partner_margin_pct: number; franchise_margin_pct: number;
  gst_pct: number; design_charges_per_kw: number; installation_per_kw: number; logistics_per_kw: number; statutory_per_kw: number;
}

export interface PriceBook {
  modules: PriceModule[]; inverters: PriceInverter[]; structures: PriceStructure[];
  bos: PriceBosItem[]; labour: PriceLabour[]; states: PriceStatePolicy[];
  subsidy: SubsidySlab[]; settings: PricingSettings;
}

export async function loadPriceBook(): Promise<PriceBook> {
  const [m, i, s, b, l, st, sub, set] = await Promise.all([
    supabase.from("price_modules").select("*").eq("active", true).order("wattage"),
    supabase.from("price_inverters").select("*").eq("active", true).order("capacity_kw"),
    supabase.from("price_structures").select("*").eq("active", true),
    supabase.from("price_bos").select("*").eq("active", true),
    supabase.from("price_labour").select("*"),
    supabase.from("price_state_policies").select("*"),
    supabase.from("subsidy_slabs").select("*").order("kw_min"),
    supabase.from("pricing_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  return {
    modules: (m.data ?? []) as any,
    inverters: (i.data ?? []) as any,
    structures: (s.data ?? []) as any,
    bos: (b.data ?? []) as any,
    labour: (l.data ?? []) as any,
    states: (st.data ?? []) as any,
    subsidy: (sub.data ?? []) as any,
    settings: (set.data ?? {
      company_margin_pct: 15, sales_margin_pct: 5, channel_partner_margin_pct: 3, franchise_margin_pct: 2,
      gst_pct: 13.8, design_charges_per_kw: 500, installation_per_kw: 2500, logistics_per_kw: 800, statutory_per_kw: 600,
    }) as PricingSettings,
  };
}

export interface CostInput {
  capacity_kw: number;
  segment: "residential" | "commercial" | "industrial";
  module_id?: string;
  inverter_id?: string;
  structure_type?: string;
  floors?: number;
  state?: string;
}

export interface CostLine { label: string; amount: number; detail?: string; }
export interface CostResult {
  lines: CostLine[];
  subtotal: number;
  margins: number;
  gst: number;
  final_price: number;        // price to customer (incl. GST)
  subsidy: number;
  net_to_customer: number;    // after subsidy
  per_kw: number;
}

export function computeSubsidy(capacityKw: number, slabs: SubsidySlab[]): number {
  // PM Surya Ghar: cumulative cap by kW
  let best = 0;
  for (const s of slabs) {
    if (capacityKw >= s.kw_min && capacityKw <= s.kw_max) best = Math.max(best, s.amount);
    if (capacityKw > s.kw_max) best = Math.max(best, s.amount);
  }
  return best;
}

export function computeCost(input: CostInput, pb: PriceBook): CostResult {
  const kw = +input.capacity_kw || 0;
  const wp = kw * 1000;
  const lines: CostLine[] = [];

  // 1. Modules
  const mod = pb.modules.find((m) => m.id === input.module_id) ?? pb.modules[0];
  if (mod) {
    const qty = Math.ceil(wp / mod.wattage);
    const cost = qty * mod.wattage * mod.price_per_wp;
    lines.push({ label: `Solar Modules — ${mod.brand} ${mod.wattage}Wp ${mod.technology}`, amount: cost, detail: `${qty} panels × ₹${mod.price_per_wp}/Wp` });
  }

  // 2. Inverter
  const inv = pb.inverters.find((i) => i.id === input.inverter_id) ?? pickInverter(pb.inverters, kw);
  if (inv) {
    const units = Math.max(1, Math.ceil(kw / inv.capacity_kw));
    lines.push({ label: `Inverter — ${inv.brand} ${inv.model ?? ""} ${inv.capacity_kw}kW`, amount: inv.price * units, detail: `${units} × ₹${inv.price.toLocaleString("en-IN")}` });
  }

  // 3. Structure (with floor premium)
  const str = pb.structures.find((s) => s.type === (input.structure_type ?? "RCC Roof")) ?? pb.structures[0];
  if (str) {
    const floors = Math.max(0, input.floors ?? 0);
    const premium = 1 + (floors * str.height_premium_per_floor_pct) / 100;
    const cost = wp * str.rate_per_wp * premium;
    lines.push({ label: `Structure — ${str.type}`, amount: cost, detail: floors > 0 ? `G+${floors} (+${Math.round((premium - 1) * 100)}%)` : "Ground floor" });
  }

  // 4. BOS (per_kw_qty × rate × kw)
  let bosTotal = 0;
  for (const b of pb.bos) {
    const qty = (b.per_kw_qty ?? 0) * kw;
    bosTotal += qty * b.rate;
  }
  if (bosTotal > 0) lines.push({ label: "Balance of System (cables, ACDB/DCDB, earthing, LA)", amount: bosTotal });

  // 5. Labour
  const lab = pb.labour.find((l) => l.segment === input.segment) ?? pb.labour[0];
  if (lab) {
    lines.push({ label: `Labour (${input.segment})`, amount: wp * lab.rate_per_wp, detail: `₹${lab.rate_per_wp}/Wp` });
    lines.push({ label: "Installation & Commissioning", amount: kw * (lab.installation_per_kw || pb.settings.installation_per_kw) });
  }

  // 6. Design + Logistics + Statutory
  lines.push({ label: "Design & Engineering", amount: kw * pb.settings.design_charges_per_kw });
  lines.push({ label: "Logistics", amount: kw * pb.settings.logistics_per_kw });

  // 7. State-wise statutory + net metering
  const sp = pb.states.find((s) => s.state === input.state);
  const netMeter = (sp?.net_metering_charge_per_kw ?? 0) * kw;
  const statutory = (sp?.statutory_charge_per_kw ?? pb.settings.statutory_per_kw) * kw;
  if (netMeter > 0) lines.push({ label: `Net Metering (${input.state})`, amount: netMeter });
  lines.push({ label: "Statutory Approvals", amount: statutory });

  const baseSubtotal = lines.reduce((s, l) => s + l.amount, 0);

  // 8. Margins (stacked on baseSubtotal)
  const marginPct = pb.settings.company_margin_pct + pb.settings.sales_margin_pct
    + pb.settings.channel_partner_margin_pct + pb.settings.franchise_margin_pct;
  const margins = baseSubtotal * (marginPct / 100);
  lines.push({ label: `Margins (${marginPct.toFixed(1)}%)`, amount: margins, detail: "Company + Sales + CP + Franchise" });

  const subtotal = baseSubtotal + margins;
  const gst = subtotal * (pb.settings.gst_pct / 100);
  const final_price = subtotal + gst;

  const subsidy = input.segment === "residential" ? computeSubsidy(kw, pb.subsidy) : 0;
  const net_to_customer = Math.max(0, final_price - subsidy);

  return {
    lines, subtotal, margins, gst, final_price, subsidy, net_to_customer,
    per_kw: kw > 0 ? final_price / kw : 0,
  };
}

function pickInverter(invs: PriceInverter[], kw: number): PriceInverter | undefined {
  const sorted = [...invs].sort((a, b) => a.capacity_kw - b.capacity_kw);
  return sorted.find((i) => i.capacity_kw >= kw) ?? sorted[sorted.length - 1];
}

export const inr = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number.isFinite(v) ? v : 0);