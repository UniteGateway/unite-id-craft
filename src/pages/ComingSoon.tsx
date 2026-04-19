import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import PageBanner, { BANNERS } from "@/components/PageBanner";

const labels: Record<string, { title: string; desc: string }> = {
  flyers: { title: "Flyers", desc: "Eye-catching single-page promotional designs." },
  brochures: { title: "Brochures", desc: "Tri-fold and bi-fold print layouts." },
  presentations: { title: "Presentations", desc: "Branded PowerPoint pitch decks." },
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
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <PageBanner
          image={BANNERS.comingSoon}
          eyebrow="Coming soon"
          icon={<Sparkles className="h-3.5 w-3.5" />}
          title={meta.title}
          subtitle={meta.desc}
          height="md"
        />
      </div>
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
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
