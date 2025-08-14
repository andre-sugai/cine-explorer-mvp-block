import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  SkipForward,
  Loader,
  ExternalLink,
  Film,
  Tv,
} from 'lucide-react';
import { useTrailers } from '@/hooks/useTrailers';
import { toast } from 'sonner';

interface TrailerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  interface Window {
    YT: any;
  }
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { getRandomTrailer, currentTrailer, isLoading, currentCategory } =
    useTrailers();
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [useYTPlayer, setUseYTPlayer] = useState(false);

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Carregar YouTube Player API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setUseYTPlayer(true);
      };
    } else {
      setUseYTPlayer(true);
    }
  }, []);

  // Inicializar player quando modal abre e API está pronta
  useEffect(() => {
    if (open && !currentTrailer && useYTPlayer) {
      loadRandomTrailer();
    }
  }, [open, useYTPlayer]);

  // Criar/atualizar YouTube Player
  useEffect(() => {
    if (currentTrailer && useYTPlayer && playerContainerRef.current) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.log('Error destroying previous player:', error);
        }
      }

      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '100%',
        width: '100%',
        videoId: currentTrailer.key,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready');
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              handleNextTrailer();
            }
          },
        },
      });
    }
  }, [currentTrailer, useYTPlayer]);

  const loadRandomTrailer = async () => {
    const trailer = await getRandomTrailer();
    if (!trailer) {
      toast.error('Nenhum trailer encontrado. Tente novamente.');
    }
  };

  const handleNextTrailer = async () => {
    setLoadingNext(true);
    setIsTransitioning(true);

    // Destruir player atual
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
      } catch (error) {
        console.log('Error destroying player:', error);
      }
    }

    // Aguardar um pouco antes de carregar o próximo
    setTimeout(async () => {
      const trailer = await getRandomTrailer();
      if (!trailer) {
        toast.error('Nenhum trailer encontrado. Tente novamente.');
      }
      setLoadingNext(false);
      setIsTransitioning(false);
    }, 500);
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleMovieDetails = () => {
    if (currentTrailer) {
      const route =
        currentTrailer.contentType === 'tv'
          ? `/serie/${currentTrailer.movieId}`
          : `/filme/${currentTrailer.movieId}`;
      navigate(route);
    }
  };

  const handleModalClose = () => {
    setIsPlaying(false);

    // Destruir player ao fechar modal
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
      } catch (error) {
        console.log('Error destroying player on close:', error);
      }
    }

    onOpenChange(false);
  };

  // Format title with year
  const getFormattedTitle = () => {
    if (!currentTrailer) return 'Carregando...';

    const { movieTitle, releaseYear } = currentTrailer;
    return releaseYear ? `${movieTitle} (${releaseYear})` : movieTitle;
  };

  const showLoadingState = isLoading || loadingNext || isTransitioning;

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] bg-gradient-cinema border-primary/20">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
              <Play className="w-6 h-6" />
              {getFormattedTitle()}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {currentTrailer?.contentType === 'tv' ? (
                <Tv className="w-5 h-5 text-blue-400" />
              ) : (
                <Film className="w-5 h-5 text-orange-400" />
              )}
              {currentCategory && (
                <Badge variant="secondary" className="text-xs">
                  {currentCategory}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {showLoadingState ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {loadingNext
                      ? 'Carregando próximo trailer...'
                      : 'Carregando trailer...'}
                  </p>
                </div>
              </div>
            ) : (
              <div ref={playerContainerRef} className="w-full h-full" />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="sm"
                disabled={showLoadingState}
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
                size="sm"
                disabled={showLoadingState}
              >
                <SkipForward className="w-4 h-4 mr-1" />
                Próximo
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleMovieDetails}
                variant="outline"
                size="sm"
                disabled={!currentTrailer}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Ver Detalhes
              </Button>
            </div>
          </div>

          {/* Info */}
          {currentTrailer && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Tipo:</strong>{' '}
                {currentTrailer.contentType === 'tv' ? 'Série de TV' : 'Filme'}
              </p>
              <p>
                <strong>Categoria:</strong> {currentCategory}
              </p>
              <p>
                <strong>Trailer:</strong> {currentTrailer.name}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
