import React from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import PageBanner, { BANNERS } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, CheckCircle2, Layers, ArrowRight } from "lucide-react";

interface SlideItem {
  n: number;
  title: string;
  desc: string;
}

const FIXED_SLIDES: SlideItem[] = [
  { n: 1, title: "About Unite Solar", desc: "Company intro, vision, expertise" },
  { n: 2, title: "Our Credentials & Trust", desc: "Projects executed, clients, experience" },
  { n: 3, title: "Project Showcase", desc: "Industrial / Residential / Commercial images" },
  { n: 4, title: "Business Models Overview", desc: "PPA / BOOT / Self Investment explanation" },
  { n: 5, title: "Community Investment Model", desc: "Concept stays same; numbers optional" },
  { n: 6, title: "Model Comparison", desc: "Table format stays same (numbers optional)" },
  { n: 7, title: "Environmental Impact", desc: "CO₂ benefits (mostly standard)" },
  { n: 8, title: "Why Unite Solar / Value Proposition", desc: "Strengths, USP" },
  { n: 9, title: "Conclusion & Call to Action", desc: "Generic closing (auto inserts project name)" },
];

const VARIABLE_SLIDES: SlideItem[] = [
  { n: 10, title: "Cover Page", desc: "Project Name, Location, Capacity, Savings highlight" },
  { n: 11, title: "Project Overview", desc: "Community name, custom description" },
  { n: 12, title: "Site & Location Analysis", desc: "Rooftop size, feasibility" },
  { n: 13, title: "Technical Overview", desc: "Capacity, system type, Net metering / Zero export" },
  { n: 14, title: "System Layout", desc: "Based on site (optional dynamic image)" },
  { n: 15, title: "Energy Generation Analysis", desc: "Monthly units, annual generation" },
  { n: 16, title: "Savings Potential", desc: "Yearly savings, long-term savings" },
  { n: 17, title: "ROI & Financial Analysis ⭐", desc: "Cost, savings, O&M, payback, IRR" },
  { n: 18, title: "Feasibility Report", desc: "Technical + financial feasibility" },
  { n: 19, title: "Implementation Timeline", desc: "Project-specific execution plan" },
];

const SlideRow: React.FC<{ s: SlideItem; tone: "fixed" | "variable" }> = ({ s, tone }) => (
  <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/40 transition-colors">
    <div
      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
        tone === "fixed"
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
      }`}
    >
      {s.n}
    </div>
    <div className="min-w-0">
      <h4 className="font-semibold text-sm text-foreground leading-tight">{s.title}</h4>
      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
    </div>
  </div>
);

const CreateProposal: React.FC = () => {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-5 md:py-6 pb-[env(safe-area-inset-bottom)]">
        <PageBanner
          image={BANNERS.studio}
          eyebrow="Proposal Engine"
          icon={<Sparkles className="h-3.5 w-3.5" />}
          title="Create Proposal"
          subtitle="Smart structure: Fixed brand slides + Variable project-specific slides."
          height="md"
          className="mb-6 md:mb-8"
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button size="lg" onClick={() => nav("/proposals")} className="gap-2">
            <Layers className="h-4 w-4" />
            Open Proposals
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => nav("/proposals")} className="gap-2">
            Start a New Proposal
          </Button>
        </div>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Fixed Slides — Reusable for all projects
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            No major data changes (only minor name/location swap if needed). These build brand trust + consistency.
          </p>
          <Card className="p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {FIXED_SLIDES.map((s) => (
                <SlideRow key={s.n} s={s} tone="fixed" />
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Variable Slides — Auto-generated per project
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            These must be dynamic — the core of your proposal engine.
          </p>
          <Card className="p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {VARIABLE_SLIDES.map((s) => (
                <SlideRow key={s.n} s={s} tone="variable" />
              ))}
            </div>
          </Card>
          <p className="text-xs text-muted-foreground mt-4">
            Share each slide's code & reference — they will be wired into this scaffold one by one.
          </p>
        </section>
      </main>
      <AppFooter />
    </div>
  );
};

export default CreateProposal;