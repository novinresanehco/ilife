import { useState } from "react";
import { User, Award, Brain, ChevronLeft, CheckCircle } from "lucide-react";
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
  type: 'likert' | 'yesno' | 'scale';
  category: string;
}

const quizQuestions: QuizQuestion[] = [
  { id: 'q1', text: 'تجربه‌های جدید من را هیجان‌زده می‌کند', type: 'likert', category: 'گشودگی' },
  { id: 'q2', text: 'معمولاً با دیگران همدردی می‌کنم', type: 'likert', category: 'توافق‌پذیری' },
  { id: 'q3', text: 'در گروه‌ها ترجیح می‌دهم رهبری کنم', type: 'scale', category: 'تسلط' },
  { id: 'q4', text: 'واقعیت‌های ملموس را به احتمالات ترجیح می‌دهم', type: 'yesno', category: 'تیپ' },
  { id: 'q5', text: 'برنامه‌ریزی برای آینده برایم مهم است', type: 'likert', category: 'وظیفه‌شناسی' },
];

const traits = [
  { name: 'گشودگی', score: 75, color: 'bg-purple-500' },
  { name: 'وظیفه‌شناسی', score: 60, color: 'bg-blue-500' },
  { name: 'برون‌گرایی', score: 45, color: 'bg-amber-500' },
  { name: 'توافق‌پذیری', score: 80, color: 'bg-emerald-500' },
  { name: 'ثبات عاطفی', score: 65, color: 'bg-pink-500' },
];

const Profile = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showQuiz, setShowQuiz] = useState(false);

  const question = quizQuestions[currentQuestion];
  const quizProgress = (Object.keys(answers).length / quizQuestions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [question.id]: value });
    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
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
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              تحلیل شخصیت
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showQuiz ? (
              <>
                <div className="space-y-4 mb-6">
                  {traits.map((trait) => (
                    <div key={trait.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{trait.name}</span>
                        <span className="text-sm text-muted-foreground">{persianNumbers(trait.score)}%</span>
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
                <Button onClick={() => setShowQuiz(true)} className="w-full">
                  تکمیل آزمون شخصیت
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>پیشرفت آزمون</span>
                    <span>{persianNumbers(Math.round(quizProgress))}%</span>
                  </div>
                  <Progress value={quizProgress} />
                </div>
                
                {currentQuestion < quizQuestions.length ? (
                  <div className="bg-accent/50 rounded-xl p-6">
                    <Badge variant="outline" className="mb-3">{question.category}</Badge>
                    <p className="text-lg font-medium mb-6">{question.text}</p>
                    
                    {question.type === 'likert' && (
                      <RadioGroup 
                        value={answers[question.id]} 
                        onValueChange={handleAnswer}
                        className="grid grid-cols-5 gap-2"
                      >
                        {['کاملاً مخالف', 'مخالف', 'نظری ندارم', 'موافق', 'کاملاً موافق'].map((label, i) => (
                          <div key={i} className="text-center">
                            <RadioGroupItem value={String(i + 1)} id={`q-${i}`} className="mx-auto" />
                            <Label htmlFor={`q-${i}`} className="text-xs mt-1 block">{label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {question.type === 'yesno' && (
                      <RadioGroup 
                        value={answers[question.id]} 
                        onValueChange={handleAnswer}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="yes" />
                          <Label htmlFor="yes">بله</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="no" />
                          <Label htmlFor="no">خیر</Label>
                        </div>
                      </RadioGroup>
                    )}
                    
                    {question.type === 'scale' && (
                      <RadioGroup 
                        value={answers[question.id]} 
                        onValueChange={handleAnswer}
                        className="grid grid-cols-5 gap-2"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div key={n} className="text-center">
                            <RadioGroupItem value={String(n)} id={`scale-${n}`} className="mx-auto" />
                            <Label htmlFor={`scale-${n}`} className="text-xs mt-1 block">{persianNumbers(n)}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">آزمون تکمیل شد!</h3>
                    <p className="text-muted-foreground mb-4">نتایج شما در حال تحلیل است...</p>
                    <Button onClick={() => { setShowQuiz(false); setCurrentQuestion(0); }}>
                      مشاهده نتایج
                    </Button>
                  </div>
                )}
                
                {currentQuestion < quizQuestions.length && (
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ChevronLeft className="w-4 h-4 ml-1" />
                      قبلی
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowQuiz(false)}
                    >
                      خروج
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
