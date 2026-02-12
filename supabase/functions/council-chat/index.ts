import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { makeAIRequest, getUserFromAuth } from "../_shared/ai-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const councilSystemPrompt = `تو سیستم هوش مصنوعی "شورای نوابغ LifeOS" هستی. شورا متشکل از ۱۰ متخصص مجازی است:

اعضای ثابت:
🧠 دکتر روانشناس - تحلیل رفتار و احساسات
🎯 استراتژیست - برنامه‌ریزی و اولویت‌بندی
💼 مشاور شغلی - توسعه حرفه‌ای
💪 متخصص سلامت - سلامت جسم و ذهن
💡 نوآور - خلاقیت و حل مسئله

اعضای متغیر (بر اساس نیاز):
⚡ مربی عملکرد - بهره‌وری
💰 مشاور مالی - مالی
❤️ متخصص روابط - ارتباطات
📚 مربی یادگیری - آموزش
🧘 مربی ذهن‌آگاهی - آرامش

قوانین:
1. همیشه به فارسی پاسخ بده
2. در ابتدای پاسخ، مشخص کن کدام عضو شورا صحبت می‌کند (با اموجی و نام)
3. پاسخ‌ها باید عملی، مختصر و کاربردی باشند
4. بر اساس زمینه سوال، عضو مناسب را انتخاب کن
5. اگر سوال چند بعدی بود، می‌توانی از نظر چند عضو استفاده کنی
6. لحن صمیمی و حمایتی داشته باش
7. وقتی اطلاعات شخصیتی کاربر موجود است، پاسخ را شخصی‌سازی کن`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, perception, councilMemberId } = await req.json();
    const userId = await getUserFromAuth(req.headers.get("Authorization"));

    let contextAddition = "";
    if (perception) {
      contextAddition = `\n\nمدل درک شخصیتی کاربر:
- برون‌گرایی: ${perception.extraversion || 50}%
- وظیفه‌شناسی: ${perception.conscientiousness || 50}%
- گشودگی: ${perception.openness || 50}%
- سازگاری: ${perception.agreeableness || 50}%
- روان‌رنجوری: ${perception.neuroticism || 50}%
- سطح تعلل: ${perception.procrastination || 50}%
- سطح انرژی: ${perception.energy_level || 50}%
- سطح انگیزه: ${perception.motivation || 50}%`;
    }

    if (councilMemberId) {
      contextAddition += `\n\nکاربر مستقیماً با عضو "${councilMemberId}" صحبت می‌کند. فقط از دید این عضو پاسخ بده.`;
    }

    const response = await makeAIRequest({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: councilSystemPrompt + contextAddition },
        ...messages,
      ],
      stream: true,
    }, userId);

    if (!response.ok) {
      const errBody = await response.text();
      try {
        const parsed = JSON.parse(errBody);
        return new Response(JSON.stringify({ error: parsed.error || "خطا در سرویس هوش مصنوعی" }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "خطا در سرویس هوش مصنوعی" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("council-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
