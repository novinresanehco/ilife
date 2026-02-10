import { useState } from "react";
import { Plus, MoreHorizontal, AlertCircle, Target, GripVertical, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";
import { useTasks, type Task as DbTask, type CreateTaskInput } from "@/hooks/useTasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns = [
  { id: 'backlog', title: 'بک‌لاگ', color: 'border-muted' },
  { id: 'todo', title: 'در انتظار', color: 'border-amber-500' },
  { id: 'in_progress', title: 'در حال انجام', color: 'border-primary' },
  { id: 'done', title: 'انجام شده', color: 'border-emerald-500' },
];

const Kanban = () => {
  const { tasks, isLoading, createTask, updateTask, deleteTask, getTasksByColumn } = useTasks();
  const [draggedCard, setDraggedCard] = useState<{ task: DbTask; fromColumn: string } | null>(null);
  const [selectedCard, setSelectedCard] = useState<DbTask | null>(null);
  const [isAddingCard, setIsAddingCard] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ title: '', description: '' });

  const handleDragStart = (e: React.DragEvent, task: DbTask, columnId: string) => {
    setDraggedCard({ task, fromColumn: columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedCard || draggedCard.fromColumn === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    // Map column to status
    const statusMap: Record<string, string> = {
      backlog: 'todo',
      todo: 'todo',
      in_progress: 'in_progress',
      done: 'done',
    };

    updateTask({ 
      id: draggedCard.task.id, 
      kanban_column: targetColumnId,
      status: statusMap[targetColumnId] as any,
    });
    setDraggedCard(null);
  };

  const addCard = (columnId: string) => {
    if (!newCard.title.trim()) return;
    
    const input: CreateTaskInput = {
      title: newCard.title,
      description: newCard.description || undefined,
      kanban_column: columnId,
    };
    
    createTask(input, {
      onSuccess: () => {
        setNewCard({ title: '', description: '' });
        setIsAddingCard(null);
      }
    });
  };

  const totalCards = tasks.length;
  const doneCards = tasks.filter(t => t.kanban_column === 'done' || t.status === 'done').length;

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
          <h1 className="text-3xl font-bold">برد کانبان</h1>
          <p className="text-muted-foreground mt-1">مدیریت بصری وظایف</p>
        </div>
        <div className="text-sm text-muted-foreground">
          پیشرفت کلی: <span className="font-semibold text-foreground">
            {persianNumbers(totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = getTasksByColumn(column.id);
          
          return (
            <div
              key={column.id}
              className={cn(
                "bg-card rounded-xl border-t-4 min-h-[500px] flex flex-col",
                column.color
              )}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="secondary">{persianNumbers(columnTasks.length)}</Badge>
                </div>
              </div>
              
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="bg-background rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="font-medium text-sm">{task.title}</h4>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCard(task)}>
                            <Edit2 className="w-4 h-4 ml-2" />
                            جزئیات
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteTask(task.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {(task.importance ?? 50) >= 80 && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        <span className={cn(
                          "text-xs font-medium",
                          (task.importance ?? 50) >= 80 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {persianNumbers(task.importance ?? 50)}%
                        </span>
                      </div>
                      {task.goal_id && (
                        <Badge variant="outline" className="text-xs">
                          <Target className="w-3 h-3 ml-1" />
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {isAddingCard === column.id ? (
                  <div className="bg-background rounded-lg p-3 border border-primary space-y-2">
                    <Input 
                      placeholder="عنوان کارت..."
                      value={newCard.title}
                      onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                      autoFocus
                    />
                    <Textarea 
                      placeholder="توضیحات..."
                      value={newCard.description}
                      onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => addCard(column.id)}>افزودن</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsAddingCard(null)}>انصراف</Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => setIsAddingCard(column.id)}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن کارت
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Detail Dialog */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCard?.title}</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">{selectedCard.description}</p>
              <div className="flex items-center gap-4">
                <Badge 
                  variant="outline"
                  className={cn(
                    (selectedCard.importance ?? 50) >= 80 ? "border-destructive/50 text-destructive" :
                    (selectedCard.importance ?? 50) >= 50 ? "border-amber-500/50 text-amber-600" :
                    "border-emerald-500/50 text-emerald-600"
                  )}
                >
                  اهمیت: {persianNumbers(selectedCard.importance ?? 50)}%
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Kanban;
