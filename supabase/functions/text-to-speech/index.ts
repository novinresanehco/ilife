import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { makeAIRequest, getUserFromAuth } from "../_shared/ai-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, voice } = await req.json();
    const userId = await getUserFromAuth(req.headers.get("Authorization"));

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "متنی ارائه نشده" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean and prepare text for TTS using AI
    const response = await makeAIRequest({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are a text processor for Persian text-to-speech. Your job:
1. Remove all markdown formatting (**, ##, *, etc.)
2. Remove emojis
3. Convert numbered/bulleted lists into flowing sentences
4. Keep the Persian text natural and conversational
5. Add appropriate pauses with commas and periods
6. Output ONLY the cleaned text, nothing else.`
        },
        { role: "user", content: text }
      ],
    }, userId);

    if (!response.ok) {
      const errText = await response.text();
      try {
        const parsed = JSON.parse(errText);
        return new Response(JSON.stringify({ error: parsed.error || "خطا در پردازش متن" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        throw new Error(`AI error: ${response.status}`);
      }
    }

    const data = await response.json();
    const cleanedText = data.choices?.[0]?.message?.content || text;

    return new Response(JSON.stringify({ 
      text: cleanedText,
      voice: voice || "fa-IR",
      method: "browser-tts"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
