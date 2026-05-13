import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Download, Loader2, ArrowLeft, FileDown, Files } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import SlideStage from "@/components/proposals/variable-slides/SlideStage";
import {
  DEFAULT_VARS,
  ProposalVars,
  VAR_LABELS,
} from "@/components/proposals/variable-slides/types";
import { VARIABLE_SLIDE_REGISTRY } from "@/components/proposals/variable-slides/registry";

const ProposalVariableSlides: React.FC = () => {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialKey = params.get("slide") || "cover";
  const [activeKey, setActiveKey] = useState<string>(initialKey);
  const [vars, setVars] = useState<ProposalVars>(DEFAULT_VARS);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ i: number; total: number } | null>(null);
  const [pdfSize, setPdfSize] = useState<"a4" | "a3" | "letter" | "16:9">("16:9");
  const slideRef = useRef<HTMLDivElement>(null);
  const allRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Hydrate vars from sessionStorage if a generated proposal was just opened.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("unite-solar:incoming-vars");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProposalVars>;
        setVars((v) => ({ ...v, ...parsed }));
        sessionStorage.removeItem("unite-solar:incoming-vars");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const active = useMemo(
    () => VARIABLE_SLIDE_REGISTRY.find((s) => s.key === activeKey) ?? VARIABLE_SLIDE_REGISTRY[0],
    [activeKey]
  );

  const onPick = (key: string) => {
    setActiveKey(key);
    setParams({ slide: key });
  };

  const exportPng = async () => {
    if (!slideRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(slideRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: 1920,
        height: 1080,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `unite-solar-${active.key}-${vars.PROJECT_NAME.replace(/\s+/g, "_")}.png`;
      a.click();
      toast.success("Slide exported");
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const PDF_SIZES: Record<
    "a4" | "a3" | "letter" | "16:9",
    { w: number; h: number; label: string }
  > = {
    "16:9": { w: 338.67, h: 190.5, label: "Slide 16:9" }, // 1920x1080 @ ~144dpi mm
    a4: { w: 297, h: 210, label: "A4 Landscape" },
    a3: { w: 420, h: 297, label: "A3 Landscape" },
    letter: { w: 279.4, h: 215.9, label: "Letter Landscape" },
  };

  const exportPdf = async () => {
    if (!slideRef.current) return;
    setExportingPdf(true);
    try {
      const dataUrl = await toPng(slideRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 1920,
        height: 1080,
      });
      const { w, h } = PDF_SIZES[pdfSize];
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [w, h] });
      // Fit 16:9 image into page, centered
      const imgRatio = 1920 / 1080;
      const pageRatio = w / h;
      let imgW = w;
      let imgH = h;
      if (pageRatio > imgRatio) {
        imgH = h;
        imgW = h * imgRatio;
      } else {
        imgW = w;
        imgH = w / imgRatio;
      }
      const x = (w - imgW) / 2;
      const y = (h - imgH) / 2;
      pdf.addImage(dataUrl, "PNG", x, y, imgW, imgH, undefined, "FAST");
      pdf.save(
        `unite-solar-${active.key}-${vars.PROJECT_NAME.replace(/\s+/g, "_")}-${pdfSize}.pdf`
      );
      toast.success("PDF exported");
    } catch (e: any) {
      toast.error(e?.message ?? "PDF export failed");
    } finally {
      setExportingPdf(false);
    }
  };

  const exportAllPdf = async () => {
    const ready = VARIABLE_SLIDE_REGISTRY.filter((s) => !!s.Component);
    if (!ready.length) return;
    setExportingAll(true);
    setExportProgress({ i: 0, total: ready.length });
    try {
      const { w, h } = PDF_SIZES[pdfSize];
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [w, h] });
      const imgRatio = 1920 / 1080;
      const pageRatio = w / h;
      let imgW = w;
      let imgH = h;
      if (pageRatio > imgRatio) {
        imgH = h;
        imgW = h * imgRatio;
      } else {
        imgW = w;
        imgH = w / imgRatio;
      }
      const x = (w - imgW) / 2;
      const y = (h - imgH) / 2;

      // Give the offscreen tree a tick to mount/paint.
      await new Promise((r) => setTimeout(r, 50));

      for (let i = 0; i < ready.length; i++) {
        const slide = ready[i];
        const node = allRefs.current[slide.key];
        if (!node) continue;
        setExportProgress({ i: i + 1, total: ready.length });
        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 2,
          width: 1920,
          height: 1080,
        });
        if (i > 0) pdf.addPage([w, h], "landscape");
        pdf.addImage(dataUrl, "PNG", x, y, imgW, imgH, undefined, "FAST");
      }

      pdf.save(
        `unite-solar-FULL-${vars.PROJECT_NAME.replace(/\s+/g, "_")}-${pdfSize}.pdf`
      );
      toast.success(`Exported ${ready.length} slides`);
    } catch (e: any) {
      toast.error(e?.message ?? "Full PDF export failed");
    } finally {
      setExportingAll(false);
      setExportProgress(null);
    }
  };

  const Comp = active.Component;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-5 md:py-6 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => nav("/create-proposal")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-lg md:text-xl font-bold">
              Variable Slides — Live Preview
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={pdfSize} onValueChange={(v) => setPdfSize(v as typeof pdfSize)}>
              <SelectTrigger className="h-9 w-[170px]">
                <SelectValue placeholder="PDF size" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PDF_SIZES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={exportAllPdf}
              disabled={exportingAll}
              variant="default"
              className="gap-2"
            >
              {exportingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Files className="h-4 w-4" />
              )}
              {exportingAll && exportProgress
                ? `Exporting ${exportProgress.i}/${exportProgress.total}…`
                : "Export All (PDF)"}
            </Button>
            <Button
              onClick={exportPdf}
              disabled={exportingPdf || !Comp}
              variant="outline"
              className="gap-2"
            >
              {exportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              This Slide PDF
            </Button>
            <Button
              onClick={exportPng}
              disabled={exporting || !Comp}
              variant="outline"
              className="gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              PNG
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-4">
          {/* Slide list */}
          <Card className="p-2 h-fit">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-2 py-2 font-semibold">
              Slides
            </div>
            <div className="flex flex-col gap-1">
              {VARIABLE_SLIDE_REGISTRY.map((s) => {
                const ready = !!s.Component;
                const isActive = s.key === activeKey;
                return (
                  <button
                    key={s.key}
                    onClick={() => ready && onPick(s.key)}
                    disabled={!ready}
                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted"
                    } ${!ready ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold">
                      {s.n}
                    </span>
                    <span className="truncate">{s.title}</span>
                    {!ready && <span className="ml-auto text-[10px] text-muted-foreground">soon</span>}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Preview */}
          <div className="min-w-0">
            <Card className="p-2 bg-neutral-900">
              {Comp ? (
                <SlideStage>
                  <Comp ref={slideRef} vars={vars} />
                </SlideStage>
              ) : (
                <div className="h-[420px] grid place-items-center text-sm text-muted-foreground">
                  Slide coming soon — share its design and code.
                </div>
              )}
            </Card>
            <div className="mt-3 text-xs text-muted-foreground text-right">
              Renders at 1920×1080 — exports as HD PNG.
            </div>
          </div>

          {/* Variables */}
          <Card className="p-3 h-fit">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
              Project Variables
            </div>
            <div className="space-y-2.5">
              {(Object.keys(vars) as (keyof ProposalVars)[]).map((k) => (
                <div key={k}>
                  <Label className="text-[11px]">{VAR_LABELS[k]}</Label>
                  <Input
                    value={vars[k]}
                    onChange={(e) => setVars((v) => ({ ...v, [k]: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
      <AppFooter />

      {/* Off-screen render of every ready slide so we can capture them in one batch. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -100000,
          top: 0,
          width: 1920,
          height: 1080,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {VARIABLE_SLIDE_REGISTRY.filter((s) => !!s.Component).map((s) => {
          const C = s.Component!;
          return (
            <div key={s.key} style={{ width: 1920, height: 1080 }}>
              <C
                ref={(el) => {
                  allRefs.current[s.key] = el;
                }}
                vars={vars}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProposalVariableSlides;