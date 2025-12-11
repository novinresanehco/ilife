import { CheckSquare, Target, Calendar, Lightbulb } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { toJalaliWithDay } from "@/lib/jalali";

const Dashboard = () => {
  const today = new Date();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">سلام، خوش آمدید! 👋</h1>
        <p className="text-muted-foreground mt-1">{toJalaliWithDay(today)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="وظایف امروز" 
          value={8} 
          icon={CheckSquare} 
          trend={12}
        />
        <StatsCard 
          title="اهداف فعال" 
          value={4} 
          icon={Target} 
          trend={5}
        />
        <StatsCard 
          title="رویدادهای هفته" 
          value={12} 
          icon={Calendar} 
          trend={-3}
        />
        <StatsCard 
          title="ایده‌های جدید" 
          value={6} 
          icon={Lightbulb} 
          trend={25}
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
