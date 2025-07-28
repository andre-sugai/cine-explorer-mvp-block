import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Heart, Search, Trash2, MonitorPlay } from 'lucide-react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { PersonalListCard } from '@/components/personal/PersonalListCard';
import { getWatchProviders, getMovieWatchProviders, getTVWatchProviders } from '@/utils/tmdb';

/**
 * PersonalListFiltersTabs
 * Componente reutilizável para filtros, estatísticas e abas de tipo (Todos, Filmes, Séries)
 * Props:
 * - items: lista de itens (filmes e séries)
 * - getItemsByType: função para filtrar por tipo ('movie' | 'tv')
 * - stats: objeto com estatísticas (total, movies, series)
 * - onRemove: função para remover item
 * - onClearAll: função para limpar todos
 * - renderCard: função para renderizar o card do item
 * - contextLabel: string para título/contexto (ex: 'Favoritos', 'Quero Assistir', 'Vistos')
 */
export const PersonalListFiltersTabs: React.FC<{
  items: any[];
  getItemsByType: (type: 'movie' | 'tv') => any[];
  stats: { total: number; movies: number; series: number };
  onRemove: (id: number, type: string, title: string) => void;
  onClearAll?: () => void;
  renderCard: (item: any) => React.ReactNode;
  contextLabel: string;
  enableStreamingFilter?: boolean;
  onStreamingFilterChange?: (items: any[]) => Promise<any[]>;
}> = ({
  items,
  getItemsByType,
  stats,
  onRemove,
  onClearAll,
  renderCard,
  contextLabel,
  enableStreamingFilter = false,
  onStreamingFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [orderBy, setOrderBy] = useState<'date' | 'rating'>('date');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedStreaming, setSelectedStreaming] = useState('');
  const [availableStreamings, setAvailableStreamings] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState(items);

  // Carregar provedores de streaming disponíveis
  useEffect(() => {
    if (enableStreamingFilter) {
      loadAvailableStreamings();
    }
  }, [enableStreamingFilter]);

  // Atualizar items filtrados quando mudarem
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const loadAvailableStreamings = async () => {
    try {
      const providers = await getWatchProviders('BR');
      setAvailableStreamings([
        { provider_id: '', provider_name: 'Todos os Streamings', logo_path: null },
        ...providers.slice(0, 15) // Limitar a 15 principais
      ]);
    } catch (error) {
      console.error('Error loading streamings:', error);
    }
  };

  const handleStreamingFilter = async (streamingId: string) => {
    setSelectedStreaming(streamingId);
    
    if (!streamingId || !enableStreamingFilter) {
      setFilteredItems(items);
      return;
    }

    // Filtrar items que estão disponíveis no streaming selecionado
    const filtered = [];
    for (const item of items) {
      try {
        let providers;
        if (item.type === 'movie') {
          const response = await getMovieWatchProviders(item.id);
          providers = response.results?.BR;
        } else if (item.type === 'tv') {
          const response = await getTVWatchProviders(item.id);
          providers = response.results?.BR;
        }
        
        if (providers?.flatrate?.some((p: any) => p.provider_id.toString() === streamingId)) {
          filtered.push(item);
        }
      } catch (error) {
        console.error(`Error checking providers for ${item.title}:`, error);
      }
    }
    setFilteredItems(filtered);
  };

  const filterItems = (list: any[]) =>
    list.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
    // Usar items filtrados se o filtro de streaming estiver ativo
    const baseList = enableStreamingFilter && selectedStreaming ? filteredItems.filter(item => 
      activeTab === 'all' || item.type === activeTab
    ) : list;
    
    const filtered = filterItems(baseList);
    const sorted = sortItems(filtered);
    
    if (sorted.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-primary mb-2">
            {searchTerm || selectedStreaming
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.map(renderCard)}
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
            onChange={(e) => handleStreamingFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
          >
            {availableStreamings.map((streaming) => (
              <option key={streaming.provider_id} value={streaming.provider_id}>
                {streaming.provider_name}
              </option>
            ))}
          </select>
          {selectedStreaming && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStreamingFilter('')}
              className="text-xs"
            >
              Limpar Filtro
            </Button>
          )}
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

export const FavoritesPage: React.FC = () => {
  const {
    favorites,
    removeFromFavorites,
    clearAllFavorites,
    getFavoritesByType,
    getStats,
  } = useFavoritesContext();
  const navigate = useNavigate();

  const stats = getStats();

  const handleRemoveFavorite = (id: number, type: string, title: string) => {
    removeFromFavorites(id, type);
    toast({
      title: 'Removido dos favoritos',
      description: `${title} foi removido da sua lista de favoritos.`,
    });
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Tem certeza que deseja remover todos os favoritos? Esta ação não pode ser desfeita.'
      )
    ) {
      clearAllFavorites();
      toast({
        title: 'Favoritos limpos',
        description: 'Todos os favoritos foram removidos.',
      });
    }
  };

  const navigateToDetails = (item: any) => {
    if (item.type === 'movie') {
      navigate(`/filme/${item.id}`);
    } else if (item.type === 'tv') {
      navigate(`/serie/${item.id}`);
    } else if (item.type === 'person') {
      navigate(`/pessoa/${item.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Meus Favoritos</h2>
        <p className="text-muted-foreground">
          Gerencie todos os seus filmes, séries e pessoas favoritas
        </p>
      </div>
      <PersonalListFiltersTabs
        items={favorites}
        getItemsByType={getFavoritesByType}
        stats={stats}
        onRemove={handleRemoveFavorite}
        renderCard={(item) => (
          <PersonalListCard
            key={`${item.type}-${item.id}`}
            item={item}
            onDetailsClick={() => navigateToDetails(item)}
            showDate={true}
            dateLabel="Adicionado em"
            actions={[
              {
                label: 'Remover',
                onClick: () =>
                  handleRemoveFavorite(item.id, item.type, item.title),
                variant: 'destructive',
              },
            ]}
          />
        )}
        contextLabel="Favoritos"
      />
    </div>
  );
};
