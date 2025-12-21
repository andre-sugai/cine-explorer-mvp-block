import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildImageUrl, TMDBTVShow } from '@/utils/tmdb';
import { MovieCardActions } from '@/components/MovieCardActions';
import { BlacklistButton } from '@/components/BlacklistButton';
import { AddToListButton } from '@/components/AddToListButton';
import { ToggleFollowButton } from '@/components/ToggleFollowButton';
import { useStreamingProvider } from '@/hooks/useStreamingProvider';

interface TVCardProps {
  show: TMDBTVShow;
}

export const TVCard: React.FC<TVCardProps> = ({ show }) => {
  const navigate = useNavigate();
  const streamingProvider = useStreamingProvider(show.id, 'tv');

  return (
    <Card
      className="group cursor-pointer overflow-hidden bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 transform hover:scale-105"
      onClick={() => navigate(`/serie/${show.id}`)}
    >
      <div className="relative">
        <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={buildImageUrl(show.poster_path, 'w342')}
          alt={show.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=342&h=513&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
          Série
        </Badge>
        <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 fill-current text-yellow-400" />
            <span>{show.vote_average.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="absolute top-2 left-2 z-10 flex flex-row gap-2">
          <ToggleFollowButton
            id={show.id}
            title={show.name}
            poster_path={show.poster_path}
            type="tv"
            release_date={show.first_air_date}
            vote_average={show.vote_average}
            genre_ids={show.genre_ids}
          />
          <AddToListButton 
            id={show.id} 
            title={show.name} 
            poster_path={show.poster_path} 
            type="tv" 
          />
          <BlacklistButton title={show.name} type="tv" />
        </div>
        </div>
      </div>

      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-foreground line-clamp-2 mb-1">
              {show.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {show.first_air_date
                ? new Date(show.first_air_date).getFullYear()
                : 'N/A'}
            </div>
          </div>
          {streamingProvider.logoPath && (
            <div className="flex-shrink-0 mb-2" title={`Disponível em ${streamingProvider.providerName}`}>
              <img
                src={streamingProvider.logoPath}
                alt={streamingProvider.providerName || 'Streaming Service'}
                className="w-8 h-8 rounded-md object-cover shadow-sm"
              />
            </div>
          )}
        </div>
      </CardContent>
      {/* Botões de ação */}
      <div className="px-3 pb-3">
        <MovieCardActions
          id={show.id}
          title={show.name}
          poster_path={show.poster_path}
          release_date={show.first_air_date}
          vote_average={show.vote_average}
          genre_ids={show.genre_ids}
          type="tv"
          showBlacklist={false}
        />
      </div>
    </Card>
  );
};
