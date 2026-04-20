import jsPDF from "jspdf";
import type { CardZone } from "./visiting-card-print";

export type DesignKind = "flyer" | "brochure" | "presentation";

export interface DesignFormat {
  kind: DesignKind;
  widthIn: number;
  heightIn: number;
  aspectCss: string; // for CSS aspectRatio
  label: string;
}

export const FORMATS: Record<DesignKind, DesignFormat> = {
  flyer:        { kind: "flyer",        widthIn: 8.27,  heightIn: 11.69, aspectCss: "1 / 1.414", label: "A4 Portrait" },
  brochure:     { kind: "brochure",     widthIn: 11.69, heightIn: 8.27,  aspectCss: "1.414 / 1", label: "A4 Landscape" },
  presentation: { kind: "presentation", widthIn: 13.33, heightIn: 7.5,   aspectCss: "16 / 9",     label: "16:9 Slide" },
};

const DPI = 200;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export interface PageData {
  imageUrl: string;
  zones: CardZone[];
  values: Record<string, string>;
}

async function renderPageCanvas(page: PageData, fmt: DesignFormat): Promise<HTMLCanvasElement> {
  const w = Math.round(fmt.widthIn * DPI);
  const h = Math.round(fmt.heightIn * DPI);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  if (page.imageUrl) {
    try {
      const img = await loadImage(page.imageUrl);
      // cover-fit
      const ir = img.width / img.height; const cr = w / h;
      let dw = w, dh = h, dx = 0, dy = 0;
      if (ir > cr) { dh = h; dw = h * ir; dx = (w - dw) / 2; }
      else { dw = w; dh = w / ir; dy = (h - dh) / 2; }
      ctx.drawImage(img, dx, dy, dw, dh);
    } catch { /* skip bg */ }
  }
  // Text overlays
  for (const z of page.zones) {
    const text = page.values[z.role] || "";
    if (!text) continue;
    const x = (z.x / 100) * w;
    const y = (z.y / 100) * h;
    const zw = (z.width / 100) * w;
    const zh = (z.height / 100) * h;
    const fontPx = (z.font_size_pct / 100) * zh;
    ctx.fillStyle = z.color_hex || "#111";
    ctx.font = `600 ${Math.max(10, fontPx)}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = "top";
    ctx.textAlign = (z.text_align as CanvasTextAlign) || "left";
    const tx = z.text_align === "center" ? x + zw / 2 : z.text_align === "right" ? x + zw : x;
    // simple word wrap
    const words = text.split(/\s+/);
    const lines: string[] = []; let line = "";
    for (const w0 of words) {
      const test = line ? line + " " + w0 : w0;
      if (ctx.measureText(test).width > zw && line) { lines.push(line); line = w0; }
      else line = test;
    }
    if (line) lines.push(line);
    const lh = fontPx * 1.2;
    lines.forEach((ln, i) => ctx.fillText(ln, tx, y + i * lh));
  }
  return canvas;
}

export async function exportDesignPNG(pages: PageData[], fmt: DesignFormat, filename = "design") {
  for (let i = 0; i < pages.length; i++) {
    const c = await renderPageCanvas(pages[i], fmt);
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}-p${i + 1}.png`;
    a.click();
  }
}

export async function exportDesignPDF(pages: PageData[], fmt: DesignFormat, filename = "design") {
  const orientation = fmt.widthIn >= fmt.heightIn ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "in", format: [fmt.widthIn, fmt.heightIn] });
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage([fmt.widthIn, fmt.heightIn], orientation);
    const c = await renderPageCanvas(pages[i], fmt);
    const url = c.toDataURL("image/jpeg", 0.92);
    pdf.addImage(url, "JPEG", 0, 0, fmt.widthIn, fmt.heightIn);
  }
  pdf.save(`${filename}.pdf`);
}
