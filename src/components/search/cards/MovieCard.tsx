import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildImageUrl, TMDBMovie } from '@/utils/tmdb';
import { MovieCardActions } from '@/components/MovieCardActions';
import { BlacklistButton } from '@/components/BlacklistButton';

interface MovieCardProps {
  movie: TMDBMovie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/filme/${movie.id}`);
  };

  return (
    <Card className="group overflow-hidden bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 transform hover:scale-105">
      <div 
        className="cursor-pointer relative"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={buildImageUrl(movie.poster_path, 'w342')}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=342&h=513&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            Filme
          </Badge>
          <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <BlacklistButton title={movie.title} type="movie" />
        </div>

        <CardContent className="p-3">
          <h3 className="font-bold text-foreground line-clamp-2 mb-1">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
          </div>
        </CardContent>
      </div>
      
      {/* Action Icons */}
      <div className="px-3 pb-3">
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
    </Card>
  );
};
