import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, MonitorPlay, Trash2 } from 'lucide-react';
import { useWatchProviders } from '@/hooks/useWatchProviders';
import { useWantToWatchFilters } from '@/hooks/useWantToWatchFilters';
import { useWantToWatchScrollManager } from '@/hooks/useWantToWatchScrollManager';

interface WantToWatchFiltersTabsProps {
  items: any[];
  getItemsByType: (type: 'movie' | 'tv') => any[];
  stats: { total: number; movies: number; series: number };
  onRemove: (id: number, type: string, title: string) => void;
  onClearAll?: () => void;
  renderCard: (item: any) => React.ReactNode;
  contextLabel: string;
  enableStreamingFilter?: boolean;
}

export const WantToWatchFiltersTabs: React.FC<WantToWatchFiltersTabsProps> = ({
  items,
  getItemsByType,
  stats,
  onRemove,
  onClearAll,
  renderCard,
  contextLabel,
  enableStreamingFilter = false,
}) => {
  // Usar hook de persistência de filtros
  const {
    searchTerm,
    activeTab,
    orderBy,
    orderDirection,
    selectedStreaming,
    selectedRating,
    setSearchTerm,
    setActiveTab,
    setOrderBy,
    setOrderDirection,
    setSelectedStreaming,
    setSelectedRating,
    saveScrollPosition,
    isRestored,
  } = useWantToWatchFilters();

  // Hook para gerenciar posição do scroll
  useWantToWatchScrollManager({
    saveScrollPosition,
    isRestored,
  });

  const [streamingFilteredItems, setStreamingFilteredItems] = useState(items);

  const {
    availableStreamings,
    loadingProviders,
    loadingFilter,
    filterItemsByStreaming,
  } = useWatchProviders();

  // Atualizar items quando a lista base mudar
  useEffect(() => {
    setStreamingFilteredItems(items);
  }, [items]);

  // Aplicar filtro de streaming quando selecionado
  useEffect(() => {
    if (enableStreamingFilter && selectedStreaming !== '0' && isRestored) {
      handleStreamingFilter(selectedStreaming);
    } else if (selectedStreaming === '0') {
      setStreamingFilteredItems(items);
    }
  }, [
    selectedStreaming,
    items,
    enableStreamingFilter,
    filterItemsByStreaming,
    isRestored,
  ]);

  const handleStreamingFilter = async (streamingId: string) => {
    if (!enableStreamingFilter || streamingId === '0') {
      setStreamingFilteredItems(items);
      return;
    }

    const filtered = await filterItemsByStreaming(items, streamingId);
    setStreamingFilteredItems(filtered);
  };

  const filterItems = (list: any[]) =>
    list.filter((item) => {
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const rating = item.vote_average || item.rating || 0;
      const matchesRating = !selectedRating || rating >= Number(selectedRating);
      
      return matchesSearch && matchesRating;
    });

  const sortItems = (list: any[]) => {
    if (orderBy === 'date') {
      return [...list].sort((a, b) => {
        const dateA = new Date(
          a.addedAt || a.added_date || a.watchedAt
        ).getTime();
        const dateB = new Date(
          b.addedAt || b.added_date || b.watchedAt
        ).getTime();
        return orderDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (orderBy === 'rating') {
      return [...list].sort((a, b) => {
        const ratingA = a.vote_average || a.rating || 0;
        const ratingB = b.vote_average || b.rating || 0;
        return orderDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    }
    return list;
  };

  const renderList = (list: any[]) => {
    // Usar items filtrados por streaming primeiro, depois filtrar por tipo de tab
    const baseList = streamingFilteredItems.filter(
      (item) => activeTab === 'all' || item.type === activeTab
    );

    const filtered = filterItems(baseList);
    const sorted = sortItems(filtered);

    if (loadingFilter) {
      return (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Filtrando por streaming...</p>
        </div>
      );
    }

    if (sorted.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-primary mb-2">
            {searchTerm || (selectedStreaming && selectedStreaming !== '0')
              ? 'Nenhum resultado encontrado'
              : `Nenhum item em ${contextLabel}`}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedStreaming
              ? 'Tente ajustar seus filtros'
              : `Explore conteúdos e adicione à sua lista de ${contextLabel.toLowerCase()}`}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sorted.map((item) => {
          // Clonar o renderCard e modificar onDetailsClick para salvar scroll
          const originalCard = renderCard(item);
          if (React.isValidElement(originalCard)) {
            return React.cloneElement(originalCard, {
              ...originalCard.props,
              key: `${item.type}-${item.id}`,
              onDetailsClick: () => {
                saveScrollPosition();
                originalCard.props.onDetailsClick();
              },
            });
          }
          return originalCard;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Controles: busca e filtros de ordenação */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-2 items-center max-w-xl w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={`Buscar em ${contextLabel.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-primary/20"
            />
          </div>
          {/* Filtros de ordenação ao lado do campo de busca */}
          <div className="flex gap-2 items-center">
            <label className="text-sm text-muted-foreground">
              Ordenar por:
            </label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value as 'date' | 'rating')}
              className="border rounded px-2 py-1 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="date">Data de Adição</option>
              <option value="rating">Nota</option>
            </select>
            <select
              value={orderDirection}
              onChange={(e) =>
                setOrderDirection(e.target.value as 'asc' | 'desc')
              }
              className="border rounded px-2 py-1 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>
        </div>
        {onClearAll && items.length > 0 && (
          <Button
            variant="outline"
            onClick={onClearAll}
            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar todos
          </Button>
        )}
      </div>

      {/* Filtro de Streaming */}
      {enableStreamingFilter && (
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-muted-foreground">
              Filtrar por Streaming:
            </label>
          </div>
          <select
            value={selectedStreaming}
            onChange={(e) => setSelectedStreaming(e.target.value)}
            disabled={loadingProviders}
            className="border rounded px-3 py-2 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px] disabled:opacity-50"
          >
            {loadingProviders ? (
              <option>Carregando...</option>
            ) : (
              availableStreamings.map((streaming) => (
                <option
                  key={streaming.provider_id}
                  value={streaming.provider_id}
                >
                  {streaming.provider_name}
                </option>
              ))
            )}
          </select>
          {selectedStreaming && selectedStreaming !== '0' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStreaming('0')}
              className="text-xs"
            >
              Limpar Filtro
            </Button>
          )}

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Nota Mínima:
              </label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="border rounded px-2 py-1 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary h-9 min-w-[120px]"
              >
                <option value="">Qualquer</option>
                <option value="9">Acima de 9.0</option>
                <option value="8">Acima de 8.0</option>
                <option value="7">Acima de 7.0</option>
                <option value="6">Acima de 6.0</option>
                <option value="5">Acima de 5.0</option>
                <option value="4">Acima de 4.0</option>
                <option value="3">Acima de 3.0</option>
                <option value="2">Acima de 2.0</option>
                <option value="1">Acima de 1.0</option>
              </select>
            </div>
            {selectedRating && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRating('')}
                className="text-xs"
              >
                Reset nota
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.movies}
            </div>
            <div className="text-sm text-muted-foreground">Filmes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.series}
            </div>
            <div className="text-sm text-muted-foreground">Séries</div>
          </CardContent>
        </Card>
      </div>

      {/* Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
          <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
          <TabsTrigger value="movie">Filmes ({stats.movies})</TabsTrigger>
          <TabsTrigger value="tv">Séries ({stats.series})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-6">
          {renderList(items)}
        </TabsContent>
        <TabsContent value="movie" className="space-y-6">
          {renderList(getItemsByType('movie'))}
        </TabsContent>
        <TabsContent value="tv" className="space-y-6">
          {renderList(getItemsByType('tv'))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
