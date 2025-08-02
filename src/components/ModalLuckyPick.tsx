
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
  X,
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
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoritesContext();
  const { isInWantToWatch, addToWantToWatch, removeFromWantToWatch } = useWantToWatchContext();
  const { isWatched, addToWatched, removeFromWatched } = useWatchedContext();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onOpenChange]);

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

  const showToast = (msg: string) => {
    setToast(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToast(null), 2000);
  };

  // --- Helper functions for rendering ---
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'movie': return 'Filme';
      case 'tv': return 'Série';
      case 'person': return 'Pessoa';
      default: return 'Item';
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

  // --- Action handlers ---
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

  // --- Render content ---
  const renderContent = () => {
    if (loading || actionLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 animate-pulse">
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
        <div className="flex flex-col items-center justify-center py-12 text-destructive">
          <p className="text-center mb-4">{error}</p>
          <Button variant="outline" onClick={fetchLuckyPick}>
            Tentar Novamente
          </Button>
        </div>
      );
    }
    if (!result || !details) return null;
    const type = result.type;
    const item = details;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Image section */}
        <div className="lg:col-span-2 flex items-center justify-center">
          <div className="w-full max-w-xs mx-auto">
            <img
              src={buildImageUrl(
                type === 'person' ? item.profile_path : item.poster_path,
                'w500'
              )}
              alt={item.title || item.name}
              className="rounded-lg shadow-cinema w-full object-cover bg-secondary/40"
              style={{ aspectRatio: '2/3' }}
              loading="lazy"
            />
          </div>
        </div>
        {/* Info and actions */}
        <div className="lg:col-span-3 space-y-4 flex flex-col min-h-0">
          {/* Title and type */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-primary mb-2 flex items-center gap-2 line-clamp-2">
              {type === 'movie' && <Film className="w-5 h-5 lg:w-6 lg:h-6 text-gold flex-shrink-0" />}
              {type === 'tv' && <Users className="w-5 h-5 lg:w-6 lg:h-6 text-gold flex-shrink-0" />}
              {type === 'person' && <User className="w-5 h-5 lg:w-6 lg:h-6 text-gold flex-shrink-0" />}
              <span className="break-words">{item.title || item.name}</span>
            </h2>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <Badge variant="secondary" className="bg-primary/80 text-primary-foreground">
                {getTypeLabel(type)}
              </Badge>
              {getYear(item, type) && (
                <Badge variant="secondary">
                  <Calendar className="w-3 h-3 mr-1" />
                  {getYear(item, type)}
                </Badge>
              )}
              {type === 'person' && item.place_of_birth && (
                <Badge variant="secondary" className="text-xs">
                  {item.place_of_birth}
                </Badge>
              )}
              {type === 'person' && item.birthday && (
                <Badge variant="secondary" className="text-xs">
                  {item.birthday} ({getAge(item.birthday)} anos)
                </Badge>
              )}
              {type !== 'person' &&
                getGenres(item).slice(0, 3).map((g: string) => (
                  <Badge key={g} variant="outline" className="text-xs">
                    {g}
                  </Badge>
                ))}
            </div>
            {/* Rating */}
            {item.vote_average && (
              <div className="flex items-center gap-1 text-yellow-400 font-semibold mb-2">
                <Star className="w-4 h-4" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
            {/* Additional info */}
            <div className="text-sm text-muted-foreground space-y-1">
              {type === 'movie' && item.runtime && (
                <div>Duração: {item.runtime} min</div>
              )}
              {type === 'tv' && item.number_of_seasons && (
                <div>Temporadas: {item.number_of_seasons}</div>
              )}
              {type === 'person' && item.known_for_department && (
                <div>Profissão: {item.known_for_department}</div>
              )}
            </div>
          </div>
          {/* Synopsis/Biography - Scrollable */}
          <div className="flex-1 min-h-0">
            <div className="overflow-y-auto max-h-32 lg:max-h-40 text-muted-foreground text-sm rounded bg-secondary/30 p-3">
              {type === 'person'
                ? item.biography || 'Sem biografia disponível.'
                : item.overview || 'Sem sinopse disponível.'}
            </div>
          </div>
          {/* Known for (for people) */}
          {type === 'person' && (
            <div>
              <div className="font-semibold text-primary mb-2 text-sm">
                Mais conhecidos por:
              </div>
              <div className="flex flex-wrap gap-1">
                {getKnownFor(item).map((k: any) => (
                  <Badge
                    key={k.id}
                    variant="outline"
                    className="cursor-pointer text-xs hover:bg-secondary"
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
          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {/* Favorite */}
            <Button
              variant={isFavorite(result.item.id, type) ? 'cinema' : 'outline'}
              onClick={handleFavorite}
              className="flex items-center gap-2 text-xs lg:text-sm h-9"
              size="sm"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite(result.item.id, type)
                    ? 'fill-red-500 text-red-500'
                    : ''
                }`}
              />
              <span className="hidden sm:inline">
                {isFavorite(result.item.id, type) ? 'Remover' : 'Favoritar'}
              </span>
              <span className="sm:hidden">
                {isFavorite(result.item.id, type) ? '♥' : '♡'}
              </span>
            </Button>
            {/* Want to watch / Watched */}
            {type !== 'person' ? (
              isWatched(result.item.id, type) ? (
                <Button
                  variant="cinema"
                  onClick={handleWatched}
                  className="flex items-center gap-2 text-xs lg:text-sm h-9"
                  size="sm"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="hidden sm:inline">Remover de Vistos</span>
                  <span className="sm:hidden">Visto</span>
                </Button>
              ) : isInWantToWatch(result.item.id) ? (
                <Button
                  variant="cinema"
                  onClick={handleWantToWatch}
                  className="flex items-center gap-2 text-xs lg:text-sm h-9"
                  size="sm"
                >
                  <Bookmark className="w-4 h-4 text-blue-500" />
                  <span className="hidden sm:inline">Remover Lista</span>
                  <span className="sm:hidden">Na Lista</span>
                </Button>
              ) : (
                <Button
                  variant="cinema"
                  onClick={handleWantToWatch}
                  className="flex items-center gap-2 text-xs lg:text-sm h-9"
                  size="sm"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Quero Assistir</span>
                  <span className="sm:hidden">Lista</span>
                </Button>
              )
            ) : (
              <Button
                variant="outline"
                disabled
                className="flex items-center gap-2 text-xs lg:text-sm h-9 opacity-60"
                size="sm"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Não disponível</span>
                <span className="sm:hidden">N/A</span>
              </Button>
            )}
            {/* View details */}
            <Button
              variant="default"
              onClick={handleDetails}
              className="flex items-center gap-2 text-xs lg:text-sm h-9"
              size="sm"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Detalhes</span>
            </Button>
            {/* Try again */}
            <Button
              variant="secondary"
              onClick={handleTryAgain}
              className={`flex items-center gap-2 text-xs lg:text-sm h-9 ${
                actionLoading ? 'animate-pulse' : ''
              }`}
              disabled={actionLoading}
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sortear Novamente</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                   w-[95vw] max-w-none max-h-none h-[85vh] 
                   sm:w-[90vw] sm:h-[80vh] 
                   md:w-[85vw] md:h-[80vh] 
                   lg:w-[80vw] lg:h-[75vh] lg:max-w-4xl
                   xl:max-w-5xl xl:h-[70vh]
                   min-w-[280px] min-h-[300px]
                   bg-gradient-cinema border-primary/20 shadow-cinema 
                   animate-fade-in rounded-xl overflow-hidden
                   flex flex-col p-0 gap-0"
      >
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-2 border-b border-primary/10 bg-gradient-cinema">
          <DialogTitle className="text-lg sm:text-xl lg:text-2xl text-primary flex items-center gap-2 pr-8">
            <Dice6 className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <span className="truncate">Descoberta Aleatória</span>
          </DialogTitle>
          {/* Custom close button for better positioning */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 p-2 rounded-sm opacity-70 ring-offset-background 
                       transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 
                       focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none 
                       data-[state=open]:bg-accent data-[state=open]:text-muted-foreground
                       min-w-[44px] min-h-[44px] flex items-center justify-center bg-secondary/20"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
          {renderContent()}
        </div>

        {/* Toast notification */}
        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-cinema-dark/90 text-white 
                         px-4 py-2 rounded-lg shadow-glow z-50 animate-fade-in text-sm
                         max-w-[90vw] text-center">
            {toast}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
