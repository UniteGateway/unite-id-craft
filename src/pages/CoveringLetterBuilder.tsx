import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LETTER_TEMPLATES,
  fillLetter,
  formatLetterDate,
  getCategory,
  getTemplatesByCategory,
} from "@/lib/covering-letters";
import letterhead from "@/assets/unite-letterhead.png";
import { ArrowLeft, Download, FileText, ImagePlus, Mail, Save, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CoveringLetterBuilder: React.FC = () => {
  const { category = "" } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const cat = getCategory(category);
  const templates = useMemo(
    () => (cat ? getTemplatesByCategory(cat.key) : []),
    [cat],
  );

  const [tplId, setTplId] = useState(templates[0]?.id ?? "");
  const activeTpl = useMemo(
    () => LETTER_TEMPLATES.find((t) => t.id === tplId) ?? templates[0],
    [tplId, templates],
  );

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [toName, setToName] = useState("");
  const [toDesignation, setToDesignation] = useState("");
  const [toOrg, setToOrg] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [subject, setSubject] = useState(activeTpl?.subject ?? "");
  const [body, setBody] = useState(activeTpl?.body ?? "");
  const [senderName, setSenderName] = useState("");
  const [senderDesignation, setSenderDesignation] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!activeTpl) return;
    setSubject(activeTpl.subject);
    setBody(activeTpl.body);
  }, [activeTpl?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const vars = {
    date: formatLetterDate(date),
    to_name: toName,
    to_designation: toDesignation,
    to_org: toOrg,
    to_address: toAddress,
    sender_name: senderName,
    sender_designation: senderDesignation,
  };

  const renderedSubject = fillLetter(subject, vars);
  const renderedBody = fillLetter(body, vars);

  const previewRef = useRef<HTMLDivElement>(null);

  const uploadSignature = async (file: File) => {
    if (!user) { toast.error("Sign in to upload a signature"); return; }
    setSignatureUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("letter-signatures").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("letter-signatures").getPublicUrl(path);
      setSignatureUrl(data.publicUrl);
      toast.success("Signature uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally { setSignatureUploading(false); }
  };

  const saveLetter = async () => {
    if (!user) { toast.error("Sign in to save"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("covering_letters").insert({
        user_id: user.id,
        category: cat!.key,
        template_id: activeTpl?.id,
        template_name: activeTpl?.name,
        date,
        to_name: toName,
        to_designation: toDesignation,
        to_org: toOrg,
        to_address: toAddress,
        subject,
        body,
        sender_name: senderName,
        sender_designation: senderDesignation,
        signature_url: signatureUrl || null,
        client_email: clientEmail || null,
      });
      if (error) throw error;
      toast.success("Letter saved to your dashboard");
    } catch (e: any) {
      toast.error(e.message || "Could not save");
    } finally { setSaving(false); }
  };

  const emailToClient = async () => {
    if (!clientEmail) { toast.error("Enter the client's email first"); return; }
    toast.info("Email sending will activate once the sender domain is verified. Your letter is saved to history.", { duration: 6000 });
    await saveLetter();
  };

  const downloadPdf = async () => {
    const node = previewRef.current;
    if (!node) return;
    try {
      toast.loading("Generating PDF…", { id: "pdf" });
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const img = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      // Fit image to A4 preserving aspect (image is A4 ratio).
      pdf.addImage(img, "JPEG", 0, 0, pageW, pageH, undefined, "FAST");
      const fileName = `${cat?.short || "Letter"} – ${toOrg || "Covering Letter"}.pdf`;
      pdf.save(fileName);
      toast.success("PDF downloaded", { id: "pdf" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF", { id: "pdf" });
    }
  };

  if (!cat) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <main className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="text-muted-foreground mb-4">Unknown letter category.</p>
          <Button onClick={() => nav("/covering-letters")}>Back</Button>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => nav("/covering-letters")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {cat.title} – Covering Letter
              </h1>
              <p className="text-xs text-muted-foreground">
                Edit the variables and body, then download the PDF.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={saveLetter} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save to Dashboard"}
            </Button>
            <Button variant="outline" onClick={emailToClient}>
              <Mail className="h-4 w-4 mr-1" /> Email to Client
            </Button>
            <Button onClick={downloadPdf}>
              <Download className="h-4 w-4 mr-1" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* FORM */}
          <Card className="p-4 space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Preloaded template
              </Label>
              <Select value={tplId} onValueChange={setTplId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        {t.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
            </div>

            <div className="rounded-md border border-border p-3 space-y-3 bg-muted/30">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                To
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="The Secretary" />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input value={toDesignation} onChange={(e) => setToDesignation(e.target.value)} placeholder="MD / Director / Principal" />
                </div>
              </div>
              <div>
                <Label>Organisation</Label>
                <Input value={toOrg} onChange={(e) => setToOrg(e.target.value)} placeholder="Organisation / Department" />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea rows={2} value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Street, City, State, PIN" />
              </div>
            </div>

            <div>
              <Label>Body</Label>
              <Textarea
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="font-mono text-xs leading-relaxed"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                You can paste your own content here, or just edit the preloaded letter. Variables: {"{date}, {to_name}, {to_org}, {to_address}, {sender_name}, {sender_designation}"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Signed by – Name</Label>
                <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <Label>Signed by – Designation</Label>
                <Input value={senderDesignation} onChange={(e) => setSenderDesignation(e.target.value)} placeholder="e.g. Director – Business Development" />
              </div>
            </div>

            <div className="rounded-md border border-border p-3 space-y-3 bg-muted/30">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Signature & Delivery
              </div>
              <div>
                <Label>Signature image (PNG with transparent background works best)</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-border cursor-pointer hover:bg-muted/60 text-sm">
                    <ImagePlus className="h-4 w-4" />
                    {signatureUploading ? "Uploading…" : "Upload signature"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && uploadSignature(e.target.files[0])}
                    />
                  </label>
                  {signatureUrl && (
                    <>
                      <img src={signatureUrl} alt="Signature" className="h-10 bg-white rounded border p-1" />
                      <Button variant="ghost" size="sm" onClick={() => setSignatureUrl("")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div>
                <Label>Client Email (for sending the letter)</Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
            </div>
          </Card>

          {/* PREVIEW */}
          <div className="lg:sticky lg:top-4 self-start">
            <div className="rounded-lg border border-border bg-muted/40 p-3 overflow-auto">
              <div className="mx-auto" style={{ width: "100%", maxWidth: 595 }}>
                {/* A4 page: 210mm x 297mm → scaled */}
                <div
                  ref={previewRef}
                  style={{
                    width: 794, // px @ ~96dpi for 210mm
                    height: 1123,
                    backgroundImage: `url(${letterhead})`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                    transform: "scale(0.74)",
                    transformOrigin: "top left",
                    color: "#1f2937",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 210, // below logo strip
                      left: 70,
                      right: 70,
                      bottom: 200, // above footer strip
                      fontFamily: "Inter, Arial, sans-serif",
                      fontSize: 13,
                      lineHeight: 1.55,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ textAlign: "right", marginBottom: 18, color: "#374151" }}>
                      {formatLetterDate(date) || "__________"}
                    </div>

                    <div style={{ marginBottom: 16, whiteSpace: "pre-wrap" }}>
                      <div style={{ fontWeight: 600 }}>To,</div>
                      <div>{toName || "__________"}</div>
                      {toDesignation && <div>{toDesignation}</div>}
                      <div style={{ fontWeight: 600 }}>{toOrg || "__________"}</div>
                      {toAddress && <div>{toAddress}</div>}
                    </div>

                    <div style={{ marginBottom: 14, fontWeight: 700 }}>
                      Subject: {renderedSubject}
                    </div>

                    <div style={{ whiteSpace: "pre-wrap" }}>{renderedBody}</div>

                    {/* Sender block – always rendered, even if body template did not include it */}
                    <div style={{ marginTop: 28 }}>
                      {signatureUrl && (
                        <img
                          src={signatureUrl}
                          alt="Signature"
                          crossOrigin="anonymous"
                          style={{ height: 60, objectFit: "contain", marginBottom: 4 }}
                        />
                      )}
                      <div style={{ fontWeight: 700 }}>{senderName || "__________"}</div>
                      {senderDesignation && (
                        <div style={{ color: "#374151" }}>{senderDesignation}</div>
                      )}
                      <div style={{ color: "#374151" }}>Unite Solar (Unite Developers Global Inc.)</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Live preview – downloads as A4 PDF on the Unite Solar letterhead.
              </p>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default CoveringLetterBuilder;