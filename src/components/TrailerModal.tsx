import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, Loader, ExternalLink, RotateCcw } from 'lucide-react';
import { useTrailers } from '@/hooks/useTrailers';
import { toast } from 'sonner';

// Declaração global para YouTube Player API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface TrailerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { 
    getRandomTrailer, 
    getNextTrailer, 
    currentTrailer, 
    isLoading,
    populateMoviesCache,
    preloadNextTrailer,
    autoplayEnabled,
    toggleAutoplay,
    trailerCount,
    incrementTrailerCount,
    resetTrailerCount
  } = useTrailers();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Carregar YouTube API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        setApiReady(true);
        return;
      }

      // Criar script para carregar YouTube API
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);

      // Callback quando API estiver pronta
      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    };

    if (open) {
      loadYouTubeAPI();
    }
  }, [open]);

  // Cleanup quando componente desmonta
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
          }
        } catch (error) {
          console.error('Error in cleanup:', error);
        }
        playerRef.current = null;
      }
    };
  }, []);

  // Inicializar modal e cache
  useEffect(() => {
    if (open) {
      resetTrailerCount();
      populateMoviesCache();
      if (!currentTrailer) {
        loadRandomTrailer();
      }
    }
  }, [open]);

  // Criar player YouTube quando API estiver pronta
  useEffect(() => {
    if (apiReady && currentTrailer && playerContainerRef.current && !playerRef.current) {
      createYouTubePlayer();
    }
  }, [apiReady, currentTrailer]);

  // Atualizar vídeo quando trailer muda
  useEffect(() => {
    if (playerRef.current && currentTrailer && !isTransitioning && typeof playerRef.current.loadVideoById === 'function') {
      updatePlayerVideo();
    }
  }, [currentTrailer, isTransitioning]);

  const createYouTubePlayer = () => {
    if (!window.YT || !playerContainerRef.current || !currentTrailer) return;

    // Limpar container antes de criar novo player
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (error) {
        console.error('Error destroying existing player:', error);
      }
      playerRef.current = null;
    }

    // Limpar innerHTML para evitar conflitos
    playerContainerRef.current.innerHTML = '';

    // Criar novo elemento div para o player
    const playerDiv = document.createElement('div');
    playerDiv.id = `trailer-player-${Date.now()}`;
    playerContainerRef.current.appendChild(playerDiv);

    playerRef.current = new window.YT.Player(playerDiv, {
      height: '100%',
      width: '100%',
      videoId: currentTrailer.key,
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        fs: 1,
        iv_load_policy: 3
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  };

  const onPlayerReady = (event: any) => {
    setIsPlaying(true);
    // Precarregar próximo trailer
    setTimeout(preloadNextTrailer, 2000);
  };

  const onPlayerStateChange = (event: any) => {
    const state = event.data;
    
    // YT.PlayerState.ENDED = 0
    if (state === 0 && autoplayEnabled) {
      handleAutoNextTrailer();
    }
    
    // YT.PlayerState.PLAYING = 1
    if (state === 1) {
      setIsPlaying(true);
    }
    
    // YT.PlayerState.PAUSED = 2
    if (state === 2) {
      setIsPlaying(false);
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error:', event.data);
    toast.error('Erro no player. Carregando próximo trailer...');
    handleAutoNextTrailer();
  };

  const handleAutoNextTrailer = async () => {
    if (!autoplayEnabled || isTransitioning) return;
    
    setIsTransitioning(true);
    setLoadingNext(true);
    
    try {
      const nextTrailer = await getNextTrailer();
      if (nextTrailer) {
        incrementTrailerCount();
        // Pequeno delay para transição suave
        setTimeout(() => {
          setIsTransitioning(false);
          setLoadingNext(false);
        }, 1000);
      } else {
        throw new Error('No trailer found');
      }
    } catch (error) {
      console.error('Error loading next trailer:', error);
      setIsTransitioning(false);
      setLoadingNext(false);
      toast.error('Erro ao carregar próximo trailer');
    }
  };

  const updatePlayerVideo = () => {
    if (playerRef.current && currentTrailer && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById(currentTrailer.key);
      } catch (error) {
        console.error('Error updating player video:', error);
        // Se falhar, recriar o player
        setTimeout(() => {
          if (playerContainerRef.current) {
            createYouTubePlayer();
          }
        }, 1000);
      }
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

  const handleNextTrailer = async () => {
    setLoadingNext(true);
    setIsTransitioning(true);
    
    try {
      const nextTrailer = await getNextTrailer();
      if (nextTrailer) {
        incrementTrailerCount();
      }
    } catch (error) {
      console.error('Error loading next trailer:', error);
      toast.error('Erro ao carregar próximo trailer');
    } finally {
      setLoadingNext(false);
      setTimeout(() => setIsTransitioning(false), 1000);
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function' && typeof playerRef.current.playVideo === 'function') {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMovieDetails = () => {
    if (currentTrailer) {
      window.open(`/filme/${currentTrailer.movieId}`, '_blank');
    }
  };

  const handleModalClose = () => {
    // Destruir player com segurança antes de fechar modal
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (error) {
        console.error('Error destroying player:', error);
      }
      playerRef.current = null;
    }
    
    // Limpar container manualmente
    if (playerContainerRef.current) {
      playerContainerRef.current.innerHTML = '';
    }
    
    setIsPlaying(false);
    setIsTransitioning(false);
    setLoadingNext(false);
    setApiReady(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] bg-gradient-cinema border-primary/20">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
            <Play className="w-6 h-6" />
            Trailers Aleatórios
          </DialogTitle>
          
          <DialogDescription className="text-muted-foreground">
            Descubra novos filmes através dos trailers aleatórios. A reprodução é automática e contínua.
          </DialogDescription>
          
          {currentTrailer && (
            <div className="text-lg text-foreground font-medium">
              {currentTrailer.movieTitle}
            </div>
          )}
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
              <div className="aspect-video relative">
                {/* Loading overlay durante transição */}
                {isTransitioning && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-4">
                      <Loader className="w-6 h-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Carregando próximo trailer...</p>
                    </div>
                  </div>
                )}
                
                {/* Container para YouTube Player */}
                <div 
                  ref={playerContainerRef}
                  className="w-full h-full rounded-lg overflow-hidden"
                  style={{ opacity: isTransitioning ? 0.3 : 1, transition: 'opacity 0.3s ease' }}
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
              disabled={!currentTrailer || isTransitioning}
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
              disabled={loadingNext || isTransitioning}
            >
              {loadingNext ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <SkipForward className="w-4 h-4" />
              )}
              Próximo Trailer
            </Button>

            <Button
              onClick={toggleAutoplay}
              variant={autoplayEnabled ? "secondary" : "outline"}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Auto: {autoplayEnabled ? 'ON' : 'OFF'}
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

          {/* Stats */}
          {trailerCount > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Trailers assistidos nesta sessão: <span className="text-primary font-medium">{trailerCount}</span>
              </p>
            </div>
          )}

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