import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
طول: حداکثر ۳۰۰ کلمه`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    let userContext = "کاربر جدید بدون فعالیت قبلی";

    if (userId) {
      // Fetch recent tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("title, status, due_date, priority")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch goals
      const { data: goals } = await supabase
        .from("goals")
        .select("title, progress, status")
        .eq("user_id", userId)
        .limit(5);

      // Fetch today's events
      const today = new Date().toISOString().split("T")[0];
      const { data: events } = await supabase
        .from("calendar_events")
        .select("title, start_time, end_time")
        .eq("user_id", userId)
        .gte("start_time", today)
        .lte("start_time", today + "T23:59:59")
        .limit(5);

      const completedTasks = tasks?.filter(t => t.status === "completed") || [];
      const pendingTasks = tasks?.filter(t => t.status !== "completed") || [];
      const overdueTasks = tasks?.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed") || [];

      userContext = `
وظایف تکمیل‌شده اخیر: ${completedTasks.map(t => t.title).join("، ") || "ندارد"}
وظایف در انتظار: ${pendingTasks.map(t => t.title).join("، ") || "ندارد"}
وظایف عقب‌افتاده: ${overdueTasks.map(t => t.title).join("، ") || "ندارد"}
اهداف فعال: ${goals?.map(t => `${t.title} (${t.progress}%)`).join("، ") || "ندارد"}
رویدادهای امروز: ${events?.map(t => t.title).join("، ") || "ندارد"}`;
    }

    // Generate podcast script
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: podcastSystemPrompt },
          { role: "user", content: `اطلاعات کاربر:\n${userContext}\n\nلطفاً متن پادکست روزانه را تولید کن.` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("خطا در تولید متن پادکست");
    }

    const aiData = await aiResponse.json();
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
