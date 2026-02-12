import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { makeAIRequest, getUserFromAuth, getSupabaseAdmin } from "../_shared/ai-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const podcastSystemPrompt = `تو یک گوینده پادکست روزانه LifeOS هستی. وظیفه تو:
1. خلاصه فعالیت‌های دیروز کاربر را مرور کن
2. دستاوردها را تبریک بگو
3. وظایف عقب‌افتاده را یادآوری کن
4. برنامه امروز را پیشنهاد بده
5. یک جمله انگیزشی در پایان بگو

لحن: صمیمی، انرژیک، حمایتی
زبان: فارسی
طول: حداکثر ۳۰۰ کلمه
مهم: متن را طوری بنویس که برای خوانده شدن بلند مناسب باشد. از علائم نگارشی درست استفاده کن.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const userId = await getUserFromAuth(req.headers.get("Authorization"));
    const supabase = getSupabaseAdmin();

    let userContext = "کاربر جدید بدون فعالیت قبلی";

    if (userId) {
      const [tasksRes, goalsRes, eventsRes] = await Promise.all([
        supabase.from("tasks").select("title, status, due_date, priority").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        supabase.from("goals").select("title, progress, status").eq("user_id", userId).limit(5),
        supabase.from("calendar_events").select("title, start_time, end_time").eq("user_id", userId)
          .gte("start_time", new Date().toISOString().split("T")[0])
          .lte("start_time", new Date().toISOString().split("T")[0] + "T23:59:59")
          .limit(5),
      ]);

      const tasks = tasksRes.data || [];
      const completedTasks = tasks.filter(t => t.status === "completed");
      const pendingTasks = tasks.filter(t => t.status !== "completed");
      const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed");

      userContext = `
وظایف تکمیل‌شده اخیر: ${completedTasks.map(t => t.title).join("، ") || "ندارد"}
وظایف در انتظار: ${pendingTasks.map(t => t.title).join("، ") || "ندارد"}
وظایف عقب‌افتاده: ${overdueTasks.map(t => t.title).join("، ") || "ندارد"}
اهداف فعال: ${goalsRes.data?.map(t => `${t.title} (${t.progress}%)`).join("، ") || "ندارد"}
رویدادهای امروز: ${eventsRes.data?.map(t => t.title).join("، ") || "ندارد"}`;
    }

    const response = await makeAIRequest({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: podcastSystemPrompt },
        { role: "user", content: `اطلاعات کاربر:\n${userContext}\n\nلطفاً متن پادکست روزانه را تولید کن.` },
      ],
    }, userId);

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      try {
        const parsed = JSON.parse(errText);
        return new Response(JSON.stringify({ error: parsed.error || "خطا در تولید پادکست" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        throw new Error("خطا در تولید متن پادکست");
      }
    }

    const aiData = await response.json();
    const podcastText = aiData.choices?.[0]?.message?.content || "پادکست آماده نشد.";

    return new Response(JSON.stringify({ text: podcastText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-podcast error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
