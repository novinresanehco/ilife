import { useState } from "react";
import { Plus, Search, Filter, CheckCircle, Circle, Clock, Trash2, ChevronDown, ChevronLeft, Edit2, X, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Subtask {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'descriptive';
  done?: boolean;
  options?: string[];
  selectedOption?: string;
  text?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  importance: number;
  category: string;
  linkedGoals: string[];
  subtasks: Subtask[];
  expanded?: boolean;
}

const initialTasks: Task[] = [
  { 
    id: '1', 
    title: 'تکمیل گزارش پروژه', 
    description: 'نوشتن گزارش نهایی پروژه و ارسال به مدیر', 
    status: 'in_progress', 
    importance: 85, 
    category: 'کار',
    linkedGoals: ['توسعه حرفه‌ای'],
    subtasks: [
      { id: 's1', title: 'جمع‌آوری داده‌ها', type: 'checkbox', done: true },
      { id: 's2', title: 'نوشتن مقدمه', type: 'checkbox', done: true },
      { id: 's3', title: 'تحلیل نتایج', type: 'checkbox', done: false },
      { id: 's4', title: 'فرمت گزارش', type: 'radio', options: ['PDF', 'Word', 'PowerPoint'], selectedOption: 'PDF' },
    ]
  },
  { 
    id: '2', 
    title: 'جلسه با تیم توسعه', 
    description: 'بررسی پیشرفت اسپرینت و برنامه‌ریزی', 
    status: 'done', 
    importance: 70, 
    category: 'کار',
    linkedGoals: ['توسعه حرفه‌ای'],
    subtasks: [
      { id: 's5', title: 'آماده‌سازی آجندا', type: 'checkbox', done: true },
      { id: 's6', title: 'یادداشت‌برداری', type: 'descriptive', text: 'نکات مهم جلسه: تمرکز بر بهبود عملکرد' },
    ]
  },
  { 
    id: '3', 
    title: 'بررسی ایمیل‌های مهم', 
    description: 'پاسخ به ایمیل‌های کاری و پیگیری‌ها', 
    status: 'todo', 
    importance: 60, 
    category: 'کار',
    linkedGoals: [],
    subtasks: []
  },
  { 
    id: '4', 
    title: 'طراحی رابط کاربری', 
    description: 'طراحی صفحات جدید اپلیکیشن موبایل با تمرکز بر UX', 
    status: 'in_progress', 
    importance: 90, 
    category: 'پروژه',
    linkedGoals: ['راه‌اندازی محصول', 'توسعه حرفه‌ای'],
    subtasks: [
      { id: 's7', title: 'طراحی صفحه اصلی', type: 'checkbox', done: true },
      { id: 's8', title: 'طراحی صفحه پروفایل', type: 'checkbox', done: false },
      { id: 's9', title: 'سبک طراحی', type: 'radio', options: ['مینیمال', 'رنگارنگ', 'حرفه‌ای'], selectedOption: 'مینیمال' },
      { id: 's10', title: 'یادداشت‌ها', type: 'descriptive', text: '' },
    ]
  },
  { 
    id: '5', 
    title: 'تمرین ورزشی صبح', 
    description: '۳۰ دقیقه پیاده‌روی و حرکات کششی', 
    status: 'done', 
    importance: 50, 
    category: 'سلامت',
    linkedGoals: ['سلامت و تناسب اندام'],
    subtasks: [
      { id: 's11', title: 'پیاده‌روی', type: 'checkbox', done: true },
      { id: 's12', title: 'کشش', type: 'checkbox', done: true },
    ]
  },
  { 
    id: '6', 
    title: 'خرید مواد غذایی', 
    description: 'خرید میوه و سبزیجات هفته', 
    status: 'todo', 
    importance: 40, 
    category: 'شخصی',
    linkedGoals: [],
    subtasks: []
  },
];

const statusConfig = {
  todo: { icon: Circle, label: 'در انتظار', color: 'text-muted-foreground bg-muted/50' },
  in_progress: { icon: Clock, label: 'در حال انجام', color: 'text-amber-600 bg-amber-50' },
  done: { icon: CheckCircle, label: 'انجام شده', color: 'text-emerald-600 bg-emerald-50' },
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    importance: 50,
    category: 'کار',
  });

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.includes(searchQuery) || task.description.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const toggleStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const toggleExpand = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, expanded: !task.expanded } : task
    ));
  };

  const updateSubtaskCheckbox = (taskId: string, subtaskId: string, done: boolean) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(s => s.id === subtaskId ? { ...s, done } : s)
        };
      }
      return task;
    }));
  };

  const updateSubtaskRadio = (taskId: string, subtaskId: string, option: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(s => s.id === subtaskId ? { ...s, selectedOption: option } : s)
        };
      }
      return task;
    }));
  };

  const updateSubtaskText = (taskId: string, subtaskId: string, text: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(s => s.id === subtaskId ? { ...s, text } : s)
        };
      }
      return task;
    }));
  };

  const getSubtaskProgress = (task: Task) => {
    if (task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(s => s.type === 'checkbox' && s.done).length;
    const checkboxCount = task.subtasks.filter(s => s.type === 'checkbox').length;
    return checkboxCount > 0 ? Math.round((completed / checkboxCount) * 100) : 0;
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      importance: newTask.importance,
      category: newTask.category,
      linkedGoals: [],
      subtasks: [],
    };
    
    setTasks([task, ...tasks]);
    setNewTask({ title: '', description: '', importance: 50, category: 'کار' });
    setIsAddingTask(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">وظایف</h1>
          <p className="text-muted-foreground mt-1">مدیریت و پیگیری وظایف روزانه با زیروظایف</p>
        </div>
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              وظیفه جدید
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>افزودن وظیفه جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>عنوان</Label>
                <Input 
                  placeholder="عنوان وظیفه..." 
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <Label>توضیحات</Label>
                <Textarea 
                  placeholder="توضیحات وظیفه..." 
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>دسته‌بندی</Label>
                  <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="کار">کار</SelectItem>
                      <SelectItem value="پروژه">پروژه</SelectItem>
                      <SelectItem value="سلامت">سلامت</SelectItem>
                      <SelectItem value="شخصی">شخصی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>اهمیت: {persianNumbers(newTask.importance)}%</Label>
                  <Input 
                    type="range" 
                    min={0} 
                    max={100} 
                    value={newTask.importance}
                    onChange={(e) => setNewTask({ ...newTask, importance: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={addTask} className="flex-1">افزودن</Button>
                <Button variant="outline" onClick={() => setIsAddingTask(false)}>انصراف</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="جستجو در وظایف..." 
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder="فیلتر وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وظایف</SelectItem>
            <SelectItem value="todo">در انتظار</SelectItem>
            <SelectItem value="in_progress">در حال انجام</SelectItem>
            <SelectItem value="done">انجام شده</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">در انتظار</p>
          <p className="text-2xl font-bold text-foreground">{persianNumbers(tasks.filter(t => t.status === 'todo').length)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">در حال انجام</p>
          <p className="text-2xl font-bold text-amber-600">{persianNumbers(tasks.filter(t => t.status === 'in_progress').length)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">انجام شده</p>
          <p className="text-2xl font-bold text-emerald-600">{persianNumbers(tasks.filter(t => t.status === 'done').length)}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTasks.map((task) => {
          const StatusIcon = statusConfig[task.status].icon;
          const progress = getSubtaskProgress(task);
          
          return (
            <div 
              key={task.id}
              className="bg-card rounded-xl border border-border hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => toggleStatus(task.id)}
                    className="mt-1 transition-transform hover:scale-110"
                  >
                    <StatusIcon className={cn("w-6 h-6", statusConfig[task.status].color.split(' ')[0])} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {task.subtasks.length > 0 && (
                            <button 
                              onClick={() => toggleExpand(task.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {task.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                            </button>
                          )}
                          <h3 className={cn(
                            "font-semibold text-lg",
                            task.status === 'done' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={statusConfig[task.status].color}>
                          {statusConfig[task.status].label}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={cn(
                            task.importance >= 80 ? "border-destructive/50 text-destructive" :
                            task.importance >= 50 ? "border-amber-500/50 text-amber-600" :
                            "border-emerald-500/50 text-emerald-600"
                          )}
                        >
                          {persianNumbers(task.importance)}%
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Subtask Progress */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">پیشرفت زیروظایف</span>
                          <span className="font-medium">{persianNumbers(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="secondary">{task.category}</Badge>
                      {task.linkedGoals.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="w-3 h-3" />
                          {task.linkedGoals.slice(0, 2).join('، ')}
                        </div>
                      )}
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors mr-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subtasks Section */}
              {task.expanded && task.subtasks.length > 0 && (
                <div className="border-t border-border bg-accent/30 p-5 space-y-4 animate-in slide-in-from-top-2">
                  <h4 className="font-medium text-sm text-muted-foreground">زیروظایف</h4>
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="bg-card rounded-lg p-3 border border-border">
                      {subtask.type === 'checkbox' && (
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={subtask.done}
                            onCheckedChange={(checked) => updateSubtaskCheckbox(task.id, subtask.id, checked as boolean)}
                          />
                          <span className={cn("text-sm", subtask.done && "line-through text-muted-foreground")}>
                            {subtask.title}
                          </span>
                        </div>
                      )}
                      
                      {subtask.type === 'radio' && (
                        <div className="space-y-2">
                          <Label className="text-sm">{subtask.title}</Label>
                          <RadioGroup 
                            value={subtask.selectedOption}
                            onValueChange={(v) => updateSubtaskRadio(task.id, subtask.id, v)}
                            className="flex flex-wrap gap-4"
                          >
                            {subtask.options?.map((option) => (
                              <div key={option} className="flex items-center gap-2">
                                <RadioGroupItem value={option} id={`${subtask.id}-${option}`} />
                                <Label htmlFor={`${subtask.id}-${option}`} className="text-sm">{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}
                      
                      {subtask.type === 'descriptive' && (
                        <div className="space-y-2">
                          <Label className="text-sm">{subtask.title}</Label>
                          <Textarea 
                            value={subtask.text || ''}
                            onChange={(e) => updateSubtaskText(task.id, subtask.id, e.target.value)}
                            placeholder="یادداشت خود را بنویسید..."
                            className="min-h-[80px]"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;
