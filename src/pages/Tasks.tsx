import { useState } from "react";
import { Plus, Search, Filter, CheckCircle, Circle, Clock, Trash2, ChevronDown, ChevronLeft, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";
import { useTasks, type Task as DbTask, type CreateTaskInput } from "@/hooks/useTasks";
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

const statusConfig = {
  todo: { icon: Circle, label: 'در انتظار', color: 'text-muted-foreground bg-muted/50' },
  in_progress: { icon: Clock, label: 'در حال انجام', color: 'text-amber-600 bg-amber-50' },
  done: { icon: CheckCircle, label: 'انجام شده', color: 'text-emerald-600 bg-emerald-50' },
  deferred: { icon: Clock, label: 'تعویق', color: 'text-orange-600 bg-orange-50' },
  cancelled: { icon: Circle, label: 'لغو شده', color: 'text-destructive bg-destructive/10' },
};

const Tasks = () => {
  const { tasks, isLoading, createTask, updateTask, deleteTask, isCreating } = useTasks();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 50,
    tags: [] as string[],
  });

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.includes(searchQuery) || (task.description?.includes(searchQuery) ?? false);
    return matchesFilter && matchesSearch;
  });

  const toggleStatus = (task: DbTask) => {
    const nextStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
    updateTask({ id: task.id, status: nextStatus as any });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const input: CreateTaskInput = {
      title: newTask.title,
      description: newTask.description || undefined,
      priority: newTask.priority,
      tags: newTask.tags.length > 0 ? newTask.tags : undefined,
    };
    
    createTask(input, {
      onSuccess: () => {
        setNewTask({ title: '', description: '', priority: 50, tags: [] });
        setIsAddingTask(false);
      }
    });
  };

  const getStatusIcon = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.icon ?? Circle;
  };

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color ?? 'text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label ?? status;
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
          <h1 className="text-3xl font-bold">وظایف</h1>
          <p className="text-muted-foreground mt-1">مدیریت و پیگیری وظایف روزانه</p>
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
              <div>
                <Label>اولویت: {persianNumbers(newTask.priority)}%</Label>
                <Input 
                  type="range" 
                  min={0} 
                  max={100} 
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={addTask} className="flex-1" disabled={isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'افزودن'}
                </Button>
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

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>هنوز وظیفه‌ای ثبت نشده است</p>
          <p className="text-sm mt-1">اولین وظیفه خود را ایجاد کنید</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status ?? 'todo');
            
            return (
              <div 
                key={task.id}
                className="bg-card rounded-xl border border-border hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleStatus(task)}
                      className="mt-1 transition-transform hover:scale-110"
                    >
                      <StatusIcon className={cn("w-6 h-6", getStatusColor(task.status ?? 'todo').split(' ')[0])} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-semibold text-lg",
                            task.status === 'done' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={getStatusColor(task.status ?? 'todo')}>
                            {getStatusLabel(task.status ?? 'todo')}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={cn(
                              (task.importance ?? 50) >= 80 ? "border-destructive/50 text-destructive" :
                              (task.importance ?? 50) >= 50 ? "border-amber-500/50 text-amber-600" :
                              "border-emerald-500/50 text-emerald-600"
                            )}
                          >
                            {persianNumbers(task.importance ?? 50)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">سررسید: {task.due_date}</span>
                        )}
                        {task.defer_count && task.defer_count > 0 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            {persianNumbers(task.defer_count)} بار تعویق
                          </Badge>
                        )}
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors mr-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;
