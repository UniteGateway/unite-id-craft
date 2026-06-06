import jsPDF from "jspdf";
import logoAsset from "@/assets/unite-solar-logo.png.asset.json";

const ORANGE = "#f08c00";
const NAVY = "#1a3c6e";
const GREY = "#3a3a3a";
const LIGHT = "#6b7280";

export interface FeasibilityQuoteInput {
  customer_name: string;
  location: string;
  segment: string;
  capacity_kw: number;
  epc_rate_per_kw: number;        // ₹/kW INCLUSIVE of GST (as per Feasibility EPC settings)
  company?: string;
  logo_url?: string;
  milestones?: { pct: number; label: string }[];
}

const inr = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number.isFinite(v) ? v : 0);

/**
 * GST split per Indian solar regulation:
 *   70% of contract value is "goods"    @ 5% GST
 *   30% of contract value is "services" @ 18% GST
 * Blended GST rate = 0.7*5 + 0.3*18 = 8.9%
 * EPC rate is provided INCLUSIVE of GST → back-calculate base.
 */
export function computeGstSplit(totalInclGst: number) {
  const base = totalInclGst / 1.089;
  const goods_base = base * 0.7;
  const services_base = base * 0.3;
  const gst_goods = goods_base * 0.05;
  const gst_services = services_base * 0.18;
  const gst_total = gst_goods + gst_services;
  return {
    base, goods_base, services_base,
    gst_goods, gst_services, gst_total,
    grand_total: base + gst_total,
  };
}

async function loadImageDataUrl(url: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const data: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = data;
    });
    return { data, w: dims.w, h: dims.h };
  } catch {
    return null;
  }
}

