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
} from 'lucide-react';
import { useTrailers } from '@/hooks/useTrailers';
import { toast } from 'sonner';
import { TrailerActionButtons } from '@/components/TrailerActionButtons';

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
  const isLoadingRef = useRef(false); // Prevenir múltiplas chamadas simultâneas

  // Função para trocar vídeo sem destruir o player (mantém tela cheia)
  const loadVideoInPlayer = (videoId: string) => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      console.log('🔄 Carregando novo vídeo no player existente:', videoId);
      try {
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: 0,
          suggestedQuality: 'default',
        });

        // Garantir que não apareçam vídeos relacionados após carregar
        setTimeout(() => {
          if (playerRef.current && playerRef.current.setOption) {
            playerRef.current.setOption('rel', 0);
          }
        }, 100);

        setIsPlaying(true);
      } catch (error) {
        console.error('Erro ao carregar vídeo:', error);
        // Fallback: tentar método simples
        try {
          playerRef.current.loadVideoById(videoId);
          setIsPlaying(true);
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
      }
    } else {
      console.log('❌ Player não está pronto para carregar vídeo');
    }
  };

  // Funções de carregamento de trailer (definidas antes dos useEffects)
  const loadRandomTrailer = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('⏸️ Já está carregando um trailer, ignorando chamada');
      return;
    }

    isLoadingRef.current = true;
    let attempts = 0;
    const maxAttempts = 3;

    const tryLoad = async (): Promise<void> => {
      attempts++;
      console.log(
        `⏳ Carregamento inicial - Tentativa ${attempts}/${maxAttempts}`
      );

      try {
        const trailer = await getRandomTrailer();

        if (trailer) {
          console.log('✅ Trailer carregado com sucesso');
          isLoadingRef.current = false;
          return;
        }

        // Se não encontrou trailer e ainda há tentativas
        if (attempts < maxAttempts) {
          console.log('🔄 Tentando novamente em 500ms...');
          await new Promise((resolve) => setTimeout(resolve, 500));
          await tryLoad();
        } else {
          // Esgotaram as tentativas
          console.error('❌ Não foi possível encontrar trailers');
          toast.error(
            'Não foi possível encontrar trailers disponíveis no momento.'
          );
          isLoadingRef.current = false;
        }
      } catch (error) {
        console.error('❌ Erro ao carregar trailer:', error);
        isLoadingRef.current = false;
        toast.error('Erro ao carregar trailer');
      }
    };

    await tryLoad();
  }, [getRandomTrailer]);

  const handleNextTrailer = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('⏸️ Já está carregando, ignorando clique');
      return;
    }

    isLoadingRef.current = true;
    setLoadingNext(true);
    setIsTransitioning(true);

    console.log('⏭️ Buscando próximo trailer...');

    // Tentar encontrar um trailer válido (até 3 tentativas)
    let attempts = 0;
    const maxAttempts = 3;

    const tryLoadTrailer = async (): Promise<void> => {
      attempts++;
      console.log(`⏳ Tentativa ${attempts}/${maxAttempts}`);

      try {
        const trailer = await getRandomTrailer();

        if (trailer) {
          console.log('✅ Próximo trailer encontrado:', trailer.movieTitle);
          setLoadingNext(false);
          setIsTransitioning(false);
          isLoadingRef.current = false;
          return;
        }

        // Se não encontrou trailer e ainda há tentativas
        if (attempts < maxAttempts) {
          console.log('🔄 Tentando novamente em 500ms...');
          await new Promise((resolve) => setTimeout(resolve, 500));
          await tryLoadTrailer();
        } else {
          console.error('❌ Não foi possível encontrar próximo trailer');
          toast.error(
            'Não foi possível encontrar trailers disponíveis no momento.'
          );
          setLoadingNext(false);
          setIsTransitioning(false);
          isLoadingRef.current = false;
        }
      } catch (error) {
        console.error('❌ Erro ao buscar próximo trailer:', error);
        setLoadingNext(false);
        setIsTransitioning(false);
        isLoadingRef.current = false;
        toast.error('Erro ao carregar próximo trailer');
      }
    };

    await tryLoadTrailer();
  }, [getRandomTrailer]);

  // Carregar YouTube Player API (otimizado)
  useEffect(() => {
    if (!window.YT) {
      console.log('📦 Carregando YouTube IFrame API...');
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true; // Carregar de forma assíncrona
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        console.log('✅ YouTube IFrame API carregada');
        setUseYTPlayer(true);
      };
    } else {
      console.log('✅ YouTube IFrame API já disponível');
      setUseYTPlayer(true);
    }
  }, []);

  // Inicializar player quando modal abre e API está pronta
  useEffect(() => {
    if (open && !currentTrailer && useYTPlayer && !isLoadingRef.current) {
      console.log('🚀 Modal aberto, iniciando carregamento de trailer');
      loadRandomTrailer();
    }
  }, [open, useYTPlayer, currentTrailer, loadRandomTrailer]);

  // Limpar estado ao fechar modal
  useEffect(() => {
    if (!open) {
      isLoadingRef.current = false;
    }
  }, [open]);

  // Criar YouTube Player quando tiver trailer disponível
  useEffect(() => {
    if (
      useYTPlayer &&
      playerContainerRef.current &&
      !playerRef.current &&
      currentTrailer
    ) {
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

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: currentTrailer.key,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0, // Não mostrar vídeos relacionados
          showinfo: 0, // Não mostrar informações do vídeo
          fs: 1, // Permitir tela cheia
          cc_load_policy: 0, // Não carregar legendas automaticamente
          iv_load_policy: 3, // Não mostrar anotações
          origin: window.location.origin,
          playsinline: 1, // Reproduzir inline em dispositivos móveis
          widget_referrer: window.location.origin,
          enablejsapi: 1, // Habilitar API JavaScript
          disablekb: 0, // Manter controles de teclado
          end: 0, // Não definir tempo de fim (evita tela de vídeos relacionados)
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
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              // Pular imediatamente para o próximo trailer sem mostrar vídeos relacionados
              console.log('🔚 Trailer terminou, carregando próximo...');
              setTimeout(() => {
                handleNextTrailer();
              }, 100); // Pequeno delay para evitar conflitos
            }
          },
          onError: () => {
            console.log('YouTube player error - vídeo indisponível');
            toast.error('Vídeo indisponível, carregando próximo trailer...');
            handleNextTrailer();
          },
        },
      });
    }
  }, [useYTPlayer, currentTrailer, handleNextTrailer]);

  // Carregar novo vídeo quando currentTrailer mudar (apenas se player já existe)
  useEffect(() => {
    if (
      currentTrailer &&
      playerRef.current &&
      playerRef.current.loadVideoById &&
      playerRef.current.getVideoData &&
      playerRef.current.getVideoData().video_id !== currentTrailer.key
    ) {
      console.log('🔄 Carregando novo trailer:', currentTrailer.movieTitle);
      loadVideoInPlayer(currentTrailer.key);
    }
  }, [currentTrailer, loadVideoInPlayer]);

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
              <Play className="w-6 h-6" />
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
