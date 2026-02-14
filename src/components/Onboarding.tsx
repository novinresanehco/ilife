import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Sparkles, User, Brain, Target, ChevronLeft, 
  CheckCircle, Rocket 
} from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

// Mini Big Five questions (10 questions, 2 per trait)
const miniQuestions = [
  { id: 'mo1', text: 'تجربه‌های جدید من را هیجان‌زده می‌کند', trait: 'O', reverse: false },
  { id: 'mo2', text: 'ترجیح می‌دهم روال‌های ثابت را دنبال کنم', trait: 'O', reverse: true },
  { id: 'mc1', text: 'همیشه کارها را به موقع انجام می‌دهم', trait: 'C', reverse: false },
  { id: 'mc2', text: 'در مدیریت زمان مهارت دارم', trait: 'C', reverse: false },
  { id: 'me1', text: 'در جمع‌ها احساس انرژی می‌کنم', trait: 'E', reverse: false },
  { id: 'me2', text: 'ترجیح می‌دهم تنها باشم تا در جمع', trait: 'E', reverse: true },
  { id: 'ma1', text: 'به دیگران اعتماد می‌کنم', trait: 'A', reverse: false },
  { id: 'ma2', text: 'همکاری را به رقابت ترجیح می‌دهم', trait: 'A', reverse: false },
  { id: 'mn1', text: 'به راحتی استرس می‌گیرم', trait: 'N', reverse: false },
  { id: 'mn2', text: 'در شرایط سخت آرامش خود را حفظ می‌کنم', trait: 'N', reverse: true },
];

const likertOptions = [
  { value: 1, label: 'کاملاً مخالف' },
  { value: 2, label: 'مخالف' },
  { value: 3, label: 'نظری ندارم' },
  { value: 4, label: 'موافق' },
  { value: 5, label: 'کاملاً موافق' },
];

