import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trash2 } from 'lucide-react';
import { useWatchedContext } from '@/context/WatchedContext';
import { useStreamingProviders } from '@/hooks/useStreamingProviders';
import { StreamingFilter } from '@/components/StreamingFilter';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PersonalListCard } from '@/components/personal/PersonalListCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PersonalListFiltersTabsWithStreaming } from '@/components/personal/PersonalListFiltersTabsWithStreaming';

export const WatchedPage: React.FC = () => {
  const { watched, removeFromWatched, clearAllWatched, cleanInvalidWatched } =
    useWatchedContext();
  const navigate = useNavigate();
  
  const [streamingFilter, setStreamingFilter] = useState<number | null>(null);
  
  // Hook para gerenciar dados de streaming
  const { 
    isLoading: isLoadingStreaming, 
    getStreamingStats,
    filterByProvider 
  } = useStreamingProviders(watched);

  // Limpeza automática ao carregar a página
  useEffect(() => {
    cleanInvalidWatched();
  }, []);

  // Funções auxiliares para separar por tipo
  const getItemsByType = (type: 'movie' | 'tv') =>
    watched.filter((item) => item.type === type);
  const stats = {
    total: watched.length,
    movies: watched.filter((item) => item.type === 'movie').length,
    series: watched.filter((item) => item.type === 'tv').length,
  };

  const handleRemove = (id: number, type: string, title: string) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover "${title}" da sua lista de assistidos?`
      )
    ) {
      removeFromWatched(id, type);
      toast({
        title: 'Removido da lista',
        description: `${title} foi removido da sua lista de assistidos.`,
      });
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Tem certeza que deseja limpar toda a lista de assistidos? Esta ação não pode ser desfeita.'
      )
    ) {
      clearAllWatched();
      toast({
        title: 'Lista limpa',
        description: 'Todos os itens foram removidos da lista de assistidos.',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">
          Meus Filmes e Séries Assistidos
        </h2>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e mantenha um registro de tudo que você
          assistiu
        </p>
      </div>

      <PersonalListFiltersTabsWithStreaming
        items={watched}
        getItemsByType={getItemsByType}
        stats={stats}
        onRemove={handleRemove}
        streamingFilter={streamingFilter}
        onStreamingFilterChange={setStreamingFilter}
        streamingStats={getStreamingStats()}
        isLoadingStreaming={isLoadingStreaming}
        filteredItems={filterByProvider(streamingFilter)}
        renderCard={(item) => (
          <PersonalListCard
            key={`${item.type}-${item.id}`}
            item={item}
            onDetailsClick={() =>
              navigate(
                item.type === 'movie'
                  ? `/filme/${item.id}`
                  : `/serie/${item.id}`
              )
            }
            showDate={true}
            dateLabel="Assistido em"
            actions={[
              {
                label: 'Remover',
                onClick: () => handleRemove(item.id, item.type, item.title),
                variant: 'destructive',
              },
            ]}
          />
        )}
        contextLabel="Vistos"
      />
    </div>
  );
};
