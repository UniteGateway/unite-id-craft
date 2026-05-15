// Lightweight geocoding + static map helpers (no API key required).
// Uses OpenStreetMap Nominatim for geocoding and OSM static map renderer.
// Swap in Google Maps later if a key is added.

export interface GeoPoint { lat: number; lng: number; }

const cache = new Map<string, GeoPoint | null>();

export async function geocodeLocation(query: string): Promise<GeoPoint | null> {
  const q = (query || "").trim();
  if (!q) return null;
  if (cache.has(q)) return cache.get(q) ?? null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { headers: { Accept: "application/json" } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      const p: GeoPoint = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      cache.set(q, p);
      return p;
    }
  } catch { /* ignore */ }
  cache.set(q, null);
  return null;
}

// OSM-based static map (no key, public service). Has rate limits; fine for proposals.
export function osmStaticMapUrl(p: GeoPoint, w = 760, h = 460, zoom = 16): string {
  const lat = p.lat.toFixed(5);
  const lng = p.lng.toFixed(5);
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${w}x${h}&maptype=mapnik&markers=${lat},${lng},red-pushpin`;
}
