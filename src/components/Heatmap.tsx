import React from 'react';
import { format, subDays, startOfWeek, getDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapProps {
  data: { date: Date; count: number }[];
  days?: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data, days = 365 }) => {
  const today = new Date();
  const startDate = startOfWeek(subDays(today, days));

  // Generate array of days
  const calendarDays = Array.from({ length: days + today.getDay() + 1 }).map((_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  // Group by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  calendarDays.forEach((date) => {
    currentWeek.push(date);
    if (getDay(date) === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Helper to find count for a specific date
  const getCount = (date: Date) => {
    const item = data.find((d) => isSameDay(d.date, date));
    return item ? item.count : 0;
  };

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted/30';
    if (count === 1) return 'bg-primary/40';
    if (count <= 3) return 'bg-primary/70';
    return 'bg-primary';
  };

  return (
    <div className="flex flex-col gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="flex flex-col gap-1">
            {week.map((date, dayIndex) => {
              const count = getCount(date);
              const label = `${format(date, 'd MMM, yyyy', { locale: ptBR })}: ${count} título(s)`;

              return (
                <TooltipProvider key={`day-${weekIndex}-${dayIndex}`}>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-colors hover:ring-2 hover:ring-primary/50 cursor-pointer ${getColor(count)}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mt-2 min-w-max">
        <span>Menos</span>
        <div className="w-3 h-3 rounded-sm bg-muted/30"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/70"></div>
        <div className="w-3 h-3 rounded-sm bg-primary"></div>
        <span>Mais</span>
      </div>
    </div>
  );
};
