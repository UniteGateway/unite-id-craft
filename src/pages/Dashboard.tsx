import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import PageBanner, { BANNERS } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Printer, Loader2, Mail, FileText } from "lucide-react";
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

interface LetterRow {
  id: string;
  category: string;
  template_name: string | null;
  subject: string;
  to_org: string | null;
  to_name: string | null;
  client_email: string | null;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [cards, setCards] = useState<CardRow[]>([]);
  const [letters, setLetters] = useState<LetterRow[]>([]);
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
      const { data: lData, error: lErr } = await supabase
        .from("covering_letters")
        .select("id, category, template_name, subject, to_org, to_name, client_email, created_at")
        .order("created_at", { ascending: false });
      if (lErr) toast.error(lErr.message);
      else setLetters((lData as any) || []);
      setBusy(false);
    })();
  }, [user]);

  const removeLetter = async (id: string) => {
    if (!confirm("Delete this letter?")) return;
    await supabase.from("covering_letters").delete().eq("id", id);
    setLetters((p) => p.filter((l) => l.id !== id));
  };

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

        {/* COVERING LETTERS HISTORY */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Covering Letters
              </h2>
              <p className="text-sm text-muted-foreground">All letters you have saved.</p>
            </div>
            <Button onClick={() => nav("/covering-letters")} variant="outline">
              <Plus className="h-4 w-4" /> New letter
            </Button>
          </div>

          {letters.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center text-muted-foreground text-sm">
              No saved letters yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {letters.map((l) => (
                <div key={l.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start gap-2">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l.category.replace("_", " ")}</div>
                      <div className="font-semibold text-sm truncate">{l.template_name || l.subject}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        To: {l.to_name || l.to_org || "—"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(l.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => nav(`/covering-letters/${l.category}`)}>
                      <Edit className="h-3.5 w-3.5" /> Open
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeLetter(l.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
