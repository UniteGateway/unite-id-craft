import React from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  FileImage,
  BookOpen,
  Presentation,
  FileSignature,
  Mail,
} from "lucide-react";

const labels: Record<
  string,
  { title: string; desc: string; icon: React.ElementType; hue: string }
> = {
  flyers: {
    title: "Flyers",
    desc: "Eye-catching single-page promotional designs.",
    icon: FileImage,
    hue: "from-pink-500 to-rose-400",
  },
  brochures: {
    title: "Brochures",
    desc: "Tri-fold and bi-fold print layouts.",
    icon: BookOpen,
    hue: "from-emerald-500 to-teal-400",
  },
  presentations: {
    title: "Presentations",
    desc: "Branded PowerPoint pitch decks.",
    icon: Presentation,
    hue: "from-violet-600 to-fuchsia-400",
  },
  proposals: {
    title: "Proposals",
    desc: "Client proposals with pricing tables.",
    icon: FileSignature,
    hue: "from-indigo-600 to-blue-400",
  },
  letterheads: {
    title: "Letterheads",
    desc: "Corporate stationery letterheads.",
    icon: Mail,
    hue: "from-yellow-500 to-orange-400",
  },
};

const ComingSoon: React.FC = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();
  // Derive type from path (e.g. /flyers) or ?type= fallback
  const pathKey = location.pathname.replace("/", "");
  const type = labels[pathKey] ? pathKey : params.get("type") || "";
  const meta =
    labels[type] || {
      title: "Coming Soon",
      desc: "This module is on its way.",
      icon: Sparkles,
      hue: "from-orange-500 to-amber-400",
    };
  const Icon = meta.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div
        className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.hue} text-white items-center justify-center mb-6 shadow-lg`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
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
    </div>
  );
};

export default ComingSoon;
