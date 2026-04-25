import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface Body {
  project_name?: string;
  location?: string;
  project_type?: string;
  capacity_mw?: number;
  approx_budget?: string;
  custom_notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as Body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a senior solar investment advisor in India. 
Given a project, recommend ONE best-fit investment model from:
- "PPA"            (developer owns, client pays per unit; great when client wants no capex)
- "BOOT"           (build-own-operate-transfer; mid-term ownership transfer)
- "Self Investment"(client funds capex; best ROI long-term, needs capital)
- "Community Investment"(crowdfund among residents; great for gated communities)
Return STRICT JSON via the tool call. Keep reasoning <60 words.`;

    const userPrompt = `Project: ${body.project_name ?? ""}
Location: ${body.location ?? ""}
Type: ${body.project_type ?? ""}
Capacity: ${body.capacity_mw ?? ""} MW
Approx budget: ${body.approx_budget ?? "not provided"}
Notes: ${body.custom_notes ?? ""}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_model",
              description: "Return a recommended investment model with reasoning.",
              parameters: {
                type: "object",
                properties: {
                  model: {
                    type: "string",
                    enum: ["PPA", "BOOT", "Self Investment", "Community Investment"],
                  },
                  reasoning: { type: "string" },
                  confidence: { type: "string", enum: ["low", "medium", "high"] },
                },
                required: ["model", "reasoning", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_model" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (resp.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Add funds in Workspace > Usage." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
    if (!args) {
      return new Response(JSON.stringify({ error: "No recommendation produced" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend-investment-model error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});