import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { inputs, computed, recommendation, slideTitle, currentSlide, instruction } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const themeTone: Record<string, string> = {
      "Dark Premium": "high-end, gold + white, confident.",
      "Corporate Blue": "structured, formal, trust-building.",
      "Green": "sustainable, environmental, optimistic.",
      "Luxury Gold": "premium, aspirational, wealth-focused.",
    };

    const systemPrompt = `You are an expert solar consultant for Unite Solar regenerating ONE slide of a community proposal deck.
Theme tone: ${themeTone[inputs.theme] || themeTone["Dark Premium"]}
Be punchy, slide-style, financially precise. Use the supplied numbers. Recommended model: ${recommendation}.`;

    const userPrompt = `INPUTS:
${JSON.stringify(inputs, null, 2)}

COMPUTED FINANCIALS:
${JSON.stringify(computed, null, 2)}

SLIDE TO REGENERATE: "${slideTitle}"

CURRENT SLIDE CONTENT (for context — produce a fresh, improved version):
${JSON.stringify(currentSlide, null, 2)}

${instruction ? `EXTRA INSTRUCTION FROM USER: ${instruction}` : "Make it sharper, more specific, more persuasive."}`;

    const slideSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        bullets: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
        highlight: {
          type: "object",
          properties: { label: { type: "string" }, value: { type: "string" } },
        },
      },
      required: ["title", "bullets"],
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: { name: "build_slide", description: "Return one regenerated slide.", parameters: slideSchema },
        }],
        tool_choice: { type: "function", function: { name: "build_slide" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return a slide.");
    const slide = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ slide }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("regenerate-community-slide error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});