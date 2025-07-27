import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import { StreamingFilter } from '@/components/filters/StreamingFilter';
import { useStreamingProviders } from '@/hooks/useStreamingProviders';

/**
 * PersonalListFiltersTabsWithStreaming
 * Enhanced version with streaming filters for personal lists
 */
export const PersonalListFiltersTabsWithStreaming: React.FC<{
  items: any[];
  getItemsByType: (type: 'movie' | 'tv') => any[];
  stats: { total: number; movies: number; series: number };
  onRemove: (id: number, type: string, title: string) => void;
  onClearAll?: () => void;
  renderCard: (item: any) => React.ReactNode;
  contextLabel: string;
}> = ({
  items,
  getItemsByType,
  stats,
  onRemove,
  onClearAll,
  renderCard,
  contextLabel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [orderBy, setOrderBy] = useState<'date' | 'rating'>('date');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');

  const {
    selectedProviders,
    setSelectedProviders,
    availableProviders,
    providerCounts,
    filteredItems
  } = useStreamingProviders(items);

  const filterItems = (list: any[]) => {
    // First apply streaming filter
    let filtered = selectedProviders.length > 0 
      ? list.filter(item => {
          const streamingData = item.streamingData?.BR;
          if (!streamingData?.flatrate) return false;
          return streamingData.flatrate.some((provider: any) =>
            selectedProviders.includes(provider.provider_name)
          );
        })
      : list;

    // Then apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

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
    const filtered = filterItems(list);
    const sorted = sortItems(filtered);
    
    if (sorted.length === 0) {
      const hasStreamingFilter = selectedProviders.length > 0;
      const hasSearchFilter = searchTerm.length > 0;
      
      let message = `Nenhum item em ${contextLabel}`;
      let description = `Explore conteúdos e adicione à sua lista de ${contextLabel.toLowerCase()}`;
      
      if (hasStreamingFilter || hasSearchFilter) {
        message = 'Nenhum resultado encontrado';
        description = 'Tente ajustar seus filtros ou busca';
      }
      
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-primary mb-2">
            {message}
          </h3>
          <p className="text-muted-foreground">
            {description}
          </p>
          {(hasStreamingFilter || hasSearchFilter) && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedProviders([]);
                setSearchTerm('');
              }}
              className="mt-4"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.map(renderCard)}
      </div>
    );
  };

  // Calculate filtered stats
  const filteredAllItems = filterItems(items);
  const filteredMovies = filterItems(getItemsByType('movie'));
  const filteredSeries = filterItems(getItemsByType('tv'));
  
  const filteredStats = {
    total: filteredAllItems.length,
    movies: filteredMovies.length,
    series: filteredSeries.length
  };

  return (
    <div className="space-y-8">
      {/* Streaming Filter */}
      {availableProviders.length > 0 && (
        <StreamingFilter
          selectedProviders={selectedProviders}
          onProvidersChange={setSelectedProviders}
          availableProviders={availableProviders}
          itemCounts={providerCounts}
        />
      )}

      {/* Search and Sort Controls */}
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

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredStats.total}
              {filteredStats.total !== stats.total && (
                <span className="text-sm text-muted-foreground">/{stats.total}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredStats.movies}
              {filteredStats.movies !== stats.movies && (
                <span className="text-sm text-muted-foreground">/{stats.movies}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Filmes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredStats.series}
              {filteredStats.series !== stats.series && (
                <span className="text-sm text-muted-foreground">/{stats.series}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Séries</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
          <TabsTrigger value="all">
            Todos ({filteredStats.total})
          </TabsTrigger>
          <TabsTrigger value="movie">
            Filmes ({filteredStats.movies})
          </TabsTrigger>
          <TabsTrigger value="tv">
            Séries ({filteredStats.series})
          </TabsTrigger>
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