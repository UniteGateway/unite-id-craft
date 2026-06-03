import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";

type TableKey = "price_modules" | "price_inverters" | "price_structures" | "price_bos" | "price_labour" | "price_state_policies" | "subsidy_slabs";

const SCHEMAS: Record<TableKey, { cols: { key: string; label: string; type?: string }[]; defaults: any }> = {
  price_modules: {
    cols: [{ key: "brand", label: "Brand" }, { key: "technology", label: "Technology" }, { key: "wattage", label: "Wp", type: "number" }, { key: "price_per_wp", label: "₹/Wp", type: "number" }],
    defaults: { brand: "", technology: "Mono PERC", wattage: 540, price_per_wp: 17, active: true },
  },
  price_inverters: {
    cols: [{ key: "brand", label: "Brand" }, { key: "model", label: "Model" }, { key: "capacity_kw", label: "kW", type: "number" }, { key: "phase", label: "Phase" }, { key: "price", label: "₹", type: "number" }],
    defaults: { brand: "", model: "", capacity_kw: 5, phase: "1P", price: 50000, active: true },
  },
  price_structures: {
    cols: [{ key: "type", label: "Type" }, { key: "rate_per_wp", label: "₹/Wp", type: "number" }, { key: "height_premium_per_floor_pct", label: "+%/floor", type: "number" }],
    defaults: { type: "", rate_per_wp: 7, height_premium_per_floor_pct: 5, active: true },
  },
  price_bos: {
    cols: [{ key: "category", label: "Category" }, { key: "item", label: "Item" }, { key: "unit", label: "Unit" }, { key: "rate", label: "Rate ₹", type: "number" }, { key: "per_kw_qty", label: "Qty/kW", type: "number" }],
    defaults: { category: "Cable", item: "", unit: "m", rate: 0, per_kw_qty: 0, active: true },
  },
  price_labour: {
    cols: [{ key: "segment", label: "Segment" }, { key: "rate_per_wp", label: "₹/Wp", type: "number" }, { key: "installation_per_kw", label: "Install ₹/kW", type: "number" }],
    defaults: { segment: "residential", rate_per_wp: 4, installation_per_kw: 2500 },
  },
  price_state_policies: {
    cols: [{ key: "state", label: "State" }, { key: "net_metering_charge_per_kw", label: "Net Mtr ₹/kW", type: "number" }, { key: "statutory_charge_per_kw", label: "Statutory ₹/kW", type: "number" }],
    defaults: { state: "", net_metering_charge_per_kw: 500, statutory_charge_per_kw: 600 },
  },
  subsidy_slabs: {
    cols: [{ key: "scheme", label: "Scheme" }, { key: "kw_min", label: "kW Min", type: "number" }, { key: "kw_max", label: "kW Max", type: "number" }, { key: "amount", label: "Amount ₹", type: "number" }],
    defaults: { scheme: "PM Surya Ghar", kw_min: 0, kw_max: 1, amount: 30000 },
  },
};

export default function PriceBook() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  if (!roleLoading && !isAdmin) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <div className="container mx-auto px-4 py-6 flex-1">
        <h1 className="text-2xl font-bold mb-1">Price Book</h1>
        <p className="text-sm text-muted-foreground mb-6">Admin-only catalog. Changes apply to new quotations instantly.</p>

        <Tabs defaultValue="settings">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="settings">Margins & GST</TabsTrigger>
            <TabsTrigger value="price_modules">Modules</TabsTrigger>
            <TabsTrigger value="price_inverters">Inverters</TabsTrigger>
            <TabsTrigger value="price_structures">Structures</TabsTrigger>
            <TabsTrigger value="price_bos">BOS</TabsTrigger>
            <TabsTrigger value="price_labour">Labour</TabsTrigger>
            <TabsTrigger value="price_state_policies">State Policies</TabsTrigger>
            <TabsTrigger value="subsidy_slabs">Subsidy</TabsTrigger>
          </TabsList>

          <TabsContent value="settings"><SettingsEditor /></TabsContent>
          {(Object.keys(SCHEMAS) as TableKey[]).map((k) => (
            <TabsContent key={k} value={k}><CrudTable tableKey={k} /></TabsContent>
          ))}
        </Tabs>
      </div>
      <AppFooter />
    </div>
  );
}

function CrudTable({ tableKey }: { tableKey: TableKey }) {
  const schema = SCHEMAS[tableKey];
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase.from(tableKey).select("*").order("created_at", { ascending: true }).limit(500);
    if (error) toast.error(error.message);
    setRows(data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, [tableKey]);

  const update = (i: number, key: string, val: any) => setRows((rs) => rs.map((r, idx) => idx === i ? { ...r, [key]: val, _dirty: true } : r));
  const save = async (r: any) => {
    const { _dirty, ...rest } = r;
    const res = r.id
      ? await supabase.from(tableKey).update(rest).eq("id", r.id)
      : await supabase.from(tableKey).insert(rest);
    if (res.error) toast.error(res.error.message); else { toast.success("Saved"); load(); }
  };
  const del = async (id: string) => {
    if (!id) { setRows((rs) => rs.filter((r) => r.id)); return; }
    if (!confirm("Delete row?")) return;
    const { error } = await supabase.from(tableKey).delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <Card className="mt-4 overflow-x-auto">
      <div className="p-3 flex justify-between">
        <div className="font-semibold">{rows.length} rows</div>
        <Button size="sm" onClick={() => setRows((rs) => [...rs, { ...schema.defaults }])}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>
      {loading ? <div className="p-6 text-muted-foreground">Loading…</div> : (
        <Table>
          <TableHeader>
            <TableRow>
              {schema.cols.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id ?? `new-${i}`}>
                {schema.cols.map((c) => (
                  <TableCell key={c.key}>
                    <Input type={c.type ?? "text"} value={r[c.key] ?? ""} onChange={(e) => update(i, c.key, c.type === "number" ? +e.target.value : e.target.value)} className="h-8" />
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => save(r)} disabled={!r._dirty && r.id}><Save className="w-4 h-4 text-green-600" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function SettingsEditor() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { supabase.from("pricing_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setS(data)); }, []);
  if (!s) return <div className="mt-4 text-muted-foreground">Loading…</div>;
  const field = (key: string, label: string, suffix = "%") => (
    <div><div className="text-xs text-muted-foreground">{label} ({suffix})</div>
      <Input type="number" value={s[key]} onChange={(e) => setS({ ...s, [key]: +e.target.value })} /></div>
  );
  const save = async () => {
    const { error } = await supabase.from("pricing_settings").update(s).eq("id", 1);
    if (error) toast.error(error.message); else toast.success("Settings saved");
  };
  return (
    <Card className="mt-4 p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {field("company_margin_pct", "Company Margin")}
      {field("sales_margin_pct", "Sales Margin")}
      {field("channel_partner_margin_pct", "Channel Partner Margin")}
      {field("franchise_margin_pct", "Franchise Margin")}
      {field("gst_pct", "GST")}
      {field("design_charges_per_kw", "Design Charges", "₹/kW")}
      {field("installation_per_kw", "Installation", "₹/kW")}
      {field("logistics_per_kw", "Logistics", "₹/kW")}
      {field("statutory_per_kw", "Statutory Default", "₹/kW")}
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end"><Button onClick={save} className="bg-orange-500 hover:bg-orange-600"><Save className="w-4 h-4 mr-1" /> Save Settings</Button></div>
    </Card>
  );
}