const TOTAL_STEPS = 4;

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user, updateProfile, updatePerception } = useAuthContext();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('personal');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [firstGoal, setFirstGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const calculateMiniTraitScore = (trait: string): number => {
    const qs = miniQuestions.filter(q => q.trait === trait);
    let score = 0;
    let count = 0;
    qs.forEach(q => {
      if (quizAnswers[q.id] !== undefined) {
        count++;
        score += q.reverse ? (6 - quizAnswers[q.id]) : quizAnswers[q.id];
      }
    });
    if (count === 0) return 50;
    // Scale from 2-10 range to 0-100
    return Math.round(((score - 2) / 8) * 100);
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // 1. Update profile
      await updateProfile({
        display_name: displayName || null,
        role,
        onboarding_completed: true,
      });

      // 2. Save mini quiz answers
      if (Object.keys(quizAnswers).length > 0) {
        const upserts = Object.entries(quizAnswers).map(([qId, val]) => ({
          user_id: user.id,
          question_id: qId,
          answer_value: String(val),
          answer_type: 'likert',
          source: 'onboarding_mini_quiz',
          confidence: 80,
        }));
        await supabase.from('personality_answers').insert(upserts);

        // Update perception with initial scores
        await updatePerception({
          openness: calculateMiniTraitScore('O'),
          conscientiousness: calculateMiniTraitScore('C'),
          extraversion: calculateMiniTraitScore('E'),
          agreeableness: calculateMiniTraitScore('A'),
          neuroticism: calculateMiniTraitScore('N'),
          confidence_score: 30,
        });
      }

      // 3. Create first goal if provided
      if (firstGoal.trim()) {
        await supabase.from('goals').insert({
          user_id: user.id,
          title: firstGoal,
          goal_type: 'personal',
          hierarchy_level: 2,
          status: 'active',
        });
      }

      toast.success('خوش آمدید! 🎉 LifeOS آماده کمک به شماست');
      onComplete();
    } catch (e) {
      console.error('Onboarding error:', e);
      toast.error('خطا در ذخیره اطلاعات');
    } finally {
      setIsSaving(false);
    }
  };

  const currentMiniQ = miniQuestions[currentQ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold">به LifeOS خوش آمدید</h1>
          <p className="text-muted-foreground mt-2">بیایید شما را بهتر بشناسیم</p>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            مرحله {persianNumbers(step + 1)} از {persianNumbers(TOTAL_STEPS)}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Step 0: Welcome & Name */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <h2 className="text-xl font-bold">معرفی خودتان</h2>
                  <p className="text-sm text-muted-foreground mt-1">اسم شما چیست؟</p>
                </div>
                <Input
                  placeholder="نام نمایشی"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-center text-lg h-12"
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium">هدف اصلی شما از استفاده LifeOS:</p>
                  <RadioGroup value={role} onValueChange={setRole} className="space-y-2">
                    {[
                      { value: 'personal', label: 'مدیریت زندگی شخصی' },
                      { value: 'work', label: 'بهره‌وری کاری' },
                      { value: 'student', label: 'تحصیل و یادگیری' },
                      { value: 'mixed', label: 'ترکیبی از همه' },
                    ].map(opt => (
                      <div key={opt.value} className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent",
                        role === opt.value && "bg-primary/10 border-primary"
                      )} onClick={() => setRole(opt.value)}>
                        <RadioGroupItem value={opt.value} id={`role-${opt.value}`} />
                        <Label htmlFor={`role-${opt.value}`} className="cursor-pointer">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <Button className="w-full" onClick={() => setStep(1)}>
                  ادامه
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              </div>
            )}

            {/* Step 1: Mini Big Five Quiz */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Brain className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <h2 className="text-xl font-bold">شناخت سریع شخصیت</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    ۱۰ سوال کوتاه برای آشنایی اولیه — بعداً می‌توانید آزمون کامل ۵۰ سوالی را انجام دهید
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>سوال {persianNumbers(currentQ + 1)} از {persianNumbers(10)}</span>
                  </div>
                  <Progress value={((currentQ + 1) / 10) * 100} />
                </div>
                <div className="bg-accent/50 rounded-xl p-5">
                  <p className="text-base font-medium mb-5">{currentMiniQ.text}</p>
                  <RadioGroup
                    value={quizAnswers[currentMiniQ.id]?.toString()}
                    onValueChange={(v) => {
                      setQuizAnswers({ ...quizAnswers, [currentMiniQ.id]: parseInt(v) });
                      if (currentQ < 9) {
                        setTimeout(() => setCurrentQ(currentQ + 1), 300);
                      }
                    }}
                    className="space-y-2"
                  >
                    {likertOptions.map(opt => (
                      <div key={opt.value} className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent",
                        quizAnswers[currentMiniQ.id] === opt.value && "bg-primary/10 border-primary"
                      )} onClick={() => {
                        setQuizAnswers({ ...quizAnswers, [currentMiniQ.id]: opt.value });
                        if (currentQ < 9) setTimeout(() => setCurrentQ(currentQ + 1), 300);
                      }}>
                        <RadioGroupItem value={opt.value.toString()} id={`onb-${opt.value}`} />
                        <Label htmlFor={`onb-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => currentQ > 0 ? setCurrentQ(currentQ - 1) : setStep(0)}>
                    قبلی
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setStep(2)}>رد شدن</Button>
                    {currentQ === 9 && quizAnswers[currentMiniQ.id] && (
                      <Button onClick={() => setStep(2)}>
                        ادامه
                        <ChevronLeft className="w-4 h-4 mr-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: First Goal */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Target className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <h2 className="text-xl font-bold">اولین هدف شما</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    یک هدف مهم را وارد کنید — بعداً می‌توانید اهداف بیشتری اضافه کنید
                  </p>
                </div>
                <Input
                  placeholder="مثلاً: یادگیری زبان انگلیسی"
                  value={firstGoal}
                  onChange={(e) => setFirstGoal(e.target.value)}
                  className="text-center text-lg h-12"
                />
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>قبلی</Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setStep(3)}>رد شدن</Button>
                    <Button onClick={() => setStep(3)}>
                      ادامه
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Summary & Complete */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Rocket className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <h2 className="text-xl font-bold">آماده‌اید!</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    خلاصه اطلاعات شما
                  </p>
                </div>
                <div className="space-y-3 bg-accent/30 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">نام:</span>
                    <span className="font-medium">{displayName || '(وارد نشده)'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">هدف استفاده:</span>
                    <Badge variant="secondary">
                      {role === 'personal' ? 'شخصی' : role === 'work' ? 'کاری' : role === 'student' ? 'تحصیلی' : 'ترکیبی'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">آزمون شخصیت:</span>
                    <span className="text-sm">
                      {Object.keys(quizAnswers).length > 0 
                        ? `${persianNumbers(Object.keys(quizAnswers).length)} سوال پاسخ داده شده` 
                        : 'رد شده'}
                    </span>
                  </div>
                  {firstGoal && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">اولین هدف:</span>
                      <span className="font-medium text-sm">{firstGoal}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  شورای هوشمند LifeOS از این اطلاعات برای شناخت بهتر شما و ارائه پیشنهادات هوشمند استفاده خواهد کرد.
                </p>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>قبلی</Button>
                  <Button onClick={handleComplete} disabled={isSaving}>
                    {isSaving ? 'در حال ذخیره...' : 'شروع استفاده از LifeOS'}
                    <Sparkles className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
