import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Search, Trash2, MonitorPlay, Loader2, Film, Tv, Star, LayoutGrid, Ghost } from 'lucide-react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ContentCard } from '@/components/home/ContentCard';
import { useWatchProviders } from '@/hooks/useWatchProviders';
import { HeroHeader } from '@/components/ui/HeroHeader';

export const PersonalListFiltersTabs: React.FC<{
  items: any[];
  getItemsByType: (type: 'movie' | 'tv') => any[];
  stats: { total: number; movies: number; series: number };
  onRemove: (id: number, type: string, title: string) => void;
  onClearAll?: () => void;
  renderCard: (item: any) => React.ReactNode;
  contextLabel: string;
  enableStreamingFilter?: boolean;
}> = ({
  items,
  getItemsByType,
  stats,
  onRemove,
  onClearAll,
  renderCard,
  contextLabel,
  enableStreamingFilter = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [orderBy, setOrderBy] = useState<'date' | 'rating'>('date');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedStreaming, setSelectedStreaming] = useState('0');
  const [streamingFilteredItems, setStreamingFilteredItems] = useState(items);
  const [displayCount, setDisplayCount] = useState(30);

  const observerRef = useRef<IntersectionObserver>();

  const lastElementRefCallback = useCallback(
    (node: HTMLDivElement) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => prev + 30);
        }
      }, {
        rootMargin: '200px', // load more 200px before reaching the end
      });
      if (node) observerRef.current.observe(node);
    },
    []
  );

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(30);
  }, [searchTerm, activeTab, orderBy, orderDirection, selectedStreaming]);

  const {
    availableStreamings,
    loadingProviders,
    loadingFilter,
    filterItemsByStreaming,
  } = useWatchProviders();

  useEffect(() => {
    setStreamingFilteredItems(items);
    setSelectedStreaming('0');
  }, [items]);

  useEffect(() => {
    if (enableStreamingFilter && selectedStreaming !== '0') {
      handleStreamingFilter(selectedStreaming);
    } else {
      setStreamingFilteredItems(items);
    }
  }, [selectedStreaming, items, enableStreamingFilter, filterItemsByStreaming]);

  const handleStreamingFilter = async (streamingId: string) => {
    if (!enableStreamingFilter || streamingId === '0') {
      setStreamingFilteredItems(items);
      return;
    }

    const filtered = await filterItemsByStreaming(items, streamingId);
    setStreamingFilteredItems(filtered);
  };

  const filterItems = (list: any[]) =>
    list.filter((item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
  const sortItems = (list: any[]) => {
    if (orderBy === 'date') {
      return [...list].sort((a, b) => {
        const dateA = new Date(
          a.addedAt || a.added_date || a.watchedAt || 0
        ).getTime();
        const dateB = new Date(
          b.addedAt || b.added_date || b.watchedAt || 0
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
        <div className="bg-card/30 border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center mt-6">
          <Ghost className="w-16 h-16 text-muted-foreground/30 mb-4 animate-bounce" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
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
    const itemsToDisplay = sorted.slice(0, displayCount);

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
        {itemsToDisplay.map((item, index) => {
          const isLastItem = index === itemsToDisplay.length - 1;
          const hasMore = itemsToDisplay.length < sorted.length;
          
          return (
            <div 
              key={`${item.type}-${item.id}`}
              ref={isLastItem && hasMore ? lastElementRefCallback : null}
              className="animate-in fade-in zoom-in-95 duration-500 fill-mode-backwards"
              style={{ animationDelay: `${(index % 30) * 50}ms` }}
            >
              {renderCard(item)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Estatísticas VIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-5 border border-primary/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <LayoutGrid className="w-16 h-16 text-primary" />
          </div>
          <span className="text-sm text-primary/80 font-medium">Total</span>
          <p className="text-3xl font-extrabold text-foreground mt-1">
            {stats.total}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-5 border border-blue-500/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Film className="w-16 h-16 text-blue-500" />
          </div>
          <span className="text-sm text-blue-500/80 font-medium">Filmes</span>
          <p className="text-3xl font-extrabold text-foreground mt-1">
            {stats.movies}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl p-5 border border-purple-500/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Tv className="w-16 h-16 text-purple-500" />
          </div>
          <span className="text-sm text-purple-500/80 font-medium">Séries</span>
          <p className="text-3xl font-extrabold text-foreground mt-1">
            {stats.series}
          </p>
        </div>
      </div>

      {/* Controles: busca e filtros de ordenação */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-2 items-center w-full">
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
            <label className="text-sm text-muted-foreground hidden sm:block">
              Ordenar:
            </label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value as 'date' | 'rating')}
              className="border rounded-md px-2 py-2 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="date">Data</option>
              <option value="rating">Nota</option>
            </select>
            <select
              value={orderDirection}
              onChange={(e) =>
                setOrderDirection(e.target.value as 'asc' | 'desc')
              }
              className="border rounded-md px-2 py-2 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="border rounded-md px-3 py-2 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px] disabled:opacity-50"
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
        </div>
      )}

      {/* Abas como Pílulas */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
            hover:scale-105 active:scale-95
            ${activeTab === 'all' 
              ? `bg-primary/20 border-primary/50 text-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] font-semibold` 
              : `bg-card border-border/50 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-foreground`
            }
          `}
        >
          <LayoutGrid className={`w-4 h-4 ${activeTab === 'all' ? 'text-primary' : ''}`} />
          Todos ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('movie')}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
            hover:scale-105 active:scale-95
            ${activeTab === 'movie' 
              ? `bg-blue-500/20 border-blue-500/50 text-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)] font-semibold` 
              : `bg-card border-border/50 text-muted-foreground hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-foreground`
            }
          `}
        >
          <Film className={`w-4 h-4 ${activeTab === 'movie' ? 'text-blue-500' : ''}`} />
          Filmes ({stats.movies})
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
            hover:scale-105 active:scale-95
            ${activeTab === 'tv' 
              ? `bg-purple-500/20 border-purple-500/50 text-foreground shadow-[0_0_15px_rgba(168,85,247,0.3)] font-semibold` 
              : `bg-card border-border/50 text-muted-foreground hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-foreground`
            }
          `}
        >
          <Tv className={`w-4 h-4 ${activeTab === 'tv' ? 'text-purple-500' : ''}`} />
          Séries ({stats.series})
        </button>
      </div>
      
      {/* Renderização condicional unificada em vez de usar múltiplos TabsContent para evitar bugs de montagem/desmontagem */}
      <div>
        {renderList(items)}
      </div>
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

  const handleRemoveFavorite = async (
    id: number,
    type: string,
    title: string
  ) => {
    try {
      await removeFromFavorites(id, type);
      toast.success(`${title} foi removido da sua lista de favoritos.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao remover favorito'
      );
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        'Tem certeza que deseja remover todos os favoritos? Esta ação não pode ser desfeita.'
      )
    ) {
      try {
        await clearAllFavorites();
        toast.success('Todos os favoritos foram removidos.');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Erro ao limpar favoritos'
        );
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <HeroHeader 
        title="Meus Favoritos"
        description="Gerencie todos os seus filmes, séries e pessoas favoritas em um só lugar."
        icon={Heart}
        colorScheme="pink"
      />
      <PersonalListFiltersTabs
        items={favorites}
        getItemsByType={getFavoritesByType}
        stats={stats}
        onRemove={handleRemoveFavorite}
        enableStreamingFilter={true}
        renderCard={(item) => (
          <ContentCard
            item={item as any}
            category={item.type === 'movie' ? 'movies' : item.type === 'tv' ? 'tv' : 'actors'}
          />
        )}
        contextLabel="Favoritos"
      />
    </div>
  );
};
