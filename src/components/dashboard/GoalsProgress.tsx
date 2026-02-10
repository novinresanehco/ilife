import { Progress } from "@/components/ui/progress";
import { persianNumbers } from "@/lib/jalali";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const GoalsProgress = () => {
  const { user } = useAuthContext();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals_progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('id, title, progress, goal_type')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const goalTypeLabels: Record<string, string> = {
    personal: 'شخصی', career: 'کار', health: 'سلامت',
    financial: 'مالی', education: 'آموزش', relationship: 'روابط', spiritual: 'معنوی',
  };

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="font-semibold text-lg mb-4">پیشرفت اهداف</h3>
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : goals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">هدفی ثبت نشده</p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{goal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {goalTypeLabels[goal.goal_type ?? 'personal'] ?? goal.goal_type}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {persianNumbers(goal.progress ?? 0)}%
                </span>
              </div>
              <Progress value={goal.progress ?? 0} className="h-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
