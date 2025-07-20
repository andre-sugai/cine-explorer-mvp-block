import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Calendar,
  Loader,
  RefreshCw,
  Heart,
  Bookmark,
  Check,
  Eye,
  Dice6,
  User,
  Film,
  Users,
} from 'lucide-react';
import {
  buildImageUrl,
  getMovieDetails,
  getTVShowDetails,
  getPersonDetails,
} from '@/utils/tmdb';
import { useLuckyPick } from '@/hooks/useLuckyPick';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { useNavigate } from 'react-router-dom';

/**
 * ModalLuckyPick
 * Modal interativo para exibir um resultado aleatório (filme, série, ator ou diretor) com layout cinematográfico.
 *
 * O que faz:
 * - Exibe um modal estilizado com o resultado de um sorteio aleatório (filme, série ou pessoa).
 * - Mostra imagem (cartaz ou foto), título, ano, nota, sinopse (ou biografia), gêneros, profissão, etc.
 * - Permite favoritar, marcar como visto/quero assistir, ver detalhes e sortear novamente.
 * - Usa componentes visuais do MVPBlocks e segue o visual do site.
 *
 * Argumentos (props):
 * - open: boolean - controla a abertura do modal.
 * - onOpenChange: (open: boolean) => void - callback para mudança de estado do modal.
 *
 * Retorno:
 * - JSX.Element: Modal estilizado com todas as informações e botões de ação.
 *
 * Detalhes:
 * - Para pessoas, mostra biografia e filmes/séries mais conhecidos.
 * - Para filmes/séries, mostra sinopse, gêneros, nota, ano, etc.
 * - Botões: Favoritar, Quero Assistir/Visto, Ver Detalhes, Sortear Novamente.
 * - Feedback visual (toast) para ações.
 */
