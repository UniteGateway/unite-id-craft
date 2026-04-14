import JsBarcode from "jsbarcode";
import uniteSolarLogoSrc from "@/assets/unite-solar-logo.png";

export interface ExportableIdCardData {
  name: string;
  designation: string;
  employeeId: string;
  photo: string | null;
  photoZoom?: number;
  photoOffsetX?: number;
  photoOffsetY?: number;
}

const BASE_WIDTH = 320;
const BASE_HEIGHT = 506;
const WHITE = "#ffffff";
const DARK = "#3a3a3a";
const ORANGE = "#f08c00";
const MUTED_TEXT = "#cccccc";
const PLACEHOLDER = "#e0e0e0";
const PLACEHOLDER_TEXT = "#999999";
const FONT_FAMILY = "Inter, Arial, Helvetica, sans-serif";
const DEFAULT_SCALE = 2;

export const ID_CARD_EXPORT_SIZE_MM = {
  width: 54,
  height: 85.6,
};

const dataUrlCache = new Map<string, Promise<string>>();
const imageCache = new Map<string, Promise<HTMLImageElement>>();
const barcodeCache = new Map<string, HTMLCanvasElement>();

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image blob"));
    reader.readAsDataURL(blob);
  });

const srcToDataUrl = async (src: string) => {
  if (!src || src.startsWith("data:")) {
    return src;
  }

  const cached = dataUrlCache.get(src);
  if (cached) {
    return cached;
  }

  const promise = fetch(src)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      return response.blob();
    })
    .then(blobToDataUrl);

  dataUrlCache.set(src, promise);
  return promise;
};

