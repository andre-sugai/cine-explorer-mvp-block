import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildImageUrl, TMDBTVShow } from '@/utils/tmdb';
import { MovieCardActions } from '@/components/MovieCardActions';

interface TVCardProps {
  show: TMDBTVShow;
}

export const TVCard: React.FC<TVCardProps> = ({ show }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer overflow-hidden bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 transform hover:scale-105"
      onClick={() => navigate(`/serie/${show.id}`)}
    >
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
        <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
          Série
        </Badge>
        <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 fill-current text-yellow-400" />
            <span>{show.vote_average.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="font-bold text-foreground line-clamp-2 mb-1">
          {show.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {show.first_air_date
            ? new Date(show.first_air_date).getFullYear()
            : 'N/A'}
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
        />
      </div>
    </Card>
  );
};
