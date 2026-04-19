import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Contact,
  FileImage,
  BookOpen,
  Presentation,
  FileSignature,
  Mail,
  Sparkles,
  LayoutDashboard,
  LibraryBig,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import uniteSolarLogoSrc from "@/assets/unite-solar-logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import { BANNERS } from "@/components/PageBanner";

interface Tile {
  icon: React.ElementType;
  title: string;
  desc: string;
  to: string;
  hue: string; // tailwind gradient classes
  ready?: boolean;
}

const tiles: Tile[] = [
  { icon: CreditCard, title: "ID Cards", desc: "Employee badges, barcodes, A4 sheets", to: "/id-cards", hue: "from-orange-500 to-amber-400", ready: true },
  { icon: Contact, title: "Business Cards", desc: "3.5×2 visiting cards, 13×19 print", to: "/visiting-cards", hue: "from-blue-600 to-cyan-400", ready: true },
  { icon: FileImage, title: "Flyers", desc: "Single-page promotional designs", to: "/coming-soon?type=flyers", hue: "from-pink-500 to-rose-400" },
  { icon: BookOpen, title: "Brochures", desc: "Tri-fold & bi-fold layouts", to: "/coming-soon?type=brochures", hue: "from-emerald-500 to-teal-400" },
  { icon: Presentation, title: "Presentations", desc: "Pitch decks & PPT templates", to: "/coming-soon?type=presentations", hue: "from-violet-600 to-fuchsia-400" },
  { icon: FileSignature, title: "Proposals", desc: "Client proposals with pricing", to: "/coming-soon?type=proposals", hue: "from-indigo-600 to-blue-400" },
  { icon: Mail, title: "Letterheads", desc: "Branded letterhead stationery", to: "/coming-soon?type=letterheads", hue: "from-yellow-500 to-orange-400" },
];

const Landing: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();

  const goAuthOrHome = () => nav(user ? "/home" : "/auth");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/70 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={uniteSolarLogoSrc} alt="Unite Solar" className="h-9 object-contain" />
            <span className="font-bold text-foreground hidden sm:block">
              Unite Solar Design Studio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button onClick={() => nav("/home")}>
                Open Studio <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => nav("/auth")}>Sign in</Button>
                <Button onClick={() => nav("/auth")}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero with banner image */}
      <section className="relative overflow-hidden">
        <img
          src={BANNERS.landing}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold mb-6 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Exclusive Unite Solar Design Branding App
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
            letterheads with one click brand consistency.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={goAuthOrHome} className="text-base shadow-lg shadow-primary/30">
              {user ? "Open Studio" : "Login to enter Studio"} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => nav("/id-cards")} className="backdrop-blur bg-background/60">
              Try ID Cards (no login)
            </Button>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-xl font-bold text-foreground mb-1">What will you create today?</h2>
        <p className="text-sm text-muted-foreground mb-6">Pick a category to start designing</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.title}
                onClick={() => nav(t.ready ? t.to : t.to)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${t.hue} transition-opacity`} />
                <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${t.hue} text-white flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="relative flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{t.title}</h3>
                  {!t.ready && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Soon
                    </span>
                  )}
                </div>
                <p className="relative text-xs text-muted-foreground mt-1">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tools strip */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
            <LibraryBig className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Brand Library</h4>
              <p className="text-xs text-muted-foreground mt-1">All approved Unite Solar templates in one place.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
            <LayoutDashboard className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Personal Dashboard</h4>
              <p className="text-xs text-muted-foreground mt-1">Save, edit and re-export every design you make.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Export PDF & PPT</h4>
              <p className="text-xs text-muted-foreground mt-1">Print-ready 13×19 PDFs with crop marks & bleed.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">Unite Developers Global Inc</span>
        </p>
      </footer>
    </div>
  );
};

export default Landing;
