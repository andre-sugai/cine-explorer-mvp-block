
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Heart, Search, Trash2, User, Film, Tv, Star, Calendar } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const FavoritesPage: React.FC = () => {
  const { favorites, removeFromFavorites, clearAllFavorites, getFavoritesByType, getStats } = useFavorites();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const stats = getStats();

  const handleRemoveFavorite = (id: number, type: string, title: string) => {
    removeFromFavorites(id, type);
    toast({
      title: "Removido dos favoritos",
      description: `${title} foi removido da sua lista de favoritos.`,
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja remover todos os favoritos? Esta ação não pode ser desfeita.')) {
      clearAllFavorites();
      toast({
        title: "Favoritos limpos",
        description: "Todos os favoritos foram removidos.",
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
    return items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const FavoriteCard = ({ item }: { item: any }) => (
    <Card className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div 
          className="w-full h-48 bg-secondary/50 rounded-md mb-3 flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => navigateToDetails(item)}
        >
          {(item.poster_path || item.profile_path) ? (
            <img
              src={buildImageUrl(item.poster_path || item.profile_path)}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {item.type === 'movie' ? <Film className="w-8 h-8" /> :
               item.type === 'tv' ? <Tv className="w-8 h-8" /> :
               <User className="w-8 h-8" />}
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg text-primary line-clamp-2">{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {item.vote_average && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{item.vote_average.toFixed(1)}/10</span>
            </div>
          )}
          
          {(item.release_date || item.first_air_date) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date(item.release_date || item.first_air_date).getFullYear()}</span>
            </div>
          )}

          {item.known_for_department && (
            <div className="text-sm text-muted-foreground">
              {item.known_for_department}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Adicionado em: {new Date(item.addedAt).toLocaleDateString('pt-BR')}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRemoveFavorite(item.id, item.type, item.title)}
            className="w-full mt-3 text-red-500 border-red-500/20 hover:bg-red-500/10"
          >
            <Heart className="w-4 h-4 mr-2 fill-current" />
            Remover dos favoritos
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFavoritesList = (items: any[]) => {
    const filteredItems = filterFavorites(items);

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum favorito nesta categoria'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Tente ajustar sua busca' : 'Explore conteúdos e adicione aos seus favoritos'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <FavoriteCard key={`${item.type}-${item.id}`} item={item} />
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
            <div className="text-2xl font-bold text-primary">{stats.movies}</div>
            <div className="text-sm text-muted-foreground">Filmes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.series}</div>
            <div className="text-sm text-muted-foreground">Séries</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.people}</div>
            <div className="text-sm text-muted-foreground">Pessoas</div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar nos favoritos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary/50 border-primary/20"
          />
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
