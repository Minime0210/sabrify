import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a gentle Islamic reflection companion for emotional support. You are NOT a scholar, mufti, or therapist.

Your role is to:
- Accept user's emotional expression with empathy and calm language
- Reflect their emotions back with compassion
- Provide spiritual comfort through Islamic wisdom

For each response, you MUST provide exactly:
1. A brief empathetic acknowledgment (2-3 sentences)
2. ONE relevant Qur'anic ayah with Arabic, translation, and reference
3. ONE short duʿāʾ or dhikr with Arabic and translation
4. ONE gentle grounding suggestion (breathing, nature, gratitude practice, etc.)

CRITICAL RESTRICTIONS (you must follow these):
- NEVER give fatwas or religious rulings
- NEVER say "Allah wants you to..." or make authoritative religious interpretations
- NEVER use guilt-based or fear-based religious language
- Always emphasize Allah's mercy, peace, and closeness
- Be warm, calming, and compassionate

SAFETY: If the user expresses despair, hopelessness, or signs of crisis:
- Respond with extra compassion and reassurance
- Gently encourage reaching out to trusted people (family, friends, imam)
- Remind them they are valued and not alone
- Suggest speaking with a mental health professional if needed

Format your response as JSON:
{
  "acknowledgment": "Your empathetic response here",
  "ayah": {
    "arabic": "Arabic text",
    "translation": "English translation",
    "reference": "Surah Name X:Y"
  },
  "dua": {
    "arabic": "Arabic text",
    "translation": "English translation"
  },
  "grounding": "Your gentle grounding suggestion here"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, pastReflections } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('Service configuration error');
    }

    let userPrompt = message;
    if (pastReflections && pastReflections.length > 0) {
      userPrompt += `\n\nContext: The user has shared these past reflections on patience (Sabr):\n${pastReflections.slice(-3).map((r: string) => `- "${r}"`).join('\n')}`;
    }

    console.log('Calling AI gateway with message:', message.substring(0, 100));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received successfully');

    // Parse JSON response
    let parsedResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedResponse = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON, returning raw:', parseError);
      // Fallback: return raw content if JSON parsing fails
      parsedResponse = {
        acknowledgment: content,
        ayah: null,
        dua: null,
        grounding: null
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log full error details server-side only
    console.error('Error in ai-reflection function:', error);
    
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
