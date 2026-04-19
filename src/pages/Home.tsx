import React from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/AppNav";
import { useAuth } from "@/hooks/useAuth";
import {
  CreditCard,
  Contact,
  FileImage,
  BookOpen,
  Presentation,
  FileSignature,
  Mail,
  LibraryBig,
  LayoutDashboard,
  Sparkles,
  Instagram,
  ShieldCheck,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface Tile {
  icon: React.ElementType;
  title: string;
  desc: string;
  to: string;
  hue: string;
  ready?: boolean;
}

const designTiles: Tile[] = [
  { icon: CreditCard, title: "ID Cards", desc: "Employee badges", to: "/id-cards", hue: "from-orange-500 to-amber-400", ready: true },
  { icon: Contact, title: "Business Cards", desc: "Visiting cards", to: "/visiting-cards", hue: "from-blue-600 to-cyan-400", ready: true },
  { icon: Instagram, title: "Social Media", desc: "Instagram posts & stories", to: "/social-media", hue: "from-fuchsia-500 to-pink-500", ready: true },
  { icon: FileImage, title: "Flyers", desc: "Single-page promos", to: "/coming-soon?type=flyers", hue: "from-pink-500 to-rose-400" },
  { icon: BookOpen, title: "Brochures", desc: "Tri-fold layouts", to: "/coming-soon?type=brochures", hue: "from-emerald-500 to-teal-400" },
  { icon: Presentation, title: "Presentations", desc: "Pitch decks (PPT)", to: "/coming-soon?type=presentations", hue: "from-violet-600 to-fuchsia-400" },
  { icon: FileSignature, title: "Proposals", desc: "Solar project proposals", to: "/proposals", hue: "from-indigo-600 to-blue-400", ready: true },
  { icon: Mail, title: "Letterheads", desc: "Stationery", to: "/coming-soon?type=letterheads", hue: "from-yellow-500 to-orange-400" },
];

const workTiles: Tile[] = [
  { icon: LibraryBig, title: "Library", desc: "Brand template library", to: "/visiting-cards?tab=library", hue: "from-slate-700 to-slate-500", ready: true },
  { icon: LayoutDashboard, title: "Dashboard", desc: "Your saved designs", to: "/dashboard", hue: "from-zinc-800 to-zinc-600", ready: true },
];

const Tile: React.FC<{ tile: Tile; onClick: () => void }> = ({ tile, onClick }) => {
  const Icon = tile.icon;
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${tile.hue} transition-opacity`} />
      <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${tile.hue} text-white flex items-center justify-center mb-4`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="relative flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{tile.title}</h3>
        {!tile.ready && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Soon</span>
        )}
      </div>
      <p className="relative text-xs text-muted-foreground mt-1">{tile.desc}</p>
    </button>
  );
};

const Home: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const visibleWorkTiles = isAdmin
    ? [...workTiles, { icon: ShieldCheck, title: "Admin", desc: "API keys & brand library", to: "/admin", hue: "from-emerald-600 to-teal-500", ready: true } as Tile]
    : workTiles;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Exclusive Unite Solar Studio
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
            Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a tool below to start designing on-brand.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Create
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {designTiles.map((t) => (
              <Tile key={t.title} tile={t} onClick={() => nav(t.to)} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Your work
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {visibleWorkTiles.map((t) => (
              <Tile key={t.title} tile={t} onClick={() => nav(t.to)} />
            ))}
          </div>
        </section>
      </main>

      <footer className="py-6 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">Unite Developers Global Inc</span>
        </p>
      </footer>
    </div>
  );
};

export default Home;
