import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Heart, Search, Trash2 } from 'lucide-react';
import { StreamingFilter } from '@/components/StreamingFilter';

/**
 * PersonalListFiltersTabsWithStreaming
 * Versão estendida do PersonalListFiltersTabs que inclui filtro de streaming
 */
export const PersonalListFiltersTabsWithStreaming: React.FC<{
  items: any[];
  getItemsByType: (type: 'movie' | 'tv') => any[];
  stats: { total: number; movies: number; series: number };
  onRemove: (id: number, type: string, title: string) => void;
  onClearAll?: () => void;
  renderCard: (item: any) => React.ReactNode;
  contextLabel: string;
  // Novas props para streaming
  streamingFilter: number | null;
  onStreamingFilterChange: (providerId: number | null) => void;
  streamingStats: Array<{ id: number; name: string; count: number }>;
  isLoadingStreaming: boolean;
  filteredItems: any[]; // Itens já filtrados pelo streaming
}> = ({
  items,
  getItemsByType,
  stats,
  onRemove,
  onClearAll,
  renderCard,
  contextLabel,
  streamingFilter,
  onStreamingFilterChange,
  streamingStats,
  isLoadingStreaming,
  filteredItems,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [orderBy, setOrderBy] = useState<'date' | 'rating'>('date');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');

  // Filtrar por busca e aplicar ordenação nos itens já filtrados por streaming
  const filterAndSortItems = (list: any[]) => {
    // Filtrar por busca
    const filtered = list.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar
    if (orderBy === 'date') {
      return [...filtered].sort((a, b) => {
        const dateA = new Date(
          a.addedAt || a.added_date || a.watchedAt
        ).getTime();
        const dateB = new Date(
          b.addedAt || b.added_date || b.watchedAt
        ).getTime();
        return orderDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (orderBy === 'rating') {
      return [...filtered].sort((a, b) => {
        const ratingA = a.vote_average || a.rating || 0;
        const ratingB = b.vote_average || b.rating || 0;
        return orderDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    }
    return filtered;
  };

  const renderList = (list: any[]) => {
    const processed = filterAndSortItems(list);
    
    if (processed.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-primary mb-2">
            {searchTerm || streamingFilter
              ? 'Nenhum resultado encontrado'
              : `Nenhum item em ${contextLabel}`}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || streamingFilter
              ? 'Tente ajustar seus filtros'
              : `Explore conteúdos e adicione à sua lista de ${contextLabel.toLowerCase()}`}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {processed.map(renderCard)}
      </div>
    );
  };

  // Filtrar os itens por tipo do contexto filtrado
  const getFilteredItemsByType = (type: 'movie' | 'tv') => 
    filteredItems.filter(item => item.type === type);

  // Recalcular stats baseado nos itens filtrados
  const filteredStats = {
    total: filteredItems.length,
    movies: filteredItems.filter(item => item.type === 'movie').length,
    series: filteredItems.filter(item => item.type === 'tv').length,
  };

  return (
    <div className="space-y-8">
      {/* Filtro de Streaming */}
      <StreamingFilter
        selectedProvider={streamingFilter}
        onProviderChange={onStreamingFilterChange}
        streamingStats={streamingStats}
        isLoading={isLoadingStreaming}
      />

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
          {/* Filtros de ordenação */}
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

      {/* Estatísticas baseadas nos itens filtrados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredStats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredStats.movies}
            </div>
            <div className="text-sm text-muted-foreground">Filmes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredStats.series}
            </div>
            <div className="text-sm text-muted-foreground">Séries</div>
          </CardContent>
        </Card>
      </div>

      {/* Abas com contadores baseados nos itens filtrados */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
          <TabsTrigger value="all">Todos ({filteredStats.total})</TabsTrigger>
          <TabsTrigger value="movie">Filmes ({filteredStats.movies})</TabsTrigger>
          <TabsTrigger value="tv">Séries ({filteredStats.series})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-6">
          {renderList(filteredItems)}
        </TabsContent>
        <TabsContent value="movie" className="space-y-6">
          {renderList(getFilteredItemsByType('movie'))}
        </TabsContent>
        <TabsContent value="tv" className="space-y-6">
          {renderList(getFilteredItemsByType('tv'))}
        </TabsContent>
      </Tabs>
    </div>
  );
};