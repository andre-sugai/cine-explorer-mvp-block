import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Swords,
  RefreshCw,
  X,
  Star,
  Crown,
  Loader,
  Tv,
  Film,
  Sparkles,
  EyeOff,
  Plus,
} from 'lucide-react';
import { buildImageUrl, getWatchProviders, getAllGenres, TMDBMovie } from '@/utils/tmdb';
import { filterAdultContent } from '@/utils/adultContentFilter';
import confetti from 'canvas-confetti';
import { MovieCardActions } from './MovieCardActions';
import { ArenaSearchModal } from './ArenaSearchModal';
import { Search } from 'lucide-react';
import { useSettingsContext } from '@/context/SettingsContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { Checkbox } from '@/components/ui/checkbox';

interface ProviderOption {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

interface GenreOption {
  id: number;
  name: string;
}

export const ModalArena: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { settings } = useSettingsContext();
  const { watched } = useWatchedContext();
  const [moviesCount, setMoviesCount] = useState<number>(2);
  const [movies, setMovies] = useState<(TMDBMovie | null)[]>([null, null]);
  const moviesRef = useRef<(TMDBMovie | null)[]>(movies);
  moviesRef.current = movies;
  const [loadingSlots, setLoadingSlots] = useState<boolean[]>([false, false]);
  const [winnerId, setWinnerId] = useState<number | null>(null);

  // Controle do modal de busca manual
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [currentSlotToEdit, setCurrentSlotToEdit] = useState<number | null>(null);

  // Filtros
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [hideWatched, setHideWatched] = useState(false);

  // Opções para filtros
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [providers, setProviders] = useState<ProviderOption[]>([]);

  // Carregar opções de filtros ao abrir o modal
  useEffect(() => {
    if (open) {
      // Carregar Gêneros
      getAllGenres().then((data) => {
        setGenres(data);
      }).catch(console.error);

      // Carregar Provedores de Streaming
      getWatchProviders('BR').then((data) => {
        // Filtrar e desduplicar como feito no SearchSection
        const deduplicated = data.filter((provider: any) => {
          const name = provider.provider_name.toLowerCase();
          if (name.includes('with ads') || name.includes('basic with ads')) return false;
          if (name.includes(' channel')) return false;
          if (provider.provider_id === 10 && name.includes('amazon video')) return false;
          if (provider.provider_id === 2 && name === 'apple tv') return false;
          return true;
        });
        setProviders(deduplicated);
      }).catch(console.error);
    }
  }, [open]);

