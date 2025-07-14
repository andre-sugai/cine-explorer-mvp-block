
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Star, Calendar, Clock, TrendingUp, Search, Trash2 } from 'lucide-react';
import { useWatched } from '@/hooks/useWatched';
import { buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const WatchedPage: React.FC = () => {
  const { watched, removeFromWatched, clearAllWatched, getStats } = useWatched();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const navigate = useNavigate();

  const stats = getStats();

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

  const navigateToDetails = (item: any) => {
    if (item.type === 'movie') {
      navigate(`/filme/${item.id}`);
    } else if (item.type === 'tv') {
      navigate(`/serie/${item.id}`);
    }
  };

  const sortWatched = (items: any[]) => {
    const filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
          const yearA = new Date(a.release_date || a.first_air_date || '').getFullYear();
          const yearB = new Date(b.release_date || b.first_air_date || '').getFullYear();
          return yearB - yearA;
        default:
          return 0;
      }
    });
  };

  const WatchedCard = ({ item }: { item: any }) => (
    <Card className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div 
          className="w-full h-48 bg-secondary/50 rounded-md mb-3 flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => navigateToDetails(item)}
        >
          {item.poster_path ? (
            <img
              src={buildImageUrl(item.poster_path)}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-8 h-8" />
              <span className="text-sm">Sem poster</span>
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

          {item.runtime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{item.runtime} min</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Assistido em: {new Date(item.watchedAt).toLocaleDateString('pt-BR')}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRemoveWatched(item.id, item.type, item.title)}
            className="w-full mt-3 text-red-500 border-red-500/20 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remover da lista
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">{stats.total}</h3>
            <p className="text-muted-foreground">Total Assistidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">{stats.totalHours}h</h3>
            <p className="text-muted-foreground">Tempo Total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">{stats.thisMonth}</h3>
            <p className="text-muted-foreground">Este Mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">{stats.movies}/{stats.series}</h3>
            <p className="text-muted-foreground">Filmes/Séries</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar nos assistidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary/50 border-primary/20"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-secondary/50 border-primary/20">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recente</SelectItem>
              <SelectItem value="oldest">Mais antigo</SelectItem>
              <SelectItem value="rating">Melhor nota</SelectItem>
              <SelectItem value="alphabetical">Alfabética</SelectItem>
              <SelectItem value="year">Ano de lançamento</SelectItem>
            </SelectContent>
          </Select>

          {watched.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-red-500 border-red-500/20 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar tudo
            </Button>
          )}
        </div>
      </div>

      {/* Lista de assistidos */}
      {sortedWatched.length === 0 ? (
        <Card className="bg-gradient-cinema border-primary/20 text-center">
          <CardContent className="p-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum filme assistido ainda'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece a marcar filmes como assistidos para acompanhar seu progresso'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedWatched.map((item) => (
            <WatchedCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
