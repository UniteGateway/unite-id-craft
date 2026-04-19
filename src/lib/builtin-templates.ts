// Built-in starter templates shown in the library alongside user uploads &
// AI-generated designs. New built-ins can be added here over time.
import uniteSolarSrikanth from "@/assets/templates/unite-solar-srikanth.jpeg";
import type { CardZone } from "@/lib/visiting-card-print";

export interface BuiltInTemplate {
  id: string;
  name: string;
  image: string;
  zones: CardZone[];
}

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: "unite-solar-classic",
    name: "Unite Solar — Classic",
    image: uniteSolarSrikanth,
    // Zones calibrated to the 3.5x2 visiting card layout of the reference design
    zones: [
      { role: "name",    x: 36, y: 6,  width: 50, height: 9,  font_size_pct: 8.5, text_align: "left", color_hex: "#111111" },
      { role: "title",   x: 36, y: 16, width: 60, height: 6,  font_size_pct: 5.0, text_align: "left", color_hex: "#333333" },
      { role: "phone",   x: 36, y: 23, width: 40, height: 6,  font_size_pct: 5.0, text_align: "left", color_hex: "#222222" },
      { role: "company", x: 36, y: 33, width: 60, height: 8,  font_size_pct: 7.0, text_align: "left", color_hex: "#0d1b3e" },
      { role: "city_1",  x: 36, y: 42, width: 40, height: 5,  font_size_pct: 4.5, text_align: "left", color_hex: "#f08c00" },
      { role: "address_1", x: 36, y: 47, width: 60, height: 14, font_size_pct: 4.0, text_align: "left", color_hex: "#222222" },
      { role: "city_2",  x: 36, y: 62, width: 40, height: 5,  font_size_pct: 4.5, text_align: "left", color_hex: "#f08c00" },
      { role: "address_2", x: 36, y: 67, width: 60, height: 14, font_size_pct: 4.0, text_align: "left", color_hex: "#222222" },
      { role: "website", x: 36, y: 88, width: 28, height: 6,  font_size_pct: 4.5, text_align: "left", color_hex: "#f08c00" },
      { role: "email",   x: 66, y: 88, width: 32, height: 6,  font_size_pct: 4.5, text_align: "left", color_hex: "#f08c00" },
    ],
  },
];
