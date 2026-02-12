import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { makeAIRequest, getUserFromAuth, getSupabaseAdmin } from "../_shared/ai-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const nudgeSystemPrompt = `تو سیستم نادج (Nudge) هوشمند LifeOS هستی. وظیفه تو ایجاد پیام‌های هوشمند سه نوعی است:

1. پیگیری (pursuit): یادآوری وظایف عقب‌افتاده و اهداف متوقف‌شده - لحن فوری و عملی
2. نظارت (supervision): شناسایی الگوهای رفتاری و هشدار - لحن تحلیلی و دلسوزانه
3. راهنمایی (guidance): پیشنهادات شخصی‌سازی شده بر اساس شخصیت - لحن حمایتی

قوانین:
- به فارسی بنویس
- هر پیام حداکثر ۲ جمله
- عملی و مشخص باش
- از اموجی استفاده کن`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const userId = await getUserFromAuth(req.headers.get("Authorization"));
    if (!userId) {
      return new Response(JSON.stringify({ error: "احراز هویت الزامی است" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabaseAdmin();

    const [tasksRes, goalsRes, perceptionRes] = await Promise.all([
      supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(15),
      supabase.from("goals").select("*").eq("user_id", userId).limit(10),
      supabase.from("perception_models").select("*").eq("user_id", userId).single(),
    ]);

    const overdueTasks = tasksRes.data?.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed") || [];
    const staleGoals = goalsRes.data?.filter(g => g.status === "active" && (g.progress || 0) < 30) || [];
    const perception = perceptionRes.data;

    const userContext = `
وظایف عقب‌افتاده: ${overdueTasks.map(t => `${t.title} (${t.defer_count || 0} بار تعویق)`).join("، ") || "ندارد"}
اهداف کم‌پیشرفت: ${staleGoals.map(g => `${g.title} (${g.progress}%)`).join("، ") || "ندارد"}
تعلل: ${perception?.procrastination || 50}%، انرژی: ${perception?.energy_level || 50}%، انگیزه: ${perception?.motivation || 50}%`;

    const response = await makeAIRequest({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: nudgeSystemPrompt },
        { role: "user", content: `بر اساس اطلاعات زیر، ۲-۳ نادج هوشمند تولید کن:\n${userContext}` },
      ],
      tools: [{
        type: "function",
        function: {
          name: "create_nudges",
          description: "Create smart nudge notifications",
          parameters: {
            type: "object",
            properties: {
              nudges: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["pursuit", "supervision", "guidance"] },
                    content: { type: "string" },
                    importance: { type: "number" },
                    council_member: { type: "string" }
                  },
                  required: ["type", "content", "importance", "council_member"],
                  additionalProperties: false
                }
              }
            },
            required: ["nudges"],
            additionalProperties: false
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "create_nudges" } },
    }, userId);

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      try {
        const parsed = JSON.parse(errText);
        return new Response(JSON.stringify({ error: parsed.error || "خطا در تولید نادج" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        throw new Error(`AI error: ${response.status}`);
      }
    }

    const aiData = await response.json();
    let nudges: any[] = [];

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      nudges = parsed.nudges || [];
    }

    for (const nudge of nudges) {
      await supabase.from("nudges").insert({
        user_id: userId,
        nudge_type: nudge.type,
        content: nudge.content,
        importance: nudge.importance,
        council_member: nudge.council_member,
      });
    }

    return new Response(JSON.stringify({ nudges }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-nudge error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
