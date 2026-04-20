// Google Fonts loader: injects <link> tags on demand and waits for the font
// to be ready so canvas exports render with the right typeface.

export const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "Lato",
  "Open Sans",
  "Oswald",
  "Raleway",
  "Merriweather",
  "Bebas Neue",
  "Nunito",
  "Source Sans 3",
  "Work Sans",
  "DM Sans",
  "Cormorant Garamond",
] as const;

export type GoogleFont = (typeof GOOGLE_FONTS)[number];

const loaded = new Set<string>();

function familyToHref(family: string) {
  const f = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${f}:wght@400;500;600;700&display=swap`;
}

/** Injects the <link> tag for a Google Font (idempotent). */
export function injectGoogleFont(family: string) {
  if (loaded.has(family)) return;
  if (typeof document === "undefined") return;
  const id = `gf-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) {
    loaded.add(family);
    return;
  }
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = familyToHref(family);
  document.head.appendChild(link);
  loaded.add(family);
}

/** Inject + wait for the font face to be usable (for canvas drawing). */
export async function ensureFontReady(family: string, weight: number | string = 600) {
  injectGoogleFont(family);
  if (typeof document === "undefined" || !(document as any).fonts) return;
  try {
    await (document as any).fonts.load(`${weight} 32px "${family}"`);
  } catch {
    /* ignore */
  }
}

/** Preload many fonts at once before rendering a print sheet. */
export async function ensureFontsReady(families: string[]) {
  await Promise.all(Array.from(new Set(families)).map((f) => ensureFontReady(f)));
}
