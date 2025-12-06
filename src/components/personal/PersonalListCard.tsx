import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildImageUrl } from '@/utils/tmdb';
import { Play, Image as ImageIcon } from 'lucide-react';
import { TrailerCardModal } from '@/components/TrailerCardModal';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { useStreamingProvider } from '@/hooks/useStreamingProvider';

interface PersonalListCardItem {
  id: number;
  title: string;
  poster_path?: string;
  profile_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genres?: string[];
  known_for_department?: string;
  watchedAt?: string;
  addedAt?: string;
  type?: string;
  rating?: number;
}

interface PersonalListCardProps {
  item: PersonalListCardItem;
  onDetailsClick: () => void;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
    className?: string;
  }>;
  showDate?: boolean;
  dateLabel?: string;
}

export const PersonalListCard: React.FC<PersonalListCardProps> = ({
  item,
  onDetailsClick,
  actions,
  showDate = false,
  dateLabel = 'Data',
}) => {
  const [trailerModalOpen, setTrailerModalOpen] = React.useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = React.useState(false);
  const streamingProvider = useStreamingProvider(
    item.id,
    item.type as 'movie' | 'tv'
  );

  const getYear = () => {
    if (item.release_date) return new Date(item.release_date).getFullYear();
    if (item.first_air_date) return new Date(item.first_air_date).getFullYear();
    return null;
  };

  const getImageUrl = () => {
    const imagePath = item.poster_path || item.profile_path;
    return imagePath ? buildImageUrl(imagePath, 'w500') : null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="bg-gradient-cinema border-primary/20 overflow-hidden hover:shadow-cinema transition-shadow duration-300">
      <div className="aspect-[2/3] relative overflow-hidden">
        {getImageUrl() ? (
          <img
            src={getImageUrl()!}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={onDetailsClick}
          />
        ) : (
          <div
            className="w-full h-full bg-secondary/50 flex items-center justify-center cursor-pointer"
            onClick={onDetailsClick}
          >
            <span className="text-muted-foreground text-sm">Sem imagem</span>
          </div>
        )}

        {/* Selo amarelo com a nota no canto superior direito */}
        {(item.vote_average ?? item.rating) !== undefined && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-primary/90 text-primary-foreground"
            >
              {(item.vote_average ?? item.rating)?.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3
            className="font-semibold text-foreground text-base mb-1 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-primary transition-colors flex-1"
            onClick={onDetailsClick}
          >
            {item.title}
          </h3>
          {streamingProvider.logoPath && (
            <div
              className="flex-shrink-0"
              title={`Disponível em ${streamingProvider.providerName}`}
            >
              <img
                src={streamingProvider.logoPath}
                alt={streamingProvider.providerName || 'Streaming Service'}
                className="w-14 h-14 rounded-md object-cover shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-1">
          {(item.vote_average ?? item.rating) !== undefined && (
            <Badge
              variant="secondary"
              className="text-xs bg-primary/90 text-primary-foreground"
            >
              {(item.vote_average ?? item.rating)?.toFixed(1)}
            </Badge>
          )}
          {getYear() && (
            <Badge variant="outline" className="text-xs">
              {getYear()}
            </Badge>
          )}
        </div>

        {showDate && (item.watchedAt || item.addedAt) && (
          <div className="text-xs text-muted-foreground mb-2">
            {dateLabel}: {formatDate(item.watchedAt || item.addedAt)}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={onDetailsClick}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Ver Detalhes
          </Button>

          {/* Botões de Trailer e Galeria */}
          {(item.type === 'movie' || item.type === 'tv') && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setTrailerModalOpen(true);
                }}
                variant="outline"
                size="sm"
                className="w-full"
                title="Ver Trailer"
              >
                <Play className="w-3 h-3 mr-1" />
                Trailer
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryModalOpen(true);
                }}
                variant="outline"
                size="sm"
                className="w-full"
                title="Ver Galeria de Fotos"
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                Galeria
              </Button>
            </div>
          )}

          {actions
            .filter((a) => a.variant !== 'destructive')
            .map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'outline'}
                size="sm"
                className={
                  (action.className ? action.className + ' ' : '') + 'w-full'
                }
              >
                {action.label}
              </Button>
            ))}
          {actions.some((a) => a.variant === 'destructive') &&
            actions
              .filter((a) => a.variant === 'destructive')
              .map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant}
                  size="sm"
                  className={
                    (action.className ? action.className + ' ' : '') + 'w-full'
                  }
                >
                  {action.label}
                </Button>
              ))}
        </div>
      </CardContent>

      <TrailerCardModal
        open={trailerModalOpen}
        onOpenChange={setTrailerModalOpen}
        movieId={item.type === 'movie' ? item.id : undefined}
        tvShowId={item.type === 'tv' ? item.id : undefined}
        title={item.title}
        type={item.type as 'movie' | 'tv'}
        poster_path={item.poster_path}
        release_date={item.release_date || item.first_air_date}
        vote_average={item.vote_average || item.rating}
      />

      <ImageGalleryModal
        open={galleryModalOpen}
        onOpenChange={setGalleryModalOpen}
        movieId={item.type === 'movie' ? item.id : undefined}
        tvShowId={item.type === 'tv' ? item.id : undefined}
        title={item.title}
        type={item.type as 'movie' | 'tv'}
      />
    </Card>
  );
};
