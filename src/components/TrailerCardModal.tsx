import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader, ExternalLink, Film, Tv } from 'lucide-react';
import { toast } from 'sonner';
import { TrailerActionButtons } from '@/components/TrailerActionButtons';

interface TrailerCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId?: number;
  tvShowId?: number;
  title: string;
  type: 'movie' | 'tv';
}

declare global {
  interface Window {
    YT: any;
  }
}

export const TrailerCardModal: React.FC<TrailerCardModalProps> = ({
  open,
  onOpenChange,
  movieId,
  tvShowId,
  title,
  type,
}) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [useYTPlayer, setUseYTPlayer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [noTrailer, setNoTrailer] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const originalUrlRef = useRef<string>('');
  const isClosingRef = useRef<boolean>(false);

  // Salvar URL atual quando modal abre e bloquear navegação
  useEffect(() => {
    if (open) {
      // Resetar flag de fechamento quando modal abre
      isClosingRef.current = false;
      originalUrlRef.current =
        window.location.pathname + window.location.search;
      console.log('📍 URL salva:', originalUrlRef.current);

      // Bloquear QUALQUER tentativa de navegação
      const blockNavigation = (e: Event) => {
        console.log('🚫 Tentativa de navegação bloqueada!');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      };

      // Bloquear cliques em elementos abaixo do modal quando está fechando
      const blockClicks = (e: MouseEvent) => {
        if (isClosingRef.current) {
          console.log('🚫 Clique bloqueado durante fechamento do modal');
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      };

      // Interceptar eventos de navegação
      window.addEventListener('popstate', blockNavigation, true);
      
      // Bloquear cliques durante o fechamento
      document.addEventListener('click', blockClicks, true);
      document.addEventListener('mousedown', blockClicks, true);

      // Monitorar mudanças de URL
      const checkUrl = () => {
        const currentUrl = window.location.pathname + window.location.search;
        if (currentUrl !== originalUrlRef.current) {
          console.log('⚠️ URL mudou! Restaurando:', originalUrlRef.current);
          navigate(originalUrlRef.current, { replace: true });
        }
      };

      const intervalId = setInterval(checkUrl, 50);

      return () => {
        window.removeEventListener('popstate', blockNavigation, true);
        document.removeEventListener('click', blockClicks, true);
        document.removeEventListener('mousedown', blockClicks, true);
        clearInterval(intervalId);
      };
    }
  }, [open, navigate]);

  // Carregar YouTube Player API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        setUseYTPlayer(true);
      };
    } else {
      setUseYTPlayer(true);
    }
  }, []);

  // Buscar trailer quando modal abrir
  useEffect(() => {
    if (open && (movieId || tvShowId)) {
      fetchTrailer();
    }
  }, [open, movieId, tvShowId]);

  // Criar player quando trailer estiver disponível
  useEffect(() => {
    // Não fazer nada se o modal não estiver aberto
    if (!open) {
      return;
    }

    console.log('🔍 useEffect player - Verificando:', {
      open,
      useYTPlayer,
      hasContainer: !!playerContainerRef.current,
      trailerKey,
      noTrailer,
    });

    if (!useYTPlayer || !trailerKey || noTrailer) {
      console.log('⏸️ Condições não atendidas para criar player');
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;

    // Aguardar o container estar disponível no DOM
    const checkAndCreatePlayer = () => {
      if (!playerContainerRef.current) {
        console.log('⏳ Container ainda não disponível, aguardando...');
        timeoutId = setTimeout(checkAndCreatePlayer, 50);
        return;
      }

      console.log('🎬 Criando YouTube Player para:', title, 'Key:', trailerKey);

      // Limpar player anterior se existir
      if (playerRef.current) {
        try {
          console.log('🗑️ Destruindo player anterior');
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.log('Erro ao destruir player anterior:', error);
        }
      }

      // Limpar container
      playerContainerRef.current.innerHTML = '';

      // Criar div para o player
      const playerDiv = document.createElement('div');
      playerDiv.id = 'trailer-card-player';
      playerContainerRef.current.appendChild(playerDiv);

      console.log('📺 Inicializando player YouTube...');

      try {
        playerRef.current = new window.YT.Player('trailer-card-player', {
          height: '100%',
          width: '100%',
          videoId: trailerKey,
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
            enablejsapi: 1,
          },
          events: {
            onReady: () => {
              console.log('✅ Player pronto:', title);
              setIsPlaying(true);
              setIsLoading(false);
            },
            onStateChange: (event: any) => {
              console.log('🎵 Estado mudou:', event.data);
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
            onError: (event: any) => {
              console.log('❌ Erro ao carregar vídeo, código:', event.data);
              toast.error('Erro ao carregar o trailer');
              setNoTrailer(true);
              setIsLoading(false);
            },
          },
        });
      } catch (error) {
        console.error('❌ Erro ao criar player:', error);
        setNoTrailer(true);
        setIsLoading(false);
      }
    };

    // Iniciar verificação
    checkAndCreatePlayer();

    // Cleanup: cancelar timeout se o componente desmontar ou modal fechar
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [open, useYTPlayer, trailerKey, noTrailer, title]);

  const fetchTrailer = async () => {
    setIsLoading(true);
    setNoTrailer(false);
    setTrailerKey(null);

    try {
      const id = movieId || tvShowId;
      const endpoint = type === 'movie' ? 'movie' : 'tv';

      console.log(`🎬 Buscando trailer para ${type}: ${title} (ID: ${id})`);

      const response = await fetch(
        `https://api.themoviedb.org/3/${endpoint}/${id}/videos?api_key=${localStorage.getItem(
          'tmdb_api_key'
        )}&language=pt-BR`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const trailers = data.results.filter(
          (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        );

        if (trailers.length > 0) {
          console.log('✅ Trailer encontrado:', trailers[0].name);
          setTrailerKey(trailers[0].key);
          setNoTrailer(false);
        } else {
          console.log('❌ Nenhum trailer encontrado');
          setNoTrailer(true);
          setIsLoading(false);
        }
      } else {
        console.log('❌ Nenhum vídeo encontrado');
        setNoTrailer(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar trailer:', error);
      setNoTrailer(true);
      setIsLoading(false);
    }
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleMovieDetails = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const route = type === 'tv' ? `/serie/${tvShowId}` : `/filme/${movieId}`;
    navigate(route);
  };

  const handleModalClose = (e?: React.MouseEvent | React.KeyboardEvent) => {
    // Bloquear propagação do evento imediatamente
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Marcar como fechando imediatamente para bloquear eventos
    isClosingRef.current = true;
    
    console.log('🚪 Iniciando fechamento do modal');
    setIsClosing(true);
    setIsPlaying(false);

    // Garantir que estamos na URL original
    const currentUrl = window.location.pathname + window.location.search;
    if (originalUrlRef.current && currentUrl !== originalUrlRef.current) {
      console.log('🔄 Restaurando URL original:', originalUrlRef.current);
      navigate(originalUrlRef.current, { replace: true });
    }

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
      } catch (error) {
        console.log('Error destroying player:', error);
      }
    }

    // Resetar estados
    setTrailerKey(null);
    setNoTrailer(false);
    setIsLoading(true);

    // Aguardar um pouco antes de fechar para garantir que todos os eventos foram bloqueados
    setTimeout(() => {
      console.log('✅ Fechando modal agora');
      onOpenChange(false);
      setIsClosing(false);
      isClosingRef.current = false;
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleModalClose();
      }
    }} modal={true}>
      <DialogContent
        className="max-w-5xl w-full max-h-[90vh] bg-gradient-cinema border-primary/20"
        onEscapeKeyDown={(e) => handleModalClose(e as any)}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleModalClose(e as any);
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleModalClose(e as any);
        }}
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
              <Play className="w-6 h-6" />
              {title}
            </DialogTitle>
            <div className="flex items-center gap-3">
              {type === 'tv' ? (
                <Tv className="w-5 h-5 text-blue-400" />
              ) : (
                <Film className="w-5 h-5 text-orange-400" />
              )}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleModalClose();
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                size="sm"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {/* Container do player - sempre presente */}
            <div ref={playerContainerRef} className="w-full h-full" />

            {/* Loading overlay */}
            {isLoading && !noTrailer && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Carregando trailer...
                  </p>
                </div>
              </div>
            )}

            {/* No trailer overlay */}
            {noTrailer && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="text-center p-8">
                  <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Trailer não disponível
                  </h3>
                  <p className="text-muted-foreground">
                    Desculpe, não encontramos nenhum trailer disponível para "
                    {title}".
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls & Actions */}
          {!noTrailer && (
            <div className="flex items-center justify-center gap-4">
              {/* Buttons */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={(e) => handlePlayPause(e)}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-9 h-9"
                  disabled={isLoading}
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                {/* Action Buttons */}
                {(movieId || tvShowId) && (
                  <TrailerActionButtons
                    id={movieId || tvShowId || 0}
                    title={title}
                    type={type}
                    className="contents"
                  />
                )}

                <Button
                  onClick={(e) => handleMovieDetails(e)}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-9 h-9"
                  title="Ver Detalhes"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {noTrailer && (
            <div className="flex justify-end">
              <Button
                onClick={(e) => handleMovieDetails(e)}
                variant="default"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Ver Detalhes do {type === 'tv' ? 'Série' : 'Filme'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
