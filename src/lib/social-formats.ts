// Centralised social-media format catalogue. Used by the Social Media studio
// for format pickers, aspect-ratio previews, and the edge function spec.
import { Square, Smartphone, Image as ImageIcon, Linkedin, Twitter, Youtube, Facebook, Instagram } from "lucide-react";

export type SocialFormat =
  | "instagram_post"
  | "instagram_story"
  | "facebook_post"
  | "linkedin_post"
  | "x_post"
  | "youtube_thumb";

export interface FormatSpec {
  id: SocialFormat;
  label: string;
  platform: string;
  /** Pixel dimensions delivered by the renderer. */
  w: number;
  h: number;
  /** Tailwind aspect-ratio class for previews. */
  aspect: string;
  /** Closest size string for OpenAI image gen (must match supported sizes). */
  openaiSize: "1024x1024" | "1024x1792" | "1792x1024";
  icon: any;
  platformIcon: any;
  hue: string;
}

export const SOCIAL_FORMATS: FormatSpec[] = [
  { id: "instagram_post", label: "Instagram Post", platform: "Instagram", w: 1080, h: 1080, aspect: "aspect-square", openaiSize: "1024x1024", icon: Square, platformIcon: Instagram, hue: "from-fuchsia-500 to-pink-500" },
  { id: "instagram_story", label: "Instagram Story", platform: "Instagram", w: 1080, h: 1920, aspect: "aspect-[9/16]", openaiSize: "1024x1792", icon: Smartphone, platformIcon: Instagram, hue: "from-pink-500 to-rose-400" },
  { id: "facebook_post", label: "Facebook Post", platform: "Facebook", w: 1200, h: 630, aspect: "aspect-[1.91/1]", openaiSize: "1792x1024", icon: ImageIcon, platformIcon: Facebook, hue: "from-blue-600 to-blue-400" },
  { id: "linkedin_post", label: "LinkedIn Post", platform: "LinkedIn", w: 1200, h: 627, aspect: "aspect-[1.91/1]", openaiSize: "1792x1024", icon: ImageIcon, platformIcon: Linkedin, hue: "from-sky-700 to-sky-500" },
  { id: "x_post", label: "X / Twitter Post", platform: "X", w: 1600, h: 900, aspect: "aspect-video", openaiSize: "1792x1024", icon: ImageIcon, platformIcon: Twitter, hue: "from-slate-800 to-slate-600" },
  { id: "youtube_thumb", label: "YouTube Thumbnail", platform: "YouTube", w: 1280, h: 720, aspect: "aspect-video", openaiSize: "1792x1024", icon: ImageIcon, platformIcon: Youtube, hue: "from-red-600 to-red-400" },
];

export const FORMAT_BY_ID: Record<SocialFormat, FormatSpec> =
  Object.fromEntries(SOCIAL_FORMATS.map((f) => [f.id, f])) as Record<SocialFormat, FormatSpec>;
