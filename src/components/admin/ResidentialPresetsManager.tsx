import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, Home, RefreshCw } from "lucide-react";
import { BoqLine, blankBoqLine, recomputeBoqAmounts, computeResidential, inr, RESIDENTIAL_KW_OPTIONS } from "@/lib/residential-presets";

interface Preset {
  id: string;
  label: string;
  capacity_kw: number;
  panel_wattage: number;
  panel_count: number;
  inverter_capacity: number;
  structure_type: string;
  cost_per_kw: number;
  boq: BoqLine[];
  terms_and_conditions: string;
  notes: string | null;
}

const ResidentialPresetsManager: React.FC = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("residential_presets")
      .select("*")
      .order("capacity_kw", { ascending: true });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const rows = (data ?? []).map((r: any) => ({
      ...r,
      boq: Array.isArray(r.boq) ? r.boq : [],
    })) as Preset[];
    setPresets(rows);
    if (!activeId && rows.length) setActiveId(rows[0].id);
  };

  useEffect(() => { load(); }, []);

  const active = useMemo(() => presets.find(p => p.id === activeId) ?? null, [presets, activeId]);

  const updateActive = (patch: Partial<Preset>) => {
    if (!active) return;
    setPresets(prev => prev.map(p => p.id === active.id ? { ...p, ...patch } : p));
  };

  const updateBoqRow = (idx: number, patch: Partial<BoqLine>) => {
    if (!active) return;
    const next = active.boq.map((l, i) => i === idx ? { ...l, ...patch } : l);
    updateActive({ boq: recomputeBoqAmounts(next) });
  };

  const addBoqRow = () => {
    if (!active) return;
    updateActive({ boq: [...active.boq, blankBoqLine()] });
  };

  const removeBoqRow = (idx: number) => {
    if (!active) return;
    updateActive({ boq: active.boq.filter((_, i) => i !== idx) });
  };

  const savePreset = async () => {
    if (!active) return;
    setSavingId(active.id);
    const { error } = await supabase
      .from("residential_presets")
      .update({
        label: active.label,
        capacity_kw: active.capacity_kw,
        panel_wattage: active.panel_wattage,
        panel_count: active.panel_count,
        inverter_capacity: active.inverter_capacity,
        structure_type: active.structure_type,
        cost_per_kw: active.cost_per_kw,
        boq: recomputeBoqAmounts(active.boq) as any,
        terms_and_conditions: active.terms_and_conditions,
        notes: active.notes,
      })
      .eq("id", active.id);
    setSavingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`${active.label} saved. New proposals will use these defaults.`);
    load();
  };

  const computed = active ? computeResidential(recomputeBoqAmounts(active.boq), active.capacity_kw) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" /> Residential Proposal Presets</CardTitle>
        <CardDescription>
          Edit pricing, BOQ items and terms for each kW size. Changes apply to all <strong>new</strong> residential proposals created from these presets — existing proposals are not affected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="py-8 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : presets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No presets found.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition ${
                    activeId === p.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  {p.capacity_kw} kW
                </button>
              ))}
              <Button variant="ghost" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Reload</Button>
            </div>

            {active && (
              <div className="space-y-5 border-t border-border pt-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input value={active.label} onChange={(e) => updateActive({ label: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Capacity (kW)</Label>
                    <Input type="number" value={active.capacity_kw} onChange={(e) => updateActive({ capacity_kw: +e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Panel wattage (W)</Label>
                    <Input type="number" value={active.panel_wattage} onChange={(e) => updateActive({ panel_wattage: +e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Panel count</Label>
                    <Input type="number" value={active.panel_count} onChange={(e) => updateActive({ panel_count: +e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Inverter capacity (kW)</Label>
                    <Input type="number" value={active.inverter_capacity} onChange={(e) => updateActive({ inverter_capacity: +e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cost per kW (₹)</Label>
                    <Input type="number" value={active.cost_per_kw} onChange={(e) => updateActive({ cost_per_kw: +e.target.value })} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Structure type</Label>
                    <Input value={active.structure_type} onChange={(e) => updateActive({ structure_type: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Bill of Quantities</Label>
                    <Button size="sm" variant="outline" onClick={addBoqRow}><Plus className="h-3.5 w-3.5 mr-1" /> Add row</Button>
                  </div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/40 text-[11px] font-semibold uppercase tracking-wide">
                      <div className="col-span-5">Item</div>
                      <div className="col-span-1 text-right">Qty</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-2 text-right">Rate (₹)</div>
                      <div className="col-span-1 text-right">Amount</div>
                      <div className="col-span-1" />
                    </div>
                    {active.boq.map((l, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-border items-center">
                        <Input className="col-span-5 h-8 text-sm" value={l.item} onChange={(e) => updateBoqRow(i, { item: e.target.value })} />
                        <Input className="col-span-1 h-8 text-sm text-right" type="number" value={l.qty} onChange={(e) => updateBoqRow(i, { qty: +e.target.value })} />
                        <Input className="col-span-2 h-8 text-sm" value={l.unit} onChange={(e) => updateBoqRow(i, { unit: e.target.value })} />
                        <Input className="col-span-2 h-8 text-sm text-right" type="number" value={l.rate} onChange={(e) => updateBoqRow(i, { rate: +e.target.value })} />
                        <div className="col-span-1 text-right text-sm tabular-nums">{inr(l.qty * l.rate)}</div>
                        <button onClick={() => removeBoqRow(i)} className="col-span-1 justify-self-end text-destructive hover:bg-destructive/10 p-1 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {computed && (
                    <div className="grid sm:grid-cols-3 gap-2 text-sm pt-2">
                      <div className="rounded-md bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">BOQ Subtotal</p>
                        <p className="font-semibold">{inr(computed.boqSubtotal)}</p>
                      </div>
                      <div className="rounded-md bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">GST (blended ~13.8%)</p>
                        <p className="font-semibold">{inr(computed.gstTotal)}</p>
                      </div>
                      <div className="rounded-md bg-primary/10 p-3 border border-primary/30">
                        <p className="text-xs text-muted-foreground">Total cost</p>
                        <p className="font-semibold">{inr(computed.totalCost)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Terms & Conditions</Label>
                  <Textarea
                    rows={8}
                    value={active.terms_and_conditions}
                    onChange={(e) => updateActive({ terms_and_conditions: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Internal notes (optional)</Label>
                  <Textarea
                    rows={2}
                    value={active.notes ?? ""}
                    onChange={(e) => updateActive({ notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={savePreset} disabled={savingId === active.id}>
                    {savingId === active.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save {active.capacity_kw} kW preset
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResidentialPresetsManager;