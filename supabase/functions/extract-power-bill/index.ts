import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Accepts { fileBase64: string, mimeType: string } and uses Lovable AI Gemini vision
 * to extract a structured power bill summary.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fileBase64, mimeType } = await req.json();
    if (!fileBase64 || !mimeType) {
      return new Response(JSON.stringify({ error: "fileBase64 and mimeType are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const dataUrl = fileBase64.startsWith("data:") ? fileBase64 : `data:${mimeType};base64,${fileBase64}`;

    const schema = {
      type: "object",
      properties: {
        consumer_name: { type: "string" },
        location: { type: "string" },
        state: { type: "string", description: "Indian state name (e.g. Telangana, Karnataka)" },
        billing_month: { type: "string" },
        monthly_units: { type: "number", description: "Total units consumed in the bill cycle" },
        monthly_bill: { type: "number", description: "Total amount payable in INR" },
        energy_charge_per_unit: { type: "number", description: "Average energy charge in INR/unit (excluding fixed/demand)" },
        fixed_monthly_charges: { type: "number", description: "Fixed + demand + meter rent charges in INR" },
        tax_pct: { type: "number", description: "Electricity duty + taxes as % of energy charges" },
        sanction_load_kw: { type: "number", description: "Sanctioned / contract demand in kW" },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
      },
      required: ["monthly_units", "monthly_bill"],
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert at parsing Indian electricity bills (TSSPDCL, APSPDCL, BESCOM, MSEDCL, etc.). Extract every requested field precisely. If a field isn't visible, return 0 (numbers) or empty string. Convert all amounts to plain INR numbers (e.g. '₹3,036,352' → 3036352). For energy charge per unit, average the slab rates if multiple. For tax %, sum electricity duty + cess as % of energy charges.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the structured fields from this power bill." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: { name: "extract_bill", description: "Return parsed power bill fields.", parameters: schema },
        }],
        tool_choice: { type: "function", function: { name: "extract_bill" } },
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return a structured bill");
    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(args), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-power-bill error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});