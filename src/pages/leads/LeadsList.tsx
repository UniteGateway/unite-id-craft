import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SolarShell from "@/components/solar/SolarShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["new", "feasibility", "design", "quoted", "won", "lost"] as const;
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-600",
  feasibility: "bg-amber-500/15 text-amber-600",
  design: "bg-purple-500/15 text-purple-600",
  quoted: "bg-orange-500/15 text-orange-600",
  won: "bg-green-500/15 text-green-600",
  lost: "bg-muted text-muted-foreground",
};

interface LeadRow {
  id: string; name: string; phone: string | null; email: string | null;
  segment: string; city: string | null; state: string | null;
  sanction_load_kw: number | null; status: string; created_at: string;
}

export default function LeadsList() {
  const nav = useNavigate();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("id,name,phone,email,segment,city,state,sanction_load_kw,status,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows((data ?? []) as LeadRow[]);
    setLoading(false);
  }

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = rows.filter((r) => r.status === s).length; return acc;
  }, {});
  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <SolarShell title="Leads">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Lead Pipeline</h1>
          <p className="text-sm text-muted-foreground">Capture → Bill OCR → Feasibility → Design → Quote</p>
        </div>
        <Button onClick={() => nav("/leads/new")} className="gap-2 bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4" /> New Lead
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filter === "all" ? "bg-foreground text-background" : "bg-card"}`}>
          All ({rows.length})
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${filter === s ? "bg-foreground text-background" : "bg-card"}`}>
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-sm text-muted-foreground mb-3">No leads yet.</div>
          <Button onClick={() => nav("/leads/new")} className="gap-2"><Plus className="h-4 w-4" /> Create first lead</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <Link key={r.id} to={`/leads/${r.id}`}
              className="block rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="font-semibold truncate">{r.name}</div>
                <Badge className={STATUS_COLORS[r.status] ?? ""} variant="secondary">{r.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{r.segment} {r.sanction_load_kw ? `· ${r.sanction_load_kw} kW` : ""}</div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {r.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {r.phone}</div>}
                {r.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {r.email}</div>}
                {(r.city || r.state) && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {[r.city, r.state].filter(Boolean).join(", ")}</div>}
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 text-foreground">Open <ArrowRight className="h-3 w-3" /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </SolarShell>
  );
}