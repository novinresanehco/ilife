import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  getCurrentJalaliDate, 
  jalaliMonthNames, 
  jalaliWeekDaysFull,
  jalaliWeekDays,
  persianNumbers,
  getJalaliMonthDays 
} from "@/lib/jalali";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarEvent {
  id: string;
  title: string;
  day: number;
  time: string;
  color: 'red' | 'blue' | 'green' | 'amber';
}

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'جلسه تیم', day: 5, time: '09:00', color: 'blue' },
  { id: '2', title: 'تحویل پروژه', day: 10, time: '14:00', color: 'red' },
  { id: '3', title: 'ورزش', day: 12, time: '07:00', color: 'green' },
  { id: '4', title: 'جلسه آنلاین', day: 15, time: '11:00', color: 'amber' },
  { id: '5', title: 'دیدار دوستانه', day: 20, time: '18:00', color: 'green' },
  { id: '6', title: 'ددلاین گزارش', day: 25, time: '23:59', color: 'red' },
];

const eventColors = {
  red: 'bg-destructive/10 text-destructive border-destructive/30',
  blue: 'bg-primary/10 text-primary border-primary/30',
  green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
};

const CalendarPage = () => {
  const today = getCurrentJalaliDate();
  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [currentYear, setCurrentYear] = useState(today.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day);
  const [view, setView] = useState('month');

  const { daysInMonth, firstDayOfWeek } = getJalaliMonthDays(currentYear, currentMonth);
  const startOffset = (firstDayOfWeek + 1) % 7;

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getEventsForDay = (day: number) => mockEvents.filter(e => e.day === day);

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-background/50 rounded-lg" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.day && currentMonth === today.month && currentYear === today.year;
      const isSelected = day === selectedDay;
      const dayEvents = getEventsForDay(day);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDay(day)}
          className={cn(
            "h-28 rounded-lg p-2 cursor-pointer transition-all border",
            isToday ? "bg-primary/5 border-primary" : "bg-card border-border hover:border-primary/50",
            isSelected && !isToday && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1",
            isToday && "bg-primary text-primary-foreground"
          )}>
            {persianNumbers(day)}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map(event => (
              <div 
                key={event.id} 
                className={cn("text-xs px-1.5 py-0.5 rounded border truncate", eventColors[event.color])}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <span className="text-xs text-muted-foreground">+{persianNumbers(dayEvents.length - 2)} بیشتر</span>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقویم</h1>
          <p className="text-muted-foreground mt-1">برنامه‌ریزی و مدیریت رویدادها</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          رویداد جدید
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[160px] text-center">
            {jalaliMonthNames[currentMonth - 1]} {persianNumbers(currentYear)}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="year">سال</TabsTrigger>
            <TabsTrigger value="month">ماه</TabsTrigger>
            <TabsTrigger value="week">هفته</TabsTrigger>
            <TabsTrigger value="day">روز</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {jalaliWeekDaysFull.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-3">
              {selectedDay ? `رویدادهای ${persianNumbers(selectedDay)} ${jalaliMonthNames[currentMonth - 1]}` : 'انتخاب روز'}
            </h3>
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDayEvents.map(event => (
                  <div key={event.id} className={cn("p-3 rounded-lg border", eventColors[event.color])}>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {persianNumbers(event.time)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">رویدادی برای این روز ثبت نشده</p>
            )}
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-3">رویدادهای پیش‌رو</h3>
            <div className="space-y-2">
              {mockEvents.slice(0, 4).map(event => (
                <div key={event.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <Badge variant="outline" className={cn("w-10 h-10 rounded-lg flex items-center justify-center", eventColors[event.color])}>
                    {persianNumbers(event.day)}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{persianNumbers(event.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
