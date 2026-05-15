import React from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { AGREEMENTS } from "@/lib/agreements";
import { FileSignature } from "lucide-react";

const Agreements: React.FC = () => {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FileSignature className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agreements</h1>
            <p className="text-sm text-muted-foreground">
              Pick a template, fill in the details, and download a print-ready PDF.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {AGREEMENTS.map((a) => (
            <button
              key={a.slug}
              onClick={() => nav(`/agreements/${a.slug}`)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/40"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={a.image}
                  alt={a.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-25 bg-gradient-to-br ${a.hue} transition-opacity`} />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-lg bg-white/95 text-foreground flex items-center justify-center shadow-md">
                  <FileSignature className="h-4 w-4" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs uppercase tracking-wider opacity-90">{a.short}</div>
                  <div className="font-semibold leading-tight">{a.title}</div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default Agreements;