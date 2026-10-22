import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildImageUrl, TMDBMovie } from '@/utils/tmdb';
import { MovieCardActions } from '@/components/MovieCardActions';
import { BlacklistButton } from '@/components/BlacklistButton';
import { AddToListButton } from '@/components/AddToListButton';
import { useStreamingProvider } from '@/hooks/useStreamingProvider';
import { handleCardLinkClick } from '@/utils/cardNavigation';

// Partial TMDBMovie to support CustomListItem which might miss some fields
type MovieCardData = Partial<TMDBMovie> & {
  id: number;
  title: string;
  poster_path: string;
  // Essential fields we need to handle if missing
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  type?: 'movie' | 'tv';
};

interface MovieCardProps {
  movie: MovieCardData;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const isTV = movie.type === 'tv';
  const targetUrl = isTV ? `/serie/${movie.id}` : `/filme/${movie.id}`;
  const streamingProvider = useStreamingProvider(movie.id, isTV ? 'tv' : 'movie');

  return (
    <Card className="relative group overflow-hidden bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 transform hover:scale-105 h-full flex flex-col">
      <div className="absolute top-2 left-2 z-10 flex flex-row gap-2">
        <AddToListButton 
          id={movie.id} 
          title={movie.title} 
          poster_path={movie.poster_path} 
          type={isTV ? 'tv' : 'movie'} 
        />
        <BlacklistButton title={movie.title} type={isTV ? 'tv' : 'movie'} />
      </div>

      <Link
        to={targetUrl}
        onClick={(e) => handleCardLinkClick(e, targetUrl)}
        className="cursor-pointer relative flex-shrink-0 block text-inherit no-underline after:content-[''] after:absolute after:inset-0 after:z-0"
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
            {isTV ? 'Série' : 'Filme'}
          </Badge>
          <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
        </div>
      </Link>
        
      <CardContent className="p-3 flex-1 flex flex-col justify-between">
        <Link
          to={targetUrl}
          onClick={(e) => handleCardLinkClick(e, targetUrl)}
          className="flex justify-between items-start mb-2 text-inherit no-underline"
        >
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-bold text-foreground line-clamp-2 mb-1 text-sm md:text-base" title={movie.title}>
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
              </div>
            </div>
            {streamingProvider.logoPath && (
              <div className="relative z-[1] flex-shrink-0" title={`Disponível em ${streamingProvider.providerName}`}>
                <img
                  src={streamingProvider.logoPath}
                  alt={streamingProvider.providerName || 'Streaming Service'}
                  className="w-6 h-6 rounded-md object-cover shadow-sm"
                />
              </div>
            )}
        </Link>

        {/* Action Icons */}
        <div className="pt-2 border-t border-border/10">
            <MovieCardActions
            id={movie.id}
            title={movie.title}
            poster_path={movie.poster_path}
            release_date={movie.release_date}
            vote_average={movie.vote_average}
            genre_ids={movie.genre_ids || []}
            type={isTV ? 'tv' : 'movie'}
            showBlacklist={false}
            size="compact"
            className="flex justify-between items-center w-full"
            />
        </div>
      </CardContent>
    </Card>
  );
};
