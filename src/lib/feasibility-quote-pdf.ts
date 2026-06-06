import jsPDF from "jspdf";

const ORANGE = "#f08c00";
const NAVY = "#1a3c6e";
const GREY = "#3a3a3a";

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

export async function downloadFeasibilityQuotePDF(q: FeasibilityQuoteInput) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  const totalInclGst = (q.epc_rate_per_kw || 0) * (q.capacity_kw || 0);
  const g = computeGstSplit(totalInclGst);

  // Header
  doc.setFillColor(ORANGE);
  doc.rect(0, 0, W, 80, "F");
  doc.setTextColor("#fff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text((q.company || "UNITE SOLAR").toUpperCase(), 40, 38);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Solar EPC • Turnkey Installation • Renewable Energy Solutions", 40, 56);
  doc.setFontSize(9);
  doc.text("www.unitesolar.in", W - 40, 38, { align: "right" });
  doc.text("hello@unitesolar.in", W - 40, 52, { align: "right" });

  let y = 110;
  doc.setTextColor(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SOLAR EPC QUOTATION", 40, y);
  doc.setFontSize(9);
  doc.setTextColor(GREY);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, W - 40, y, { align: "right" });
  doc.text(`Quote #: FB-${Date.now().toString().slice(-6)}`, W - 40, y - 12, { align: "right" });

  // Customer box
  y += 16;
  doc.setDrawColor(220); doc.setFillColor(248, 250, 252);
  doc.rect(40, y, W - 80, 78, "FD");
  doc.setTextColor(NAVY); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("CUSTOMER", 50, y + 16);
  doc.setTextColor(GREY); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  let cy = y + 32;
  [
    `${q.customer_name || "—"}`,
    `Location: ${q.location || "—"}`,
    `Segment: ${q.segment}   |   Capacity: ${q.capacity_kw} kW`,
  ].forEach((t) => { doc.text(t, 50, cy); cy += 12; });

  // Cost table header
  y += 98;
  doc.setFillColor(NAVY); doc.rect(40, y, W - 80, 22, "F");
  doc.setTextColor("#fff"); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("DESCRIPTION", 50, y + 15);
  doc.text("TAXABLE VALUE", 360, y + 15);
  doc.text("GST", 460, y + 15);
  doc.text("AMOUNT (₹)", W - 50, y + 15, { align: "right" });

  y += 22;
  doc.setTextColor(GREY); doc.setFont("helvetica", "normal"); doc.setFontSize(9);

  const row = (desc: string, sub: string, base: number, gstPct: number, gst: number) => {
    doc.setFont("helvetica", "bold"); doc.text(desc, 50, y + 14);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(120);
    doc.text(sub, 50, y + 24, { maxWidth: 300 });
    doc.setFontSize(9); doc.setTextColor(GREY);
    doc.text(inr(base).replace("₹", ""), 360, y + 14);
    doc.text(`${gstPct}%`, 460, y + 14);
    doc.text(inr(base + gst).replace("₹", ""), W - 50, y + 14, { align: "right" });
    y += 32;
    doc.setDrawColor(235); doc.line(40, y, W - 40, y);
  };

  row(
    "Solar Plant — Supply of Goods (70%)",
    "Modules, Inverters, Structure, Cables, ACDB/DCDB, Earthing & BOS — HSN 8541",
    g.goods_base, 5, g.gst_goods,
  );
  row(
    "EPC Services (30%)",
    "Design, Engineering, Installation, Commissioning, Insurance & O&M — SAC 9954",
    g.services_base, 18, g.gst_services,
  );

  // Totals
  y += 12;
  const rowR = (label: string, val: string, bold = false, color = GREY) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(color);
    doc.text(label, W - 260, y);
    doc.text(val, W - 50, y, { align: "right" });
    y += 16;
  };
  rowR("Sub-total (Taxable)", inr(g.base));
  rowR("CGST + SGST / IGST (5% on goods)", inr(g.gst_goods));
  rowR("CGST + SGST / IGST (18% on services)", inr(g.gst_services));
  rowR("Total GST", inr(g.gst_total), true, NAVY);
  y += 4;
  doc.setFillColor(ORANGE); doc.rect(W - 260, y, 220, 26, "F");
  doc.setTextColor("#fff"); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("GRAND TOTAL (incl. GST)", W - 250, y + 17);
  doc.text(inr(g.grand_total), W - 50, y + 17, { align: "right" });
  y += 40;

  doc.setTextColor(GREY); doc.setFont("helvetica", "italic"); doc.setFontSize(8);
  doc.text(
    `Rate: ${inr(q.epc_rate_per_kw)} / kW (incl. GST)  ·  Blended GST: 8.9% (5% on 70% + 18% on 30%)`,
    40, y,
  );
  y += 20;

  // Milestones
  const mil = q.milestones && q.milestones.length
    ? q.milestones
    : [
        { pct: 10, label: "Advance against Purchase Order" },
        { pct: 70, label: "Material ready to dispatch" },
        { pct: 15, label: "Pre-installation" },
        { pct: 5,  label: "Post-installation / Commissioning" },
      ];
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(NAVY);
  doc.text("Payment Milestones", 40, y); y += 14;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(GREY);
  mil.forEach((m) => {
    const amt = g.grand_total * (m.pct / 100);
    doc.text(`${m.pct}% — ${m.label}`, 50, y);
    doc.text(inr(amt), W - 50, y, { align: "right" });
    y += 14;
  });

  // Terms
  y += 10;
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(NAVY);
  doc.text("Terms & Conditions", 40, y); y += 14;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(GREY);
  const terms = [
    "1. Quotation valid for 15 days from the date of issue.",
    "2. GST is charged as per CBIC Notification: 5% on 70% (goods component) and 18% on 30% (services component) of the contract value.",
    "3. Scope: Turnkey EPC including supply, design, installation, commissioning, net-metering liaison, insurance during execution and module cleaning for 1 year.",
    "4. Subsidy disbursement (if any) is governed by MNRE / DISCOM under PM Surya Ghar guidelines.",
    "5. Statutory & DISCOM charges, transformer upgrade and civil works (if required) are at actuals.",
  ];
  terms.forEach((t) => {
    const split = doc.splitTextToSize(t, W - 80);
    doc.text(split, 40, y);
    y += split.length * 11;
  });

  // Footer
  doc.setDrawColor(ORANGE); doc.setLineWidth(1.5);
  doc.line(40, 800, W - 40, 800);
  doc.setTextColor(GREY); doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text(
    `${q.company || "Unite Solar"} — A Unite Developers Global Inc. Company`,
    W / 2, 815, { align: "center" },
  );

  doc.save(`EPC_Quote_${(q.customer_name || "Customer").replace(/\s+/g, "_")}_${q.capacity_kw}kW.pdf`);
}