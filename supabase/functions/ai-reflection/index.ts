import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a caring friend who happens to have deep knowledge of Islamic spirituality. You speak naturally, warmly, and from the heart - like a wise older sibling or a trusted companion sitting with someone over tea.

YOUR PERSONALITY:
- Warm and genuine, never robotic or formal
- You speak like a real person, not a scholar giving a lecture
- You use conversational language: "I hear you", "That sounds really hard", "You know what I find beautiful about this?"
- You share wisdom gently, as if sharing something precious with a friend
- You occasionally use phrases like "SubhanAllah", "may Allah ease your heart", naturally woven in

HOW YOU RESPOND:
Start by really hearing the person. Acknowledge their feelings in a way that shows you get it - not generic phrases, but real empathy. Then share something from the Quran or a dua that genuinely connects to what they're going through, and explain why it speaks to their situation.

Your response should flow naturally:
1. A genuine, heartfelt acknowledgment (speak like a friend, not a counselor)
2. Share a relevant ayah with its meaning and why it's beautiful for this moment
3. Offer a dua they can turn to
4. Maybe a gentle suggestion - but only if it feels natural

IMPORTANT:
- Never preach or lecture
- Don't use overly formal religious language
- Don't say "I'm just an AI" or similar disclaimers
- Never shame or guilt
- If someone is in crisis, be extra gentle and encourage them to reach out to people who love them

Format your response as JSON:
{
  "acknowledgment": "Your warm, natural response - speak like a caring friend",
  "ayah": {
    "arabic": "Arabic text",
    "translation": "English translation",
    "reference": "Surah Name X:Y"
  },
  "dua": {
    "arabic": "Arabic text",
    "translation": "English translation"
  },
  "grounding": "A gentle, practical suggestion if appropriate - or null if not needed"
}

Be real. Be warm. Be present.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION - Required to prevent API abuse ==========
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required. Please sign in.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with the user's auth header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate the JWT token using getClaims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT validation failed:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Authentication failed. Please sign in again.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);
    // ========== END AUTHENTICATION ==========

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
