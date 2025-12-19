import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Clock, Check, X } from 'lucide-react';
import { buildImageUrl } from '@/utils/tmdb';
import { useWatchedContext } from '@/context/WatchedContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

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
      // Trigger confetti
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { x, y },
        colors: ['#22c55e', '#ffffff', '#fbbf24'],
        disableForReducedMotion: true,
        zIndex: 9999,
      });

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
        {/* Image - Clicável para marcar como assistido */}
        <div
          className="w-full md:w-64 flex-shrink-0 relative aspect-video md:aspect-auto cursor-pointer group/thumb"
          onClick={handleToggleWatched}
          title={
            watched
              ? 'Clique para remover dos vistos'
              : 'Clique para marcar como visto'
          }
        >
          <img
            src={buildImageUrl(episode.still_path, 'w500')}
            alt={episode.name}
            className={`w-full h-full object-cover transition-all ${
              watched ? 'opacity-60 grayscale' : 'group-hover/thumb:opacity-90'
            }`}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&h=281&fit=crop';
            }}
          />

          {/* Badge do número do episódio */}
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="bg-black/60 hover:bg-black/80"
            >
              EP {episode.episode_number}
            </Badge>
          </div>

          {/* Overlay de hover e estado assistido */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all ${
              watched
                ? 'bg-black/20 group-hover/thumb:bg-black/40'
                : 'bg-black/0 group-hover/thumb:bg-black/40'
            }`}
          >
            {watched ? (
              <div className="relative">
                {/* Check verde sempre visível quando assistido */}
                <Check className="w-16 h-16 text-green-500 drop-shadow-lg stroke-[3]" />
                {/* X vermelho aparece no hover para remover */}
                <X className="w-16 h-16 text-red-500 drop-shadow-lg stroke-[3] absolute inset-0 opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
              </div>
            ) : (
              /* Check branco aparece no hover para marcar como assistido */
              <Check className="w-16 h-16 text-white drop-shadow-lg stroke-[2.5] opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
            )}
          </div>
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
                    className={`h-8 w-8 rounded-full transition-all duration-300 ${
                      watched
                        ? 'text-green-500 hover:text-green-600 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.3)] scale-110 active:scale-90'
                        : 'text-muted-foreground hover:text-green-500 hover:scale-110 active:scale-90'
                    }`}
                    onClick={handleToggleWatched}
                    title={watched ? 'Remover dos vistos' : 'Marcar como visto'}
                  >
                    <Check
                      className={`h-5 w-5 ${watched ? 'stroke-[3]' : ''}`}
                    />
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
