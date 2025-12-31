import { useState } from "react";
import { Plus, ChevronDown, ChevronLeft, Target, Trophy, TrendingUp, Link2, Trash2, Edit3, X, Save, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";

interface LinkedTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  category: string;
  level: 'vision' | 'longterm' | 'midterm' | 'shortterm';
  linkedTasks?: LinkedTask[];
  subGoals?: Goal[];
}

const levelLabels: Record<string, string> = {
  vision: 'چشم‌انداز',
  longterm: 'بلندمدت',
  midterm: 'میان‌مدت',
  shortterm: 'کوتاه‌مدت',
};

const levelColors: Record<string, string> = {
  vision: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  longterm: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  midterm: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  shortterm: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
};

const categoryColors: Record<string, string> = {
  'کار': 'bg-primary/10 text-primary',
  'سلامت': 'bg-emerald-500/10 text-emerald-600',
  'مالی': 'bg-amber-500/10 text-amber-600',
  'شخصی': 'bg-purple-500/10 text-purple-600',
  'فنی': 'bg-blue-500/10 text-blue-600',
  'آموزش': 'bg-pink-500/10 text-pink-600',
};

const categories = ['کار', 'سلامت', 'مالی', 'شخصی', 'فنی', 'آموزش'];

const initialGoals: Goal[] = [
  {
    id: '1',
    title: 'زندگی متعادل و موفق',
    description: 'دستیابی به تعادل در همه ابعاد زندگی',
    progress: 55,
    category: 'شخصی',
    level: 'vision',
    subGoals: [
      {
        id: '1-1',
        title: 'توسعه حرفه‌ای',
        description: 'ارتقای مهارت‌های فنی و شغلی',
        progress: 60,
        category: 'کار',
        level: 'longterm',
        subGoals: [
          { 
            id: '1-1-1', 
            title: 'یادگیری React', 
            description: 'تسلط کامل بر فریمورک React', 
            progress: 80, 
            category: 'فنی',
            level: 'midterm',
            linkedTasks: [
              { id: 't1', title: 'مطالعه داکیومنت React', completed: true },
              { id: 't2', title: 'ساخت پروژه تمرینی', completed: true },
              { id: 't3', title: 'یادگیری Next.js', completed: false },
            ]
          },
          { 
            id: '1-1-2', 
            title: 'گواهینامه AWS', 
            description: 'اخذ گواهینامه AWS Solutions Architect', 
            progress: 40, 
            category: 'فنی',
            level: 'midterm',
            linkedTasks: [
              { id: 't4', title: 'ثبت‌نام در دوره', completed: true },
              { id: 't5', title: 'مطالعه روزانه', completed: false },
            ]
          },
        ]
      },
      {
        id: '1-2',
        title: 'سلامت و تناسب اندام',
        description: 'بهبود سطح سلامت جسمی',
        progress: 75,
        category: 'سلامت',
        level: 'longterm',
        subGoals: [
          { 
            id: '1-2-1', 
            title: 'ورزش منظم', 
            description: '۳ روز در هفته ورزش', 
            progress: 90, 
            category: 'سلامت',
            level: 'shortterm',
            linkedTasks: [
              { id: 't6', title: 'ثبت‌نام باشگاه', completed: true },
              { id: 't7', title: 'تمرین امروز', completed: true },
            ]
          },
          { 
            id: '1-2-2', 
            title: 'تغذیه سالم', 
            description: 'رعایت رژیم غذایی متعادل', 
            progress: 60, 
            category: 'سلامت',
            level: 'shortterm',
          },
        ]
      },
    ]
  },
  {
    id: '2',
    title: 'استقلال مالی',
    description: 'رسیدن به آزادی مالی در ۱۰ سال',
    progress: 35,
    category: 'مالی',
    level: 'vision',
    subGoals: [
      {
        id: '2-1',
        title: 'افزایش پس‌انداز',
        description: 'ذخیره ۲۰٪ درآمد ماهانه',
        progress: 50,
        category: 'مالی',
        level: 'longterm',
        linkedTasks: [
          { id: 't8', title: 'باز کردن حساب پس‌انداز', completed: true },
          { id: 't9', title: 'تنظیم واریز خودکار', completed: false },
        ]
      },
      {
        id: '2-2',
        title: 'یادگیری سرمایه‌گذاری',
        description: 'آشنایی با بازار سرمایه',
        progress: 20,
        category: 'مالی',
        level: 'midterm',
      },
    ]
  },
];

