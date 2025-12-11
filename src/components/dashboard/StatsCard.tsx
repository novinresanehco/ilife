import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { persianNumbers } from "@/lib/jalali";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  className?: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, className }: StatsCardProps) => {
  return (
    <div className={cn(
      "bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">
            {typeof value === 'number' ? persianNumbers(value) : value}
          </p>
          {trend !== undefined && (
            <p className={cn(
              "text-xs mt-2",
              trend >= 0 ? "text-emerald-600" : "text-destructive"
            )}>
              {trend >= 0 ? '↑' : '↓'} {persianNumbers(Math.abs(trend))}% از هفته گذشته
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
};
