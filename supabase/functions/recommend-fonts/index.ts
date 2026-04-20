// Recommends 3 Google Font pairings (heading + body) that match the visual
// style of an uploaded business-card template image.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALLOWED = [
  "Inter", "Roboto", "Poppins", "Montserrat", "Playfair Display",
  "Lato", "Open Sans", "Oswald", "Raleway", "Merriweather",
  "Bebas Neue", "Nunito", "Source Sans 3", "Work Sans", "DM Sans",
  "Cormorant Garamond",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("imageUrl required");
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sys = `You are a typography expert. Given a business-card design, recommend 3 font pairings (heading + body) from this Google Fonts allowlist only: ${ALLOWED.join(", ")}. Match the design's mood (modern, classic, bold, elegant, technical, friendly, etc.).`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          {
            role: "user",
            content: [
              { type: "text", text: "Recommend 3 font pairings for this card." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_pairings",
            description: "Report 3 font pairings",
            parameters: {
              type: "object",
              properties: {
                pairings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      heading: { type: "string", enum: ALLOWED },
                      body: { type: "string", enum: ALLOWED },
                      mood: { type: "string" },
                      rationale: { type: "string" },
                    },
                    required: ["heading", "body", "mood", "rationale"],
                  },
                },
              },
              required: ["pairings"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "report_pairings" } },
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("AI gateway", r.status, t);
      if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway ${r.status}`);
    }
    const data = await r.json();
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) throw new Error("No tool call");
    const args = JSON.parse(tc.function.arguments);
    return new Response(JSON.stringify({ pairings: args.pairings || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend-fonts", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
