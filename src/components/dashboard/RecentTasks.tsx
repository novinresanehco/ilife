import { CheckCircle, Circle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

const statusIcons: Record<string, typeof Circle> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle,
};

const statusColors: Record<string, string> = {
  todo: 'text-muted-foreground',
  in_progress: 'text-amber-500',
  done: 'text-emerald-500',
};

const statusLabels: Record<string, string> = {
  todo: 'در انتظار',
  in_progress: 'در حال انجام',
  done: 'انجام شده',
};

export const RecentTasks = () => {
  const { user } = useAuthContext();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['recent_tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, importance')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="font-semibold text-lg mb-4">وظایف اخیر</h3>
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">وظیفه‌ای ثبت نشده</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const status = task.status ?? 'todo';
            const Icon = statusIcons[status] ?? Circle;
            return (
              <div 
                key={task.id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Icon className={cn("w-5 h-5", statusColors[status])} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    status === 'done' && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{statusLabels[status]}</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium",
                  (task.importance ?? 50) >= 80 ? "bg-destructive/10 text-destructive" :
                  (task.importance ?? 50) >= 50 ? "bg-amber-500/10 text-amber-600" :
                  "bg-emerald-500/10 text-emerald-600"
                )}>
                  {persianNumbers(task.importance ?? 50)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
