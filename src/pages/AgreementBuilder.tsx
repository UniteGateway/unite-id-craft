import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import mammoth from "mammoth";
import html2canvas from "html2canvas";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Upload, FileText, X } from "lucide-react";
import {
  AGREEMENTS,
  fillTemplate,
  formatValue,
  getAgreement,
} from "@/lib/agreements";
import { toast } from "@/hooks/use-toast";

const AgreementBuilder: React.FC = () => {
  const { slug = "" } = useParams();
  const nav = useNavigate();
  const def = getAgreement(slug);

  const initial = useMemo(() => {
    const o: Record<string, string> = {};
    def?.fields.forEach((f) => (o[f.key] = f.default ?? ""));
    return o;
  }, [def]);

  const [values, setValues] = useState<Record<string, string>>(initial);
  const [template, setTemplate] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!def) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <main className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="text-muted-foreground mb-4">Agreement template not found.</p>
          <Button onClick={() => nav("/agreements")}>Back to Agreements</Button>
        </main>
      </div>
    );
  }

  // Build the formatted-value map used for rendering and PDF
  const display: Record<string, string> = {};
  def.fields.forEach((f) => (display[f.key] = formatValue(f, values[f.key] ?? "")));

  const handleChange = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const onTemplateUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".docx")) {
      toast({
        title: "Unsupported file",
        description: "Please upload a .docx Word template with {placeholders}.",
        variant: "destructive",
      });
      return;
    }
    const data = await file.arrayBuffer();
    setTemplate({ name: file.name, data });
    toast({ title: "Template loaded", description: file.name });
  };

  const renderTemplateBlob = (): Blob | null => {
    if (!template) return null;
    const zip = new PizZip(template.data);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{", end: "}" },
    });
    doc.render(display);
    return doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  };

  const downloadFromTemplate = () => {
    if (!template) return;
    try {
      const out = renderTemplateBlob();
      if (!out) return;
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${def!.slug}-${(display.party_name || "party").toString().replace(/[^\w]+/g, "-").toLowerCase()}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Filled template downloaded", description: a.download });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to render template";
      toast({ title: "Template error", description: msg, variant: "destructive" });
    }
  };

  const downloadTemplateAsPdf = async () => {
    if (!template) return;
    let host: HTMLDivElement | null = null;
    try {
      const blob = renderTemplateBlob();
      if (!blob) return;
      const buf = await blob.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });

      const A4_WIDTH_PX = 794; // ~210mm at 96 DPI
      host = document.createElement("div");
      host.style.cssText = `position:fixed;left:-10000px;top:0;width:${A4_WIDTH_PX}px;background:#fff;color:#000;padding:48px;font-family:'Helvetica','Arial',sans-serif;font-size:12px;line-height:1.55;`;
      host.innerHTML = `<style>
        h1{font-size:20px;margin:0 0 12px;font-weight:700;text-align:center;}
        h2{font-size:16px;margin:18px 0 8px;font-weight:700;}
        h3{font-size:14px;margin:14px 0 6px;font-weight:700;}
        p{margin:0 0 8px;}
        table{border-collapse:collapse;width:100%;margin:8px 0;}
        td,th{border:1px solid #999;padding:6px;vertical-align:top;}
        ul,ol{margin:0 0 8px 18px;padding:0;}
        img{max-width:100%;height:auto;}
      </style>${html}`;
      document.body.appendChild(host);

      const canvas = await html2canvas(host, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }

      const filename = `${def!.slug}-${(display.party_name || "party").toString().replace(/[^\w]+/g, "-").toLowerCase()}-from-template.pdf`;
      pdf.save(filename);
      toast({ title: "Template PDF downloaded", description: filename });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to export template as PDF";
      toast({ title: "PDF export error", description: msg, variant: "destructive" });
    } finally {
      if (host && host.parentNode) host.parentNode.removeChild(host);
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 56;
    const maxW = pageW - margin * 2;
    let y = margin;

    const ensureSpace = (need: number) => {
      if (y + need > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(def.title.toUpperCase(), pageW / 2, y, { align: "center" });
    y += 24;

    // Sub-line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const subline = `Executed at ${display.place || "__________"} on ${display.effective_date || "__________"}`;
    doc.text(subline, pageW / 2, y, { align: "center" });
    y += 24;

    // Parties block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("BETWEEN", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    const partyA = `${display.company_name || "__________"}, having its registered office at ${display.company_address || "__________"} (hereinafter referred to as the "First Party"),`;
    const partyB = `AND ${display.party_name || "__________"}, having its address at ${display.party_address || "__________"}${display.party_pan ? `, PAN/GSTIN: ${display.party_pan}` : ""} (hereinafter referred to as the "Second Party").`;
    [partyA, "", partyB].forEach((p) => {
      const lines = doc.splitTextToSize(p, maxW);
      ensureSpace(lines.length * 14 + 4);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 4;
    });
    y += 8;

    // Sections
    def.sections.forEach((s) => {
      ensureSpace(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(s.heading, margin, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const filled = fillTemplate(s.body, display);
      const lines = doc.splitTextToSize(filled, maxW);
      ensureSpace(lines.length * 13 + 8);
      doc.text(lines, margin, y);
      y += lines.length * 13 + 12;
    });

    // Signatures
    ensureSpace(120);
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("IN WITNESS WHEREOF", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const wit = "The parties hereto have executed this Agreement on the date and place first above written.";
    const witLines = doc.splitTextToSize(wit, maxW);
    doc.text(witLines, margin, y);
    y += witLines.length * 13 + 28;

    const colW = (maxW - 40) / 2;
    ensureSpace(110);
    doc.line(margin, y + 40, margin + colW, y + 40);
    doc.line(margin + colW + 40, y + 40, margin + colW * 2 + 40, y + 40);
    doc.setFont("helvetica", "bold");
    doc.text("For " + (display.company_name || "First Party"), margin, y + 56);
    doc.text("For " + (display.party_name || "Second Party"), margin + colW + 40, y + 56);
    doc.setFont("helvetica", "normal");
    doc.text(display.company_rep || "Authorised Signatory", margin, y + 72);
    doc.text(display.party_rep || "Authorised Signatory", margin + colW + 40, y + 72);

    // Footer with page numbers
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `${def.title} • Page ${i} of ${total}`,
        pageW / 2,
        pageH - 24,
        { align: "center" },
      );
      doc.setTextColor(0);
    }

    const filename = `${def.slug}-agreement-${(display.party_name || "party").toString().replace(/[^\w]+/g, "-").toLowerCase()}.pdf`;
    doc.save(filename);
    toast({ title: "PDF downloaded", description: filename });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/agreements">
                <ArrowLeft className="h-4 w-4 mr-1" /> All agreements
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{def.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {template && (
              <>
                <Button variant="secondary" onClick={downloadFromTemplate}>
                  <FileText className="h-4 w-4 mr-2" /> Template .docx
                </Button>
                <Button variant="secondary" onClick={downloadTemplateAsPdf}>
                  <Download className="h-4 w-4 mr-2" /> Template PDF
                </Button>
              </>
            )}
            <Button onClick={downloadPdf}>
              <Download className="h-4 w-4 mr-2" /> Built-in PDF
            </Button>
          </div>
        </div>

        {/* Custom template upload */}
        <section className="mb-6 rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Upload className="h-4 w-4" /> Use your own Word template (.docx)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a .docx with placeholders like <code className="px-1 rounded bg-muted">{"{party_name}"}</code>, <code className="px-1 rounded bg-muted">{"{effective_date}"}</code> — values from the form below will be merged in.
              </p>
              <details className="mt-2">
                <summary className="text-xs text-primary cursor-pointer">Show available placeholders</summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {def.fields.map((f) => (
                    <code key={f.key} className="text-[11px] px-1.5 py-0.5 rounded bg-background border border-border">
                      {`{${f.key}}`}
                    </code>
                  ))}
                </div>
              </details>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={fileRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onTemplateUpload(f);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> {template ? "Replace" : "Upload"} template
              </Button>
              {template && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="max-w-[140px] truncate">{template.name}</span>
                  <button
                    onClick={() => setTemplate(null)}
                    className="hover:text-destructive"
                    aria-label="Remove template"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <section className="rounded-xl border border-border bg-card p-4 md:p-5">
            <h2 className="font-semibold mb-1">Agreement Details</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Fill what you have — anything left blank shows as ______ in the PDF.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {def.fields.map((f) => (
                <div
                  key={f.key}
                  className={f.type === "textarea" ? "md:col-span-2" : ""}
                >
                  <Label className="text-xs mb-1.5 block">{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      rows={3}
                      value={values[f.key] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={values[f.key] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Preview */}
          <section className="rounded-xl border border-border bg-card p-5 md:p-8 max-h-[80vh] overflow-y-auto">
            <article className="prose prose-sm max-w-none dark:prose-invert">
              <h2 className="text-center !mb-1">{def.title.toUpperCase()}</h2>
              <p className="text-center text-xs text-muted-foreground !mt-0">
                Executed at {display.place || "__________"} on {display.effective_date || "__________"}
              </p>
              <h4>BETWEEN</h4>
              <p>
                <strong>{display.company_name || "__________"}</strong>, having its registered office at {display.company_address || "__________"} (hereinafter the "First Party"),
              </p>
              <p>
                AND <strong>{display.party_name || "__________"}</strong>, having its address at {display.party_address || "__________"}{display.party_pan ? `, PAN/GSTIN: ${display.party_pan}` : ""} (hereinafter the "Second Party").
              </p>
              {def.sections.map((s) => (
                <div key={s.heading}>
                  <h4>{s.heading}</h4>
                  <p className="whitespace-pre-wrap">{fillTemplate(s.body, display)}</p>
                </div>
              ))}
              <h4>IN WITNESS WHEREOF</h4>
              <p>The parties hereto have executed this Agreement on the date and place first above written.</p>
              <div className="grid grid-cols-2 gap-8 mt-10 not-prose">
                <div>
                  <div className="border-t border-foreground/40 pt-2 text-xs">
                    <div className="font-semibold">For {display.company_name || "First Party"}</div>
                    <div>{display.company_rep || "Authorised Signatory"}</div>
                  </div>
                </div>
                <div>
                  <div className="border-t border-foreground/40 pt-2 text-xs">
                    <div className="font-semibold">For {display.party_name || "Second Party"}</div>
                    <div>{display.party_rep || "Authorised Signatory"}</div>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Other agreements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {AGREEMENTS.filter((a) => a.slug !== def.slug).map((a) => (
              <Link
                key={a.slug}
                to={`/agreements/${a.slug}`}
                className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/40 transition"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={a.image} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="px-2 py-1.5 text-xs font-medium truncate">{a.short}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default AgreementBuilder;