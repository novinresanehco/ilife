import { useState } from "react";
import { Plus, MoreHorizontal, Clock, AlertCircle, Target, GripVertical, CheckCircle, Circle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";
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

interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  importance: number;
  linkedGoals: string[];
  subtasks: Subtask[];
  guidanceNudge?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color: string;
}

const initialColumns: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'بک‌لاگ',
    color: 'border-muted',
    cards: [
      { 
        id: '1', 
        title: 'تحقیق بازار', 
        description: 'بررسی رقبا و تحلیل بازار هدف', 
        importance: 70, 
        linkedGoals: ['هدف فروش'],
        subtasks: [
          { id: 's1', title: 'شناسایی رقبا', done: false },
          { id: 's2', title: 'تحلیل SWOT', done: false },
        ],
        guidanceNudge: 'با توجه به علاقه شما به تحلیل، این کار مناسب صبح است'
      },
      { 
        id: '2', 
        title: 'طراحی لوگو', 
        description: 'طراحی لوگوی جدید برند با هویت مدرن', 
        importance: 60, 
        linkedGoals: [],
        subtasks: []
      },
    ]
  },
  {
    id: 'todo',
    title: 'در انتظار',
    color: 'border-amber-500',
    cards: [
      { 
        id: '3', 
        title: 'نوشتن مستندات', 
        description: 'مستندسازی API ها و راهنمای توسعه‌دهندگان', 
        importance: 80, 
        linkedGoals: ['راه‌اندازی محصول'],
        subtasks: [
          { id: 's3', title: 'مستند API', done: true },
          { id: 's4', title: 'راهنمای نصب', done: false },
          { id: 's5', title: 'نمونه کدها', done: false },
        ],
        guidanceNudge: 'تأخیر در این کار ۲ هدف را تحت تأثیر قرار می‌دهد'
      },
      { 
        id: '4', 
        title: 'تست عملکرد', 
        description: 'تست بار و کارایی سیستم تحت فشار', 
        importance: 85, 
        linkedGoals: ['راه‌اندازی محصول', 'بهینه‌سازی'],
        subtasks: [
          { id: 's6', title: 'تست Load', done: false },
          { id: 's7', title: 'تست Stress', done: false },
        ]
      },
    ]
  },
  {
    id: 'in_progress',
    title: 'در حال انجام',
    color: 'border-primary',
    cards: [
      { 
        id: '5', 
        title: 'توسعه داشبورد', 
        description: 'پیاده‌سازی داشبورد کاربری با نمودارها', 
        importance: 90, 
        linkedGoals: ['راه‌اندازی محصول'],
        subtasks: [
          { id: 's8', title: 'طراحی UI', done: true },
          { id: 's9', title: 'پیاده‌سازی نمودارها', done: true },
          { id: 's10', title: 'تست و دیباگ', done: false },
        ],
        guidanceNudge: 'عالی پیش می‌روید! ۶۶٪ پیشرفت داشته‌اید'
      },
    ]
  },
  {
    id: 'done',
    title: 'انجام شده',
    color: 'border-emerald-500',
    cards: [
      { 
        id: '6', 
        title: 'طراحی دیتابیس', 
        description: 'طراحی ساختار پایگاه داده و روابط', 
        importance: 95, 
        linkedGoals: ['راه‌اندازی محصول'],
        subtasks: [
          { id: 's11', title: 'مدل‌سازی', done: true },
          { id: 's12', title: 'ایندکس‌گذاری', done: true },
        ]
      },
      { 
        id: '7', 
        title: 'راه‌اندازی سرور', 
        description: 'کانفیگ سرور اصلی و تنظیمات امنیتی', 
        importance: 75, 
        linkedGoals: [],
        subtasks: []
      },
    ]
  },
];

