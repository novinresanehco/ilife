import { useState } from "react";
import { Plus, Target, Trophy, TrendingUp, Trash2, Edit3, Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";
import { useGoals, type Goal as DbGoal, type CreateGoalInput } from "@/hooks/useGoals";

const goalTypeLabels: Record<string, string> = {
  personal: 'شخصی',
  career: 'کار',
  health: 'سلامت',
  financial: 'مالی',
  education: 'آموزش',
  relationship: 'روابط',
  spiritual: 'معنوی',
};

const goalTypeColors: Record<string, string> = {
  personal: 'bg-purple-500/10 text-purple-600',
  career: 'bg-primary/10 text-primary',
  health: 'bg-emerald-500/10 text-emerald-600',
  financial: 'bg-amber-500/10 text-amber-600',
  education: 'bg-pink-500/10 text-pink-600',
  relationship: 'bg-blue-500/10 text-blue-600',
  spiritual: 'bg-indigo-500/10 text-indigo-600',
};

interface GoalCardProps {
  goal: DbGoal;
  onEdit: (goal: DbGoal) => void;
  onDelete: (id: string) => void;
  onAddSubGoal: (parentId: string) => void;
}

const GoalCard = ({ goal, onEdit, onDelete, onAddSubGoal }: GoalCardProps) => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          (goal.progress ?? 0) >= 80 ? "bg-emerald-500/10" : (goal.progress ?? 0) >= 50 ? "bg-amber-500/10" : "bg-primary/10"
        )}>
          {(goal.progress ?? 0) >= 80 ? (
            <Trophy className="w-6 h-6 text-emerald-500" />
          ) : (goal.progress ?? 0) >= 50 ? (
            <TrendingUp className="w-6 h-6 text-amber-500" />
          ) : (
            <Target className="w-6 h-6 text-primary" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{goal.title}</h3>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              <Badge className={cn("shrink-0", goalTypeColors[goal.goal_type ?? 'personal'])}>
                {goalTypeLabels[goal.goal_type ?? 'personal']}
              </Badge>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(goal)}>
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(goal.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">پیشرفت</span>
              <span className={cn(
                "font-semibold",
                (goal.progress ?? 0) >= 80 ? "text-emerald-600" : (goal.progress ?? 0) >= 50 ? "text-amber-600" : "text-primary"
              )}>
                {persianNumbers(goal.progress ?? 0)}%
              </span>
            </div>
            <Progress value={goal.progress ?? 0} className="h-2" />
          </div>
          
          {goal.target_date && (
            <p className="text-xs text-muted-foreground mt-3">تاریخ هدف: {goal.target_date}</p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 text-xs gap-1"
              onClick={() => onAddSubGoal(goal.id)}
            >
              <Plus className="w-3 h-3" />
              افزودن هدف فرعی
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-goals */}
      {goal.children && goal.children.length > 0 && (
        <div className="mr-8 mt-4 space-y-3 border-r-2 border-border pr-4">
          {goal.children.map(child => (
            <GoalCard key={child.id} goal={child} onEdit={onEdit} onDelete={onDelete} onAddSubGoal={onAddSubGoal} />
          ))}
        </div>
      )}
    </div>
  );
};

const Goals = () => {
  const { goals, goalTree, isLoading, createGoal, updateGoal, deleteGoal, isCreating } = useGoals();
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<DbGoal | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'personal' as DbGoal['goal_type'],
    priority: 50,
  });

  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + (g.progress ?? 0), 0) / goals.length)
    : 0;

  const handleOpenCreate = (parentGoalId: string | null = null) => {
    setEditingGoal(null);
    setParentId(parentGoalId);
    setFormData({ title: '', description: '', goal_type: 'personal', priority: 50 });
    setShowDialog(true);
  };

  const handleEdit = (goal: DbGoal) => {
    setEditingGoal(goal);
    setParentId(null);
    setFormData({
      title: goal.title,
      description: goal.description ?? '',
      goal_type: goal.goal_type as DbGoal['goal_type'],
      priority: goal.priority ?? 50,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (editingGoal) {
      updateGoal({ id: editingGoal.id, ...formData });
    } else {
      const input: CreateGoalInput = {
        title: formData.title,
        description: formData.description || undefined,
        goal_type: formData.goal_type,
        parent_id: parentId || undefined,
        priority: formData.priority,
      };
      createGoal(input);
    }
    
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اهداف</h1>
          <p className="text-muted-foreground mt-1">تعریف و پیگیری اهداف بلندمدت و کوتاه‌مدت</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenCreate()}>
          <Plus className="w-4 h-4" />
          هدف جدید
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-muted-foreground">تعداد اهداف</p>
          <p className="text-2xl font-bold">{persianNumbers(goals.length)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-muted-foreground">میانگین پیشرفت</p>
          <p className="text-2xl font-bold text-primary">{persianNumbers(totalProgress)}%</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-muted-foreground">تکمیل شده</p>
          <p className="text-2xl font-bold text-emerald-600">
            {persianNumbers(goals.filter(g => g.status === 'completed').length)}
          </p>
        </div>
      </div>

      {goalTree.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>هنوز هدفی ثبت نشده است</p>
          <p className="text-sm mt-1">اولین هدف خود را ایجاد کنید</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goalTree.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddSubGoal={handleOpenCreate}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'ویرایش هدف' : parentId ? 'افزودن هدف فرعی' : 'هدف جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Input 
                placeholder="عنوان هدف..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Textarea 
                placeholder="توضیحات هدف..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Select 
                value={formData.goal_type} 
                onValueChange={(v) => setFormData({ ...formData, goal_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(goalTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1" disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ذخیره'}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>انصراف</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
