
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, Loader, ExternalLink } from 'lucide-react';
import { useTrailers } from '@/hooks/useTrailers';
import { toast } from 'sonner';

interface TrailerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { getRandomTrailer, currentTrailer, isLoading } = useTrailers();
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);

  // Carregar primeiro trailer quando modal abre
  useEffect(() => {
    if (open && !currentTrailer) {
      loadRandomTrailer();
    }
  }, [open]);

  const loadRandomTrailer = async () => {
    try {
      const trailer = await getRandomTrailer();
      if (!trailer) {
        toast.error('Não foi possível encontrar trailers no momento');
      }
    } catch (error) {
      console.error('Error loading trailer:', error);
      toast.error('Erro ao carregar trailer');
    }
  };

  const handleNextTrailer = async () => {
    setLoadingNext(true);
    await loadRandomTrailer();
    setLoadingNext(false);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMovieDetails = () => {
    if (currentTrailer) {
      handleModalClose();
      navigate(`/filme/${currentTrailer.movieId}`);
    }
  };

  const handleModalClose = () => {
    setIsPlaying(false);
    onOpenChange(false);
  };

  // Format title with year
  const getFormattedTitle = () => {
    if (!currentTrailer) return 'Carregando...';
    
    const { movieTitle, releaseYear } = currentTrailer;
    return releaseYear ? `${movieTitle} (${releaseYear})` : movieTitle;
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] bg-gradient-cinema border-primary/20">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
            <Play className="w-6 h-6" />
            {getFormattedTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          <div className="relative">
            {isLoading || loadingNext ? (
              <div className="aspect-video bg-secondary/20 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    {isLoading ? 'Carregando trailer...' : 'Buscando próximo trailer...'}
                  </p>
                </div>
              </div>
            ) : currentTrailer ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${currentTrailer.key}?autoplay=${isPlaying ? 1 : 0}&rel=0&showinfo=0`}
                  title={currentTrailer.name}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              </div>
            ) : (
              <div className="aspect-video bg-secondary/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">Nenhum trailer disponível</p>
                  <Button onClick={loadRandomTrailer} variant="default">
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={handlePlayPause}
              variant="default"
              className="flex items-center gap-2"
              disabled={!currentTrailer}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isPlaying ? 'Pausar' : 'Reproduzir'}
            </Button>

            <Button
              onClick={handleNextTrailer}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loadingNext}
            >
              {loadingNext ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <SkipForward className="w-4 h-4" />
              )}
              Próximo Trailer
            </Button>

            {currentTrailer && (
              <Button
                onClick={handleMovieDetails}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Filme
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Descubra novos filmes através dos trailers! 
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> • </span>
              Clique em "Próximo Trailer" para ver outro filme.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
