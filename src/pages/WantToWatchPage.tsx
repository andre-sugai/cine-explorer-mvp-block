import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { buildImageUrl } from '@/utils/tmdb';
import { Calendar, Eye, Trash2, ExternalLink, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { PersonalListCard } from '@/components/personal/PersonalListCard';

const WantToWatchPage: React.FC = () => {
  const { wantToWatchList, removeFromWantToWatch, getWantToWatchCount } =
    useWantToWatchContext();
  const { addToWatched } = useWatchedContext();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [orderBy, setOrderBy] = React.useState<'date' | 'rating'>('date');
  const [orderDirection, setOrderDirection] = React.useState<'asc' | 'desc'>(
    'desc'
  );

  const handleRemoveFromList = (id: number, title: string) => {
    if (
      window.confirm(`Tem certeza que deseja remover "${title}" da sua lista?`)
    ) {
      removeFromWantToWatch(id);
      toast.success('Filme removido da lista');
    }
  };

  const handleMarkAsWatched = (item: any) => {
    // Adicionar aos assistidos com dados completos incluindo poster_path
    addToWatched({
      id: item.id,
      type: 'movie',
      title: item.title,
      poster_path: item.poster_path,
      release_date: item.release_date,
      vote_average: item.rating,
      genre_ids: [], // Pode ser expandido se necessário
      runtime: undefined, // Pode ser obtido da API se necessário
    });

    // Remover da lista de quero assistir
    removeFromWantToWatch(item.id);

    toast.success('Filme marcado como assistido e removido da lista');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const stats = {
    total: wantToWatchList.length,
    avgRating:
      wantToWatchList.length > 0
        ? (
            wantToWatchList.reduce((acc, cur) => acc + (cur.rating || 0), 0) /
            wantToWatchList.length
          ).toFixed(1)
        : '0.0',
  };

  const filterList = (items: any[]) => {
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  const sortList = (items: any[]) => {
    if (orderBy === 'date') {
      return [...items].sort((a, b) => {
        const dateA = new Date(a.added_date).getTime();
        const dateB = new Date(b.added_date).getTime();
        return orderDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (orderBy === 'rating') {
      return [...items].sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return orderDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    }
    return items;
  };
  const filteredSortedList = sortList(filterList(wantToWatchList));

  if (wantToWatchList.length === 0) {
    return (
      <Layout>
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-cinema rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Calendar className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Lista Vazia
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Você ainda não marcou nenhum filme para assistir. Explore filmes e
            adicione-os à sua lista!
          </p>
          <Button onClick={() => navigate('/')} variant="hero">
            Explorar Filmes
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Filmes que Quero Assistir
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua lista de filmes para assistir
          </p>
        </div>
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-cinema border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-cinema border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.avgRating}
              </div>
              <div className="text-sm text-muted-foreground">Nota Média</div>
            </CardContent>
          </Card>
        </div>
        {/* Controles: busca e filtros de ordenação */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-2 items-center max-w-xl w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar na lista..."
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
                onChange={(e) =>
                  setOrderBy(e.target.value as 'date' | 'rating')
                }
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
        </div>
        {/* Lista de filmes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSortedList.map((movie) => (
            <PersonalListCard
              key={movie.id}
              item={movie}
              onDetailsClick={() =>
                navigate(
                  `/filme/${movie.id}?title=${encodeURIComponent(movie.title)}`
                )
              }
              showDate={true}
              dateLabel="Adicionado em"
              actions={[
                {
                  label: 'Marcar como Assistido',
                  onClick: () => handleMarkAsWatched(movie),
                  variant: 'default',
                  className: 'bg-green-600 text-white hover:bg-green-700',
                },
                {
                  label: 'Remover da Lista',
                  onClick: () => handleRemoveFromList(movie.id, movie.title),
                  variant: 'destructive',
                },
              ]}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WantToWatchPage;
