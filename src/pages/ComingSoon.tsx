import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

const labels: Record<string, { title: string; desc: string }> = {
  flyers: { title: "Flyers", desc: "Eye-catching single-page promotional designs." },
  brochures: { title: "Brochures", desc: "Tri-fold and bi-fold print layouts." },
  presentations: { title: "Presentations", desc: "Branded PowerPoint pitch decks." },
  proposals: { title: "Proposals", desc: "Client proposals with pricing tables." },
  letterheads: { title: "Letterheads", desc: "Corporate stationery letterheads." },
};

const ComingSoon: React.FC = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const type = params.get("type") || "";
  const meta = labels[type] || { title: "Coming Soon", desc: "This module is on its way." };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Coming soon
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{meta.title}</h1>
        <p className="text-muted-foreground mt-3">{meta.desc}</p>
        <p className="text-sm text-muted-foreground mt-6">
          We're crafting AI-powered templates and a drag-and-drop editor for{" "}
          <span className="font-semibold text-foreground">{meta.title.toLowerCase()}</span>. Stay
          tuned — it'll plug straight into your Library &amp; Dashboard.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <Button variant="outline" onClick={() => nav(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={() => nav("/home")}>Go to Studio</Button>
        </div>
      </main>
    </div>
  );
};

export default ComingSoon;
