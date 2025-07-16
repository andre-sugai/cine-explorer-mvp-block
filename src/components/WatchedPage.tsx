
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trash2, ExternalLink, Star, Calendar } from 'lucide-react';
import { useWatched } from '@/hooks/useWatched';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { buildImageUrl } from '@/utils/tmdb';

export const WatchedPage: React.FC = () => {
  const { watched, removeFromWatched, clearAllWatched } = useWatched();
  const navigate = useNavigate();

  const handleRemoveWatched = (id: number, type: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja remover "${title}" da sua lista de assistidos?`)) {
      removeFromWatched(id, type);
      toast({
        title: "Removido da lista",
        description: `${title} foi removido da sua lista de assistidos.`,
      });
    }
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const fallback = target.parentElement?.querySelector('.fallback-poster') as HTMLElement;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  // Ordenar por mais recente primeiro
  const sortedWatched = [...watched].sort((a, b) => 
    new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Meus Filmes Assistidos</h2>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e mantenha um registro de tudo que você assistiu
        </p>
      </div>

      {/* Estatísticas simples */}
      <Card className="bg-gradient-cinema border-primary/20">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <CheckCircle className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-2xl font-bold text-primary">{watched.length}</h3>
              <p className="text-muted-foreground">
                {watched.length === 1 ? 'Item assistido' : 'Itens assistidos'}
              </p>
            </div>
          </div>
          
          {watched.length > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="text-red-500 border-red-500/20 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar toda a lista
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de assistidos */}
      {sortedWatched.length === 0 ? (
        <Card className="bg-gradient-cinema border-primary/20 text-center">
          <CardContent className="p-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              Nenhum filme assistido ainda
            </h3>
            <p className="text-muted-foreground mb-6">
              Comece a marcar filmes como assistidos para acompanhar seu progresso
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedWatched.map((item) => (
            <Card 
              key={`${item.type}-${item.id}`} 
              className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 group"
            >
              <CardContent className="p-4">
                <div 
                  className="w-full h-48 bg-secondary/50 rounded-md mb-3 cursor-pointer overflow-hidden relative"
                  onClick={() => navigateToDetails(item)}
                >
                  {item.poster_path ? (
                    <>
                      <img
                        src={buildImageUrl(item.poster_path, 'w300')}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={handleImageError}
                      />
                      <div className="fallback-poster hidden w-full h-full items-center justify-center flex-col text-muted-foreground">
                        <CheckCircle className="w-8 h-8 mb-2" />
                        <span className="text-sm text-center px-2">{item.title}</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mb-2" />
                      <span className="text-sm text-center px-2">{item.title}</span>
                    </div>
                  )}
                </div>

                <h3 
                  className="font-semibold text-primary line-clamp-2 cursor-pointer hover:text-primary/80 transition-colors mb-2"
                  onClick={() => navigateToDetails(item)}
                >
                  {item.title}
                </h3>

                <div className="space-y-2 mb-4">
                  {item.vote_average && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{item.vote_average.toFixed(1)}/10</span>
                    </div>
                  )}
                  
                  {item.year && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{item.year}</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Assistido em: {new Date(item.watchedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToDetails(item)}
                    className="flex-1 text-primary border-primary/20 hover:bg-primary/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveWatched(item.id, item.type, item.title)}
                    className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