export const ModalLuckyPick: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [lastId, setLastId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getRandomItem } = useLuckyPick();
  const { isFavorite, addToFavorites, removeFromFavorites } =
    useFavoritesContext();
  const { isInWantToWatch, addToWantToWatch, removeFromWantToWatch } =
    useWantToWatchContext();
  const { isWatched, addToWatched, removeFromWatched } = useWatchedContext();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Busca um novo item aleatório e seus detalhes completos.
   * Garante que não repita o último resultado imediatamente.
   */
  const fetchLuckyPick = async () => {
    setLoading(true);
    setError(null);
    setDetails(null);
    try {
      let random;
      let attempts = 0;
      do {
        random = await getRandomItem();
        attempts++;
      } while (random && random.item.id === lastId && attempts < 5);
      setResult(random);
      setLastId(random?.item.id);
      if (random) {
        let det;
        if (random.type === 'movie') {
          det = await getMovieDetails(random.item.id);
        } else if (random.type === 'tv') {
          det = await getTVShowDetails(random.item.id);
        } else if (random.type === 'person') {
          det = await getPersonDetails(random.item.id);
        }
        setDetails(det);
      }
    } catch (e) {
      setError('Erro ao buscar resultado aleatório.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLuckyPick();
    } else {
      setResult(null);
      setDetails(null);
      setError(null);
    }
    // eslint-disable-next-line
  }, [open]);

  /**
   * Exibe um toast temporário para feedback de ações.
   * @param msg Mensagem do toast
   */
  const showToast = (msg: string) => {
    setToast(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToast(null), 2000);
  };

  // --- Funções auxiliares para renderização ---
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'movie':
        return 'Filme';
      case 'tv':
        return 'Série';
      case 'person':
        return 'Pessoa';
      default:
        return 'Item';
    }
  };

  const getGenres = (item: any) => {
    if (!item?.genres) return [];
    return item.genres.map((g: any) => g.name);
  };

  const getYear = (item: any, type: string) => {
    if (type === 'movie' && item.release_date) {
      return new Date(item.release_date).getFullYear();
    }
    if (type === 'tv' && item.first_air_date) {
      return new Date(item.first_air_date).getFullYear();
    }
    if (type === 'person' && item.birthday) {
      return new Date(item.birthday).getFullYear();
    }
    return null;
  };

  const getAge = (birthday: string) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getKnownFor = (item: any) => {
    if (!item?.movie_credits?.cast && !item?.tv_credits?.cast) return [];
    const movies = (item.movie_credits?.cast || []).slice(0, 2);
    const tvs = (item.tv_credits?.cast || []).slice(0, 2);
    return [...movies, ...tvs];
  };

  // --- Ações dos botões ---
  const handleFavorite = () => {
    if (!result) return;
    if (isFavorite(result.item.id, result.type)) {
      removeFromFavorites(result.item.id, result.type);
      showToast('Removido dos favoritos!');
    } else {
      addToFavorites({
        id: result.item.id,
        type: result.type,
        title: result.type === 'movie' ? result.item.title : result.item.name,
        poster_path: result.item.poster_path,
        profile_path: result.item.profile_path,
        release_date: result.item.release_date,
        first_air_date: result.item.first_air_date,
        vote_average: result.item.vote_average,
        genre_ids: result.item.genre_ids,
        known_for_department: result.item.known_for_department,
      });
      showToast('Adicionado aos favoritos!');
    }
  };

  const handleWantToWatch = () => {
    if (!result) return;
    if (isInWantToWatch(result.item.id)) {
      removeFromWantToWatch(result.item.id);
      showToast('Removido de Quero Assistir!');
    } else {
      addToWantToWatch({
        id: result.item.id,
        title: result.type === 'movie' ? result.item.title : result.item.name,
        type: result.type,
        poster_path: result.item.poster_path,
        release_date: result.item.release_date || result.item.first_air_date,
        rating: result.item.vote_average || 0,
        genres: getGenres(details),
      });
      showToast('Adicionado a Quero Assistir!');
    }
  };

  const handleWatched = () => {
    if (!result) return;
    if (isWatched(result.item.id, result.type)) {
      removeFromWatched(result.item.id, result.type);
      showToast('Removido de Vistos!');
    } else {
      addToWatched({
        id: result.item.id,
        type: result.type,
        title: result.type === 'movie' ? result.item.title : result.item.name,
        poster_path: result.item.poster_path,
        release_date: result.item.release_date,
        first_air_date: result.item.first_air_date,
        vote_average: result.item.vote_average,
        genre_ids: result.item.genre_ids,
        runtime: details?.runtime,
      });
      showToast('Marcado como Visto!');
    }
  };

  const handleDetails = () => {
    if (!result) return;
    if (result.type === 'movie') {
      navigate(`/filme/${result.item.id}`);
    } else if (result.type === 'tv') {
      navigate(`/serie/${result.item.id}`);
    } else if (result.type === 'person') {
      navigate(`/pessoa/${result.item.id}`);
    }
    onOpenChange(false);
  };

  const handleTryAgain = async () => {
    setActionLoading(true);
    await fetchLuckyPick();
    setActionLoading(false);
  };

  // --- Renderização do conteúdo do modal ---
  const renderContent = () => {
    if (loading || actionLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
          <Loader className="w-10 h-10 text-primary animate-spin mb-4" />
          <div className="h-6 w-40 bg-secondary/40 rounded mb-2" />
          <div className="h-4 w-64 bg-secondary/30 rounded mb-2" />
          <div className="h-4 w-56 bg-secondary/30 rounded mb-2" />
          <div className="h-4 w-48 bg-secondary/20 rounded" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-destructive">
          <p>{error}</p>
          <Button variant="outline" onClick={fetchLuckyPick} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      );
    }
    if (!result || !details) return null;
    const type = result.type;
    const item = details;
    return (
      <div className="grid md:grid-cols-5 gap-6">
        {/* Imagem em destaque */}
        <div className="md:col-span-3 flex items-center justify-center h-full">
          <img
            src={buildImageUrl(
              type === 'person' ? item.profile_path : item.poster_path,
              'w780'
            )}
            alt={item.title || item.name}
            className="rounded-lg shadow-cinema w-full h-full object-cover bg-secondary/40"
            style={{ aspectRatio: '2/3' }}
            loading="lazy"
          />
        </div>
        {/* Informações e ações */}
        <div className="md:col-span-2 space-y-4 flex flex-col">
          {/* Título e tipo */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1 flex items-center gap-2">
              {type === 'movie' && <Film className="w-6 h-6 text-gold" />}
              {type === 'tv' && <Users className="w-6 h-6 text-gold" />}
              {type === 'person' && <User className="w-6 h-6 text-gold" />}
              {item.title || item.name}
            </h2>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <Badge
                variant="secondary"
                className="bg-primary/80 text-primary-foreground"
              >
                {getTypeLabel(type)}
              </Badge>
              {getYear(item, type) && (
                <Badge variant="secondary">
                  <Calendar className="w-4 h-4 mr-1 inline" />
                  {getYear(item, type)}
                </Badge>
              )}
              {type === 'person' && item.place_of_birth && (
                <Badge variant="secondary">{item.place_of_birth}</Badge>
              )}
              {type === 'person' && item.birthday && (
                <Badge variant="secondary">
                  {item.birthday} ({getAge(item.birthday)} anos)
                </Badge>
              )}
              {type !== 'person' &&
                getGenres(item).map((g: string) => (
                  <Badge key={g} variant="outline">
                    {g}
                  </Badge>
                ))}
            </div>
            {/* Nota TMDB */}
            {item.vote_average && (
              <div className="flex items-center gap-1 text-yellow-400 font-semibold mb-2">
                <Star className="w-5 h-5" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
            {/* Duração/Temporadas */}
            {type === 'movie' && item.runtime && (
              <div className="text-sm text-muted-foreground mb-1">
                Duração: {item.runtime} min
              </div>
            )}
            {type === 'tv' && item.number_of_seasons && (
              <div className="text-sm text-muted-foreground mb-1">
                Temporadas: {item.number_of_seasons}
              </div>
            )}
            {type === 'person' && item.known_for_department && (
              <div className="text-sm text-muted-foreground mb-1">
                Profissão: {item.known_for_department}
              </div>
            )}
          </div>
          {/* Sinopse/Biografia */}
          <div className="overflow-y-auto max-h-40 text-muted-foreground text-sm rounded bg-secondary/30 p-3">
            {type === 'person'
              ? item.biography || 'Sem biografia disponível.'
              : item.overview || 'Sem sinopse disponível.'}
          </div>
          {/* Filmes mais conhecidos (para pessoas) */}
          {type === 'person' && (
            <div>
              <div className="font-semibold text-primary mb-1">
                Mais conhecidos por:
              </div>
              <div className="flex flex-wrap gap-2">
                {getKnownFor(item).map((k: any) => (
                  <Badge
                    key={k.id}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(k.title ? `/filme/${k.id}` : `/serie/${k.id}`)
                    }
                  >
                    {k.title || k.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {/* Favoritar */}
            <Button
              variant={isFavorite(result.item.id, type) ? 'cinema' : 'outline'}
              onClick={handleFavorite}
              className="flex items-center gap-2"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite(result.item.id, type)
                    ? 'fill-red-500 text-red-500'
                    : ''
                }`}
              />
              {isFavorite(result.item.id, type)
                ? 'Remover dos Favoritos'
                : 'Favoritar'}
            </Button>
            {/* Quero Assistir / Visto */}
            {type !== 'person' ? (
              isWatched(result.item.id, type) ? (
                <Button
                  variant="cinema"
                  onClick={handleWatched}
                  className="flex items-center gap-2"
                >
                  <Check className="w-5 h-5 text-green-500" /> Remover de Vistos
                </Button>
              ) : isInWantToWatch(result.item.id) ? (
                <Button
                  variant="cinema"
                  onClick={handleWantToWatch}
                  className="flex items-center gap-2"
                >
                  <Bookmark className="w-5 h-5 text-blue-500" /> Remover de
                  Quero Assistir
                </Button>
              ) : (
                <Button
                  variant="cinema"
                  onClick={handleWantToWatch}
                  className="flex items-center gap-2"
                >
                  <Bookmark className="w-5 h-5" /> Quero Assistir
                </Button>
              )
            ) : (
              <Button
                variant="outline"
                disabled
                className="flex items-center gap-2 opacity-60"
              >
                <Bookmark className="w-5 h-5" /> Não disponível
              </Button>
            )}
            {/* Ver Detalhes */}
            <Button
              variant="default"
              onClick={handleDetails}
              className="flex items-center gap-2"
            >
              <Eye className="w-5 h-5" /> Ver Detalhes
            </Button>
            {/* Sortear Novamente */}
            <Button
              variant="secondary"
              onClick={handleTryAgain}
              className={`flex items-center gap-2 ${
                actionLoading ? 'animate-spin-slow' : ''
              }`}
              disabled={actionLoading}
            >
              <RefreshCw className="w-5 h-5" /> Sortear Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gradient-cinema border-primary/20 shadow-cinema animate-fade-in rounded-xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b border-primary/10 bg-gradient-cinema">
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            <Dice6 className="w-6 h-6" /> Descoberta Aleatória
          </DialogTitle>
          <DialogClose className="absolute right-6 top-6" />
        </DialogHeader>
        <div className="p-6">{renderContent()}</div>
        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-cinema-dark/90 text-white px-6 py-3 rounded-lg shadow-glow z-50 animate-fade-in">
            {toast}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
