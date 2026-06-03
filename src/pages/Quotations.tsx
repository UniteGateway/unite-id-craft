import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText, Trash2 } from "lucide-react";
import { inr } from "@/lib/pricing";
import { toast } from "sonner";

export default function Quotations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("quotations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setRows(data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const del = async (id: string) => {
    if (!confirm("Delete this quotation?")) return;
    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Quotations</h1>
            <p className="text-sm text-muted-foreground">Dynamic solar EPC quotations powered by your live price book.</p>
          </div>
          <Button onClick={() => navigate("/quotations/new")} className="bg-orange-500 hover:bg-orange-600"><Plus className="w-4 h-4 mr-1" /> New Quotation</Button>
        </div>

        {loading ? <div className="text-muted-foreground">Loading…</div> :
         rows.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
            No quotations yet. Click <strong>New Quotation</strong> to generate your first dynamic EPC quote.
          </Card>
        ) : (
          <div className="grid gap-3">
            {rows.map((r) => (
              <Card key={r.id} className="p-4 flex items-center justify-between hover:shadow-md transition">
                <Link to={`/quotations/${r.id}`} className="flex-1">
                  <div className="font-semibold">{r.customer_name}{r.company_name ? ` — ${r.company_name}` : ""}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.project_type} • {r.capacity_kw} kW • {r.city || r.state} • {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </div>
                </Link>
                <div className="text-right mr-4">
                  <div className="font-bold text-orange-600">{inr(r.net_to_customer)}</div>
                  <div className="text-xs text-muted-foreground">net to customer</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </Card>
            ))}
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}