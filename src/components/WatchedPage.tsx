
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useWatched } from '@/hooks/useWatched';
import { toast } from '@/hooks/use-toast';
import { WatchedStats } from './watched/WatchedStats';
import { WatchedControls } from './watched/WatchedControls';
import { WatchedCard } from './watched/WatchedCard';

export const WatchedPage: React.FC = () => {
  const { watched, removeFromWatched, clearAllWatched, getStats, getFilteredWatched, exportWatchedList } = useWatched();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const stats = getStats();

  const availableYears = useMemo(() => {
    const years = watched
      .map(item => item.year)
      .filter((year): year is number => year !== undefined)
      .filter((year, index, arr) => arr.indexOf(year) === index)
      .sort((a, b) => b - a);
    return years;
  }, [watched]);

  const handleRemoveWatched = (id: number, type: string, title: string) => {
    removeFromWatched(id, type);
    toast({
      title: "Removido da lista",
      description: `${title} foi removido da sua lista de assistidos.`,
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar toda a lista de assistidos? Esta ação não pode ser desfeita.')) {
      clearAllWatched();
      toast({
        title: "Lista limpa",
        description: "Todos os itens foram removidos da lista de assistidos.",
      });
    }
  };

  const handleExport = () => {
    try {
      exportWatchedList();
      toast({
        title: "Lista exportada",
        description: "Sua lista de assistidos foi exportada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar a lista.",
        variant: "destructive"
      });
    }
  };

  const sortWatched = (items: any[]) => {
    const filtered = getFilteredWatched(searchTerm, genreFilter, yearFilter);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime();
        case 'oldest':
          return new Date(a.watchedAt).getTime() - new Date(b.watchedAt).getTime();
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        default:
          return 0;
      }
    });
  };

  const sortedWatched = sortWatched(watched);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Filmes e Séries Assistidos</h2>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e mantenha um registro de tudo que você assistiu
        </p>
      </div>

      {/* Estatísticas */}
      <WatchedStats stats={stats} />

      {/* Controles */}
      <WatchedControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        availableYears={availableYears}
        onClearAll={handleClearAll}
        onExport={handleExport}
        hasWatched={watched.length > 0}
      />

      {/* Lista de assistidos */}
      {sortedWatched.length === 0 ? (
        <Card className="bg-gradient-cinema border-primary/20 text-center">
          <CardContent className="p-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              {searchTerm || genreFilter || yearFilter ? 'Nenhum resultado encontrado' : 'Nenhum filme assistido ainda'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || genreFilter || yearFilter ? 'Tente ajustar seus filtros de busca' : 'Comece a marcar filmes como assistidos para acompanhar seu progresso'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedWatched.map((item) => (
            <WatchedCard 
              key={`${item.type}-${item.id}`} 
              item={item} 
              onRemove={handleRemoveWatched}
            />
          ))}
        </div>
      )}
    </div>
  );
};
