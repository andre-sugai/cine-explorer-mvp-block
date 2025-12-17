import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from 'lucide-react';
import { getReleasedContent, TMDBContent } from '@/utils/tmdb';
import { Link } from 'react-router-dom';
import { buildImageUrl } from '@/utils/tmdb';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [content, setContent] = useState<TMDBContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper para obter nome do mês
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

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // 1-12
        
        // Formatar datas para a API (YYYY-MM-DD)
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const lastDay = daysInMonth(currentDate);
        const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
        
        console.log(`Fetching calendar data: ${startDate} to ${endDate}`);
        const results = await getReleasedContent(startDate, endDate);
        setContent(results);
      } catch (error) {
        console.error('Error fetching calendar content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [currentDate]);

  // Agrupar conteúdo por dia
  const getContentByDay = (day: number) => {
    return content.filter(item => {
      const dateStr = item.release_date || item.first_air_date;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      // Ajuste de fuso horário simples (considerando apenas o dia UTC/Local)
      // A API retorna YYYY-MM-DD, new Date() assume UTC as 00:00 se não der horas
      // Vamos comparar apenas os componentes de dia
      return date.getDate() + 1 === day; // Bug comum de timezone JS, YYYY-MM-DD interpreta como UTC-0, brasil é -3, então dia anterior
      // Correção robusta:
      const parts = dateStr.split('-');
      return parseInt(parts[2]) === day;
    });
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
                        <Link 
                            key={item.id} 
                            to={`/${item.media_type === 'tv' ? 'serie' : 'filme'}/${item.id}`}
                            className="block"
                        >
                            <div className="flex items-center gap-2 p-1 rounded hover:bg-white/10 transition-colors tooltip-trigger" title={item.title || item.name}>
                                <div className="w-8 h-10 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                                     <img 
                                        src={buildImageUrl(item.poster_path, 'w92')} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                     />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-200 truncate">{item.title || item.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">{item.media_type === 'tv' ? 'Série' : 'Filme'}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {dayContent.length > 3 && (
                        <div className="text-[10px] text-center text-gray-500 pt-1">
                            + {dayContent.length - 3} outros
                        </div>
                    )}
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
                        <CalendarDays className="w-8 h-8 text-primary" />
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

            {loading ? (
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
