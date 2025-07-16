
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWantToWatch } from '@/hooks/useWantToWatch';
import { useWatched } from '@/hooks/useWatched';
import { buildImageUrl } from '@/utils/tmdb';
import { Calendar, Eye, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const WantToWatchPage: React.FC = () => {
  const { wantToWatchList, removeFromWantToWatch, getWantToWatchCount } = useWantToWatch();
  const { addToWatched } = useWatched();
  const navigate = useNavigate();

  const handleRemoveFromList = (id: number, title: string) => {
    if (window.confirm(`Tem certeza que deseja remover "${title}" da sua lista?`)) {
      removeFromWantToWatch(id);
      toast.success('Filme removido da lista');
    }
  };

  const handleMarkAsWatched = (item: any) => {
    // Adicionar aos assistidos
    addToWatched({
      id: item.id,
      type: 'movie',
      title: item.title
    });
    
    // Remover da lista de quero assistir
    removeFromWantToWatch(item.id);
    
    toast.success('Filme marcado como assistido e removido da lista');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
            Você ainda não marcou nenhum filme para assistir. Explore filmes e adicione-os à sua lista!
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Filmes que Quero Assistir
            </h1>
            <p className="text-muted-foreground">
              {getWantToWatchCount()} filme{getWantToWatchCount() !== 1 ? 's' : ''} na sua lista
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wantToWatchList.map((movie) => (
            <Card key={movie.id} className="bg-gradient-cinema border-primary/20 overflow-hidden hover:shadow-cinema transition-shadow">
              <div className="aspect-[2/3] relative">
                <img
                  src={buildImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                    {movie.rating.toFixed(1)}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg leading-tight text-foreground line-clamp-2">
                  {movie.title}
                </CardTitle>
                <div className="flex flex-wrap gap-1">
                  {movie.genres.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="outline" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Adicionado em {formatDate(movie.added_date)}</span>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(`/filme/${movie.id}?title=${encodeURIComponent(movie.title)}`)}
                    className="w-full"
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>

                  <Button
                    onClick={() => handleMarkAsWatched(movie)}
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Marcar como Assistido
                  </Button>

                  <Button
                    onClick={() => handleRemoveFromList(movie.id, movie.title)}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover da Lista
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WantToWatchPage;
