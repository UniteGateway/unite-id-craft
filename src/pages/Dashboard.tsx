import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import PageBanner, { BANNERS } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportPrintSheet, loadCard, type CardZone } from "@/lib/visiting-card-print";

interface CardRow {
  id: string;
  title: string;
  field_values: Record<string, string>;
  created_at: string;
  visiting_card_templates: {
    image_url: string;
    field_zones: CardZone[];
  } | null;
}

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [cards, setCards] = useState<CardRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav("/auth");
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setBusy(true);
      const { data, error } = await supabase
        .from("visiting_cards")
        .select("id, title, field_values, created_at, visiting_card_templates(image_url, field_zones)")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setCards((data as any) || []);
      setBusy(false);
    })();
  }, [user]);

  const removeCard = async (id: string) => {
    if (!confirm("Delete this card?")) return;
    await supabase.from("visiting_cards").delete().eq("id", id);
    setCards((p) => p.filter((c) => c.id !== id));
  };

  const printAll = async () => {
    if (!cards.length) return;
    setPrinting(true);
    try {
      const renderable = await Promise.all(
        cards
          .filter((c) => c.visiting_card_templates)
          .map((c) =>
            loadCard(
              c.visiting_card_templates!.image_url,
              c.visiting_card_templates!.field_zones,
              c.field_values,
            ),
          ),
      );
      const r = await exportPrintSheet(renderable, "all-cards-13x19.pdf");
      toast.success(`Sheet ready · ${r.cols}×${r.rows} per sheet`);
    } catch (e: any) {
      toast.error(e.message);
    }
    setPrinting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Visiting Cards</h1>
            <p className="text-sm text-muted-foreground">Saved card history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={printAll} disabled={!cards.length || printing}>
              {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              Print all (13×19)
            </Button>
            <Button onClick={() => nav("/visiting-cards")}>
              <Plus className="h-4 w-4" /> New card
            </Button>
          </div>
        </div>

        {busy ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border p-12 text-center text-muted-foreground">
            No cards yet. Create your first one!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="aspect-[3.5/2] relative bg-muted">
                  {c.visiting_card_templates?.image_url && (
                    <img
                      src={c.visiting_card_templates.image_url}
                      alt={c.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" onClick={() => nav(`/visiting-cards?edit=${c.id}`)}>
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeCard(c.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
