// Design engine — picks modules/inverter/structure from the price book and
// produces a string-sizing BOQ for the recommended capacity.
import type { PriceBook, PriceModule, PriceInverter, PriceStructure } from "./pricing";

export interface DesignInput {
  capacity_kw: number;
  roof_type?: string | null;
  segment?: "residential" | "commercial" | "industrial";
  budget_tier?: "value" | "standard" | "premium";
}

export interface DesignOutput {
  module: PriceModule | null;
  inverter: PriceInverter | null;
  structure: PriceStructure | null;
  module_count: number;
  inverter_count: number;
  dc_ac_ratio: number;
  strings_per_inverter: number;
  panels_per_string: number;
  total_strings: number;
  estimated_roof_sqm: number;
  boq: { item: string; qty: number; unit: string; note?: string }[];
}

function pickModule(pb: PriceBook, tier: DesignInput["budget_tier"]): PriceModule | null {
  if (!pb.modules.length) return null;
  const sorted = [...pb.modules].sort((a, b) => b.wattage - a.wattage);
  if (tier === "value") return sorted[sorted.length - 1];
  if (tier === "premium") return sorted[0];
  return sorted[Math.floor(sorted.length / 2)] ?? sorted[0];
}

function pickInverter(pb: PriceBook, kw: number): PriceInverter | null {
  if (!pb.inverters.length) return null;
  // Prefer 1.15–1.25 DC/AC ratio inverter, i.e. AC capacity ≈ kw / 1.2.
  const target = kw / 1.2;
  return [...pb.inverters].sort((a, b) =>
    Math.abs(a.capacity_kw - target) - Math.abs(b.capacity_kw - target)
  )[0] ?? null;
}

function pickStructure(pb: PriceBook, roofType?: string | null): PriceStructure | null {
  if (!pb.structures.length) return null;
  if (!roofType) return pb.structures[0];
  const k = roofType.toLowerCase();
  const hit = pb.structures.find((s) => s.type.toLowerCase().includes(k.split(" ")[0]));
  return hit ?? pb.structures[0];
}

export function runDesign(input: DesignInput, pb: PriceBook): DesignOutput {
  const kw = Math.max(0, input.capacity_kw || 0);
  const wp = kw * 1000;
  const module = pickModule(pb, input.budget_tier ?? "standard");
  const inverter = pickInverter(pb, kw);
  const structure = pickStructure(pb, input.roof_type);

  const moduleWp = module?.wattage ?? 550;
  const module_count = module ? Math.ceil(wp / moduleWp) : 0;
  const invCap = inverter?.capacity_kw ?? Math.max(1, kw);
  const inverter_count = Math.max(1, Math.ceil(kw / invCap));
  const dc_ac_ratio = +((module_count * moduleWp) / 1000 / (inverter_count * invCap)).toFixed(2);

  // String sizing heuristic: 20 modules/string for >100 kW, 12 for residential.
  const panels_per_string = kw >= 100 ? 20 : kw >= 25 ? 16 : 12;
  const total_strings = Math.max(1, Math.ceil(module_count / panels_per_string));
  const strings_per_inverter = Math.ceil(total_strings / inverter_count);
  const estimated_roof_sqm = +(module_count * 2.58).toFixed(0); // 550W panel ≈ 2.58 m²

  const boq: DesignOutput["boq"] = [];
  if (module) boq.push({ item: `${module.brand} ${module.wattage}Wp ${module.technology}`, qty: module_count, unit: "panels" });
  if (inverter) boq.push({ item: `${inverter.brand} ${inverter.capacity_kw}kW ${inverter.phase}`, qty: inverter_count, unit: "units" });
  if (structure) boq.push({ item: `Structure — ${structure.type}`, qty: kw, unit: "kW" });
  boq.push({ item: "DC Cable (4/6 sqmm)", qty: Math.round(kw * 30), unit: "m" });
  boq.push({ item: "AC Cable (XLPE)", qty: Math.round(kw * 15), unit: "m" });
  boq.push({ item: "ACDB + DCDB", qty: inverter_count, unit: "sets" });
  boq.push({ item: "Earthing kit + Lightning arrestor", qty: 1, unit: "lot" });
  boq.push({ item: "MC4 connectors", qty: total_strings * 2, unit: "pairs" });

  return {
    module, inverter, structure,
    module_count, inverter_count, dc_ac_ratio,
    strings_per_inverter, panels_per_string, total_strings,
    estimated_roof_sqm, boq,
  };
}