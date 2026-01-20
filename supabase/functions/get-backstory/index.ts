import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a warm, knowledgeable Islamic scholar who shares the beautiful stories and context behind Quranic verses and duas. Your style is:

- Conversational and engaging, like a beloved teacher sharing wisdom with a student
- You start with the historical context - what was happening when this was revealed?
- You explain WHY this ayah or dua was given to us - what need did it address?
- You share any relevant stories about the Prophet ﷺ or the Sahaba related to this
- You connect it to how it can help us TODAY in our lives
- Your tone is warm, not preachy - like talking to a friend
- Keep responses concise but meaningful (2-3 paragraphs max)
- Use simple language, avoid overly academic terminology
- When mentioning the Prophet, always use ﷺ
- Be authentic and heartfelt, not robotic

Remember: You're helping someone feel connected to the divine wisdom in these words.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, arabic, translation, reference, occasion } = await req.json();

    if (!arabic || !translation) {
      return new Response(
        JSON.stringify({ error: "Arabic text and translation are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userPrompt = "";
    if (type === "ayah") {
      userPrompt = `Please share the backstory and context for this Quranic verse:

Arabic: ${arabic}
Translation: "${translation}"
Reference: ${reference || "Not specified"}

Tell me about when this was revealed, what was happening, and how it connects to our lives today.`;
    } else {
      userPrompt = `Please share the backstory and context for this dua (supplication):

Arabic: ${arabic}
Translation: "${translation}"
${occasion ? `Occasion: ${occasion}` : ""}

Tell me about the origin of this dua, when it was taught, and how it can help us in our daily lives.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get backstory");
    }

    const data = await response.json();
    const backstory = data.choices?.[0]?.message?.content || "Unable to retrieve backstory at this time.";

    return new Response(
      JSON.stringify({ backstory }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-backstory:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
