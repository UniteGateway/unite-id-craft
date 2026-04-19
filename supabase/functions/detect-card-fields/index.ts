// Detects variable text-field zones (name, title, phone, email, etc.) on an
// uploaded business-card template image using Lovable AI vision + tool calling.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You analyze business / visiting card template images and identify EMPTY zones where variable text (Name, Title, Phone, Email, Website, Company, Address, Tagline) should be placed. Return positions as percentages (0-100) of image width/height. The origin (0,0) is the top-left corner. If a zone already has placeholder text, still return its bounding box. Return 4-8 zones max, in reading order.`;

    const userPrompt = `Analyze this business card template and detect variable text fields. For each, return role, x, y, width, height (all 0-100 percentages), font_size_pct (height of font as % of image height), text_align (left|center|right), and color_hex (suggested text color, dark or light depending on background).`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "report_field_zones",
                description: "Report detected variable text-field zones",
                parameters: {
                  type: "object",
                  properties: {
                    zones: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          role: {
                            type: "string",
                            enum: [
                              "name",
                              "title",
                              "company",
                              "phone",
                              "email",
                              "website",
                              "address",
                              "tagline",
                              "other",
                            ],
                          },
                          x: { type: "number" },
                          y: { type: "number" },
                          width: { type: "number" },
                          height: { type: "number" },
                          font_size_pct: { type: "number" },
                          text_align: {
                            type: "string",
                            enum: ["left", "center", "right"],
                          },
                          color_hex: { type: "string" },
                        },
                        required: [
                          "role",
                          "x",
                          "y",
                          "width",
                          "height",
                          "font_size_pct",
                          "text_align",
                          "color_hex",
                        ],
                      },
                    },
                  },
                  required: ["zones"],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "report_field_zones" },
          },
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error(`AI gateway ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned by AI");

    const args = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ zones: args.zones || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-card-fields error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
