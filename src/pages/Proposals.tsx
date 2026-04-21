import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import PageBanner, { BANNERS } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, FileSignature, Trash2, Loader2, Pencil, Copy, Building2, Home, Sparkles } from "lucide-react";
import { inr } from "@/lib/proposal-calc";
import { RESIDENTIAL_KW_OPTIONS } from "@/lib/residential-presets";

interface Row {
  id: string;
  title: string;
  client_name: string | null;
  client_location: string | null;
  capacity_kw: number | null;
  computed: any;
  updated_at: string;
}

interface CommunityRow {
  id: string;
  title: string;
  community_name: string | null;
  location: string | null;
  theme: string | null;
  computed: any;
  updated_at: string;
}

interface ResidentialRow {
  id: string;
  title: string;
  client_name: string | null;
  client_location: string | null;
  capacity_kw: number | null;
  is_customised: boolean | null;
  computed: any;
  updated_at: string;
}

const ProposalsList: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [communityRows, setCommunityRows] = useState<CommunityRow[]>([]);
  const [residentialRows, setResidentialRows] = useState<ResidentialRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data, error }, { data: cData, error: cErr }, { data: rData, error: rErr }] = await Promise.all([
      supabase
        .from("proposals")
        .select("id,title,client_name,client_location,capacity_kw,computed,updated_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("community_proposals")
        .select("id,title,community_name,location,theme,computed,updated_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("residential_proposals")
        .select("id,title,client_name,client_location,capacity_kw,is_customised,computed,updated_at")
        .order("updated_at", { ascending: false }),
    ]);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    if (cErr) { toast.error(cErr.message); return; }
    if (rErr) { toast.error(rErr.message); return; }
    setRows((data as any) || []);
    setCommunityRows((cData as any) || []);
    setResidentialRows((rData as any) || []);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Delete this proposal?")) return;
    const { error } = await supabase.from("proposals").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const removeCommunity = async (id: string) => {
    if (!confirm("Delete this community proposal?")) return;
    const { error } = await supabase.from("community_proposals").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const removeResidential = async (id: string) => {
    if (!confirm("Delete this residential proposal?")) return;
    const { error } = await supabase.from("residential_proposals").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const duplicate = async (id: string) => {
    if (!user) return;
    const { data: src, error: fetchErr } = await supabase
      .from("proposals").select("*").eq("id", id).maybeSingle();
    if (fetchErr || !src) { toast.error(fetchErr?.message || "Not found"); return; }
    const { id: _id, created_at, updated_at, proposal_number, ...rest } = src as any;
    const insertRow = {
      ...rest,
      user_id: user.id,
      title: `${src.title || "Untitled"} (Copy)`,
      status: "draft",
    };
    const { data: created, error: insErr } = await supabase
      .from("proposals").insert(insertRow).select("id").single();
    if (insErr) { toast.error(insErr.message); return; }
    toast.success("Duplicated");
    nav(`/proposals/${created.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
              <FileSignature className="h-3.5 w-3.5" /> Solar Proposals
            </div>
            <h1 className="text-3xl font-extrabold">Project Proposals</h1>
            <p className="text-sm text-muted-foreground">Industrial proposals and AI-generated decks for gated communities.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
        <Tabs defaultValue="residential" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mb-6">
            <TabsTrigger value="industrial"><FileSignature className="h-3.5 w-3.5 mr-1.5" /> Industrial</TabsTrigger>
            <TabsTrigger value="residential"><Home className="h-3.5 w-3.5 mr-1.5" /> Residential</TabsTrigger>
            <TabsTrigger value="community"><Building2 className="h-3.5 w-3.5 mr-1.5" /> Communities</TabsTrigger>
          </TabsList>

          <TabsContent value="industrial">
            <div className="flex justify-end mb-4">
              <Button onClick={() => nav("/proposals/new")}><Plus className="h-4 w-4" /> New proposal</Button>
            </div>
            {rows.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <FileSignature className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No proposals yet.</p>
                <Button onClick={() => nav("/proposals/new")}><Plus className="h-4 w-4" /> Create your first proposal</Button>
              </CardContent></Card>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((r) => (
              <Card key={r.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">{r.title || "Untitled"}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.client_name || "—"} · {r.client_location || "—"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="rounded-md bg-muted p-2">
                      <div className="text-muted-foreground">Capacity</div>
                      <div className="font-bold">{r.capacity_kw || 0} kW</div>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-bold">{inr(r.computed?.totalCost || 0)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => nav(`/proposals/${r.id}`)}>
                      <Pencil className="h-3.5 w-3.5" /> Open
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => duplicate(r.id)}>
                      <Copy className="h-3.5 w-3.5" /> Duplicate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
            )}
          </TabsContent>

          <TabsContent value="community">
            {/* placeholder anchor — residential tab inserted just above */}
            <div className="flex justify-end mb-4">
              <Button onClick={() => nav("/proposals/community/new")}>
                <Plus className="h-4 w-4" /> New community proposal
              </Button>
            </div>
            {communityRows.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No community proposals yet.</p>
                <Button onClick={() => nav("/proposals/community/new")}>
                  <Plus className="h-4 w-4" /> Create AI-generated community deck
                </Button>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communityRows.map((r) => (
                  <Card key={r.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h3 className="font-bold truncate">{r.title || "Untitled"}</h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {r.community_name || "—"} · {r.location || "—"}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeCommunity(r.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div className="rounded-md bg-muted p-2">
                          <div className="text-muted-foreground">Capacity</div>
                          <div className="font-bold">{r.computed?.recommendedCapacityKw || 0} kW</div>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <div className="text-muted-foreground">Theme</div>
                          <div className="font-bold truncate">{r.theme || "—"}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => nav(`/proposals/community/${r.id}`)}>
                        <Pencil className="h-3.5 w-3.5" /> Open
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        )}
      </main>
    </div>
  );
};

export default ProposalsList;
