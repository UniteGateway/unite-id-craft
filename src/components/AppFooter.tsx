import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const AppFooter: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col items-center text-center gap-3">
        {/* Logo mark */}
        <Link to="/home" className="inline-flex items-center gap-2">
          <img
            src="/icon-192.png"
            alt="Unite Solar"
            width={32}
            height={32}
            loading="lazy"
            className="h-8 w-8 rounded-md"
          />
          <span className="text-base font-extrabold tracking-tight text-foreground">
            Unite Solar <span className="text-primary">Studio</span>
          </span>
        </Link>

        {/* Tagline */}
        <p className="text-xs md:text-sm text-muted-foreground max-w-md inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          On-brand design studio — built for the Unite Solar team.
        </p>

        {/* Divider */}
        <div className="h-px w-16 bg-border my-1" />

        {/* Copyright */}
        <p className="text-[11px] text-muted-foreground">
          © {year} · Powered by{" "}
          <span className="font-semibold text-foreground">Unite Developers Global Inc</span>
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;