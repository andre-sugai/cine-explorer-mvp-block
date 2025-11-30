import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Clock, Eye, EyeOff } from 'lucide-react';
import { buildImageUrl } from '@/utils/tmdb';
import { useWatchedContext } from '@/context/WatchedContext';
import { toast } from 'sonner';

interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  vote_average: number;
  runtime: number;
  season_number: number;
}

interface EpisodeCardProps {
  episode: Episode;
  tvId: number;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, tvId }) => {
  const { isWatched, addToWatched, removeFromWatched } = useWatchedContext();
  const watched = isWatched(episode.id, 'episode');

  const handleToggleWatched = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (watched) {
      removeFromWatched(episode.id, 'episode');
      toast.success('Episódio removido dos vistos');
    } else {
      addToWatched({
        id: episode.id,
        type: 'episode',
        title: episode.name,
        poster_path: episode.still_path || undefined,
        first_air_date: episode.air_date,
        vote_average: episode.vote_average,
        runtime: episode.runtime,
        tvId: tvId,
        seasonNumber: episode.season_number,
      });
      toast.success('Episódio marcado como visto');
    }
  };

  return (
    <Card className="overflow-hidden bg-secondary/30 border-primary/10 hover:bg-secondary/50 transition-colors relative group">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        <div className="w-full md:w-64 flex-shrink-0 relative aspect-video md:aspect-auto">
          <img
            src={buildImageUrl(episode.still_path, 'w500')}
            alt={episode.name}
            className={`w-full h-full object-cover transition-opacity ${
              watched ? 'opacity-60 grayscale' : ''
            }`}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&h=281&fit=crop';
            }}
          />
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="bg-black/60 hover:bg-black/80"
            >
              EP {episode.episode_number}
            </Badge>
          </div>
          {watched && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Eye className="w-8 h-8 text-primary drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-4 md:py-4 md:pl-0">
          <div className="flex flex-col h-full justify-between gap-4">
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="text-lg font-bold text-foreground line-clamp-1">
                  {episode.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-yellow-400 font-medium text-sm whitespace-nowrap">
                    <Star className="w-4 h-4 fill-current" />
                    {episode.vote_average.toFixed(1)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full ${
                      watched
                        ? 'text-primary hover:text-primary/80'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={handleToggleWatched}
                    title={watched ? 'Remover dos vistos' : 'Marcar como visto'}
                  >
                    {watched ? (
                      <Eye className="h-5 w-5 fill-current" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                {episode.air_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(episode.air_date).toLocaleDateString('pt-BR')}
                  </div>
                )}
                {episode.runtime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {episode.runtime} min
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 md:line-clamp-4">
                {episode.overview || 'Sinopse não disponível.'}
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
