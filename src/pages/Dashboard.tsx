import { CheckSquare, Target, Calendar, Lightbulb } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { toJalaliWithDay } from "@/lib/jalali";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

const Dashboard = () => {
  const today = new Date();
  const { user } = useAuthContext();

  const { data: stats } = useQuery({
    queryKey: ['dashboard_stats', user?.id],
    queryFn: async () => {
      if (!user) return { tasks: 0, goals: 0, events: 0, ideas: 0 };
      
      const todayStr = new Date().toISOString().split('T')[0];
      
      const [tasksRes, goalsRes, eventsRes, ideasRes] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['todo', 'in_progress']),
        supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
        supabase.from('calendar_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('ideas').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      return {
        tasks: tasksRes.count ?? 0,
        goals: goalsRes.count ?? 0,
        events: eventsRes.count ?? 0,
        ideas: ideasRes.count ?? 0,
      };
    },
    enabled: !!user,
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">سلام، خوش آمدید! 👋</h1>
        <p className="text-muted-foreground mt-1">{toJalaliWithDay(today)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="وظایف فعال" 
          value={stats?.tasks ?? 0} 
          icon={CheckSquare} 
        />
        <StatsCard 
          title="اهداف فعال" 
          value={stats?.goals ?? 0} 
          icon={Target} 
        />
        <StatsCard 
          title="رویدادها" 
          value={stats?.events ?? 0} 
          icon={Calendar} 
        />
        <StatsCard 
          title="ایده‌ها" 
          value={stats?.ideas ?? 0} 
          icon={Lightbulb} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentTasks />
          <GoalsProgress />
        </div>
        <div className="space-y-6">
          <MiniCalendar />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
