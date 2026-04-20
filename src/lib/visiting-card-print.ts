// Multi-up print sheet generator for standard 3.5" x 2" business cards.
// Supports multiple sheet sizes with 3mm bleed and 0.25pt hairline crop marks.
import jsPDF from "jspdf";
import { ensureFontsReady } from "./google-fonts";

export const CARD_W_IN = 3.5;
export const CARD_H_IN = 2;
export const BLEED_MM = 3;
export const BLEED_IN = BLEED_MM / 25.4; // ~0.118"
export const DPI = 300;
export const CROP_MARK_IN = 0.125;
export const HAIRLINE_PT = 0.25;

export interface SheetSize {
  id: string;
  label: string;
  widthIn: number;
  heightIn: number;
  marginIn: number;
}

export const SHEET_OPTIONS: SheetSize[] = [
  { id: "13x19", label: '13" × 19" (24-up)', widthIn: 13, heightIn: 19, marginIn: 0.5 },
  { id: "12x18", label: '12" × 18" (24-up)', widthIn: 12, heightIn: 18, marginIn: 0.4 },
  { id: "19x25", label: '19" × 25" (32-up)', widthIn: 19, heightIn: 25, marginIn: 0.5 },
  { id: "18x24", label: '18" × 24" (40-up)', widthIn: 18, heightIn: 24, marginIn: 0.4 },
  { id: "a4", label: "A4 (10-up)", widthIn: 8.27, heightIn: 11.69, marginIn: 0.25 },
];

// Backwards-compat exports
export const SHEET_W_IN = 13;
export const SHEET_H_IN = 19;

export interface CardZone {
  role: string;
  x: number; // %
  y: number;
  width: number;
  height: number;
  font_size_pct: number;
  text_align: "left" | "center" | "right";
  color_hex: string;
  font_family?: string;
  font_weight?: number;
}

export interface RenderableCard {
  templateImage: HTMLImageElement;
  zones: CardZone[];
  values: Record<string, string>;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export async function loadCard(
  imageUrl: string,
  zones: CardZone[],
  values: Record<string, string>,
): Promise<RenderableCard> {
  const templateImage = await loadImage(imageUrl);
  // Preload any custom Google Fonts referenced by zones so canvas draws sharp.
  const families = zones.map((z) => z.font_family).filter(Boolean) as string[];
  if (families.length) await ensureFontsReady(families);
  return { templateImage, zones, values };
}

/** Renders a single card (with optional bleed) onto its own canvas. */
export function renderCardCanvas(card: RenderableCard, withBleed = true): HTMLCanvasElement {
  const bleedIn = withBleed ? BLEED_IN : 0;
  const wIn = CARD_W_IN + bleedIn * 2;
  const hIn = CARD_H_IN + bleedIn * 2;
  const w = Math.round(wIn * DPI);
  const h = Math.round(hIn * DPI);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(card.templateImage, 0, 0, w, h);

  const bodyOffsetX = bleedIn * DPI;
  const bodyOffsetY = bleedIn * DPI;
  const bodyW = CARD_W_IN * DPI;
  const bodyH = CARD_H_IN * DPI;

  for (const zone of card.zones) {
    const text = card.values[zone.role] || "";
    if (!text) continue;
    const fontPx = (zone.font_size_pct / 100) * bodyH;
    const family = zone.font_family || "Inter";
    const weight = zone.font_weight || 600;
    ctx.fillStyle = zone.color_hex || "#111111";
    ctx.font = `${weight} ${fontPx}px "${family}", system-ui, sans-serif`;
    ctx.textBaseline = "top";
    ctx.textAlign = zone.text_align;
    const zx = bodyOffsetX + (zone.x / 100) * bodyW;
    const zy = bodyOffsetY + (zone.y / 100) * bodyH;
    const zw = (zone.width / 100) * bodyW;
    let drawX = zx;
    if (zone.text_align === "center") drawX = zx + zw / 2;
    else if (zone.text_align === "right") drawX = zx + zw;
    ctx.fillText(text, drawX, zy, zw);
  }
  return canvas;
}

export interface SheetExportOptions {
  sheet?: SheetSize;
  cropMarks?: boolean;
  filename?: string;
}

/** Builds an n-up PDF with auto-fit grid + hairline crop marks. */
export async function exportPrintSheet(
  cards: RenderableCard[],
  filenameOrOpts: string | SheetExportOptions = "visiting-cards-sheet.pdf",
) {
  const opts: SheetExportOptions =
    typeof filenameOrOpts === "string" ? { filename: filenameOrOpts } : filenameOrOpts;
  const sheet = opts.sheet || SHEET_OPTIONS[0];
  const cropMarks = opts.cropMarks !== false;
  const filename = opts.filename || "visiting-cards-sheet.pdf";

  const orientation = sheet.widthIn > sheet.heightIn ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "in", format: [sheet.widthIn, sheet.heightIn] });
  const cardWBleed = CARD_W_IN + BLEED_IN * 2;
  const cardHBleed = CARD_H_IN + BLEED_IN * 2;
  const cols = Math.floor((sheet.widthIn - sheet.marginIn * 2) / cardWBleed);
  const rows = Math.floor((sheet.heightIn - sheet.marginIn * 2) / cardHBleed);
  const perSheet = cols * rows;
  if (perSheet === 0) throw new Error("Card too large for sheet");

  let placed = 0;
  let cardIdx = 0;
  while (cardIdx < cards.length) {
    if (placed > 0) pdf.addPage([sheet.widthIn, sheet.heightIn], orientation);
    placed = 0;
    for (let r = 0; r < rows && cardIdx < cards.length; r++) {
      for (let c = 0; c < cols && cardIdx < cards.length; c++) {
        const card = cards[cardIdx++];
        const canvas = renderCardCanvas(card, true);
        const x = sheet.marginIn + c * cardWBleed;
        const y = sheet.marginIn + r * cardHBleed;
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", x, y, cardWBleed, cardHBleed);

        if (cropMarks) {
          const tx = x + BLEED_IN;
          const ty = y + BLEED_IN;
          const tw = CARD_W_IN;
          const th = CARD_H_IN;
          pdf.setLineWidth(HAIRLINE_PT / 72);
          pdf.setDrawColor(0, 0, 0);
          const m = CROP_MARK_IN;
          const gap = 0.05;
          pdf.line(tx - m - gap, ty, tx - gap, ty);
          pdf.line(tx, ty - m - gap, tx, ty - gap);
          pdf.line(tx + tw + gap, ty, tx + tw + m + gap, ty);
          pdf.line(tx + tw, ty - m - gap, tx + tw, ty - gap);
          pdf.line(tx - m - gap, ty + th, tx - gap, ty + th);
          pdf.line(tx, ty + th + gap, tx, ty + th + m + gap);
          pdf.line(tx + tw + gap, ty + th, tx + tw + m + gap, ty + th);
          pdf.line(tx + tw, ty + th + gap, tx + tw, ty + th + m + gap);
        }
        placed++;
      }
    }
  }

  pdf.save(filename);
  return { cols, rows, perSheet, sheet };
}

/** Single card PDF export with bleed. */
export async function exportSingleCard(card: RenderableCard, filename = "visiting-card.pdf") {
  const wIn = CARD_W_IN + BLEED_IN * 2;
  const hIn = CARD_H_IN + BLEED_IN * 2;
  const pdf = new jsPDF({ orientation: "landscape", unit: "in", format: [wIn, hIn] });
  const canvas = renderCardCanvas(card, true);
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, wIn, hIn);
  pdf.save(filename);
}