interface GoalCardProps {
  goal: Goal;
  level?: number;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAddSubGoal: (parentId: string) => void;
}

const GoalCard = ({ goal, level = 0, onEdit, onDelete, onAddSubGoal }: GoalCardProps) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasSubGoals = goal.subGoals && goal.subGoals.length > 0;
  const hasLinkedTasks = goal.linkedTasks && goal.linkedTasks.length > 0;

  const completedTasks = goal.linkedTasks?.filter(t => t.completed).length || 0;
  const totalTasks = goal.linkedTasks?.length || 0;

  return (
    <div className={cn(
      "space-y-2",
      level > 0 && "mr-6 border-r-2 border-border pr-4",
      level === 0 && "relative"
    )}>
      {/* Pyramid level indicator for top-level goals */}
      {level === 0 && (
        <div className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center">
          <Layers className="w-3 h-3 text-primary" />
        </div>
      )}
      
      <div 
        className={cn(
          "bg-card rounded-xl p-5 border border-border hover:shadow-md transition-all",
          level === 0 && "shadow-sm border-r-4",
          levelColors[goal.level]?.replace('bg-', 'border-r-').split(' ')[0]
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
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {hasSubGoals && (
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                  )}
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  <Badge variant="outline" className={cn("text-xs", levelColors[goal.level])}>
                    {levelLabels[goal.level]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <Badge className={cn("shrink-0", categoryColors[goal.category])}>
                  {goal.category}
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
                  goal.progress >= 80 ? "text-emerald-600" : goal.progress >= 50 ? "text-amber-600" : "text-primary"
                )}>
                  {persianNumbers(goal.progress)}%
                </span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
            
            {/* Linked Tasks */}
            {hasLinkedTasks && (
              <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Link2 className="w-4 h-4" />
                  وظایف مرتبط ({persianNumbers(completedTasks)}/{persianNumbers(totalTasks)})
                </div>
                <div className="space-y-1">
                  {goal.linkedTasks!.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2",
                        task.completed ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground"
                      )} />
                      <span className={cn(task.completed && "line-through text-muted-foreground")}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {goal.linkedTasks!.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      و {persianNumbers(goal.linkedTasks!.length - 3)} وظیفه دیگر...
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-3">
              {hasSubGoals && (
                <p className="text-xs text-muted-foreground">
                  {persianNumbers(goal.subGoals!.length)} هدف فرعی
                </p>
              )}
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
      </div>
      
      {hasSubGoals && isExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          {goal.subGoals!.map(subGoal => (
            <GoalCard 
              key={subGoal.id} 
              goal={subGoal} 
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubGoal={onAddSubGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Pyramid visualization component
const GoalsPyramid = ({ goals }: { goals: Goal[] }) => {
  const countByLevel = (goals: Goal[], level: string): number => {
    let count = 0;
    goals.forEach(g => {
      if (g.level === level) count++;
      if (g.subGoals) count += countByLevel(g.subGoals, level);
    });
    return count;
  };

  const levels = [
    { key: 'vision', label: 'چشم‌انداز', count: countByLevel(goals, 'vision') },
    { key: 'longterm', label: 'بلندمدت', count: countByLevel(goals, 'longterm') },
    { key: 'midterm', label: 'میان‌مدت', count: countByLevel(goals, 'midterm') },
    { key: 'shortterm', label: 'کوتاه‌مدت', count: countByLevel(goals, 'shortterm') },
  ];

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary" />
        هرم اهداف
      </h3>
      <div className="flex flex-col items-center gap-2">
        {levels.map((level, i) => (
          <div 
            key={level.key}
            className={cn(
              "flex items-center justify-center rounded-lg py-3 text-center transition-all",
              levelColors[level.key]
            )}
            style={{ width: `${60 + i * 12}%` }}
          >
            <span className="font-medium">{level.label}</span>
            <Badge variant="secondary" className="mr-2">
              {persianNumbers(level.count)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'شخصی',
    level: 'shortterm' as Goal['level'],
  });

  const calculateTotalProgress = (goals: Goal[]): number => {
    let total = 0;
    let count = 0;
    goals.forEach(g => {
      total += g.progress;
      count++;
      if (g.subGoals) {
        const sub = calculateTotalProgress(g.subGoals);
        total += sub * g.subGoals.length;
        count += g.subGoals.length;
      }
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  const countAllGoals = (goals: Goal[]): number => {
    return goals.reduce((acc, g) => acc + 1 + (g.subGoals ? countAllGoals(g.subGoals) : 0), 0);
  };

  const countCompletedGoals = (goals: Goal[]): number => {
    return goals.reduce((acc, g) => {
      const completed = g.progress >= 100 ? 1 : 0;
      return acc + completed + (g.subGoals ? countCompletedGoals(g.subGoals) : 0);
    }, 0);
  };

  const handleOpenCreate = (parentGoalId: string | null = null) => {
    setEditingGoal(null);
    setParentId(parentGoalId);
    setFormData({ title: '', description: '', category: 'شخصی', level: 'shortterm' });
    setShowDialog(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setParentId(null);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      level: goal.level,
    });
    setShowDialog(true);
  };

  const addGoalToTree = (goals: Goal[], parentId: string, newGoal: Goal): Goal[] => {
    return goals.map(g => {
      if (g.id === parentId) {
        return { ...g, subGoals: [...(g.subGoals || []), newGoal] };
      }
      if (g.subGoals) {
        return { ...g, subGoals: addGoalToTree(g.subGoals, parentId, newGoal) };
      }
      return g;
    });
  };

  const updateGoalInTree = (goals: Goal[], goalId: string, updates: Partial<Goal>): Goal[] => {
    return goals.map(g => {
      if (g.id === goalId) {
        return { ...g, ...updates };
      }
      if (g.subGoals) {
        return { ...g, subGoals: updateGoalInTree(g.subGoals, goalId, updates) };
      }
      return g;
    });
  };

  const deleteGoalFromTree = (goals: Goal[], goalId: string): Goal[] => {
    return goals
      .filter(g => g.id !== goalId)
      .map(g => ({
        ...g,
        subGoals: g.subGoals ? deleteGoalFromTree(g.subGoals, goalId) : undefined
      }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (editingGoal) {
      setGoals(updateGoalInTree(goals, editingGoal.id, formData));
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...formData,
        progress: 0,
      };
      
      if (parentId) {
        setGoals(addGoalToTree(goals, parentId, newGoal));
      } else {
        setGoals([...goals, newGoal]);
      }
    }
    
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    setGoals(deleteGoalFromTree(goals, id));
  };

  const totalGoals = countAllGoals(goals);
  const totalProgress = calculateTotalProgress(goals);
  const completedGoals = countCompletedGoals(goals);

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground">کل اهداف</p>
          <p className="text-3xl font-bold text-foreground mt-1">{persianNumbers(totalGoals)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground">میانگین پیشرفت</p>
          <p className="text-3xl font-bold text-primary mt-1">{persianNumbers(totalProgress)}%</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground">تکمیل شده</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {persianNumbers(completedGoals)}
          </p>
        </div>
        <GoalsPyramid goals={goals} />
      </div>

      <div className="space-y-4">
        {goals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddSubGoal={(id) => handleOpenCreate(id)}
          />
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? 'ویرایش هدف' : parentId ? 'افزودن هدف فرعی' : 'هدف جدید'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">عنوان</label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان هدف"
              />
            </div>
            <div>
              <label className="text-sm font-medium">توضیحات</label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="توضیحات هدف"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">دسته‌بندی</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">سطح</label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v as Goal['level'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(levelLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                <X className="w-4 h-4 ml-1" />
                انصراف
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 ml-1" />
                ذخیره
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;