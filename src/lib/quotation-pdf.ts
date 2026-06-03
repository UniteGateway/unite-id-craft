import jsPDF from "jspdf";
import { CostResult, inr } from "./pricing";

export interface QuotationData {
  customer_name: string; company_name?: string; mobile?: string; email?: string;
  address?: string; city?: string; state?: string; pincode?: string;
  project_type?: string; segment: string; capacity_kw: number;
  structure_type?: string; floors?: number; tariff?: number;
  cost: CostResult;
  quotation_no?: string;
}

const ORANGE = "#f08c00";
const NAVY = "#1a3c6e";
const GREY = "#3a3a3a";

export function downloadQuotationPDF(q: QuotationData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 40;

  // Header bar
  doc.setFillColor(ORANGE);
  doc.rect(0, 0, W, 80, "F");
  doc.setTextColor("#fff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("UNITE SOLAR", 40, 38);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Solar EPC • Renewable Energy Solutions", 40, 56);
  doc.setFontSize(9);
  doc.text("www.unitesolar.in", W - 40, 38, { align: "right" });
  doc.text("hello@unitesolar.in", W - 40, 52, { align: "right" });

  y = 110;
  doc.setTextColor(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SOLAR PROJECT QUOTATION", 40, y);
  doc.setFontSize(9);
  doc.setTextColor(GREY);
  doc.setFont("helvetica", "normal");
  doc.text(`Quote #: ${q.quotation_no ?? "DRAFT"}`, W - 40, y - 12, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, W - 40, y, { align: "right" });

  // Customer box
  y += 20;
  doc.setDrawColor(220);
  doc.setFillColor(248, 250, 252);
  doc.rect(40, y, W - 80, 90, "FD");
  doc.setTextColor(NAVY); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("CUSTOMER", 50, y + 16);
  doc.setTextColor(GREY); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  let cy = y + 32;
  const lines = [
    `${q.customer_name}${q.company_name ? " — " + q.company_name : ""}`,
    [q.mobile, q.email].filter(Boolean).join(" • "),
    [q.address, q.city, q.state, q.pincode].filter(Boolean).join(", "),
    `Project: ${q.project_type ?? q.segment} • Capacity: ${q.capacity_kw} kW`,
  ];
  lines.forEach((t) => { doc.text(t || " ", 50, cy); cy += 12; });

  // Cost breakdown table
  y += 110;
  doc.setFillColor(NAVY);
  doc.rect(40, y, W - 80, 22, "F");
  doc.setTextColor("#fff"); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("COST BREAKDOWN", 50, y + 15);
  doc.text("AMOUNT (₹)", W - 50, y + 15, { align: "right" });

  y += 22;
  doc.setTextColor(GREY); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  for (const line of q.cost.lines) {
    if (y > 720) { doc.addPage(); y = 60; }
    doc.text(line.label, 50, y + 14, { maxWidth: 360 });
    if (line.detail) {
      doc.setFontSize(7); doc.setTextColor(150);
      doc.text(line.detail, 50, y + 24, { maxWidth: 360 });
      doc.setFontSize(9); doc.setTextColor(GREY);
    }
    doc.text(inr(line.amount).replace("₹", ""), W - 50, y + 14, { align: "right" });
    y += line.detail ? 30 : 20;
    doc.setDrawColor(235); doc.line(40, y, W - 40, y);
  }

  // Totals
  y += 10;
  const row = (label: string, val: string, bold = false) => {
    if (y > 750) { doc.addPage(); y = 60; }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(bold ? NAVY : GREY);
    doc.text(label, W - 250, y);
    doc.text(val, W - 50, y, { align: "right" });
    y += 16;
  };
  row("Subtotal", inr(q.cost.subtotal));
  row(`GST`, inr(q.cost.gst));
  row("Final Price (incl. GST)", inr(q.cost.final_price), true);
  if (q.cost.subsidy > 0) {
    doc.setTextColor("#16a34a");
    row("PM Surya Ghar Subsidy", "- " + inr(q.cost.subsidy));
    doc.setTextColor(GREY);
  }
  doc.setFillColor(ORANGE);
  doc.rect(W - 260, y, 220, 26, "F");
  doc.setTextColor("#fff"); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("NET PAYABLE", W - 250, y + 17);
  doc.text(inr(q.cost.net_to_customer), W - 50, y + 17, { align: "right" });
  y += 40;

  // Per kW note
  doc.setTextColor(GREY); doc.setFont("helvetica", "italic"); doc.setFontSize(8);
  doc.text(`Effective price: ${inr(q.cost.per_kw)} / kW (before subsidy)`, 40, y);
  y += 24;

  // Terms
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(NAVY);
  doc.text("Terms & Conditions", 40, y); y += 14;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(GREY);
  const terms = [
    "1. Quotation valid for 15 days from the date of issue.",
    "2. Payment terms: 30% advance, 50% on material delivery, 20% on commissioning.",
    "3. Generation estimate is indicative; actual generation depends on site conditions, shadow & weather.",
    "4. Subsidy disbursement is governed by MNRE / DISCOM as per PM Surya Ghar guidelines.",
    "5. GST and statutory charges may vary as per government notification.",
  ];
  terms.forEach((t) => { doc.text(t, 40, y, { maxWidth: W - 80 }); y += 12; });

  // Footer
  doc.setDrawColor(ORANGE); doc.setLineWidth(1.5);
  doc.line(40, 800, W - 40, 800);
  doc.setTextColor(GREY); doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text("Unite Solar — A Unite Developers Global Inc. Company", W / 2, 815, { align: "center" });

  doc.save(`Quotation_${q.customer_name.replace(/\s+/g, "_")}_${q.capacity_kw}kW.pdf`);
}