const Kanban = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard; fromColumn: string } | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [isAddingCard, setIsAddingCard] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ title: '', description: '' });

  const handleDragStart = (e: React.DragEvent, card: KanbanCard, columnId: string) => {
    setDraggedCard({ card, fromColumn: columnId });
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

    setColumns(columns.map(column => {
      if (column.id === draggedCard.fromColumn) {
        return { ...column, cards: column.cards.filter(c => c.id !== draggedCard.card.id) };
      }
      if (column.id === targetColumnId) {
        return { ...column, cards: [...column.cards, draggedCard.card] };
      }
      return column;
    }));
    setDraggedCard(null);
  };

  const getSubtaskProgress = (card: KanbanCard) => {
    if (card.subtasks.length === 0) return 0;
    const completed = card.subtasks.filter(s => s.done).length;
    return Math.round((completed / card.subtasks.length) * 100);
  };

  const toggleSubtask = (cardId: string, subtaskId: string) => {
    setColumns(columns.map(column => ({
      ...column,
      cards: column.cards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            subtasks: card.subtasks.map(s => 
              s.id === subtaskId ? { ...s, done: !s.done } : s
            )
          };
        }
        return card;
      })
    })));
    
    if (selectedCard?.id === cardId) {
      setSelectedCard({
        ...selectedCard,
        subtasks: selectedCard.subtasks.map(s => 
          s.id === subtaskId ? { ...s, done: !s.done } : s
        )
      });
    }
  };

  const deleteCard = (columnId: string, cardId: string) => {
    setColumns(columns.map(column => {
      if (column.id === columnId) {
        return { ...column, cards: column.cards.filter(c => c.id !== cardId) };
      }
      return column;
    }));
  };

  const addCard = (columnId: string) => {
    if (!newCard.title.trim()) return;
    
    const card: KanbanCard = {
      id: Date.now().toString(),
      title: newCard.title,
      description: newCard.description,
      importance: 50,
      linkedGoals: [],
      subtasks: [],
    };
    
    setColumns(columns.map(column => {
      if (column.id === columnId) {
        return { ...column, cards: [...column.cards, card] };
      }
      return column;
    }));
    
    setNewCard({ title: '', description: '' });
    setIsAddingCard(null);
  };

  const totalCards = columns.reduce((acc, col) => acc + col.cards.length, 0);
  const doneCards = columns.find(c => c.id === 'done')?.cards.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">برد کانبان</h1>
          <p className="text-muted-foreground mt-1">مدیریت بصری پروژه‌ها با زیروظایف و راهنمایی</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            پیشرفت کلی: <span className="font-semibold text-foreground">{persianNumbers(totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
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
                <Badge variant="secondary">{persianNumbers(column.cards.length)}</Badge>
              </div>
            </div>
            
            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {column.cards.map((card) => {
                const progress = getSubtaskProgress(card);
                
                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, column.id)}
                    className="bg-background rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="font-medium text-sm">{card.title}</h4>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCard(card)}>
                            <Edit2 className="w-4 h-4 ml-2" />
                            جزئیات
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteCard(column.id, card.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{card.description}</p>
                    
                    {/* Subtask Progress */}
                    {card.subtasks.length > 0 && (
                      <div className="mb-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {persianNumbers(card.subtasks.filter(s => s.done).length)}/{persianNumbers(card.subtasks.length)} زیروظیفه
                          </span>
                          <span className="font-medium">{persianNumbers(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    )}
                    
                    {/* Subtasks Preview */}
                    {card.subtasks.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {card.subtasks.slice(0, 3).map((subtask) => (
                          <div 
                            key={subtask.id} 
                            className="flex items-center gap-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubtask(card.id, subtask.id);
                            }}
                          >
                            <Checkbox checked={subtask.done} className="h-3 w-3" />
                            <span className={cn(subtask.done && "line-through text-muted-foreground")}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                        {card.subtasks.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{persianNumbers(card.subtasks.length - 3)} مورد دیگر
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {card.importance >= 80 && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        <span className={cn(
                          "text-xs font-medium",
                          card.importance >= 80 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {persianNumbers(card.importance)}%
                        </span>
                      </div>
                      {card.linkedGoals.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Target className="w-3 h-3 ml-1" />
                          {persianNumbers(card.linkedGoals.length)}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Guidance Nudge */}
                    {card.guidanceNudge && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-primary/80 italic">
                          💡 {card.guidanceNudge}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Add Card Form */}
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
        ))}
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
                    selectedCard.importance >= 80 ? "border-destructive/50 text-destructive" :
                    selectedCard.importance >= 50 ? "border-amber-500/50 text-amber-600" :
                    "border-emerald-500/50 text-emerald-600"
                  )}
                >
                  اهمیت: {persianNumbers(selectedCard.importance)}%
                </Badge>
                {selectedCard.linkedGoals.length > 0 && (
                  <Badge variant="secondary">
                    <Target className="w-3 h-3 ml-1" />
                    {selectedCard.linkedGoals.join('، ')}
                  </Badge>
                )}
              </div>
              
              {selectedCard.subtasks.length > 0 && (
                <div className="space-y-3">
                  <Label>زیروظایف</Label>
                  <div className="space-y-2">
                    {selectedCard.subtasks.map((subtask) => (
                      <div 
                        key={subtask.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-accent/50 cursor-pointer hover:bg-accent"
                        onClick={() => toggleSubtask(selectedCard.id, subtask.id)}
                      >
                        <Checkbox checked={subtask.done} />
                        <span className={cn("text-sm", subtask.done && "line-through text-muted-foreground")}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Progress value={getSubtaskProgress(selectedCard)} className="h-2" />
                </div>
              )}
              
              {selectedCard.guidanceNudge && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-primary">💡 {selectedCard.guidanceNudge}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Kanban;
