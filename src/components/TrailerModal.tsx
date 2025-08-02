
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
  const [videoKey, setVideoKey] = useState(0);
  const [playerLoading, setPlayerLoading] = useState(false);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const currentTrailerIdRef = useRef<string>('');

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
      cleanupPlayer();
    };
  }, []);

  // Inicializar modal e cache
  useEffect(() => {
    if (open) {
      resetTrailerCount();
      populateMoviesCache();
      setVideoKey(0);
      setPlayerLoading(false);
      if (!currentTrailer) {
        loadRandomTrailer();
      }
    }
  }, [open]);

  // Detectar mudanças no trailer atual e forçar recriação do player
  useEffect(() => {
    if (currentTrailer && currentTrailerIdRef.current !== currentTrailer.key) {
      console.log('Trailer changed, recreating player:', currentTrailer.movieTitle);
      currentTrailerIdRef.current = currentTrailer.key;
      
      // Incrementar key para forçar recriação
      setVideoKey(prev => prev + 1);
      setPlayerLoading(true);
      
      // Cleanup player anterior
      cleanupPlayer();
      
      // Aguardar um momento antes de criar novo player
      setTimeout(() => {
        if (apiReady && playerContainerRef.current) {
          createYouTubePlayer();
        }
      }, 100);
    }
  }, [currentTrailer, apiReady]);

  const cleanupPlayer = () => {
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
    
    // Limpar container
    if (playerContainerRef.current) {
      playerContainerRef.current.innerHTML = '';
    }
  };

  const createYouTubePlayer = () => {
    if (!window.YT || !playerContainerRef.current || !currentTrailer) {
      console.log('Cannot create player:', { YT: !!window.YT, container: !!playerContainerRef.current, trailer: !!currentTrailer });
      return;
    }

    console.log('Creating YouTube player for:', currentTrailer.movieTitle);

    // Cleanup player existente
    cleanupPlayer();

    // Criar novo elemento div para o player
    const playerDiv = document.createElement('div');
    playerDiv.id = `trailer-player-${videoKey}-${Date.now()}`;
    playerDiv.style.width = '100%';
    playerDiv.style.height = '100%';
    playerContainerRef.current.appendChild(playerDiv);

    try {
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
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      setPlayerLoading(false);
      toast.error('Erro ao criar player de vídeo');
    }
  };

  const onPlayerReady = (event: any) => {
    console.log('Player ready for:', currentTrailer?.movieTitle);
    setIsPlaying(true);
    setPlayerLoading(false);
    setIsTransitioning(false);
    
    // Precarregar próximo trailer após 10 segundos para não interferir
    setTimeout(() => {
      if (autoplayEnabled) {
        preloadNextTrailer();
      }
    }, 10000);
  };

  const onPlayerStateChange = (event: any) => {
    const state = event.data;
    console.log('Player state change:', state, 'for:', currentTrailer?.movieTitle);
    
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
    console.error('YouTube Player Error:', event.data, 'for:', currentTrailer?.movieTitle);
    setPlayerLoading(false);
    toast.error('Erro no player. Carregando próximo trailer...');
    handleAutoNextTrailer();
  };

  const handleAutoNextTrailer = async () => {
    if (!autoplayEnabled || isTransitioning || loadingNext) return;
    
    console.log('Auto transitioning to next trailer');
    setIsTransitioning(true);
    setLoadingNext(true);
    
    try {
      const nextTrailer = await getNextTrailer();
      if (nextTrailer) {
        incrementTrailerCount();
        // O useEffect vai detectar a mudança e recriar o player
      } else {
        throw new Error('No trailer found');
      }
    } catch (error) {
      console.error('Error loading next trailer:', error);
      setIsTransitioning(false);
      setLoadingNext(false);
      toast.error('Erro ao carregar próximo trailer');
    } finally {
      setLoadingNext(false);
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
    if (loadingNext || isTransitioning) return;
    
    console.log('Manually loading next trailer');
    setLoadingNext(true);
    setIsTransitioning(true);
    
    try {
      const nextTrailer = await getNextTrailer();
      if (nextTrailer) {
        incrementTrailerCount();
        // O useEffect vai detectar a mudança e recriar o player
      }
    } catch (error) {
      console.error('Error loading next trailer:', error);
      toast.error('Erro ao carregar próximo trailer');
    } finally {
      setLoadingNext(false);
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
    console.log('Closing modal, cleaning up player');
    cleanupPlayer();
    
    setIsPlaying(false);
    setIsTransitioning(false);
    setLoadingNext(false);
    setApiReady(false);
    setVideoKey(0);
    setPlayerLoading(false);
    currentTrailerIdRef.current = '';
    onOpenChange(false);
  };

  // Loading state durante carregamento ou transição
  const showLoading = isLoading || loadingNext || playerLoading || isTransitioning;

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
            {showLoading ? (
              <div className="aspect-video bg-secondary/20 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    {isLoading ? 'Carregando trailer...' : 
                     playerLoading ? 'Inicializando player...' :
                     'Buscando próximo trailer...'}
                  </p>
                </div>
              </div>
            ) : currentTrailer ? (
              <div className="aspect-video relative">
                {/* Container para YouTube Player com key única */}
                <div 
                  key={`player-container-${videoKey}`}
                  ref={playerContainerRef}
                  className="w-full h-full rounded-lg overflow-hidden bg-black"
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
              disabled={!currentTrailer || showLoading}
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
              disabled={showLoading}
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