export async function downloadFeasibilityQuotePDF(q: FeasibilityQuoteInput) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 595
  const H = doc.internal.pageSize.getHeight();  // 842
  const M = 40;                                 // 4-side margin ~14mm
  const innerW = W - M * 2;

  const totalInclGst = (q.epc_rate_per_kw || 0) * (q.capacity_kw || 0);
  const g = computeGstSplit(totalInclGst);

  // Load logo
  const logo = await loadImageDataUrl(logoAsset.url);

  // ─────────── HEADER ───────────
  const headerH = 70;
  if (logo) {
    const targetH = 44;
    const targetW = (logo.w / logo.h) * targetH;
    doc.addImage(logo.data, "PNG", M, M, targetW, targetH);
  }
  // Right side header info
  doc.setTextColor(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text((q.company || "Unite Solar").toUpperCase(), W - M, M + 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(LIGHT);
  doc.text("Solar EPC · Turnkey Installation", W - M, M + 28, { align: "right" });
  doc.text("hello@unitesolar.in  ·  www.unitesolar.in", W - M, M + 40, { align: "right" });

  // Header divider
  doc.setDrawColor(ORANGE);
  doc.setLineWidth(1.2);
  doc.line(M, M + headerH, W - M, M + headerH);

  let y = M + headerH + 22;

  // ─────────── TITLE ───────────
  doc.setTextColor(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SOLAR EPC QUOTATION", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(GREY);
  doc.text(`Quote #: FB-${Date.now().toString().slice(-6)}`, W - M, y - 10, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, W - M, y + 4, { align: "right" });

  y += 18;

  // ─────────── CUSTOMER BOX ───────────
  const boxH = 80;
  doc.setDrawColor(220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, innerW, boxH, 4, 4, "FD");
  doc.setTextColor(ORANGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CUSTOMER", M + 14, y + 18);
  doc.setTextColor(NAVY);
  doc.setFontSize(12);
  doc.text(q.customer_name || "—", M + 14, y + 36);
  doc.setTextColor(GREY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Location: ${q.location || "—"}`, M + 14, y + 52);
  doc.text(`Segment: ${q.segment}`, M + 14, y + 66);
  doc.text(`Capacity: ${q.capacity_kw} kW`, M + innerW / 2, y + 66);

  y += boxH + 18;

  // ─────────── COST TABLE ───────────
  // Column layout (within innerW = 515pt)
  const cDesc = M + 12;
  const cBase = M + 305;
  const cGst = M + 385;
  const cAmt = W - M - 12;

  doc.setFillColor(NAVY);
  doc.rect(M, y, innerW, 24, "F");
  doc.setTextColor("#fff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DESCRIPTION", cDesc, y + 16);
  doc.text("TAXABLE (₹)", cBase, y + 16);
  doc.text("GST", cGst, y + 16);
  doc.text("AMOUNT (₹)", cAmt, y + 16, { align: "right" });
  y += 24;

  const drawRow = (desc: string, sub: string, base: number, gstPct: number, gst: number) => {
    const rowH = 38;
    doc.setTextColor(NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(desc, cDesc, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(LIGHT);
    const subLines = doc.splitTextToSize(sub, 280);
    doc.text(subLines, cDesc, y + 26);

    doc.setFontSize(9.5);
    doc.setTextColor(GREY);
    doc.text(inr(base).replace("₹", "").trim(), cBase, y + 14);
    doc.text(`${gstPct}%`, cGst, y + 14);
    doc.setFont("helvetica", "bold");
    doc.text(inr(base + gst).replace("₹", "").trim(), cAmt, y + 14, { align: "right" });

    y += rowH;
    doc.setDrawColor(230);
    doc.line(M, y, W - M, y);
  };

  drawRow(
    "Solar Plant — Supply of Goods (70%)",
    "Modules, Inverters, Structure, Cables, ACDB/DCDB, Earthing & BOS — HSN 8541",
    g.goods_base, 5, g.gst_goods,
  );
  drawRow(
    "EPC Services (30%)",
    "Design, Engineering, Installation, Commissioning, Insurance — SAC 9954",
    g.services_base, 18, g.gst_services,
  );

  // ─────────── TOTALS PANEL (right) ───────────
  y += 14;
  const totW = 260;
  const totX = W - M - totW;
  const totRow = (label: string, val: string, bold = false, color = GREY) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(color);
    doc.setFontSize(9.5);
    doc.text(label, totX, y);
    doc.text(val, W - M, y, { align: "right" });
    y += 15;
  };
  totRow("Sub-total (Taxable)", inr(g.base));
  totRow("GST @ 5% on Goods", inr(g.gst_goods));
  totRow("GST @ 18% on Services", inr(g.gst_services));
  totRow("Total GST", inr(g.gst_total), true, NAVY);

  y += 6;
  doc.setFillColor(ORANGE);
  doc.roundedRect(totX, y, totW, 30, 3, 3, "F");
  doc.setTextColor("#fff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("GRAND TOTAL", totX + 12, y + 19);
  doc.text(inr(g.grand_total), W - M - 12, y + 19, { align: "right" });
  y += 42;

  doc.setTextColor(LIGHT);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(
    `Rate: ${inr(q.epc_rate_per_kw)} / kW (incl. GST)  ·  Blended GST 8.9% (5% on 70% + 18% on 30%)`,
    M, y,
  );
  y += 22;

  // ─────────── PAYMENT MILESTONES ───────────
  const mil = q.milestones && q.milestones.length
    ? q.milestones
    : [
        { pct: 10, label: "Advance against Purchase Order" },
        { pct: 70, label: "Material ready to dispatch" },
        { pct: 15, label: "Pre-installation" },
        { pct: 5,  label: "Post-installation / Commissioning" },
      ];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(NAVY);
  doc.text("Payment Milestones", M, y);
  y += 6;
  doc.setDrawColor(ORANGE);
  doc.setLineWidth(0.8);
  doc.line(M, y, M + 90, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(GREY);
  mil.forEach((m) => {
    const amt = g.grand_total * (m.pct / 100);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ORANGE);
    doc.text(`${m.pct}%`, M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GREY);
    doc.text(m.label, M + 36, y);
    doc.text(inr(amt), W - M, y, { align: "right" });
    y += 14;
  });

  // ─────────── TERMS ───────────
  y += 12;
  if (y > H - 180) { doc.addPage(); y = M + 20; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(NAVY);
  doc.text("Terms & Conditions", M, y);
  y += 6;
  doc.setDrawColor(ORANGE);
  doc.line(M, y, M + 100, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GREY);
  const terms = [
    "Quotation valid for 15 days from the date of issue.",
    "GST is charged per CBIC Notification: 5% on 70% (goods) and 18% on 30% (services) of the contract value.",
    "Scope: Turnkey EPC including supply, design, installation, commissioning, net-metering liaison, insurance during execution and module cleaning for 1 year.",
    "Subsidy disbursement (if any) is governed by MNRE / DISCOM under PM Surya Ghar guidelines.",
    "Statutory & DISCOM charges, transformer upgrade and civil works (if required) are charged at actuals.",
  ];
  terms.forEach((t, i) => {
    const split = doc.splitTextToSize(`${i + 1}. ${t}`, innerW);
    doc.text(split, M, y);
    y += split.length * 11 + 2;
  });

  // ─────────── FOOTER (every page) ───────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(ORANGE);
    doc.setLineWidth(1);
    doc.line(M, H - M + 4, W - M, H - M + 4);
    doc.setTextColor(LIGHT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(
      `${q.company || "Unite Solar"} — A Unite Developers Global Inc. Company`,
      M, H - M + 18,
    );
    doc.text(`Page ${p} of ${pages}`, W - M, H - M + 18, { align: "right" });
  }

  doc.save(`EPC_Quote_${(q.customer_name || "Customer").replace(/\s+/g, "_")}_${q.capacity_kw}kW.pdf`);
}