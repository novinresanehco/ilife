import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2, Loader2 } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import moment from "moment-jalaali";

const eventColors: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/30',
  red: 'bg-destructive/10 text-destructive border-destructive/30',
  green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
};

const CalendarPage = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = getCurrentJalaliDate();
  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [currentYear, setCurrentYear] = useState(today.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day);
  const [view, setView] = useState('month');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '09:00',
    color: 'primary',
  });

  const { daysInMonth, firstDayOfWeek } = getJalaliMonthDays(currentYear, currentMonth);
  const startOffset = (firstDayOfWeek + 1) % 7;

  // Fetch events for current month
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar_events', user?.id, currentYear, currentMonth],
    queryFn: async () => {
      if (!user) return [];
      
      // Calculate gregorian date range for this jalali month
      const startMoment = moment(`${currentYear}/${currentMonth}/1`, 'jYYYY/jM/jD');
      const endMoment = moment(`${currentYear}/${currentMonth}/${daysInMonth}`, 'jYYYY/jM/jD').endOf('day');
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startMoment.toISOString())
        .lte('start_time', endMoment.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (input: { title: string; day: number; time: string; color: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const dateStr = `${currentYear}/${currentMonth}/${input.day}`;
      const startMoment = moment(`${dateStr} ${input.time}`, 'jYYYY/jM/jD HH:mm');
      const endMoment = startMoment.clone().add(1, 'hour');
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          user_id: user.id,
          title: input.title,
          start_time: startMoment.toISOString(),
          end_time: endMoment.toISOString(),
          color: input.color,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      toast({ title: 'رویداد ایجاد شد ✓' });
    },
    onError: (error) => {
      toast({ title: 'خطا', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('calendar_events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      toast({ title: 'رویداد حذف شد' });
    },
  });

  const goToPrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eventMoment = moment(e.start_time);
      return eventMoment.jDate() === day && eventMoment.jMonth() + 1 === currentMonth && eventMoment.jYear() === currentYear;
    });
  };

  const addEvent = () => {
    if (!newEvent.title.trim() || !selectedDay) return;
    createMutation.mutate({ ...newEvent, day: selectedDay }, {
      onSuccess: () => {
        setNewEvent({ title: '', time: '09:00', color: 'primary' });
        setIsAddingEvent(false);
      }
    });
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
                className={cn("text-xs px-1.5 py-0.5 rounded border truncate", eventColors[event.color ?? 'primary'])}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <span className="text-xs text-muted-foreground">+{persianNumbers(dayEvents.length - 2)}</span>
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
                    onValueChange={(v) => setNewEvent({ ...newEvent, color: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">قرمز (مهم)</SelectItem>
                      <SelectItem value="primary">آبی (کار)</SelectItem>
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
                <Button onClick={addEvent} disabled={!selectedDay || createMutation.isPending} className="flex-1">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'افزودن'}
                </Button>
                <Button variant="outline" onClick={() => setIsAddingEvent(false)}>انصراف</Button>
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
            {renderMonthView()}
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
                  <div key={event.id} className={cn("p-3 rounded-lg border", eventColors[event.color ?? 'primary'])}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {persianNumbers(moment(event.start_time).format('HH:mm'))}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => deleteMutation.mutate(event.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">رویدادی برای این روز ثبت نشده</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
