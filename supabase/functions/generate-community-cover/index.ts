import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const THEME_PROMPTS: Record<string, string> = {
  "Dark Premium":
    "ultra-premium dark cinematic composition, deep charcoal and obsidian background, warm gold accents, faint architectural lines of a luxury gated community at dusk, abstract solar panel grid silhouette, subtle volumetric light, magazine cover quality",
  "Corporate Blue":
    "clean corporate composition, deep navy blue background with bright cyan accents, structured geometric grid, modern apartment community skyline silhouette, minimal solar panel array, professional trust-building mood, soft daylight",
  "Green":
    "vibrant sustainability composition, lush emerald green and soft teal palette with white accents, leaves growing into solar panel patterns, eco-friendly residential community at golden hour, fresh and optimistic",
  "Luxury Gold":
    "opulent luxury composition, rich champagne gold and warm cream tones over deep brown, premium gated community villas at sunrise, refined solar panels integrated as architectural feature, aspirational wealth feel, soft glow",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { theme, communityName, location, capacityKw } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const styleLine = THEME_PROMPTS[theme] || THEME_PROMPTS["Dark Premium"];

    const prompt = `Premium A4 landscape cover artwork for a Unite Solar gated-community proposal.
Theme: ${theme}. Style: ${styleLine}.
Composition: cinematic wide landscape, generous negative space on the LEFT and BOTTOM for title and stats overlay (no text in the image).
Mood inspired by community "${communityName || "Premium Community"}" in "${location || ""}", ${capacityKw || ""}kW solar installation.
Strict rules: NO text, NO logos, NO watermarks, NO people faces. Ultra-detailed, photoreal, magazine cover quality.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("No image was generated. Try a different theme.");

    return new Response(JSON.stringify({ image: imageUrl }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-community-cover error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});