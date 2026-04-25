import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SolarShell from "@/components/solar/SolarShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, FileText, Sun, TrendingUp } from "lucide-react";

interface Stats {
  total: number;
  totalCapacityMw: number;
  totalSavingsCr: number;
}

const SolarDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, totalCapacityMw: 0, totalSavingsCr: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("solar_proposals")
        .select("id, project_name, location, capacity_mw, computed, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      const rows = (data ?? []) as any[];
      setRecent(rows.slice(0, 5));
      setStats({
        total: rows.length,
        totalCapacityMw: rows.reduce((s, r) => s + (Number(r.capacity_mw) || 0), 0),
        totalSavingsCr: rows.reduce((s, r) => s + (Number(r.computed?.total_savings_cr) || 0), 0),
      });
    })();
  }, []);

  return (
    <SolarShell title="Dashboard">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Solar Studio</h1>
          <p className="text-sm text-muted-foreground">Generate, manage, and present solar proposals.</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/solar/generate"><Sparkles className="h-4 w-4" /> New Proposal</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<FileText className="h-4 w-4" />} label="Proposals" value={stats.total.toString()} />
        <StatCard icon={<Sun className="h-4 w-4" />} label="Total Capacity" value={`${stats.totalCapacityMw.toFixed(1)} MW`} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Cumulative Savings" value={`₹${stats.totalSavingsCr.toFixed(1)} Cr`} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Proposals</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/solar/proposals">View all</Link></Button>
        </div>
        {recent.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No proposals yet. <Link to="/solar/generate" className="text-primary underline">Generate your first proposal</Link>.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((r) => (
              <li key={r.id} className="py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{r.project_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {r.location ?? "—"} • {r.capacity_mw} MW • ₹{r.computed?.total_savings_cr ?? "—"} Cr savings
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/solar/proposals/${r.id}/summary`}>Open</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </SolarShell>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <Card className="p-4">
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
      {icon} {label}
    </div>
    <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
  </Card>
);

export default SolarDashboard;