import { Plus, Zap, MessageSquarePlus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: 'وظیفه جدید', color: 'bg-primary' },
  { icon: Target, label: 'هدف جدید', color: 'bg-emerald-500' },
  { icon: MessageSquarePlus, label: 'یادداشت', color: 'bg-amber-500' },
  { icon: Zap, label: 'ایده سریع', color: 'bg-purple-500' },
];

export const QuickActions = () => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="font-semibold text-lg mb-4">دسترسی سریع</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-accent"
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
              <action.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
