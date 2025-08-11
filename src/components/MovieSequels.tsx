import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { MovieCardActions } from '@/components/MovieCardActions';

interface MovieSequelsProps {
  sequels: any[];
  isLoading?: boolean;
  title?: string;
  strategy?: string;
}

export const MovieSequels: React.FC<MovieSequelsProps> = ({
  sequels,
  isLoading = false,
  title = 'Filmes da Mesma Franquia',
  strategy,
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMovieClick = (movieId: number, movieTitle: string) => {
    navigate(`/filme/${movieId}?title=${encodeURIComponent(movieTitle)}`);
  };

  // Calcular quantos filmes mostrar baseado no estado expandido
  const getVisibleMovies = () => {
    if (!sequels || sequels.length === 0) return [];

    if (sequels.length <= 6) {
      return sequels; // Mostrar todos se 6 ou menos
    }

    if (isExpanded) {
      // Mostrar até 18 filmes (3 linhas x 6 filmes) quando expandido
      return sequels.slice(0, 18);
    }

    // Mostrar apenas 6 filmes quando não expandido
    return sequels.slice(0, 6);
  };

  // Verificar se deve mostrar o botão de expandir/contrair
  const shouldShowExpandButton = sequels && sequels.length > 6;

  // Calcular quantas linhas serão mostradas
  const getVisibleRows = () => {
    const visibleMovies = getVisibleMovies();
    return Math.ceil(visibleMovies.length / 6);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sequels || sequels.length === 0) {
    return null; // Não exibir se não houver sequências
  }

  const visibleMovies = getVisibleMovies();

  return (
    <Card className="bg-gradient-cinema border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center gap-2">
            <Play className="w-5 h-5" />
            {title}
            {sequels.length > 6 && (
              <span className="text-sm text-muted-foreground font-normal">
                ({sequels.length} filmes)
              </span>
            )}
          </CardTitle>
          {shouldShowExpandButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-primary/80"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Ver mais ({Math.min(sequels.length - 6, 12)} filmes)
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Renderizar filmes em linhas de 6 */}
          {Array.from({ length: getVisibleRows() }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {visibleMovies
                .slice(rowIndex * 6, (rowIndex + 1) * 6)
                .map((movie) => (
                  <Card
                    key={movie.id}
                    className="
                      group cursor-pointer transition-all duration-300 
                      hover:scale-105 hover:shadow-glow border-primary/20
                      bg-gradient-cinema overflow-hidden
                    "
                    onClick={() => handleMovieClick(movie.id, movie.title)}
                  >
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <img
                          src={buildImageUrl(movie.poster_path, 'w500')}
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Rating */}
                        {movie.vote_average > 0 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {movie.vote_average.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">
                          {movie.title}
                        </h3>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          {/* Release Date */}
                          {movie.release_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(movie.release_date).getFullYear()}
                            </div>
                          )}
                        </div>

                        {/* Action Icons */}
                        <MovieCardActions
                          id={movie.id}
                          title={movie.title}
                          poster_path={movie.poster_path}
                          release_date={movie.release_date}
                          vote_average={movie.vote_average}
                          genre_ids={movie.genre_ids}
                          type="movie"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
