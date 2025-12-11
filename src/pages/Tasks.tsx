import { useState } from "react";
import { Plus, Search, Filter, CheckCircle, Circle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  importance: number;
  category: string;
}

const initialTasks: Task[] = [
  { id: '1', title: 'تکمیل گزارش پروژه', description: 'نوشتن گزارش نهایی پروژه و ارسال به مدیر', status: 'in_progress', importance: 85, category: 'کار' },
  { id: '2', title: 'جلسه با تیم توسعه', description: 'بررسی پیشرفت اسپرینت و برنامه‌ریزی', status: 'done', importance: 70, category: 'کار' },
  { id: '3', title: 'بررسی ایمیل‌های مهم', description: 'پاسخ به ایمیل‌های کاری و پیگیری‌ها', status: 'todo', importance: 60, category: 'کار' },
  { id: '4', title: 'طراحی رابط کاربری', description: 'طراحی صفحات جدید اپلیکیشن', status: 'in_progress', importance: 90, category: 'پروژه' },
  { id: '5', title: 'تمرین ورزشی صبح', description: '۳۰ دقیقه پیاده‌روی و حرکات کششی', status: 'done', importance: 50, category: 'سلامت' },
  { id: '6', title: 'خرید مواد غذایی', description: 'خرید میوه و سبزیجات هفته', status: 'todo', importance: 40, category: 'شخصی' },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">وظایف</h1>
          <p className="text-muted-foreground mt-1">مدیریت و پیگیری وظایف روزانه</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          وظیفه جدید
        </Button>
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

      <div className="grid gap-4">
        {filteredTasks.map((task) => {
          const StatusIcon = statusConfig[task.status].icon;
          return (
            <div 
              key={task.id}
              className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => toggleStatus(task.id)}
                  className="mt-1 transition-transform hover:scale-110"
                >
                  <StatusIcon className={cn("w-6 h-6", statusConfig[task.status].color.split(' ')[0])} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={cn(
                        "font-semibold text-lg",
                        task.status === 'done' && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
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
                        اهمیت: {persianNumbers(task.importance)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="secondary">{task.category}</Badge>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;
