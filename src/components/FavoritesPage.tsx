import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Heart, Search, Trash2 } from 'lucide-react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { PersonalListCard } from '@/components/personal/PersonalListCard';

export const FavoritesPage: React.FC = () => {
  const {
    favorites,
    removeFromFavorites,
    clearAllFavorites,
    getFavoritesByType,
    getStats,
  } = useFavoritesContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [orderBy, setOrderBy] = useState<'date' | 'rating'>('date');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
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

  const filterFavorites = (items: any[]) => {
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const sortFavorites = (items: any[]) => {
    if (orderBy === 'date') {
      return [...items].sort((a, b) => {
        const dateA = new Date(a.addedAt).getTime();
        const dateB = new Date(b.addedAt).getTime();
        return orderDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (orderBy === 'rating') {
      return [...items].sort((a, b) => {
        const ratingA = a.vote_average || 0;
        const ratingB = b.vote_average || 0;
        return orderDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    }
    return items;
  };

  const renderFavoritesList = (items: any[]) => {
    const filteredItems = filterFavorites(items);
    const sortedItems = sortFavorites(filteredItems);

    if (sortedItems.length === 0) {
      return (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            {searchTerm
              ? 'Nenhum resultado encontrado'
              : 'Nenhum favorito nesta categoria'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Tente ajustar sua busca'
              : 'Explore conteúdos e adicione aos seus favoritos'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedItems.map((item) => (
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
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Meus Favoritos</h2>
        <p className="text-muted-foreground">
          Gerencie todos os seus filmes, séries e pessoas favoritas
        </p>
      </div>
      {/* Controles: busca e filtros de ordenação */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-2 items-center max-w-xl w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar nos favoritos..."
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
        {favorites.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar todos
          </Button>
        )}
      </div>

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
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.people}
            </div>
            <div className="text-sm text-muted-foreground">Pessoas</div>
          </CardContent>
        </Card>
      </div>

      {/* Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
          <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
          <TabsTrigger value="movie">Filmes ({stats.movies})</TabsTrigger>
          <TabsTrigger value="tv">Séries ({stats.series})</TabsTrigger>
          <TabsTrigger value="person">Pessoas ({stats.people})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {renderFavoritesList(favorites)}
        </TabsContent>

        <TabsContent value="movie" className="space-y-6">
          {renderFavoritesList(getFavoritesByType('movie'))}
        </TabsContent>

        <TabsContent value="tv" className="space-y-6">
          {renderFavoritesList(getFavoritesByType('tv'))}
        </TabsContent>

        <TabsContent value="person" className="space-y-6">
          {renderFavoritesList(getFavoritesByType('person'))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
