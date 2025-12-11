import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  getCurrentJalaliDate, 
  jalaliMonthNames, 
  jalaliWeekDays, 
  persianNumbers,
  getJalaliMonthDays
} from "@/lib/jalali";

export const MiniCalendar = () => {
  const today = getCurrentJalaliDate();
  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [currentYear, setCurrentYear] = useState(today.year);

  const { daysInMonth, firstDayOfWeek } = getJalaliMonthDays(currentYear, currentMonth);
  
  // Adjust for Saturday start (Persian calendar)
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

  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} className="h-8" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today.day && currentMonth === today.month && currentYear === today.year;
    days.push(
      <div
        key={day}
        className={cn(
          "h-8 w-8 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors",
          isToday 
            ? "bg-primary text-primary-foreground font-bold" 
            : "hover:bg-accent text-foreground"
        )}
      >
        {persianNumbers(day)}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">تقویم</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            {jalaliMonthNames[currentMonth - 1]} {persianNumbers(currentYear)}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {jalaliWeekDays.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs text-muted-foreground font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};
