import { useState } from "react";
import { Plus, ChevronDown, ChevronLeft, Target, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  category: string;
  subGoals?: Goal[];
}

const initialGoals: Goal[] = [
  {
    id: '1',
    title: 'توسعه حرفه‌ای',
    description: 'ارتقای مهارت‌های فنی و شغلی',
    progress: 60,
    category: 'کار',
    subGoals: [
      { id: '1-1', title: 'یادگیری React', description: 'تسلط کامل بر فریمورک React', progress: 80, category: 'فنی' },
      { id: '1-2', title: 'گواهینامه AWS', description: 'اخذ گواهینامه AWS Solutions Architect', progress: 40, category: 'فنی' },
    ]
  },
  {
    id: '2',
    title: 'سلامت و تناسب اندام',
    description: 'بهبود سطح سلامت جسمی',
    progress: 75,
    category: 'سلامت',
    subGoals: [
      { id: '2-1', title: 'ورزش منظم', description: '۳ روز در هفته ورزش', progress: 90, category: 'سلامت' },
      { id: '2-2', title: 'تغذیه سالم', description: 'رعایت رژیم غذایی متعادل', progress: 60, category: 'سلامت' },
    ]
  },
  {
    id: '3',
    title: 'رشد مالی',
    description: 'افزایش پس‌انداز و سرمایه‌گذاری',
    progress: 45,
    category: 'مالی',
    subGoals: [
      { id: '3-1', title: 'پس‌انداز ماهانه', description: '۲۰٪ درآمد', progress: 70, category: 'مالی' },
      { id: '3-2', title: 'یادگیری سرمایه‌گذاری', description: 'مطالعه بازار سرمایه', progress: 20, category: 'مالی' },
    ]
  },
  {
    id: '4',
    title: 'روابط اجتماعی',
    description: 'تقویت ارتباطات خانوادگی و دوستانه',
    progress: 55,
    category: 'شخصی',
  },
];

const categoryColors: Record<string, string> = {
  'کار': 'bg-primary/10 text-primary',
  'سلامت': 'bg-emerald-500/10 text-emerald-600',
  'مالی': 'bg-amber-500/10 text-amber-600',
  'شخصی': 'bg-purple-500/10 text-purple-600',
  'فنی': 'bg-blue-500/10 text-blue-600',
};

const GoalCard = ({ goal, level = 0 }: { goal: Goal; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasSubGoals = goal.subGoals && goal.subGoals.length > 0;

  return (
    <div className={cn("space-y-2", level > 0 && "mr-6 border-r-2 border-border pr-4")}>
      <div 
        className={cn(
          "bg-card rounded-xl p-5 border border-border hover:shadow-md transition-all",
          level === 0 && "shadow-sm"
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            goal.progress >= 80 ? "bg-emerald-500/10" : goal.progress >= 50 ? "bg-amber-500/10" : "bg-primary/10"
          )}>
            {goal.progress >= 80 ? (
              <Trophy className="w-6 h-6 text-emerald-500" />
            ) : goal.progress >= 50 ? (
              <TrendingUp className="w-6 h-6 text-amber-500" />
            ) : (
              <Target className="w-6 h-6 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {hasSubGoals && (
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                  )}
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              </div>
              <Badge className={cn("shrink-0", categoryColors[goal.category])}>
                {goal.category}
              </Badge>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">پیشرفت</span>
                <span className={cn(
                  "font-semibold",
                  goal.progress >= 80 ? "text-emerald-600" : goal.progress >= 50 ? "text-amber-600" : "text-primary"
                )}>
                  {persianNumbers(goal.progress)}%
                </span>
              </div>
              <Progress 
                value={goal.progress} 
                className="h-2"
              />
            </div>
            
            {hasSubGoals && (
              <p className="text-xs text-muted-foreground mt-2">
                {persianNumbers(goal.subGoals!.length)} هدف فرعی
              </p>
            )}
          </div>
        </div>
      </div>
      
      {hasSubGoals && isExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          {goal.subGoals!.map(subGoal => (
            <GoalCard key={subGoal.id} goal={subGoal} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Goals = () => {
  const [goals] = useState<Goal[]>(initialGoals);
  const totalProgress = Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اهداف</h1>
          <p className="text-muted-foreground mt-1">تعریف و پیگیری اهداف بلندمدت و کوتاه‌مدت</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          هدف جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground">کل اهداف</p>
          <p className="text-3xl font-bold text-foreground mt-1">{persianNumbers(goals.length)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground">میانگین پیشرفت</p>
          <p className="text-3xl font-bold text-primary mt-1">{persianNumbers(totalProgress)}%</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground">تکمیل شده</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {persianNumbers(goals.filter(g => g.progress >= 100).length)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
};

export default Goals;
