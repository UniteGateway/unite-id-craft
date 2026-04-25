import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SolarShell from "@/components/solar/SolarShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Sparkles, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const SolarMyProposals: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("solar_proposals")
      .select("id, project_name, location, capacity_mw, computed, investment_model, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as any[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this proposal?")) return;
    const { error } = await supabase.from("solar_proposals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const filtered = rows.filter((r) =>
    !q || `${r.project_name} ${r.location ?? ""}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <SolarShell title="My Proposals">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">My Proposals</h1>
        <Button asChild className="gap-2">
          <Link to="/solar/generate"><Sparkles className="h-4 w-4" /> New Proposal</Link>
        </Button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
          placeholder="Search by project name or location"
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {rows.length === 0
            ? <>No proposals yet. <Link to="/solar/generate" className="text-primary underline">Generate your first one</Link>.</>
            : "No proposals match your search."}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <Card key={r.id} className="p-4 flex flex-col">
              <div className="font-semibold truncate">{r.project_name}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {r.location ?? "—"} • {r.capacity_mw} MW • {r.investment_model ?? "—"}
              </div>
              <div className="mt-2 text-xs">
                ₹{r.computed?.project_cost_cr ?? "—"} Cr cost • ₹{r.computed?.total_savings_cr ?? "—"} Cr savings
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()}
              </div>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="outline" className="gap-1 flex-1">
                  <Link to={`/solar/proposals/${r.id}/summary`}><Eye className="h-3.5 w-3.5" /> Open</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </SolarShell>
  );
};

export default SolarMyProposals;