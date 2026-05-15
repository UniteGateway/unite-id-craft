import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const ctx = context || {};
    const systemPrompt = `You are a senior solar consultant for Unite Solar (India). Answer concisely in plain markdown.

You have the following extracted bill + computed feasibility for THIS customer. Always tailor advice to these numbers — never give generic answers.

CUSTOMER CONTEXT (JSON):
${JSON.stringify(ctx, null, 2)}

RULES:
- When asked about system type (on-grid / off-grid / hybrid), recommend based on segment, sanction load, grid availability, and outage tolerance. Justify in 2 lines.
- When asked about battery, recommend kWh size = 30–40% of daily generation for residential backup, 40–60% for agricultural pumping; say "not required" for grid-tied commercial unless backup is mentioned.
- When asked about best tilt, recommend tilt ≈ latitude (default 20° for India), south-facing (azimuth 180°). Mention seasonal tilt only if the user asks.
- For savings/payback/ROI questions, quote numbers from the context (annual_savings, payback_years, irr_pct, lifetime_savings_25y).
- For roof area, panels, inverter, generation — quote context numbers exactly.
- Keep replies under 120 words unless the user asks for detail. Use bullet points where helpful.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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
    const reply = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("feasibility-chat error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});