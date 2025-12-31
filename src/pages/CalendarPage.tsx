import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  getCurrentJalaliDate, 
  jalaliMonthNames, 
  jalaliWeekDaysFull,
  persianNumbers,
  getJalaliMonthDays 
} from "@/lib/jalali";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  title: string;
  day: number;
  time: string;
  endTime?: string;
  color: 'red' | 'blue' | 'green' | 'amber';
  importance: number;
  location?: string;
  attendees?: string[];
}

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'جلسه تیم', day: 5, time: '09:00', endTime: '10:30', color: 'blue', importance: 80, location: 'اتاق کنفرانس', attendees: ['علی', 'مریم'] },
  { id: '2', title: 'تحویل پروژه', day: 10, time: '14:00', color: 'red', importance: 95 },
  { id: '3', title: 'ورزش', day: 12, time: '07:00', endTime: '08:00', color: 'green', importance: 50 },
  { id: '4', title: 'جلسه آنلاین', day: 15, time: '11:00', endTime: '12:00', color: 'amber', importance: 75 },
  { id: '5', title: 'دیدار دوستانه', day: 20, time: '18:00', color: 'green', importance: 40 },
  { id: '6', title: 'ددلاین گزارش', day: 25, time: '23:59', color: 'red', importance: 100 },
  { id: '7', title: 'بررسی کد', day: 5, time: '14:00', endTime: '15:00', color: 'blue', importance: 70 },
  { id: '8', title: 'یوگا', day: 5, time: '17:00', endTime: '18:00', color: 'green', importance: 45 },
];

const eventColors = {
  red: 'bg-destructive/10 text-destructive border-destructive/30',
  blue: 'bg-primary/10 text-primary border-primary/30',
  green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
};

const eventColorsDot = {
  red: 'bg-destructive',
  blue: 'bg-primary',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
};

const timeSlots = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  label: `${String(i).padStart(2, '0')}:00`,
}));

const CalendarPage = () => {
  const today = getCurrentJalaliDate();
  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [currentYear, setCurrentYear] = useState(today.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day);
  const [view, setView] = useState('month');
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    time: string;
    color: 'red' | 'blue' | 'green' | 'amber';
    importance: number;
  }>({
    title: '',
    time: '09:00',
    color: 'blue',
    importance: 50,
  });

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

  const getEventsForDay = (day: number) => events.filter(e => e.day === day);

  const addEvent = () => {
    if (!newEvent.title.trim() || !selectedDay) return;
    
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      day: selectedDay,
      time: newEvent.time,
      color: newEvent.color,
      importance: newEvent.importance,
    };
    
    setEvents([...events, event]);
    setNewEvent({ title: '', time: '09:00', color: 'blue', importance: 50 });
    setIsAddingEvent(false);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const renderMonthView = () => {
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-background/50 rounded-lg" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.day && currentMonth === today.month && currentYear === today.year;
      const isSelected = day === selectedDay;
      const dayEvents = getEventsForDay(day);
      const hasHighPriority = dayEvents.some(e => e.importance >= 80);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDay(day)}
          className={cn(
            "h-28 rounded-lg p-2 cursor-pointer transition-all border",
            isToday ? "bg-primary/5 border-primary" : "bg-card border-border hover:border-primary/50",
            isSelected && !isToday && "ring-2 ring-primary ring-offset-2",
            hasHighPriority && "border-destructive/50"
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

  const renderWeekView = () => {
    const startDay = selectedDay ? Math.max(1, selectedDay - 3) : 1;
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = startDay + i;
      return day <= daysInMonth ? day : null;
    }).filter(Boolean) as number[];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isToday = day === today.day && currentMonth === today.month && currentYear === today.year;
            const isSelected = day === selectedDay;
            
            return (
              <div 
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "text-center p-3 rounded-lg cursor-pointer transition-all",
                  isToday ? "bg-primary text-primary-foreground" : 
                  isSelected ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                <span className="font-medium">{persianNumbers(day)}</span>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-7 gap-2 min-h-[400px]">
          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div key={day} className="bg-card rounded-lg border border-border p-2 space-y-2">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className={cn("p-2 rounded-lg border text-xs", eventColors[event.color])}
                  >
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-muted-foreground">{persianNumbers(event.time)}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    if (!selectedDay) return null;
    const dayEvents = getEventsForDay(selectedDay);

    return (
      <div className="space-y-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-lg font-semibold mb-4">
            {persianNumbers(selectedDay)} {jalaliMonthNames[currentMonth - 1]} {persianNumbers(currentYear)}
          </h3>
          
          <div className="space-y-2">
            {timeSlots.map(({ hour, label }) => {
              const slotEvents = dayEvents.filter(e => parseInt(e.time.split(':')[0]) === hour);
              
              return (
                <div 
                  key={hour}
                  className={cn(
                    "flex gap-4 py-2 border-t border-border first:border-0",
                    slotEvents.length > 0 && "bg-accent/30 rounded-lg px-2 -mx-2"
                  )}
                >
                  <div className="w-16 text-sm text-muted-foreground shrink-0">
                    {persianNumbers(label)}
                  </div>
                  <div className="flex-1 space-y-1">
                    {slotEvents.map(event => (
                      <div 
                        key={event.id}
                        className={cn("p-3 rounded-lg border", eventColors[event.color])}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {persianNumbers(event.time)}
                                {event.endTime && ` - ${persianNumbers(event.endTime)}`}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </span>
                              )}
                              {event.attendees && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {persianNumbers(event.attendees.length)} نفر
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => deleteEvent(event.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقویم</h1>
          <p className="text-muted-foreground mt-1">برنامه‌ریزی و مدیریت رویدادها</p>
        </div>
        <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              رویداد جدید
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>افزودن رویداد جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>عنوان رویداد</Label>
                <Input 
                  placeholder="عنوان رویداد..."
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ساعت</Label>
                  <Input 
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>رنگ</Label>
                  <Select 
                    value={newEvent.color} 
                    onValueChange={(v) => setNewEvent({ ...newEvent, color: v as CalendarEvent['color'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">قرمز (مهم)</SelectItem>
                      <SelectItem value="blue">آبی (کار)</SelectItem>
                      <SelectItem value="green">سبز (شخصی)</SelectItem>
                      <SelectItem value="amber">نارنجی (یادآوری)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                تاریخ: {selectedDay ? `${persianNumbers(selectedDay)} ${jalaliMonthNames[currentMonth - 1]}` : 'یک روز انتخاب کنید'}
              </p>
              <div className="flex gap-2 pt-4">
                <Button onClick={addEvent} disabled={!selectedDay} className="flex-1">
                  افزودن
                </Button>
                <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
                  انصراف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
            <TabsTrigger value="month">ماه</TabsTrigger>
            <TabsTrigger value="week">هفته</TabsTrigger>
            <TabsTrigger value="day">روز</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {view === 'month' && (
            <>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {jalaliWeekDaysFull.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderMonthView()}
              </div>
            </>
          )}
          
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
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
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {persianNumbers(event.time)}
                        </p>
                      </div>
                      {event.importance >= 80 && (
                        <Badge variant="destructive" className="text-xs">مهم</Badge>
                      )}
                    </div>
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
              {events
                .filter(e => e.day >= (today.day || 1))
                .sort((a, b) => a.day - b.day)
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium", eventColors[event.color])}>
                      {persianNumbers(event.day)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{persianNumbers(event.time)}</p>
                    </div>
                    <div className={cn("w-2 h-2 rounded-full", eventColorsDot[event.color])} />
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
