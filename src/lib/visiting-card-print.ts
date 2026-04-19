// Multi-up print sheet generator for standard 3.5" x 2" business cards on a
// 13" x 19" sheet at 300 DPI with 3mm bleed and 0.25pt hairline crop marks.
import jsPDF from "jspdf";

export const SHEET_W_IN = 13;
export const SHEET_H_IN = 19;
export const CARD_W_IN = 3.5;
export const CARD_H_IN = 2;
export const BLEED_MM = 3;
export const BLEED_IN = BLEED_MM / 25.4; // ~0.118"
export const DPI = 300;
export const CROP_MARK_IN = 0.125; // length of each crop mark
export const HAIRLINE_PT = 0.25;

export interface CardZone {
  role: string;
  x: number; // %
  y: number;
  width: number;
  height: number;
  font_size_pct: number;
  text_align: "left" | "center" | "right";
  color_hex: string;
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
  return { templateImage, zones, values };
}

/** Renders a single card (with bleed) onto its own canvas. */
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

  // Fill background by stretching template into bleed area
  ctx.drawImage(card.templateImage, 0, 0, w, h);

  // Draw text fields (positions are % of card body, not bleed)
  const bodyOffsetX = bleedIn * DPI;
  const bodyOffsetY = bleedIn * DPI;
  const bodyW = CARD_W_IN * DPI;
  const bodyH = CARD_H_IN * DPI;

  for (const zone of card.zones) {
    const text = card.values[zone.role] || "";
    if (!text) continue;
    const fontPx = (zone.font_size_pct / 100) * bodyH;
    ctx.fillStyle = zone.color_hex || "#111111";
    ctx.font = `600 ${fontPx}px Inter, system-ui, sans-serif`;
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

/** Builds a 13x19" PDF with auto-fit grid + hairline crop marks. */
export async function exportPrintSheet(
  cards: RenderableCard[],
  filename = "visiting-cards-sheet.pdf",
) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: [SHEET_W_IN, SHEET_H_IN] });
  const cardWBleed = CARD_W_IN + BLEED_IN * 2;
  const cardHBleed = CARD_H_IN + BLEED_IN * 2;
  const margin = 0.5; // outer margin
  const cols = Math.floor((SHEET_W_IN - margin * 2) / cardWBleed);
  const rows = Math.floor((SHEET_H_IN - margin * 2) / cardHBleed);
  const perSheet = cols * rows;
  if (perSheet === 0) throw new Error("Card too large for sheet");

  let placed = 0;
  let cardIdx = 0;
  while (cardIdx < cards.length) {
    if (placed > 0) pdf.addPage([SHEET_W_IN, SHEET_H_IN], "portrait");
    placed = 0;
    for (let r = 0; r < rows && cardIdx < cards.length; r++) {
      for (let c = 0; c < cols && cardIdx < cards.length; c++) {
        const card = cards[cardIdx++];
        const canvas = renderCardCanvas(card, true);
        const x = margin + c * cardWBleed;
        const y = margin + r * cardHBleed;
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", x, y, cardWBleed, cardHBleed);

        // Trim box (inside the bleed)
        const tx = x + BLEED_IN;
        const ty = y + BLEED_IN;
        const tw = CARD_W_IN;
        const th = CARD_H_IN;

        // Hairline crop marks at the 4 corners of the trim box
        pdf.setLineWidth(HAIRLINE_PT / 72);
        pdf.setDrawColor(0, 0, 0);
        const m = CROP_MARK_IN;
        const gap = 0.05; // small gap between trim and start of mark
        // Top-left
        pdf.line(tx - m - gap, ty, tx - gap, ty);
        pdf.line(tx, ty - m - gap, tx, ty - gap);
        // Top-right
        pdf.line(tx + tw + gap, ty, tx + tw + m + gap, ty);
        pdf.line(tx + tw, ty - m - gap, tx + tw, ty - gap);
        // Bottom-left
        pdf.line(tx - m - gap, ty + th, tx - gap, ty + th);
        pdf.line(tx, ty + th + gap, tx, ty + th + m + gap);
        // Bottom-right
        pdf.line(tx + tw + gap, ty + th, tx + tw + m + gap, ty + th);
        pdf.line(tx + tw, ty + th + gap, tx + tw, ty + th + m + gap);

        placed++;
      }
    }
  }

  pdf.save(filename);
  return { cols, rows, perSheet };
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
