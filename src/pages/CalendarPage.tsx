import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { getReleasedContent, TMDBContent } from '@/utils/tmdb';
import { CalendarItem } from '@/components/calendar/CalendarItem';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { useWatchProviders } from '@/hooks/useWatchProviders';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<{[key: string]: TMDBContent[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [selectedProvider, setSelectedProvider] = useState('0');
  const [selectedType, setSelectedType] = useState('all');
  
  const { availableStreamings, loadingProviders } = useWatchProviders();

  const getMonthName = (date: Date) => {
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const fetchContent = async () => {
    setIsLoading(true);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Prepare filters
    let watchProviders = undefined;
    if (selectedProvider !== '0') {
      if (selectedProvider === 'my-streamings') {
         const savedStreamings = localStorage.getItem('my_streamings');
         if (savedStreamings) {
           try {
             const list = JSON.parse(savedStreamings);
             if (list.length > 0) watchProviders = list.join('|');
           } catch (e) {
             console.error('Error parsing my_streamings', e);
           }
         }
      } else {
        watchProviders = selectedProvider;
      }
    }

    const content = await getReleasedContent(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0],
      {
        watchProviders,
        type: selectedType as 'all' | 'movie' | 'tv'
      }
    );

    const data: {[key: string]: TMDBContent[]} = {};
    content.forEach(item => {
        const date = item.release_date || item.first_air_date;
        if (date) {
            // Ensure we key by local YYYY-MM-DD
            if (!data[date]) data[date] = [];
            data[date].push(item);
        }
    });

    setCalendarData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [currentDate, selectedProvider, selectedType]);

  const getContentByDay = (day: number) => {
    // Construct keys that match the YYYY-MM-DD format from API
    // Need to be careful with padding
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return calendarData[dateKey] || [];
  };

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-black/20 border border-white/5 p-2" />);
    }

    // Days of month
    for (let day = 1; day <= totalDays; day++) {
        const dayContent = getContentByDay(day);
        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        
        days.push(
            <div key={day} className={`min-h-[120px] bg-black/20 border border-white/5 p-2 relative group hover:bg-white/5 transition-colors ${isToday ? 'ring-1 ring-primary/50 bg-primary/5' : ''}`}>
                <span className={`absolute top-2 right-2 text-sm font-medium ${isToday ? 'text-primary bg-primary/10 px-2 py-0.5 rounded-full' : 'text-gray-400'}`}>
                    {day}
                </span>
                
                <div className="mt-8 space-y-1">
                    {dayContent.map(item => (
                        <CalendarItem key={item.id} item={item} />
                    ))}

                </div>
            </div>
        );
    }
    
    return days;
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-cinema-dark text-white font-sans selection:bg-primary/30">
        <Header activeTab="calendar" />
        
        <main className="pt-24 pb-12 px-4 container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-primary" />
                        Calendário de Lançamentos
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Confira as estreias de filmes e séries deste mês
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 rounded-full p-1 border border-white/10">
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="rounded-full hover:bg-white/10">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="min-w-[150px] text-center font-medium capitalize">
                        {getMonthName(currentDate)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="rounded-full hover:bg-white/10">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <CalendarFilters
              providers={availableStreamings}
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              loadingProviders={loadingProviders}
            />

            {isLoading ? (
                <div className="h-[600px] flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                    {/* Header Dias da Semana */}
                    <div className="grid grid-cols-7 border-b border-white/10 bg-black/40">
                        {weekDays.map(day => (
                            <div key={day} className="p-3 text-center text-sm font-medium text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    {/* Grid do Calendário */}
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {renderCalendarDays()}
                    </div>
                </div>
            )}
        </main>
    </div>
  );
};

export default CalendarPage;
