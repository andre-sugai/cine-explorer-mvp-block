
import React, { useState, useEffect, useRef } from 'react';
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

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { getRandomTrailer, currentTrailer, isLoading } = useTrailers();
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
    if (useYTPlayer && currentTrailer && playerContainerRef.current && open) {
      // Destruir player existente se houver
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.log('Error destroying player:', error);
        }
      }

      // Criar novo player
      try {
        playerRef.current = new window.YT.Player(playerContainerRef.current, {
          videoId: currentTrailer.key,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
          }
        });
      } catch (error) {
        console.error('Error creating YouTube player:', error);
        setUseYTPlayer(false); // Fallback para iframe
      }
    }
  }, [currentTrailer, useYTPlayer, open]);

  const onPlayerReady = (event: any) => {
    console.log('YouTube Player ready');
    setIsTransitioning(false);
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    
    // YT.PlayerState.ENDED = 0
    if (playerState === 0) {
      console.log('Trailer ended - loading next automatically');
      loadNextTrailerAutomatic();
    }
    
    // YT.PlayerState.PLAYING = 1
    if (playerState === 1) {
      setIsPlaying(true);
    }
    
    // YT.PlayerState.PAUSED = 2
    if (playerState === 2) {
      setIsPlaying(false);
    }
  };

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

  const loadNextTrailerAutomatic = async () => {
    console.log('Loading next trailer automatically...');
    setIsTransitioning(true);
    
    try {
      const newTrailer = await getRandomTrailer();
      
      if (newTrailer && playerRef.current && playerRef.current.loadVideoById) {
        // Usar loadVideoById para trocar vídeo sem recriar player
        playerRef.current.loadVideoById({
          videoId: newTrailer.key,
          startSeconds: 0
        });
        setIsPlaying(true);
      } else if (!newTrailer) {
        // Se não conseguir novo trailer, tentar novamente
        console.log('No trailer found, retrying...');
        setTimeout(loadNextTrailerAutomatic, 2000);
      }
    } catch (error) {
      console.error('Error loading next trailer automatically:', error);
      setIsTransitioning(false);
    }
  };

  const handleNextTrailer = async () => {
    setLoadingNext(true);
    
    try {
      const newTrailer = await getRandomTrailer();
      
      if (newTrailer && useYTPlayer && playerRef.current && playerRef.current.loadVideoById) {
        // Usar YouTube Player API
        playerRef.current.loadVideoById({
          videoId: newTrailer.key,
          startSeconds: 0
        });
        setIsPlaying(true);
      } else {
        // Fallback para recarregar componente
        await loadRandomTrailer();
      }
    } catch (error) {
      console.error('Error loading next trailer:', error);
      toast.error('Erro ao carregar próximo trailer');
    } finally {
      setLoadingNext(false);
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current && useYTPlayer) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
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
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
            <Play className="w-6 h-6" />
            {getFormattedTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          <div className="relative">
            {showLoadingState ? (
              <div className="aspect-video bg-secondary/20 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    {isLoading ? 'Carregando trailer...' : 
                     loadingNext ? 'Buscando próximo trailer...' :
                     'Carregando próximo trailer...'}
                  </p>
                </div>
              </div>
            ) : currentTrailer ? (
              <div className="aspect-video">
                {useYTPlayer ? (
                  <div 
                    ref={playerContainerRef}
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  // Fallback para iframe tradicional
                  <iframe
                    src={`https://www.youtube.com/embed/${currentTrailer.key}?autoplay=${isPlaying ? 1 : 0}&rel=0&showinfo=0`}
                    title={currentTrailer.name}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                )}
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
              disabled={!currentTrailer || showLoadingState}
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
              O próximo trailer será reproduzido automaticamente ao final.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
