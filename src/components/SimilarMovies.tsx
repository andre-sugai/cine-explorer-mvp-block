import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Play } from 'lucide-react';
import { MovieCardActions } from '@/components/MovieCardActions';
import { BlacklistButton } from '@/components/BlacklistButton';
import { AddToListButton } from '@/components/AddToListButton';

interface SimilarMoviesProps {
  similarMovies: any[];
  isLoading?: boolean;
}

export const SimilarMovies: React.FC<SimilarMoviesProps> = ({
  similarMovies,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const handleMovieClick = (movieId: number, movieTitle: string) => {
    navigate(`/filme/${movieId}?title=${encodeURIComponent(movieTitle)}`);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Play className="w-5 h-5" />
            Filmes Similares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
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

  if (!similarMovies || similarMovies.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-cinema border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Play className="w-5 h-5" />
          Filmes Similares
          <span className="text-sm text-muted-foreground font-normal">
            ({similarMovies.length} filmes)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {similarMovies.map((movie) => (
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
                  
                  <div className="absolute top-2 left-2 z-10 flex flex-row gap-2">
                    <AddToListButton 
                      id={movie.id} 
                      title={movie.title} 
                      poster_path={movie.poster_path} 
                      type="movie" 
                    />
                    <BlacklistButton title={movie.title} type="movie" />
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-3">
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
                    showBlacklist={false}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
