import { Progress } from "@/components/ui/progress";
import { persianNumbers } from "@/lib/jalali";

interface Goal {
  id: string;
  title: string;
  progress: number;
  category: string;
}

const mockGoals: Goal[] = [
  { id: '1', title: 'یادگیری زبان انگلیسی', progress: 65, category: 'آموزش' },
  { id: '2', title: 'افزایش پس‌انداز', progress: 40, category: 'مالی' },
  { id: '3', title: 'تناسب اندام', progress: 75, category: 'سلامت' },
  { id: '4', title: 'خواندن ۱۲ کتاب', progress: 50, category: 'شخصی' },
];

export const GoalsProgress = () => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="font-semibold text-lg mb-4">پیشرفت اهداف</h3>
      <div className="space-y-4">
        {mockGoals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{goal.title}</p>
                <p className="text-xs text-muted-foreground">{goal.category}</p>
              </div>
              <span className="text-sm font-semibold text-primary">
                {persianNumbers(goal.progress)}%
              </span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
};
