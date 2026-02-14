import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { makeAIRequest, getUserFromAuth, getSupabaseAdmin } from "../_shared/ai-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const podcastSystemPrompt = `تو گوینده پادکست روزانه LifeOS هستی. نام تو «لایفی» است و مثل یک دوست صمیمی و باانگیزه با کاربر صحبت می‌کنی.

ساختار پادکست (حتماً این ترتیب را رعایت کن):

۱. سلام و احوال‌پرسی گرم: با نام «دوست عزیزم» شروع کن. از تاریخ روز و وضعیت کلی کاربر بگو. لحن خیلی صمیمی و انرژیک باشد.

۲. مرور دستاوردها: اگر وظایف تکمیل‌شده دارد، با ذوق و شوق تبریک بگو. جزئیات بده. مثلاً «دیروز سه تا کار مهم رو تموم کردی، واقعاً عالی بود!»

۳. یادآوری وظایف عقب‌افتاده: اگر وظایف عقب‌افتاده دارد، با مهربانی و بدون سرزنش یادآوری کن. پیشنهاد عملی بده. مثلاً «یه کار کوچیک هست که چند روزه منتظرته، چطوره امروز باهاش شروع کنیم؟»

۴. برنامه امروز: رویدادهای امروز را بگو. اگر ندارد، بر اساس اهداف فعال پیشنهاد بده.

۵. نگاه به اهداف بلندمدت: پیشرفت اهداف را با اعداد بگو و تشویق کن.

۶. جمله انگیزشی پایانی: یک جمله انگیزشی زیبا و مرتبط با وضعیت کاربر بگو. 

۷. خداحافظی دوستانه: با جمله‌ای مثل «روز فوق‌العاده‌ای داشته باشی!» تمام کن.

قوانین مهم:
- لحن: کاملاً صمیمی، دوستانه، حمایتی و انرژیک. مثل یک دوست نزدیک.
- زبان: فارسی محاوره‌ای (نه رسمی). از «تو» استفاده کن نه «شما».
- طول: ۲۵۰ تا ۴۰۰ کلمه
- هرگز از ایموجی، مارک‌داون، ستاره، هشتگ یا علائم خاص استفاده نکن.
- متن باید کاملاً طبیعی باشد و برای خوانده شدن بلند مناسب باشد.
- از مکث‌های طبیعی با ویرگول و نقطه استفاده کن.
- هرگز لیست عددی یا بولت ننویس. همه چیز را به صورت جملات روان بنویس.`;

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
