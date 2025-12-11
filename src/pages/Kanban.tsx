import { useState } from "react";
import { Plus, MoreHorizontal, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { persianNumbers } from "@/lib/jalali";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  importance: number;
  linkedGoals: string[];
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
      { id: '1', title: 'تحقیق بازار', description: 'بررسی رقبا و تحلیل بازار', importance: 70, linkedGoals: ['هدف فروش'] },
      { id: '2', title: 'طراحی لوگو', description: 'طراحی لوگوی جدید برند', importance: 60, linkedGoals: [] },
    ]
  },
  {
    id: 'todo',
    title: 'در انتظار',
    color: 'border-amber-500',
    cards: [
      { id: '3', title: 'نوشتن مستندات', description: 'مستندسازی API ها', importance: 80, linkedGoals: ['راه‌اندازی محصول'] },
      { id: '4', title: 'تست عملکرد', description: 'تست بار و کارایی سیستم', importance: 85, linkedGoals: ['راه‌اندازی محصول', 'بهینه‌سازی'] },
    ]
  },
  {
    id: 'in_progress',
    title: 'در حال انجام',
    color: 'border-primary',
    cards: [
      { id: '5', title: 'توسعه داشبورد', description: 'پیاده‌سازی داشبورد کاربری', importance: 90, linkedGoals: ['راه‌اندازی محصول'] },
    ]
  },
  {
    id: 'done',
    title: 'انجام شده',
    color: 'border-emerald-500',
    cards: [
      { id: '6', title: 'طراحی دیتابیس', description: 'طراحی ساختار پایگاه داده', importance: 95, linkedGoals: ['راه‌اندازی محصول'] },
      { id: '7', title: 'راه‌اندازی سرور', description: 'کانفیگ سرور اصلی', importance: 75, linkedGoals: [] },
    ]
  },
];

const Kanban = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard; fromColumn: string } | null>(null);

  const handleDragStart = (card: KanbanCard, columnId: string) => {
    setDraggedCard({ card, fromColumn: columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">برد کانبان</h1>
          <p className="text-muted-foreground mt-1">مدیریت بصری پروژه‌ها و وظایف</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          کارت جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              "bg-card rounded-xl border-t-4 min-h-[500px]",
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
            <div className="p-3 space-y-3">
              {column.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card, column.id)}
                  className="bg-background rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{card.title}</h4>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{card.description}</p>
                  
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
                        {persianNumbers(card.linkedGoals.length)} هدف
                      </Badge>
                    )}
                  </div>
                  
                  {card.linkedGoals.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {card.linkedGoals.slice(0, 2).join('، ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <Plus className="w-4 h-4 ml-2" />
                افزودن کارت
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kanban;
