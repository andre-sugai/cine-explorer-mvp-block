
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Clock, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';

interface WatchedItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  runtime?: number;
  watchedAt: string;
  year?: number;
}

interface WatchedCardProps {
  item: WatchedItem;
  onRemove: (id: number, type: string, title: string) => void;
}

export const WatchedCard: React.FC<WatchedCardProps> = ({ item, onRemove }) => {
  const navigate = useNavigate();

  const navigateToDetails = () => {
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

  return (
    <Card className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div 
          className="w-full h-48 bg-secondary/50 rounded-md mb-3 cursor-pointer overflow-hidden relative"
          onClick={navigateToDetails}
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
        <CardTitle 
          className="text-lg text-primary line-clamp-2 cursor-pointer hover:text-primary/80 transition-colors"
          onClick={navigateToDetails}
        >
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
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

          {item.runtime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{item.runtime} min</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Assistido em: {new Date(item.watchedAt).toLocaleDateString('pt-BR')}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToDetails}
              className="flex-1 text-primary border-primary/20 hover:bg-primary/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver detalhes
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(item.id, item.type, item.title)}
              className="text-red-500 border-red-500/20 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
