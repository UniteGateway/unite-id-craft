import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Palette,
  Zap,
  Download,
  LayoutDashboard,
  LibraryBig,
  CheckCircle2,
  BookOpenCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import uniteSolarLogoSrc from "@/assets/unite-solar-logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import AppFooter from "@/components/AppFooter";
import { BANNERS } from "@/components/PageBanner";

/* Curated corporate imagery */
const IMG = {
  teamwork:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=70",
  designer:
    "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=70",
  presentation:
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1200&q=70",
  brand:
    "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=1200&q=70",
};

const benefits = [
  {
    icon: ShieldCheck,
    title: "100% On-Brand",
    desc: "Every template uses Unite Solar's approved colors, fonts and logos — no off-brand designs slip out.",
  },
  {
    icon: Zap,
    title: "Fast as Lightning",
    desc: "Generate ID cards, business cards and proposals in minutes, not hours.",
  },
  {
    icon: Palette,
    title: "AI Design Assist",
    desc: "Describe what you need and let the studio generate ready-to-edit templates.",
  },
  {
    icon: Download,
    title: "Print-Ready Exports",
    desc: "300 DPI PNG, PDF and 13×19 print sheets with crop marks & bleed included.",
  },
  {
    icon: LayoutDashboard,
    title: "Personal Dashboard",
    desc: "Save, edit and re-export every design you've ever created — in one place.",
  },
  {
    icon: LibraryBig,
    title: "Brand Library",
    desc: "Centralised library of approved templates kept in sync across the team.",
  },
];

const guidelines = [
  "Always use the official Unite Solar logo — never recolour or distort it.",
  "Stick to brand colours: Orange #f08c00, Dark Grey #3a3a3a, Logo Blue #1a3c6e.",
  "Use Inter font for all designs to keep typography consistent.",
  "Employee names appear in UPPERCASE bold; IDs use the format US-BA-XXX.",
  "Always preview before exporting and verify spelling, phone & email.",
  "Save your work to the Dashboard so it stays available for re-export.",
];

const Landing: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();

  const cta = () => nav(user ? "/home" : "/auth");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={uniteSolarLogoSrc} alt="Unite Solar" className="h-9 object-contain" />
            <span className="font-bold text-foreground hidden sm:block">
              Unite Solar Design Studio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button onClick={() => nav("/home")} size="sm">
                Open Studio <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => nav("/auth")}>
                  Sign in
                </Button>
                <Button size="sm" onClick={() => nav("/auth")}>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={BANNERS.landing}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background" />
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pt-16 md:pt-20 pb-20 md:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold mb-6 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Exclusive Unite Solar Design Studio
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
            Design anything.
            <br />
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-400 bg-clip-text text-transparent">
              On-brand. Instantly.
            </span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-foreground/85 max-w-2xl mx-auto">
            A Canva-style design hub built exclusively for the Unite Solar team — ID
            cards, business cards, flyers, brochures, presentations, proposals and
            more, all with one-click brand consistency.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={cta} className="text-base shadow-lg shadow-primary/30">
              {user ? "Open Studio" : "Login to enter Studio"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => nav("/auth")}
                className="backdrop-blur bg-background/60"
              >
                Create an account
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Why the studio */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
            Why Unite Solar Studio
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            Built for speed, locked to brand
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Every tool inside the studio is engineered so the Unite Solar team
            can produce professional, print-ready collateral without a designer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Image strip */}
      <section className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg aspect-[4/3]">
            <img
              src={IMG.designer}
              alt="Designer working on Unite Solar designs"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              For every team member
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
              From sales to ops — everyone designs like a pro
            </h2>
            <p className="mt-3 text-muted-foreground text-sm md:text-base">
              Whether you're handing out a business card, sending a client
              proposal, or printing a new batch of employee ID cards, the
              studio gives you on-brand templates ready to personalise.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                "ID cards with barcode & A4 print sheets",
                "Business cards with 13×19 print layout",
                "Solar proposals with auto pricing & ROI",
                "Social media posts & stories",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Employee guidelines */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2 inline-flex items-center gap-1.5">
              <BookOpenCheck className="h-3.5 w-3.5" />
              Employee guidelines
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
              Stay on-brand — every time
            </h2>
            <p className="mt-3 text-muted-foreground text-sm md:text-base">
              Follow these simple rules to make sure everything you produce
              represents Unite Solar with the same quality and consistency.
            </p>
            <ul className="mt-5 space-y-3">
              {guidelines.map((g, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground">{g}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 md:order-2 relative rounded-2xl overflow-hidden border border-border shadow-lg aspect-[4/3]">
            <img
              src={IMG.brand}
              alt="Unite Solar brand guidelines"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-primary/15 via-background to-background border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold mb-5">
            <Users className="h-3.5 w-3.5" />
            For Unite Solar team members
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Ready to design something{" "}
            <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              brilliant?
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Sign in with your Unite Solar account and the entire studio unlocks instantly.
          </p>
          <div className="mt-8">
            <Button size="lg" onClick={cta} className="text-base shadow-lg shadow-primary/30">
              {user ? "Open Studio" : "Sign in to continue"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
};

export default Landing;