  // Função robusta de busca de filme aleatório com filtros
  const fetchRandomMovie = async (excludeIds: number[], retries = 3): Promise<TMDBMovie | null> => {
    const apiKey = localStorage.getItem('tmdb_api_key');
    if (!apiKey) return null;

    const params: Record<string, string> = {
      api_key: apiKey,
      language: 'pt-BR',
      include_adult: 'false',
      sort_by: 'popularity.desc',
      page: '1',
    };

    if (selectedGenre) params.with_genres = selectedGenre;
    if (selectedProvider) {
      if (selectedProvider === 'my_streamings') {
        const myStreamings = settings.my_streamings || [];
        if (myStreamings.length > 0) {
          params.with_watch_providers = myStreamings.join('|');
        }
      } else {
        params.with_watch_providers = selectedProvider;
      }
      params.watch_region = 'BR';
    }

    const buildUrl = (p: Record<string, string>) => {
      const u = new URL('https://api.themoviedb.org/3/discover/movie');
      Object.entries(p).forEach(([key, val]) => u.searchParams.append(key, val));
      return u.toString();
    };

    try {
      let res = await fetch(buildUrl(params));
      if (!res.ok) return null;
      let data = await res.json();
      let results = filterAdultContent(data.results || []);

      const totalPages = data.total_pages || 1;

      // Escolher uma página aleatória entre 1 e o máximo de 10 para trazer variedade
      if (totalPages > 1) {
        const randomPage = Math.floor(Math.random() * Math.min(totalPages, 10)) + 1;
        if (randomPage > 1) {
          params.page = randomPage.toString();
          res = await fetch(buildUrl(params));
          if (res.ok) {
            const randData = await res.json();
            results = filterAdultContent(randData.results || []);
          }
        }
      }

      // Filtrar itens sem pôster e duplicatas atuais (ou assistidos)
      const available = results.filter(
        (m: TMDBMovie) => m.poster_path && !excludeIds.includes(m.id)
      );

      if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
      } 
      
      // Se não sobrou nenhum filme disponível na página sorteada, tentar novamente (até 3 vezes)
      if (retries > 0 && totalPages > 1) {
        return fetchRandomMovie(excludeIds, retries - 1);
      } else if (results.length > 0) {
        // Último fallback: retornar algo mesmo que esteja nos excludeIds (melhor que nada se for a última tentativa)
        const withPoster = results.filter((m: TMDBMovie) => m.poster_path);
        return withPoster.length > 0 ? withPoster[0] : results[0];
      }

      return null;
    } catch (e) {
      console.error('Erro ao buscar filme randômico:', e);
      return null;
    }
  };

  // Helper para pegar os IDs a excluir
  const getExcludeIds = (currentMovies: (TMDBMovie | null)[], excludeIndex?: number) => {
    let excludeIds = currentMovies
      .filter((m, i) => m !== null && i !== excludeIndex)
      .map((m) => m!.id);
      
    if (hideWatched) {
      const watchedIds = watched.filter(w => w.type === 'movie').map(w => w.id);
      excludeIds = [...excludeIds, ...watchedIds];
    }
    return excludeIds;
  };

  // Carregar um filme específico para um slot
  const loadSlot = async (index: number, currentMovies: (TMDBMovie | null)[]) => {
    setLoadingSlots((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    const excludeIds = getExcludeIds(currentMovies, index);
    const movie = await fetchRandomMovie(excludeIds);

    setMovies((prev) => {
      const next = [...prev];
      // Se o filme antigo do slot for o vencedor, remover o status de vencedor
      if (next[index]?.id === winnerId) {
        setWinnerId(null);
      }
      next[index] = movie;
      moviesRef.current = next;
      return next;
    });

    setLoadingSlots((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  const handleManualMovieSelect = (movie: TMDBMovie) => {
    if (currentSlotToEdit === null) return;
    
    setMovies((prev) => {
      const next = [...prev];
      if (next[currentSlotToEdit]?.id === winnerId) {
        setWinnerId(null);
      }
      next[currentSlotToEdit] = movie;
      moviesRef.current = next;
      return next;
    });
  };

  // Carregar todos os slots ativos de uma vez
  const loadAllSlots = async (targetCount = moviesCount) => {
    setWinnerId(null);
    setLoadingSlots(Array(targetCount).fill(true));

    const activeSlotsCount = targetCount;
    const tempMovies: (TMDBMovie | null)[] = Array(activeSlotsCount).fill(null);

    for (let i = 0; i < activeSlotsCount; i++) {
      const excludeIds = getExcludeIds(tempMovies);
      const movie = await fetchRandomMovie(excludeIds);
      tempMovies[i] = movie;
    }

    moviesRef.current = tempMovies;
    setMovies(tempMovies);
    setLoadingSlots(Array(activeSlotsCount).fill(false));
  };

  // Alterar quantidade de cards preservando os já sorteados quando aumentar
  const handleChangeMoviesCount = async (newCount: number) => {
    if (newCount === moviesCount || newCount < 2) return;
    const prevCount = moviesCount;
    setMoviesCount(newCount);

    if (newCount < prevCount) {
      setMovies((prev) => {
        const sliced = prev.slice(0, newCount);
        moviesRef.current = sliced;
        if (winnerId && !sliced.some((m) => m?.id === winnerId)) {
          setWinnerId(null);
        }
        return sliced;
      });
      setLoadingSlots((prev) => prev.slice(0, newCount));
      return;
    }

    const addedCount = newCount - prevCount;
    setMovies((prev) => {
      const next = [...prev.slice(0, prevCount), ...Array(addedCount).fill(null)];
      moviesRef.current = next;
      return next;
    });
    setLoadingSlots((prev) => [
      ...prev.slice(0, prevCount),
      ...Array(addedCount).fill(true),
    ]);

    for (let i = prevCount; i < newCount; i++) {
      const excludeIds = getExcludeIds(moviesRef.current, i);
      const movie = await fetchRandomMovie(excludeIds);
      setMovies((prev) => {
        const next = [...prev];
        next[i] = movie;
        moviesRef.current = next;
        return next;
      });
      setLoadingSlots((prev) => {
        const next = [...prev];
        next[i] = false;
        return next;
      });
    }
  };

  const handleAddSlot = () => {
    handleChangeMoviesCount(moviesCount + 1);
  };

  // Carregar os filmes ao abrir o modal
  useEffect(() => {
    if (open) {
      loadAllSlots(moviesCount);
    }
  }, [open]);

  // Recarregar quando filtros forem alterados
  const handleApplyFilters = () => {
    loadAllSlots(moviesCount);
  };

  const handleSetWinner = (movieId: number, e: React.MouseEvent) => {
    setWinnerId(movieId);

    // Efeito de Confete
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { x, y },
      colors: ['#fbbf24', '#ffffff', '#a855f7'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 w-screen h-screen max-w-none max-h-none rounded-none 
                   bg-cinema-dark border-none shadow-none z-[9999] flex flex-col p-0 gap-0 
                   overflow-hidden select-none animate-fade-in"
      >
        {/* Header Superior Fixado */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b border-primary/10 bg-secondary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center shadow-glow">
              <Swords className="w-6 h-6 text-cinema-dark" />
            </div>
            <div>
              <DialogTitle className="text-xl md:text-2xl font-black text-primary flex items-center gap-2">
                Arena de Decisões
              </DialogTitle>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Escolha e eleja o melhor filme sugerido dentro de seus parâmetros favoritos!
              </p>
            </div>
          </div>

          {/* Configuração da Quantidade de Filmes e Ações */}
          <div className="flex items-center gap-3 pr-12">
            <span className="text-sm font-semibold text-muted-foreground mr-1 hidden md:inline">Comparar:</span>
            <div className="flex items-center bg-secondary/50 rounded-lg p-0.5 border border-primary/5">
              {([2, 3, 4] as const).map((count) => (
                <button
                  key={count}
                  onClick={() => handleChangeMoviesCount(count)}
                  className={`px-4 py-1.5 rounded-md font-bold text-xs sm:text-sm transition-all duration-200 ${
                    moviesCount === count
                      ? 'bg-gradient-gold text-cinema-dark shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {count} Filmes
                </button>
              ))}
              {moviesCount > 4 && (
                <span className="px-4 py-1.5 rounded-md font-bold text-xs sm:text-sm bg-gradient-gold text-cinema-dark shadow-md">
                  {moviesCount} Filmes
                </span>
              )}
              <button
                onClick={handleAddSlot}
                className="px-3 py-1.5 rounded-md font-bold text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 flex items-center justify-center"
                title="Adicionar mais um card"
                aria-label="Adicionar mais um card"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Botão de Fechar */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 p-2 rounded-lg opacity-70 hover:opacity-100 
                       transition-opacity focus:outline-none bg-secondary/20 hover:bg-secondary/40 
                       w-10 h-10 flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        {/* Barra de Filtros Rápidos (Horizontal) */}
        <div className="flex-shrink-0 bg-secondary/5 border-b border-primary/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Seletor de Streaming */}
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-primary" />
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-secondary/50 border border-primary/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Todos Streamings</option>
                {settings.my_streamings && settings.my_streamings.length > 0 && (
                  <option value="my_streamings" className="font-bold text-primary">★ Meus Streamings</option>
                )}
                {providers.map((p) => (
                  <option key={p.provider_id} value={p.provider_id}>
                    {p.provider_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Gêneros */}
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-primary" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-secondary/50 border border-primary/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Todos Gêneros</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox Ocultar Assistidos */}
            <div className="flex items-center gap-2">
              <Checkbox 
                id="hide-watched" 
                checked={hideWatched}
                onCheckedChange={(checked) => setHideWatched(!!checked)}
                className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-black"
              />
              <label 
                htmlFor="hide-watched" 
                className="text-sm cursor-pointer hover:text-primary flex items-center gap-1.5"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Ocultar assistidos
              </label>
            </div>

            {/* Botão Aplicar */}
            <Button
              size="sm"
              onClick={handleApplyFilters}
              className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 font-bold"
            >
              Aplicar Filtros
            </Button>
          </div>

          {/* Botão de Sortear Tudo */}
          <Button
            onClick={() => loadAllSlots(moviesCount)}
            className="bg-gradient-gold text-cinema-dark hover:opacity-90 font-bold gap-2 self-end shadow-glow"
          >
            <RefreshCw className="w-4 h-4" />
            Sortear Todos
          </Button>
        </div>

        {/* Gladiadores: Grid Principal preenchendo a tela */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col min-h-0 bg-gradient-cinema/20">
          <div
            className={`
              grid gap-4 md:gap-5 w-full mx-auto items-stretch my-auto
              ${moviesCount === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl h-full min-h-0' : ''}
              ${moviesCount === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-6xl h-full min-h-0' : ''}
              ${moviesCount === 4 ? 'grid-cols-2 md:grid-cols-4 max-w-7xl h-full min-h-0' : ''}
              ${moviesCount === 5 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-[1600px] h-full min-h-0' : ''}
              ${moviesCount > 5 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-[1600px] auto-rows-fr' : ''}
            `}
          >
            {Array.from({ length: moviesCount }).map((_, idx) => {
              const movie = movies[idx];
              const isLoading = loadingSlots[idx];
              const isWinner = movie !== null && movie.id === winnerId;

              return (
                <div key={idx} className="flex flex-col h-full gap-2 min-h-0">
                  {/* Botões superiores para alterar o slot */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => loadSlot(idx, movies)}
                      disabled={isLoading}
                      className="flex-1 bg-secondary/20 hover:bg-secondary/40 border border-primary/5 text-xs text-muted-foreground hover:text-foreground font-semibold py-1.5 h-8 gap-1.5 rounded-lg transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      Sortear Novo
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCurrentSlotToEdit(idx);
                        setSearchModalOpen(true);
                      }}
                      disabled={isLoading}
                      className="bg-secondary/20 hover:bg-secondary/40 border border-primary/5 text-xs text-muted-foreground hover:text-foreground font-semibold py-1.5 h-8 px-3 rounded-lg transition-all"
                      title="Definir filme manualmente"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Card do Filme */}
                  <Card
                    className={`
                      relative flex-1 flex flex-col justify-between overflow-hidden border-primary/10 bg-secondary/10 transition-all duration-300 min-h-0
                      ${isWinner ? 'ring-4 ring-yellow-400 scale-[1.02] shadow-[0_0_30px_rgba(251,191,36,0.4)]' : ''}
                      ${winnerId && !isWinner ? 'opacity-40 grayscale-[40%]' : ''}
                    `}
                  >
                    {/* Badge do Vencedor (🏆 Selo de Vitorioso) */}
                    {isWinner && (
                      <div className="absolute top-3 left-3 z-30 animate-pulse">
                        <Badge className="bg-yellow-400 text-cinema-dark font-black text-xs px-3 py-1 border border-yellow-500 shadow-glow flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 fill-cinema-dark" />
                          VITORIOSO
                        </Badge>
                      </div>
                    )}

                    {isLoading ? (
                      /* Estado de Carregamento do Card */
                      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40">
                        <Loader className="w-8 h-8 text-primary animate-spin mb-2" />
                        <span className="text-xs text-muted-foreground animate-pulse">Buscando filme...</span>
                      </div>
                    ) : movie ? (
                      /* Render do Filme */
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Nota IMDb/TMDB em Destaque (Acima do Pôster) */}
                        {movie.vote_average !== undefined && (
                          <div className="flex justify-center p-2 bg-secondary/10 border-b border-primary/5 flex-shrink-0">
                            <Badge className="bg-secondary/40 text-yellow-400 font-black text-xs sm:text-sm border border-yellow-400/25 gap-1.5 py-1 px-3 shadow-md">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              {movie.vote_average.toFixed(1)}
                            </Badge>
                          </div>
                        )}

                        {/* Imagem de Pôster */}
                        <div className="relative w-full flex-1 min-h-0 bg-secondary/5 flex items-center justify-center p-3">
                          <div className="relative h-full max-h-[35vh] sm:max-h-[42vh] aspect-[2/3] rounded-md overflow-hidden shadow-lg bg-secondary/35 border border-primary/10">
                            <img
                              src={buildImageUrl(movie.poster_path, 'w300')}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>

                        {/* Conteúdo Textual */}
                        <CardContent className="p-4 pt-3 flex-shrink-0 flex flex-col justify-between gap-3">
                          
                          {/* Ações do Card (Assistido, Favoritar, Quero Assistir) */}
                          <MovieCardActions
                            id={movie.id}
                            title={movie.title}
                            poster_path={movie.poster_path}
                            release_date={movie.release_date}
                            vote_average={movie.vote_average}
                            genre_ids={movie.genre_ids}
                            type="movie"
                            showBlacklist={false}
                            showTrailer={true}
                            showGallery={false}
                            className="flex justify-center items-center gap-3 py-1 border-b border-primary/5"
                          />

                          <div className="space-y-1 text-center">
                            <h3 className="text-sm sm:text-base font-black text-foreground line-clamp-2 leading-tight">
                              {movie.title}
                            </h3>
                            {movie.release_date && (
                              <span className="text-xs text-muted-foreground block">
                                Ano: {new Date(movie.release_date).getFullYear()}
                              </span>
                            )}
                          </div>

                          {/* Botão de Elegibilidade de Vencedor */}
                          <Button
                            variant={isWinner ? 'default' : 'outline'}
                            onClick={(e) => handleSetWinner(movie.id, e)}
                            className={`
                              w-full text-xs font-extrabold h-9 gap-1.5 rounded-lg border-primary/20
                              ${isWinner 
                                ? 'bg-gradient-gold text-cinema-dark hover:opacity-95 shadow-glow' 
                                : 'hover:bg-yellow-400/10 hover:text-yellow-400 hover:border-yellow-400/40'}
                            `}
                          >
                            {isWinner ? (
                              <>
                                <Crown className="w-4 h-4 fill-cinema-dark" />
                                Filme Vitorioso!
                              </>
                            ) : (
                              'Eleger Vencedor'
                            )}
                          </Button>
                        </CardContent>
                      </div>
                    ) : (
                      /* Estado Vazio (Caso não encontre filme com filtros restritivos) */
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-black/40 gap-2">
                        <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                        <span className="text-xs">Nenhum filme encontrado para os filtros atuais.</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => loadSlot(idx, movies)}
                          className="text-xs text-primary underline"
                        >
                          Tentar Novamente
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>

      <ArenaSearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        onSelectMovie={handleManualMovieSelect}
      />
    </Dialog>
  );
};
