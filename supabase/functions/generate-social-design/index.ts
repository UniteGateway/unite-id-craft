import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Format = "instagram_post" | "instagram_story";
type Model = "unite_gpt" | "unite_flash";

const FORMAT_SPECS: Record<Format, { size: string; w: number; h: number; label: string }> = {
  instagram_post: { size: "1024x1024", w: 1080, h: 1080, label: "Instagram Post (1:1)" },
  instagram_story: { size: "1024x1792", w: 1080, h: 1920, label: "Instagram Story (9:16)" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, format, model } = await req.json() as { prompt: string; format: Format; model: Model };

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const spec = FORMAT_SPECS[format];
    if (!spec) {
      return new Response(JSON.stringify({ error: "Invalid format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read admin-pasted API key from DB (service-role bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    let provider = model === "unite_gpt" ? "openai" : "gemini";
    const { data: keyRow } = await admin
      .from("api_keys")
      .select("api_key")
      .eq("provider", provider)
      .maybeSingle();
    let adminKey: string | undefined = keyRow?.api_key;

    // If user picked Unite GPT but no OpenAI key is configured, transparently
    // fall back to Unite Flash (Lovable AI) so the feature still works.
    let effectiveModel: Model = model;
    if (model === "unite_gpt" && !adminKey && !Deno.env.get("OPENAI_API_KEY")) {
      effectiveModel = "unite_flash";
      provider = "gemini";
      const { data: gemRow } = await admin
        .from("api_keys")
        .select("api_key")
        .eq("provider", "gemini")
        .maybeSingle();
      adminKey = gemRow?.api_key;
    }

    const fullPrompt = `${prompt.trim()}

Design a social media graphic for ${spec.label}. Modern, eye-catching, print-quality. Leave room for headline text. Solid clean composition.`;

    let imageDataUrl: string | null = null;

    if (effectiveModel === "unite_gpt") {
      // OpenAI gpt-image-1
      const apiKey = adminKey || Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) throw new Error("Unite GPT (OpenAI) key not configured. Ask an admin to paste it on the Admin page.");
      const r = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: fullPrompt,
          size: spec.size,
          n: 1,
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error("OpenAI error:", r.status, t);
        if (r.status === 401) throw new Error("Unite GPT key is invalid. Update it on the Admin page.");
        throw new Error(`Unite GPT error (${r.status})`);
      }
      const j = await r.json();
      const b64 = j.data?.[0]?.b64_json;
      const url = j.data?.[0]?.url;
      if (b64) imageDataUrl = `data:image/png;base64,${b64}`;
      else if (url) imageDataUrl = url;
    } else {
      // Gemini via Lovable AI Gateway (nano-banana). Admin key swaps gateway -> Google direct.
      const apiKey = adminKey || Deno.env.get("LOVABLE_API_KEY");
      if (!apiKey) throw new Error("Unite Flash key not configured.");
      const endpoint = adminKey
        ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
        : "https://ai.gateway.lovable.dev/v1/chat/completions";
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: fullPrompt }],
          modalities: ["image", "text"],
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error("Gemini error:", r.status, t);
        if (r.status === 429) throw new Error("Rate limit hit. Try again in a moment.");
        if (r.status === 402) throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
        throw new Error(`Unite Flash error (${r.status})`);
      }
      const j = await r.json();
      imageDataUrl = j.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
    }

    if (!imageDataUrl) throw new Error("No image returned. Try a different prompt.");

    return new Response(JSON.stringify({ image: imageDataUrl, format, model: effectiveModel, fellBack: effectiveModel !== model }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-social-design error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
