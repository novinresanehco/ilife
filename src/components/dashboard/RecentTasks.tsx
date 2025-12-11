import { CheckCircle, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  importance: number;
}

const mockTasks: Task[] = [
  { id: '1', title: 'تکمیل گزارش پروژه', status: 'in_progress', importance: 85 },
  { id: '2', title: 'جلسه با تیم توسعه', status: 'done', importance: 70 },
  { id: '3', title: 'بررسی ایمیل‌های مهم', status: 'todo', importance: 60 },
  { id: '4', title: 'طراحی رابط کاربری', status: 'in_progress', importance: 90 },
  { id: '5', title: 'تمرین ورزشی صبح', status: 'done', importance: 50 },
];

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle,
};

const statusColors = {
  todo: 'text-muted-foreground',
  in_progress: 'text-amber-500',
  done: 'text-emerald-500',
};

const statusLabels = {
  todo: 'در انتظار',
  in_progress: 'در حال انجام',
  done: 'انجام شده',
};

export const RecentTasks = () => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="font-semibold text-lg mb-4">وظایف اخیر</h3>
      <div className="space-y-3">
        {mockTasks.map((task) => {
          const Icon = statusIcons[task.status];
          return (
            <div 
              key={task.id} 
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <Icon className={cn("w-5 h-5", statusColors[task.status])} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  task.status === 'done' && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">{statusLabels[task.status]}</p>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-md text-xs font-medium",
                task.importance >= 80 ? "bg-destructive/10 text-destructive" :
                task.importance >= 50 ? "bg-amber-500/10 text-amber-600" :
                "bg-emerald-500/10 text-emerald-600"
              )}>
                {persianNumbers(task.importance)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