const loadImage = async (src: string) => {
  const resolvedSrc = src.startsWith("data:") ? src : await srcToDataUrl(src).catch(() => src);
  const cached = imageCache.get(resolvedSrc);

  if (cached) {
    return cached;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${resolvedSrc}`));
    image.src = resolvedSrc;
  });

  imageCache.set(resolvedSrc, promise);
  return promise;
};

const waitForFonts = async () => {
  if ("fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness failures and fall back to available fonts.
    }
  }
};

const createRoundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const setFont = (ctx: CanvasRenderingContext2D, fontWeight: number, fontSize: number) => {
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
};

const measureTextWidth = (ctx: CanvasRenderingContext2D, text: string, letterSpacing = 0) => {
  if (!text) {
    return 0;
  }

  return ctx.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing;
};

const drawTextWithLetterSpacing = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing = 0,
) => {
  let cursorX = x;
  for (const character of text) {
    ctx.fillText(character, cursorX, y);
    cursorX += ctx.measureText(character).width + letterSpacing;
  }
};

const truncateToWidth = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  letterSpacing = 0,
) => {
  let output = text.trim();
  while (output.length > 0 && measureTextWidth(ctx, `${output}…`, letterSpacing) > maxWidth) {
    output = output.slice(0, -1).trimEnd();
  }
  return output ? `${output}…` : "";
};

const drawCenteredImageByHeight = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  top: number,
  height: number,
) => {
  const ratio = height / image.naturalHeight;
  const drawWidth = image.naturalWidth * ratio;
  const drawX = (BASE_WIDTH - drawWidth) / 2;
  ctx.drawImage(image, drawX, top, drawWidth, height);
};

const drawRoundedImageCover = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
) => {
  const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const finalScale = baseScale * zoom;
  const drawWidth = image.naturalWidth * finalScale;
  const drawHeight = image.naturalHeight * finalScale;
  const drawX = x + (width - drawWidth) / 2 + (offsetX / 100) * width;
  const drawY = y + (height - drawHeight) / 2 + (offsetY / 100) * height;

  ctx.save();
  createRoundedRectPath(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  ctx.save();
  createRoundedRectPath(ctx, x, y, width, height, radius);
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
};

const drawFittedCenterText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  options: {
    color: string;
    fontSize: number;
    fontWeight: number;
    maxWidth: number;
    minFontSize?: number;
    uppercase?: boolean;
    letterSpacing?: number;
  },
) => {
  const {
    color,
    fontSize,
    fontWeight,
    maxWidth,
    minFontSize = 10,
    uppercase = false,
    letterSpacing = 0,
  } = options;
  let content = uppercase ? text.toUpperCase() : text;
  let size = fontSize;

  for (; size > minFontSize; size -= 1) {
    setFont(ctx, fontWeight, size);
    if (measureTextWidth(ctx, content, letterSpacing) <= maxWidth) {
      break;
    }
  }

  setFont(ctx, fontWeight, size);
  if (measureTextWidth(ctx, content, letterSpacing) > maxWidth) {
    content = truncateToWidth(ctx, content, maxWidth, letterSpacing);
  }

  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  drawTextWithLetterSpacing(
    ctx,
    content,
    (BASE_WIDTH - measureTextWidth(ctx, content, letterSpacing)) / 2,
    y,
    letterSpacing,
  );
};

const drawDesignation = (ctx: CanvasRenderingContext2D, designation: string) => {
  drawFittedCenterText(ctx, designation || "Designation", BASE_HEIGHT * 0.66, {
    color: MUTED_TEXT,
    fontSize: 13,
    fontWeight: 600,
    maxWidth: BASE_WIDTH * 0.82,
    minFontSize: 10,
  });
};

const drawEmployeeId = (ctx: CanvasRenderingContext2D, employeeId: string) => {
  const label = "Employee ID: ";
  const value = employeeId || "US-BA-001";
  const y = BASE_HEIGHT * 0.73;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  setFont(ctx, 400, 12);
  const labelWidth = ctx.measureText(label).width;
  setFont(ctx, 700, 12);
  const valueWidth = ctx.measureText(value).width;
  const startX = (BASE_WIDTH - (labelWidth + valueWidth)) / 2;

  ctx.fillStyle = WHITE;
  setFont(ctx, 400, 12);
  ctx.fillText(label, startX, y);
  setFont(ctx, 700, 12);
  ctx.fillText(value, startX + labelWidth, y);
};

const getBarcodeCanvas = (employeeId: string, scale: number) => {
  const key = `${employeeId}-${scale}`;
  const cached = barcodeCache.get(key);

  if (cached) {
    return cached;
  }

  const barcodeCanvas = document.createElement("canvas");
  barcodeCanvas.width = Math.round(BASE_WIDTH * 0.8 * scale);
  barcodeCanvas.height = Math.round(BASE_HEIGHT * 0.1 * scale);

  try {
    JsBarcode(barcodeCanvas, employeeId || "US-BA-001", {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      width: Math.max(1, scale * 0.9),
      height: Math.round(BASE_HEIGHT * 0.1 * scale),
      lineColor: WHITE,
      background: "rgba(0,0,0,0)",
    });
  } catch {
    const fallbackCtx = barcodeCanvas.getContext("2d");
    if (fallbackCtx) {
      fallbackCtx.clearRect(0, 0, barcodeCanvas.width, barcodeCanvas.height);
      fallbackCtx.fillStyle = WHITE;
      for (let x = 0; x < barcodeCanvas.width; x += 10) {
        fallbackCtx.fillRect(x, 0, 5, barcodeCanvas.height);
      }
    }
  }

  barcodeCache.set(key, barcodeCanvas);
  return barcodeCanvas;
};

const drawPlaceholderPhoto = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
  ctx.save();
  createRoundedRectPath(ctx, x, y, width, height, 14);
  ctx.fillStyle = PLACEHOLDER;
  ctx.fill();
  ctx.restore();

  ctx.save();
  createRoundedRectPath(ctx, x, y, width, height, 14);
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = PLACEHOLDER_TEXT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  setFont(ctx, 500, 14);
  ctx.fillText("Photo", x + width / 2, y + height / 2);
};

export const renderIdCardCanvas = async (
  data: ExportableIdCardData,
  scale = DEFAULT_SCALE,
) => {
  await waitForFonts();

  const canvas = document.createElement("canvas");
  canvas.width = BASE_WIDTH * scale;
  canvas.height = BASE_HEIGHT * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  const [logoImage, photoImage] = await Promise.all([
    loadImage(uniteSolarLogoSrc),
    data.photo ? loadImage(data.photo).catch(() => null) : Promise.resolve(null),
  ]);

  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.save();
  createRoundedRectPath(ctx, 0, 0, BASE_WIDTH, BASE_HEIGHT, 16);
  ctx.clip();

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT * 0.35);

  ctx.fillStyle = DARK;
  ctx.fillRect(0, BASE_HEIGHT * 0.35, BASE_WIDTH, BASE_HEIGHT * 0.65);

  ctx.save();
  ctx.translate(BASE_WIDTH, BASE_HEIGHT * 0.28);
  ctx.transform(1, Math.tan((-15 * Math.PI) / 180), 0, 1, 0, 0);
  ctx.fillStyle = ORANGE;
  ctx.fillRect(-BASE_WIDTH * 0.35, 0, BASE_WIDTH * 0.35, BASE_HEIGHT * 0.12);
  ctx.restore();

  ctx.save();
  ctx.translate(0, BASE_HEIGHT * 0.28);
  ctx.transform(1, Math.tan((15 * Math.PI) / 180), 0, 1, 0, 0);
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 0, BASE_WIDTH * 0.35, BASE_HEIGHT * 0.12);
  ctx.restore();

  drawCenteredImageByHeight(ctx, logoImage, 8, 80);

  const photoX = (BASE_WIDTH - 170) / 2;
  const photoY = BASE_HEIGHT * 0.19;
  if (photoImage) {
    drawRoundedImageCover(ctx, photoImage, photoX, photoY, 170, 195, 14);
  } else {
    drawPlaceholderPhoto(ctx, photoX, photoY, 170, 195);
  }

  drawFittedCenterText(ctx, data.name || "Full Name", BASE_HEIGHT * 0.6, {
    color: WHITE,
    fontSize: 18,
    fontWeight: 700,
    maxWidth: BASE_WIDTH * 0.84,
    minFontSize: 12,
    uppercase: true,
    letterSpacing: 1,
  });

  drawDesignation(ctx, data.designation || "Designation");

  ctx.fillStyle = ORANGE;
  ctx.fillRect(BASE_WIDTH * 0.15, BASE_HEIGHT * 0.71, BASE_WIDTH * 0.7, 1);

  drawEmployeeId(ctx, data.employeeId || "US-BA-001");

  const barcodeCanvas = getBarcodeCanvas(data.employeeId || "US-BA-001", scale);
  ctx.drawImage(
    barcodeCanvas,
    BASE_WIDTH * 0.1,
    BASE_HEIGHT * 0.79,
    BASE_WIDTH * 0.8,
    BASE_HEIGHT * 0.1,
  );

  drawFittedCenterText(ctx, "www.unitesolar.in", BASE_HEIGHT - 21, {
    color: WHITE,
    fontSize: 11,
    fontWeight: 500,
    maxWidth: BASE_WIDTH * 0.82,
    minFontSize: 10,
  });

  ctx.restore();

  return canvas;
};

export const downloadCanvasAsPng = (canvas: HTMLCanvasElement, filename: string) =>
  new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create PNG file"));
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, "image/png");
  });
