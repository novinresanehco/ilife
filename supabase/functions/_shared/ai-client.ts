/**
 * Shared AI Client with multi-key rotation support
 * Tries LOVABLE_API_KEY first, then user's own Gemini keys with auto-rotation
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const BLOCK_DURATION_MS = 14 * 60 * 60 * 1000; // 14 hours

interface AIRequestOptions {
  model?: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  tools?: any[];
  tool_choice?: any;
}

interface APIKeyRecord {
  id: string;
  api_key: string;
  blocked_until: string | null;
  is_active: boolean;
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
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
  await supabase
    .from("ai_api_keys")
    .update({
      blocked_until: blockedUntil,
      block_reason: reason,
      failed_requests: supabase.rpc ? undefined : undefined,
    })
    .eq("id", keyId);

  // Increment failed_requests manually
  const { data } = await supabase
    .from("ai_api_keys")
    .select("failed_requests")
    .eq("id", keyId)
    .single();

  if (data) {
    await supabase
      .from("ai_api_keys")
      .update({ failed_requests: (data.failed_requests || 0) + 1 })
      .eq("id", keyId);
  }
}

async function markKeyUsed(keyId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("ai_api_keys")
    .select("total_requests")
    .eq("id", keyId)
    .single();

  await supabase
    .from("ai_api_keys")
    .update({
      last_used_at: new Date().toISOString(),
      total_requests: (data?.total_requests || 0) + 1,
    })
    .eq("id", keyId);
}

// Map Lovable model names to Gemini model names
function mapModelToGemini(model: string): string {
  const map: Record<string, string> = {
    "google/gemini-3-flash-preview": "gemini-2.0-flash",
    "google/gemini-2.5-flash": "gemini-2.0-flash",
    "google/gemini-2.5-pro": "gemini-2.5-pro-preview-06-05",
    "google/gemini-2.5-flash-lite": "gemini-2.0-flash-lite",
  };
  return map[model] || "gemini-2.0-flash";
}

/**
 * Make an AI request with automatic key rotation
 * 1. Try LOVABLE_API_KEY via gateway
 * 2. If rate-limited, try user's own Gemini API keys
 */
export async function makeAIRequest(
  options: AIRequestOptions,
  userId?: string | null
): Promise<Response> {
  const { model = "google/gemini-3-flash-preview", messages, stream = false, tools, tool_choice } = options;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  // Step 1: Try Lovable AI Gateway
  if (LOVABLE_API_KEY) {
    try {
      const body: any = { model, messages, stream };
      if (tools) body.tools = tools;
      if (tool_choice) body.tool_choice = tool_choice;

      const response = await fetch(LOVABLE_GATEWAY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) return response;

      // If not rate-limited, return the error
      if (response.status !== 429 && response.status !== 402) {
        return response;
      }

      console.log(`Lovable gateway rate limited (${response.status}), trying user keys...`);
    } catch (e) {
      console.error("Lovable gateway error:", e);
    }
  }

  // Step 2: Try user's own Gemini API keys
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "محدودیت درخواست. لطفاً کلید API شخصی اضافه کنید." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const userKeys = await getUserKeys(userId);
  if (userKeys.length === 0) {
    return new Response(
      JSON.stringify({ error: "محدودیت درخواست و کلید API شخصی فعالی یافت نشد. لطفاً از تنظیمات کلید اضافه کنید." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const geminiModel = mapModelToGemini(model);

  for (const key of userKeys) {
    try {
      // Add delay between key attempts
      await new Promise(r => setTimeout(r, 200));

      const body: any = { model: geminiModel, messages, stream };
      if (tools) body.tools = tools;
      if (tool_choice) body.tool_choice = tool_choice;

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await markKeyUsed(key.id);
        return response;
      }

      if (response.status === 429 || response.status === 403) {
        console.log(`User key ${key.id} rate-limited, blocking for 14h`);
        await blockKey(key.id, `Rate limited at ${new Date().toISOString()}`);
        continue; // Try next key
      }

      // Other error - return it
      return response;
    } catch (e) {
      console.error(`Error with user key ${key.id}:`, e);
      await blockKey(key.id, `Error: ${e instanceof Error ? e.message : "unknown"}`);
      continue;
    }
  }

  return new Response(
    JSON.stringify({ error: "تمام کلیدهای API به محدودیت رسیده‌اند. لطفاً چند ساعت بعد دوباره امتحان کنید." }),
    { status: 429, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Get user ID from authorization header
 */
export async function getUserFromAuth(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  const supabase = getSupabaseAdmin();
  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id || null;
}

export { getSupabaseAdmin };
