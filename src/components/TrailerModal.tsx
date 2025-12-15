import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Star,
} from 'lucide-react';
import { useTrailers } from '@/hooks/useTrailers';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { toast } from 'sonner';
import { TrailerActionButtons } from '@/components/TrailerActionButtons';
import { useStreamingProvider } from '@/hooks/useStreamingProvider';

interface TrailerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters?: { startDate: string; endDate: string; label: string };
}

declare global {
  interface Window {
    YT: any;
  }
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  open,
  onOpenChange,
  filters,
}) => {
  const navigate = useNavigate();
  const {
    getRandomTrailer,
    currentTrailer,
    isLoading,
    currentCategory,
    setCurrentTrailer,
  } = useTrailers();
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [useYTPlayer, setUseYTPlayer] = useState(false);
  
  const { logoPath: streamingLogo, providerName: streamingProviderName } = useStreamingProvider(
    currentTrailer?.movieId,
    currentTrailer?.contentType
  );

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false); // Prevenir múltiplas chamadas simultâneas

  // Função para trocar vídeo sem destruir o player (mantém tela cheia)
  const loadVideoInPlayer = useCallback((videoId: string) => {
    // Verificações de segurança
    if (!playerRef.current) {
      console.log('❌ Player não existe');
      return;
    }

    if (
      !playerRef.current.loadVideoById ||
      typeof playerRef.current.loadVideoById !== 'function'
    ) {
      console.log('❌ Player não está pronto para carregar vídeo');
      return;
    }

    console.log('🔄 Carregando novo vídeo no player existente:', videoId);

    try {
      playerRef.current.loadVideoById({
        videoId: videoId,
        startSeconds: 0,
        suggestedQuality: 'default',
      });

      // Garantir que não apareçam vídeos relacionados após carregar
      setTimeout(() => {
        if (
          playerRef.current &&
          playerRef.current.setOption &&
          typeof playerRef.current.setOption === 'function'
        ) {
          try {
            playerRef.current.setOption('rel', 0);
          } catch (e) {
            console.log('⚠️ Não foi possível definir opção rel');
          }
        }
      }, 100);

      setIsPlaying(true);
    } catch (error) {
      console.error('❌ Erro ao carregar vídeo:', error);

      // Fallback: tentar método simples
      try {
        if (playerRef.current && playerRef.current.loadVideoById) {
          playerRef.current.loadVideoById(videoId);
          setIsPlaying(true);
        }
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError);
        toast.error('Erro ao carregar vídeo. Tente novamente.');
      }
    }
  }, []);

  // Funções de carregamento de trailer (definidas antes dos useEffects)
  const loadRandomTrailer = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    
    try {
      const trailer = await getRandomTrailer(filters);

      if (trailer) {
        isLoadingRef.current = false;
        return;
      }

      // Se não encontrou trailer
      console.error('❌ Não foi possível encontrar trailers');
      toast.error(
        'Não foi possível encontrar trailers disponíveis no momento.'
      );
      isLoadingRef.current = false;
    } catch (error) {
      console.error('❌ Erro ao carregar trailer:', error);
      isLoadingRef.current = false;
      toast.error('Erro ao carregar trailer');
    }
  }, [getRandomTrailer, filters]);

  const handleNextTrailer = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoadingNext(true);
    setIsTransitioning(true);

    try {
      const trailer = await getRandomTrailer(filters);

      if (trailer) {
        setLoadingNext(false);
        setIsTransitioning(false);
        isLoadingRef.current = false;
        return;
      }

      console.error('❌ Não foi possível encontrar próximo trailer');
      toast.error(
        'Não foi possível encontrar trailers disponíveis no momento.'
      );
      setLoadingNext(false);
      setIsTransitioning(false);
      isLoadingRef.current = false;
    } catch (error) {
      console.error('❌ Erro ao buscar próximo trailer:', error);
      setLoadingNext(false);
      setIsTransitioning(false);
      isLoadingRef.current = false;
      toast.error('Erro ao carregar próximo trailer');
    }
  }, [getRandomTrailer, filters]);

  // Carregar YouTube Player API (otimizado)
  const { isReady: isYTReady } = useYouTubePlayer();

  useEffect(() => {
    if (isYTReady) {
      console.log('✅ YouTube Player API disponível via hook');
      setUseYTPlayer(true);
    }
  }, [isYTReady]);

  const initialLoadDone = useRef(false);

  // Inicializar player quando modal abre e API está pronta
  useEffect(() => {
    console.log('🔍 useEffect inicialização:', {
      open,
      useYTPlayer,
      isLoading: isLoadingRef.current,
      hasPlayer: !!playerRef.current,
      hasTrailer: !!currentTrailer,
      initialLoadDone: initialLoadDone.current
    });

    // Só carregar quando modal ABRE (não quando fecha)
    if (open && useYTPlayer && !isLoadingRef.current && !initialLoadDone.current) {
      console.log('🚀 Modal aberto, carregando novo trailer');
      // Resetar contador de erros ao abrir
      consecutiveErrors.current = 0;
      // Marcar que já iniciou o carregamento para esta sessão
      initialLoadDone.current = true;
      // Sempre carregar um novo trailer ao abrir
      loadRandomTrailer();
    } else {
      if (!open) {
         console.log('⏸️ Modal fechado');
         initialLoadDone.current = false; // Resetar para próxima abertura
      }
      if (!useYTPlayer) console.log('⏸️ YouTube API não pronta');
      if (isLoadingRef.current) console.log('⏸️ Já está carregando');
      if (initialLoadDone.current && open) console.log('⏸️ Já carregou trailer inicial');
    }
  }, [open, useYTPlayer, loadRandomTrailer]);

  // Remover dependência de currentTrailer para evitar re-execuções

  // Limpar estado ao fechar modal
  useEffect(() => {
    if (!open) {
      console.log('🧹 Modal fechado, limpando estado');
      isLoadingRef.current = false;
      setCurrentTrailer(null);

      // Garantir que o player seja destruído
      if (playerRef.current) {
        try {
          console.log('🗑️ Destruindo player no useEffect de fechamento');
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.error('❌ Erro ao destruir player:', error);
          // Forçar null mesmo com erro
          playerRef.current = null;
        }
      }
    }
  }, [open, setCurrentTrailer]);

  const consecutiveErrors = useRef(0);
  const startTimeRef = useRef<number>(0);
  const hasPlayedRef = useRef(false);

  // Criar YouTube Player quando tiver trailer disponível
  useEffect(() => {
    if (!useYTPlayer || !playerContainerRef.current || !currentTrailer) {
      return;
    }

    // Se já existe um player, apenas carregar o novo vídeo
    if (playerRef.current) {
      // Verificar se o player está pronto
      if (
        playerRef.current.loadVideoById &&
        typeof playerRef.current.loadVideoById === 'function'
      ) {
        // Verificar se é o mesmo vídeo
        try {
          const videoData = playerRef.current.getVideoData?.();
          if (videoData && videoData.video_id === currentTrailer.key) {
            console.log('⏸️ Vídeo já está carregado:', currentTrailer.key);
            return;
          }
        } catch (e) {
          // Ignorar erro
        }

        console.log('🔄 Reutilizando player para:', currentTrailer.movieTitle);
        hasPlayedRef.current = false; // Resetar flag de reprodução
        loadVideoInPlayer(currentTrailer.key);
      }
      return;
    }

    // Se não existe, criar um novo
    console.log(
      '🎬 Criando YouTube Player com trailer:',
      currentTrailer.movieTitle
    );

    // Limpar conteúdo anterior
    playerContainerRef.current.innerHTML = '';

    // Criar div para o player
    const playerDiv = document.createElement('div');
    playerDiv.id = 'youtube-player';
    playerContainerRef.current.appendChild(playerDiv);

    hasPlayedRef.current = false; // Resetar flag de reprodução

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: currentTrailer.key,
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 1,
        cc_load_policy: 0,
        iv_load_policy: 3,
        origin: window.location.origin,
        playsinline: 1,
        widget_referrer: window.location.origin,
        enablejsapi: 1,
        disablekb: 0,
        end: 0,
      },
      events: {
        onReady: () => {
          console.log(
            '🎬 YouTube player ready com vídeo:',
            currentTrailer.movieTitle
          );
          setIsPlaying(true);
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            // Registrar tempo de início e marcar que tocou
            startTimeRef.current = Date.now();
            hasPlayedRef.current = true;
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            console.log('🔚 Trailer terminou.');
            
            // Verificar se o vídeo chegou a tocar
            if (!hasPlayedRef.current) {
               console.log('⚠️ Vídeo terminou sem nunca tocar (erro de bloqueio)');
               consecutiveErrors.current += 1;
            } else {
               // Verificar tempo de reprodução
               const playDuration = Date.now() - startTimeRef.current;
               console.log(`⏱️ Duração da reprodução: ${playDuration}ms`);

               if (playDuration < 5000) {
                  // Se tocou menos de 5 segundos, considerar erro/skip
                  console.log('⚠️ Vídeo terminou muito rápido (possível erro/bloqueio)');
                  consecutiveErrors.current += 1;
               } else {
                  // Sucesso real, resetar erros
                  consecutiveErrors.current = 0;
               }
            }

            if (consecutiveErrors.current >= 3) {
               console.log('🛑 Muitos erros consecutivos, parando.');
               toast.error('Muitos vídeos indisponíveis. Tente outra categoria.');
               setIsPlaying(false);
               return;
            }

            console.log('⏭️ Carregando próximo...');
            setTimeout(() => {
              handleNextTrailer();
            }, 100);
          }
        },
        onError: () => {
          console.log('YouTube player error - vídeo indisponível');
          
          consecutiveErrors.current += 1;
          console.log(`⚠️ Erro consecutivo #${consecutiveErrors.current}`);

          if (consecutiveErrors.current >= 3) {
             console.log('🛑 Muitos erros consecutivos, parando.');
             toast.error('Muitos vídeos indisponíveis. Tente outra categoria.');
             setIsPlaying(false);
             return;
          }

          toast.error('Vídeo indisponível, tentando próximo em 2s...');
          
          // Delay para evitar loop rápido
          setTimeout(() => {
            handleNextTrailer();
          }, 2000);
        },
      },
    });
  }, [useYTPlayer, currentTrailer, handleNextTrailer, loadVideoInPlayer]);

  // Remover o useEffect antigo que tentava carregar vídeo separadamente
  // (O bloco acima agora lida com criação E atualização)

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

  const handleModalClose = useCallback(() => {
    console.log('🚪 Fechando modal de trailers');
    setIsPlaying(false);
    isLoadingRef.current = false;

    // Destruir player ao fechar modal
    if (playerRef.current) {
      try {
        console.log('🗑️ Destruindo player do YouTube');
        playerRef.current.destroy();
        playerRef.current = null;
      } catch (error) {
        console.error('❌ Erro ao destruir player:', error);
      }
    }

    onOpenChange(false);
  }, [onOpenChange]);

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
              {streamingLogo ? (
                <img
                  key={streamingLogo} // Force re-render to trigger animation
                  src={streamingLogo}
                  alt={streamingProviderName || 'Streaming Service'}
                  className="w-8 h-8 object-contain rounded-md animate-flip"
                  title={`Disponível em ${streamingProviderName}`}
                />
              ) : (
                <Play className="w-6 h-6" />
              )}
              {getFormattedTitle()}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {currentTrailer?.contentType === 'tv' ? (
                <Tv className="w-5 h-5 text-blue-400" />
              ) : (
                <Film className="w-5 h-5 text-orange-400" />
              )}
              {currentTrailer && (
                <Badge variant="secondary" className="text-xs">
                  {currentTrailer.contentType === 'tv' ? 'Série' : 'Filme'}
                </Badge>
              )}
              {currentCategory && (
                <Badge variant="secondary" className="text-xs">
                  {currentCategory}
                </Badge>
              )}
              {currentTrailer?.vote_average !== undefined && currentTrailer.vote_average > 0 && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {currentTrailer.vote_average.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {/* Container do player - sempre presente */}
            <div ref={playerContainerRef} className="w-full h-full" />

            {/* Loading overlay */}
            {showLoadingState && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                <div className="text-center space-y-3">
                  <Loader className="w-10 h-10 animate-spin mx-auto text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {loadingNext
                        ? 'Carregando próximo trailer...'
                        : 'Buscando trailer...'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentCategory || 'Aguarde um momento'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Controls & Actions */}
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9"
                disabled={showLoadingState}
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button
                onClick={handleNextTrailer}
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9"
                disabled={showLoadingState}
                title="Próximo Trailer"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Action Buttons */}
              {currentTrailer && (
                <TrailerActionButtons
                  id={currentTrailer.movieId}
                  title={currentTrailer.movieTitle}
                  type={currentTrailer.contentType}
                  poster_path={currentTrailer.poster_path}
                  release_date={currentTrailer.release_date}
                  first_air_date={currentTrailer.first_air_date}
                  vote_average={currentTrailer.vote_average}
                  genre_ids={currentTrailer.genre_ids}
                  className="contents"
                />
              )}

              <Button
                onClick={handleMovieDetails}
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9"
                disabled={!currentTrailer}
                title="Ver Detalhes"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
