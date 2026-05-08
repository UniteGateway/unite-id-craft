import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AppNav from "@/components/AppNav";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Layers, ImagePlus, Palette, Home, Tag, FileText,
  LayoutTemplate, Key, Users, FileSignature, Activity, ArrowRight, Loader2,
} from "lucide-react";

interface SectionDef {
  key: string;
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
  countKey?: keyof Counts;
}

interface Counts {
  fixed_slides: number;
  brand_assets: number;
  brand_palettes: number;
  residential_presets: number;
  residential_offers: number;
  design_templates: number;
  admin_users: number;
  proposals_total: number;
}

const SECTIONS: SectionDef[] = [
  { key: "fixed-slides", title: "Fixed Slides", description: "About, Credentials, CTA & shared deck slides.", icon: Layers, to: "/admin#fixed-slides", countKey: "fixed_slides" },
  { key: "brand-assets", title: "Brand Assets", description: "Logos and approved imagery library.", icon: ImagePlus, to: "/admin#brand-assets", countKey: "brand_assets" },
  { key: "palettes", title: "Brand Palettes", description: "Named color palettes for editors.", icon: Palette, to: "/admin#palettes", countKey: "brand_palettes" },
  { key: "residential-presets", title: "Residential Presets", description: "1–10 kW preset configurations.", icon: Home, to: "/admin#residential-presets", countKey: "residential_presets" },
  { key: "residential-offers", title: "Residential Offers", description: "Active discounts and freebies.", icon: Tag, to: "/admin#residential-offers", countKey: "residential_offers" },
  { key: "proposal-settings", title: "Proposal Settings", description: "Warranties, AMC and general T&C.", icon: FileText, to: "/admin#proposal-settings" },
  { key: "design-templates", title: "Design Templates", description: "ID, visiting & social templates.", icon: LayoutTemplate, to: "/designs/id", countKey: "design_templates" },
  { key: "api-keys", title: "API Keys", description: "OpenAI / Gemini provider credentials.", icon: Key, to: "/admin#api-keys" },
  { key: "users", title: "Users & Roles", description: "Grant or revoke admin access.", icon: Users, to: "/admin#users", countKey: "admin_users" },
];

const ACTIVITY_SOURCES = [
  { table: "brand_assets", label: "Brand Asset", to: "/admin#brand-assets", nameField: "name" },
  { table: "fixed_slides", label: "Fixed Slide", to: "/admin#fixed-slides", nameField: "title" },
  { table: "design_templates", label: "Template", to: "/admin#design-templates", nameField: "name" },
  { table: "solar_proposals", label: "Solar Proposal", to: "/solar/proposals", nameField: "project_name" },
] as const;

const AdminHub: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [activity, setActivity] = useState<Array<{ id: string; label: string; name: string; created_at: string; to: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      const headCount = (table: string) =>
        (supabase.from(table as any).select("id", { count: "exact", head: true }) as any);

      const [
        fs, ba, bp, rp, ro, dt, au, p1, p2, p3, p4,
      ] = await Promise.all([
        headCount("fixed_slides"),
        headCount("brand_assets"),
        headCount("brand_palettes"),
        headCount("residential_presets"),
        headCount("residential_offers"),
        headCount("design_templates"),
        (supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin") as any),
        headCount("proposals"),
        headCount("community_proposals"),
        headCount("residential_proposals"),
        headCount("solar_proposals"),
      ]);

      setCounts({
        fixed_slides: fs.count ?? 0,
        brand_assets: ba.count ?? 0,
        brand_palettes: bp.count ?? 0,
        residential_presets: rp.count ?? 0,
        residential_offers: ro.count ?? 0,
        design_templates: dt.count ?? 0,
        admin_users: au.count ?? 0,
        proposals_total:
          (p1.count ?? 0) + (p2.count ?? 0) + (p3.count ?? 0) + (p4.count ?? 0),
      });

      // Recent activity — pull latest from each source, merge.
      const results = await Promise.all(
        ACTIVITY_SOURCES.map((src) =>
          supabase
            .from(src.table as any)
            .select(`id, ${src.nameField}, created_at`)
            .order("created_at", { ascending: false })
            .limit(5),
        ),
      );
      const merged: typeof activity = [];
      results.forEach((r, i) => {
        const src = ACTIVITY_SOURCES[i];
        (r.data ?? []).forEach((row: any) => {
          merged.push({
            id: `${src.table}-${row.id}`,
            label: src.label,
            name: row[src.nameField] ?? "Untitled",
            created_at: row.created_at,
            to: src.to,
          });
        });
      });
      merged.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      setActivity(merged.slice(0, 10));
      setLoading(false);
    })();
  }, [isAdmin]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;

  const fmtTime = (iso: string) => {
    const diff = Date.now() - +new Date(iso);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">Studio Administration</h1>
            <p className="text-sm text-muted-foreground mt-1">All shared resources, uploads and template managers in one place.</p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin"><FileSignature className="h-4 w-4" /> Open full admin page</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Proposals" value={counts?.proposals_total} icon={<FileSignature className="h-4 w-4" />} />
          <StatCard label="Brand Assets" value={counts?.brand_assets} icon={<ImagePlus className="h-4 w-4" />} />
          <StatCard label="Fixed Slides" value={counts?.fixed_slides} icon={<Layers className="h-4 w-4" />} />
          <StatCard label="Admin Users" value={counts?.admin_users} icon={<Users className="h-4 w-4" />} />
        </div>

        {/* Sections grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const count = s.countKey && counts ? counts[s.countKey] : null;
            return (
              <Link key={s.key} to={s.to} className="group">
                <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      {count !== null && count !== undefined && (
                        <Badge variant="secondary" className="tabular-nums">{count}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-3">{s.title}</CardTitle>
                    <CardDescription className="text-xs">{s.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs font-medium text-primary inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      Open <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4" /> Recent Activity</CardTitle>
            <CardDescription>Latest uploads, slides, templates and proposals across the studio.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((a) => (
                  <li key={a.id} className="py-2.5 flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0">{a.label}</Badge>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{fmtTime(a.created_at)}</div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={a.to}>Open</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value?: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <Card className="p-4">
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
      {icon} {label}
    </div>
    <div className="text-2xl font-bold mt-1 tabular-nums">
      {value ?? <Loader2 className="h-4 w-4 animate-spin inline text-muted-foreground" />}
    </div>
  </Card>
);

export default AdminHub;