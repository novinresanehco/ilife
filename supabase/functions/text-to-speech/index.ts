import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { getUserFromAuth, getSupabaseAdmin } from "../_shared/ai-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const BLOCK_DURATION_MS = 14 * 60 * 60 * 1000;

// Persian-friendly voices in Gemini TTS
const PERSIAN_VOICES = ["Kore", "Puck", "Charon", "Fenrir", "Aoede"];

interface APIKeyRecord {
  id: string;
  api_key: string;
  blocked_until: string | null;
  is_active: boolean;
}

async function getUserKeys(userId: string): Promise<APIKeyRecord[]> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("ai_api_keys")
    .select("id, api_key, blocked_until, is_active")
    .eq("user_id", userId)
    .eq("provider", "gemini")
    .eq("is_active", true)
    .or(`blocked_until.is.null,blocked_until.lt.${now}`)
    .order("last_used_at", { ascending: true, nullsFirst: true });
  return data || [];
}

async function blockKey(keyId: string, reason: string) {
  const supabase = getSupabaseAdmin();
  const blockedUntil = new Date(Date.now() + BLOCK_DURATION_MS).toISOString();
  await supabase.from("ai_api_keys").update({ blocked_until: blockedUntil, block_reason: reason }).eq("id", keyId);
  const { data } = await supabase.from("ai_api_keys").select("failed_requests").eq("id", keyId).single();
  if (data) {
    await supabase.from("ai_api_keys").update({ failed_requests: (data.failed_requests || 0) + 1 }).eq("id", keyId);
  }
}

async function markKeyUsed(keyId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("ai_api_keys").select("total_requests").eq("id", keyId).single();
  await supabase.from("ai_api_keys").update({
    last_used_at: new Date().toISOString(),
    total_requests: (data?.total_requests || 0) + 1,
  }).eq("id", keyId);
}

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

    if (!userId) {
      return new Response(JSON.stringify({ error: "برای استفاده از TTS باید وارد شوید" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userKeys = await getUserKeys(userId);
    if (userKeys.length === 0) {
      return new Response(JSON.stringify({ error: "کلید API جمینای یافت نشد. لطفاً از تنظیمات کلید اضافه کنید." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const selectedVoice = voice || PERSIAN_VOICES[Math.floor(Math.random() * PERSIAN_VOICES.length)];

    // Try each user key for Gemini TTS
    for (const key of userKeys) {
      try {
        await new Promise(r => setTimeout(r, 100));

        const ttsUrl = `${GEMINI_API_BASE}/${GEMINI_TTS_MODEL}:generateContent?key=${key.api_key}`;
        
        const response = await fetch(ttsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: text.substring(0, 5000) }] // Gemini TTS limit
            }],
            generationConfig: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: {
                    voice_name: selectedVoice
                  }
                }
              }
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          await markKeyUsed(key.id);

          // Extract audio data from Gemini response
          const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (audioData) {
            return new Response(JSON.stringify({
              audio: audioData.data,
              mimeType: audioData.mimeType || "audio/mp3",
              voice: selectedVoice,
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ error: "پاسخ صوتی از Gemini دریافت نشد" }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (response.status === 429 || response.status === 403) {
          console.log(`TTS key ${key.id} rate-limited, blocking`);
          await blockKey(key.id, `TTS rate limited at ${new Date().toISOString()}`);
          continue;
        }

        const errText = await response.text();
        console.error(`TTS error with key ${key.id}:`, response.status, errText);
        continue;
      } catch (e) {
        console.error(`TTS error with key ${key.id}:`, e);
        await blockKey(key.id, `Error: ${e instanceof Error ? e.message : "unknown"}`);
        continue;
      }
    }

    return new Response(JSON.stringify({ error: "تمام کلیدهای API به محدودیت رسیده‌اند. لطفاً بعداً دوباره امتحان کنید." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
