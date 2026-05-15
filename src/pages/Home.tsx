import React from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/AppNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard,
  Contact,
  FileImage,
  BookOpen,
  Presentation,
  FileSignature,
  Mail,
  Receipt,
  Ticket,
  LibraryBig,
  LayoutDashboard,
  Sparkles,
  Instagram,
  ShieldCheck,
  Users,
  Wand2,
  Gauge,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import PageBanner, { BANNERS } from "@/components/PageBanner";
import AppFooter from "@/components/AppFooter";

interface Tile {
  icon: React.ElementType;
  title: string;
  desc: string;
  to: string;
  hue: string;
  image: string;
  ready?: boolean;
}

// Curated royalty-free Unsplash thumbnails — corporate, on-brand
const IMG = {
  idCards: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=70",
  visiting: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=70",
  social: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=70",
  flyer: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=70",
  brochure: "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=70",
  presentation: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=800&q=70",
  proposals: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=70",
  letterhead: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=70",
  envelope: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?auto=format&fit=crop&w=800&q=70",
  billbook: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=70",
  voucher: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=70",
  library: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=70",
  dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=70",
  admin: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=70",
  crm: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=800&q=70",
  createProposal: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=70",
  feasibility: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=70",
};

const designTiles: Tile[] = [
  { icon: CreditCard, title: "ID Cards", desc: "Employee badges", to: "/id-cards", hue: "from-orange-500 to-amber-400", image: IMG.idCards, ready: true },
  { icon: Contact, title: "Business Cards", desc: "Visiting cards", to: "/visiting-cards", hue: "from-blue-600 to-cyan-400", image: IMG.visiting, ready: true },
  { icon: Instagram, title: "Social Media", desc: "Instagram posts & stories", to: "/social-media", hue: "from-fuchsia-500 to-pink-500", image: IMG.social, ready: true },
  { icon: FileImage, title: "Flyers", desc: "Single-page promos", to: "/designs/flyer", hue: "from-pink-500 to-rose-400", image: IMG.flyer, ready: true },
  { icon: BookOpen, title: "Brochures", desc: "Tri-fold layouts", to: "/designs/brochure", hue: "from-emerald-500 to-teal-400", image: IMG.brochure, ready: true },
  { icon: Presentation, title: "Presentations", desc: "Pitch decks", to: "/designs/presentation", hue: "from-violet-600 to-fuchsia-400", image: IMG.presentation, ready: true },
  { icon: FileSignature, title: "Proposals", desc: "Solar project proposals", to: "/proposals", hue: "from-indigo-600 to-blue-400", image: IMG.proposals, ready: true },
  { icon: Wand2, title: "Create Proposal", desc: "Smart fixed + variable slides", to: "/create-proposal", hue: "from-amber-500 to-orange-500", image: IMG.createProposal, ready: true },
  { icon: Gauge, title: "Feasibility Analysis", desc: "AI report from power bill", to: "/solar/feasibility", hue: "from-green-500 to-yellow-400", image: IMG.feasibility, ready: true },
  { icon: Users, title: "CRM", desc: "Customer relationship manager", to: "https://crm.unitesolar.in", hue: "from-teal-600 to-emerald-400", image: IMG.crm, ready: true },
  { icon: Users, title: "CRM Portal", desc: "Open crm.unitesolar.in", to: "https://crm.unitesolar.in", hue: "from-emerald-600 to-teal-500", image: IMG.crm, ready: true },
];

const stationeryTiles: Tile[] = [
  { icon: Mail, title: "Letterheads", desc: "Corporate stationery", to: "/designs/letterhead", hue: "from-yellow-500 to-orange-400", image: IMG.letterhead, ready: true },
  { icon: Mail, title: "Envelopes", desc: "#10 business envelopes", to: "/designs/envelope", hue: "from-amber-500 to-orange-500", image: IMG.envelope, ready: true },
  { icon: Receipt, title: "Billbooks", desc: "Invoices & bills", to: "/designs/billbook", hue: "from-sky-600 to-blue-500", image: IMG.billbook, ready: true },
  { icon: Ticket, title: "Vouchers", desc: "Coupons & gift vouchers", to: "/designs/voucher", hue: "from-rose-500 to-red-400", image: IMG.voucher, ready: true },
];

const workTiles: Tile[] = [
  { icon: LibraryBig, title: "Library", desc: "Brand template library", to: "/visiting-cards?tab=library", hue: "from-slate-700 to-slate-500", image: IMG.library, ready: true },
  { icon: LayoutDashboard, title: "Dashboard", desc: "Your saved designs", to: "/dashboard", hue: "from-zinc-800 to-zinc-600", image: IMG.dashboard, ready: true },
];

const Tile: React.FC<{ tile: Tile; onClick: () => void }> = ({ tile, onClick }) => {
  const Icon = tile.icon;
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/40"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={tile.image}
          alt={tile.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Subtle dark gradient for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {/* Brand tint on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-25 bg-gradient-to-br ${tile.hue} transition-opacity`} />
        {/* Icon chip */}
        <div className={`absolute top-3 left-3 w-9 h-9 rounded-lg bg-white/95 backdrop-blur text-foreground flex items-center justify-center shadow-md`}>
          <Icon className="h-4 w-4" />
        </div>
        {!tile.ready && (
          <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-foreground font-semibold">
            Soon
          </span>
        )}
      </div>
      {/* Caption */}
      <div className="px-4 py-3 border-t border-border">
        <h3 className="font-semibold text-foreground text-sm leading-tight">{tile.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tile.desc}</p>
      </div>
    </button>
  );
};

const Home: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const visibleWorkTiles = isAdmin
    ? [...workTiles, { icon: ShieldCheck, title: "Admin", desc: "API keys & brand library", to: "/admin", hue: "from-emerald-600 to-teal-500", image: IMG.admin, ready: true } as Tile]
    : workTiles;

  const trackClick = (tile: Tile) => {
    // Fire-and-forget; ignore errors so navigation is never blocked
    supabase
      .from("tile_clicks")
      .insert({
        tile_key: tile.title,
        destination: tile.to,
        user_id: user?.id ?? null,
      })
      .then(() => {})
      .then(undefined, () => {});
  };

  const handleTileClick = (tile: Tile) => {
    trackClick(tile);
    if (tile.to.startsWith("http")) {
      window.open(tile.to, "_blank", "noopener,noreferrer");
    } else {
      nav(tile.to);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-5 md:py-6 pb-[env(safe-area-inset-bottom)]">
        <PageBanner
          image={BANNERS.studio}
          eyebrow="Exclusive Unite Solar Studio"
          icon={<Sparkles className="h-3.5 w-3.5" />}
          title={`Welcome${user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋`}
          subtitle="Pick a tool below to start designing on-brand — ID cards, business cards, proposals & more."
          height="md"
          className="mb-6 md:mb-8"
        />

        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Create
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {designTiles.map((t) => (
              <Tile
                key={t.title}
                tile={t}
                onClick={() => handleTileClick(t)}
              />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Stationery
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {stationeryTiles.map((t) => (
              <Tile key={t.title} tile={t} onClick={() => handleTileClick(t)} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Your work
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {visibleWorkTiles.map((t) => (
              <Tile key={t.title} tile={t} onClick={() => handleTileClick(t)} />
            ))}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
};

export default Home;
