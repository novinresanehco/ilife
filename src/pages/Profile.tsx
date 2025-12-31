import { useState } from "react";
import { User, Award, Brain, ChevronLeft, ChevronRight, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";

interface QuizQuestion {
  id: string;
  text: string;
  trait: 'O' | 'C' | 'E' | 'A' | 'N';
  reverse: boolean;
}

// Big Five 50-question assessment
const bigFiveQuestions: QuizQuestion[] = [
  // Openness (10 questions)
  { id: 'o1', text: 'تجربه‌های جدید من را هیجان‌زده می‌کند', trait: 'O', reverse: false },
  { id: 'o2', text: 'به هنر و زیبایی‌شناسی علاقه‌مندم', trait: 'O', reverse: false },
  { id: 'o3', text: 'تخیل قوی و فعالی دارم', trait: 'O', reverse: false },
  { id: 'o4', text: 'به مباحث فلسفی و انتزاعی علاقه‌مندم', trait: 'O', reverse: false },
  { id: 'o5', text: 'دوست دارم ایده‌های جدید را امتحان کنم', trait: 'O', reverse: false },
  { id: 'o6', text: 'ترجیح می‌دهم روال‌های ثابت را دنبال کنم', trait: 'O', reverse: true },
  { id: 'o7', text: 'به موسیقی و هنرهای مختلف علاقه‌مندم', trait: 'O', reverse: false },
  { id: 'o8', text: 'خلاقیت در حل مسائل برایم مهم است', trait: 'O', reverse: false },
  { id: 'o9', text: 'از یادگیری چیزهای جدید لذت می‌برم', trait: 'O', reverse: false },
  { id: 'o10', text: 'ذهن باز و پذیرای نظرات مختلف هستم', trait: 'O', reverse: false },
  
  // Conscientiousness (10 questions)
  { id: 'c1', text: 'همیشه کارها را به موقع انجام می‌دهم', trait: 'C', reverse: false },
  { id: 'c2', text: 'به جزئیات توجه زیادی دارم', trait: 'C', reverse: false },
  { id: 'c3', text: 'برنامه‌ریزی برای آینده برایم مهم است', trait: 'C', reverse: false },
  { id: 'c4', text: 'وظایفم را با دقت انجام می‌دهم', trait: 'C', reverse: false },
  { id: 'c5', text: 'محیط اطرافم را مرتب نگه می‌دارم', trait: 'C', reverse: false },
  { id: 'c6', text: 'گاهی فراموش می‌کنم چیزها را سر جایشان بگذارم', trait: 'C', reverse: true },
  { id: 'c7', text: 'اهداف مشخصی دارم و برای رسیدن به آنها تلاش می‌کنم', trait: 'C', reverse: false },
  { id: 'c8', text: 'مسئولیت‌پذیر و قابل اعتماد هستم', trait: 'C', reverse: false },
  { id: 'c9', text: 'کارها را تا آخر پیگیری می‌کنم', trait: 'C', reverse: false },
  { id: 'c10', text: 'در مدیریت زمان مهارت دارم', trait: 'C', reverse: false },
  
  // Extraversion (10 questions)
  { id: 'e1', text: 'در جمع‌ها احساس انرژی می‌کنم', trait: 'E', reverse: false },
  { id: 'e2', text: 'به راحتی با افراد جدید آشنا می‌شوم', trait: 'E', reverse: false },
  { id: 'e3', text: 'در مهمانی‌ها با افراد مختلف صحبت می‌کنم', trait: 'E', reverse: false },
  { id: 'e4', text: 'ترجیح می‌دهم مرکز توجه باشم', trait: 'E', reverse: false },
  { id: 'e5', text: 'فعالیت‌های گروهی را دوست دارم', trait: 'E', reverse: false },
  { id: 'e6', text: 'ترجیح می‌دهم تنها باشم تا در جمع', trait: 'E', reverse: true },
  { id: 'e7', text: 'پرحرف و اجتماعی هستم', trait: 'E', reverse: false },
  { id: 'e8', text: 'به راحتی احساساتم را بیان می‌کنم', trait: 'E', reverse: false },
  { id: 'e9', text: 'در گروه‌ها نقش رهبری می‌گیرم', trait: 'E', reverse: false },
  { id: 'e10', text: 'فعالیت‌های هیجان‌انگیز را دوست دارم', trait: 'E', reverse: false },
  
  // Agreeableness (10 questions)
  { id: 'a1', text: 'به دیگران اعتماد می‌کنم', trait: 'A', reverse: false },
  { id: 'a2', text: 'با دیگران همدردی می‌کنم', trait: 'A', reverse: false },
  { id: 'a3', text: 'دوست دارم به دیگران کمک کنم', trait: 'A', reverse: false },
  { id: 'a4', text: 'در تعارض‌ها به دنبال سازش هستم', trait: 'A', reverse: false },
  { id: 'a5', text: 'نسبت به دیگران صبور هستم', trait: 'A', reverse: false },
  { id: 'a6', text: 'گاهی با دیگران بحث و جدل می‌کنم', trait: 'A', reverse: true },
  { id: 'a7', text: 'احساسات دیگران برایم مهم است', trait: 'A', reverse: false },
  { id: 'a8', text: 'فروتن و متواضع هستم', trait: 'A', reverse: false },
  { id: 'a9', text: 'همکاری را به رقابت ترجیح می‌دهم', trait: 'A', reverse: false },
  { id: 'a10', text: 'به راحتی دیگران را می‌بخشم', trait: 'A', reverse: false },
  
  // Neuroticism (10 questions)
  { id: 'n1', text: 'به راحتی استرس می‌گیرم', trait: 'N', reverse: false },
  { id: 'n2', text: 'گاهی احساس غمگینی می‌کنم', trait: 'N', reverse: false },
  { id: 'n3', text: 'نگران اتفاقات آینده هستم', trait: 'N', reverse: false },
  { id: 'n4', text: 'خلق و خویم تغییرات زیادی دارد', trait: 'N', reverse: false },
  { id: 'n5', text: 'به راحتی عصبانی می‌شوم', trait: 'N', reverse: false },
  { id: 'n6', text: 'در شرایط سخت آرامش خود را حفظ می‌کنم', trait: 'N', reverse: true },
  { id: 'n7', text: 'گاهی احساس ناامیدی می‌کنم', trait: 'N', reverse: false },
  { id: 'n8', text: 'حساس به انتقاد هستم', trait: 'N', reverse: false },
  { id: 'n9', text: 'گاهی احساس تنهایی می‌کنم', trait: 'N', reverse: false },
  { id: 'n10', text: 'به اتفاقات بد زیاد فکر می‌کنم', trait: 'N', reverse: false },
];

const traitLabels: Record<string, { name: string; color: string; description: string }> = {
  O: { name: 'گشودگی', color: 'bg-purple-500', description: 'خلاقیت، کنجکاوی و علاقه به تجربه‌های جدید' },
  C: { name: 'وظیفه‌شناسی', color: 'bg-blue-500', description: 'نظم، برنامه‌ریزی و مسئولیت‌پذیری' },
  E: { name: 'برون‌گرایی', color: 'bg-amber-500', description: 'اجتماعی بودن، پرانرژی و خوش‌مشرب' },
  A: { name: 'توافق‌پذیری', color: 'bg-emerald-500', description: 'همدلی، همکاری و اعتماد به دیگران' },
  N: { name: 'ثبات عاطفی', color: 'bg-pink-500', description: 'آرامش، تحمل استرس و کنترل احساسات' },
};

const likertOptions = [
  { value: 1, label: 'کاملاً مخالف' },
  { value: 2, label: 'مخالف' },
  { value: 3, label: 'نظری ندارم' },
  { value: 4, label: 'موافق' },
  { value: 5, label: 'کاملاً موافق' },
];

const Profile = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const question = bigFiveQuestions[currentQuestion];
  const quizProgress = (Object.keys(answers).length / bigFiveQuestions.length) * 100;

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [question.id]: value });
    if (currentQuestion < bigFiveQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const calculateTraitScore = (trait: string): number => {
    const traitQuestions = bigFiveQuestions.filter(q => q.trait === trait);
    let score = 0;
    let answered = 0;
    
    traitQuestions.forEach(q => {
      if (answers[q.id] !== undefined) {
        answered++;
        if (q.reverse) {
          score += (6 - answers[q.id]);
        } else {
          score += answers[q.id];
        }
      }
    });
    
    if (answered === 0) return 0;
    
    // Convert to percentage (max score per trait = 50, min = 10)
    return Math.round(((score - 10) / 40) * 100);
  };

  const traits = [
    { key: 'O', ...traitLabels.O, score: calculateTraitScore('O') },
    { key: 'C', ...traitLabels.C, score: calculateTraitScore('C') },
    { key: 'E', ...traitLabels.E, score: calculateTraitScore('E') },
    { key: 'A', ...traitLabels.A, score: calculateTraitScore('A') },
    { key: 'N', ...traitLabels.N, score: 100 - calculateTraitScore('N') }, // Reverse for "stability"
  ];

  const resetQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setShowQuiz(true);
  };

  const finishQuiz = () => {
    setShowResults(true);
    setShowQuiz(false);
  };

  const getTraitInterpretation = (trait: string, score: number): string => {
    if (score >= 70) {
      switch (trait) {
        case 'O': return 'شما فردی بسیار خلاق و کنجکاو هستید که از تجربه‌های جدید استقبال می‌کنید.';
        case 'C': return 'شما فردی بسیار منظم و هدفمند هستید که به برنامه‌ریزی اهمیت می‌دهید.';
        case 'E': return 'شما فردی بسیار اجتماعی و پرانرژی هستید که در جمع‌ها می‌درخشید.';
        case 'A': return 'شما فردی بسیار همدل و مهربان هستید که به دیگران اعتماد می‌کنید.';
        case 'N': return 'شما فردی بسیار آرام و متعادل هستید که استرس را به خوبی مدیریت می‌کنید.';
        default: return '';
      }
    } else if (score >= 40) {
      return 'شما در این ویژگی تعادل خوبی دارید.';
    } else {
      switch (trait) {
        case 'O': return 'شما ترجیح می‌دهید از روش‌های آزموده شده استفاده کنید.';
        case 'C': return 'شما انعطاف‌پذیرتر هستید و کمتر به برنامه‌ریزی سخت پایبندید.';
        case 'E': return 'شما درون‌گراتر هستید و از تنهایی لذت می‌برید.';
        case 'A': return 'شما مستقل‌تر فکر می‌کنید و رقابتی‌تر هستید.';
        case 'N': return 'شما حساس‌تر هستید و ممکن است گاهی استرس تجربه کنید.';
        default: return '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">پروفایل</h1>
          <p className="text-muted-foreground mt-1">اطلاعات شخصی و تحلیل شخصیت</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold">کاربر LifeOS</h2>
              <p className="text-muted-foreground text-sm">عضو از ۱۴۰۳</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge variant="secondary" className="gap-1">
                  <Award className="w-3 h-3" />
                  سطح طلایی
                </Badge>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">وظایف تکمیل‌شده</span>
                <span className="font-semibold">{persianNumbers(156)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">اهداف فعال</span>
                <span className="font-semibold">{persianNumbers(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">روزهای فعال متوالی</span>
                <span className="font-semibold">{persianNumbers(23)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">سوالات پاسخ داده</span>
                <span className="font-semibold">{persianNumbers(Object.keys(answers).length)}/{persianNumbers(50)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              تحلیل شخصیت (Big Five)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showQuiz && !showResults ? (
              <>
                <p className="text-muted-foreground mb-6">
                  آزمون شخصیت Big Five شامل ۵۰ سوال است که ۵ ویژگی اصلی شخصیت شما را ارزیابی می‌کند.
                </p>
                <div className="space-y-4 mb-6">
                  {traits.map((trait) => (
                    <div key={trait.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">{trait.name}</span>
                          <p className="text-xs text-muted-foreground">{trait.description}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {trait.score > 0 ? `${persianNumbers(trait.score)}%` : '—'}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all", trait.color)}
                          style={{ width: `${trait.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowQuiz(true)} className="flex-1">
                    {Object.keys(answers).length > 0 ? 'ادامه آزمون' : 'شروع آزمون'}
                  </Button>
                  {Object.keys(answers).length > 0 && (
                    <Button variant="outline" onClick={resetQuiz}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </>
            ) : showQuiz ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>پیشرفت آزمون</span>
                    <span>{persianNumbers(currentQuestion + 1)} از {persianNumbers(bigFiveQuestions.length)}</span>
                  </div>
                  <Progress value={quizProgress} />
                </div>
                
                {currentQuestion < bigFiveQuestions.length ? (
                  <div className="bg-accent/50 rounded-xl p-6">
                    <Badge variant="outline" className="mb-3">
                      {traitLabels[question.trait].name}
                    </Badge>
                    <p className="text-lg font-medium mb-6">{question.text}</p>
                    
                    <RadioGroup 
                      value={answers[question.id]?.toString()} 
                      onValueChange={(v) => handleAnswer(parseInt(v))}
                      className="space-y-3"
                    >
                      {likertOptions.map((option) => (
                        <div 
                          key={option.value} 
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border border-border transition-all cursor-pointer hover:bg-accent",
                            answers[question.id] === option.value && "bg-primary/10 border-primary"
                          )}
                          onClick={() => handleAnswer(option.value)}
                        >
                          <RadioGroupItem value={option.value.toString()} id={`opt-${option.value}`} />
                          <Label htmlFor={`opt-${option.value}`} className="flex-1 cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">آزمون تکمیل شد!</h3>
                    <p className="text-muted-foreground mb-4">همه ۵۰ سوال پاسخ داده شد</p>
                    <Button onClick={finishQuiz}>
                      مشاهده نتایج
                    </Button>
                  </div>
                )}
                
                {currentQuestion < bigFiveQuestions.length && (
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ChevronRight className="w-4 h-4 ml-1" />
                      قبلی
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowQuiz(false)}
                      >
                        خروج
                      </Button>
                      {answers[question.id] !== undefined && currentQuestion === bigFiveQuestions.length - 1 && (
                        <Button onClick={finishQuiz}>
                          اتمام و نتایج
                        </Button>
                      )}
                      {answers[question.id] !== undefined && currentQuestion < bigFiveQuestions.length - 1 && (
                        <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                          بعدی
                          <ChevronLeft className="w-4 h-4 mr-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-border">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">نتایج تحلیل شخصیت شما</h3>
                  <p className="text-sm text-muted-foreground">بر اساس مدل Big Five</p>
                </div>
                
                <div className="space-y-6">
                  {traits.map((trait) => (
                    <div key={trait.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", trait.color)} />
                          <span className="font-semibold">{trait.name}</span>
                        </div>
                        <span className={cn(
                          "font-bold",
                          trait.score >= 70 ? "text-emerald-600" : trait.score >= 40 ? "text-amber-600" : "text-primary"
                        )}>
                          {persianNumbers(trait.score)}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all", trait.color)}
                          style={{ width: `${trait.score}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getTraitInterpretation(trait.key, trait.score)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={resetQuiz} className="flex-1">
                    <RotateCcw className="w-4 h-4 ml-1" />
                    آزمون مجدد
                  </Button>
                  <Button onClick={() => setShowResults(false)} className="flex-1">
                    بازگشت
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

export default Profile;