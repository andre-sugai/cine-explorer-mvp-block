import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Check, ListPlus } from 'lucide-react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import SignupInviteModal from '@/components/auth/SignupInviteModal';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCustomListsContext } from '@/context/CustomListsContext';
import { getMovieDetails, getTVShowDetails } from '@/utils/tmdb';

interface TrailerActionButtonsProps {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  runtime?: number;
  className?: string;
}

export const TrailerActionButtons: React.FC<TrailerActionButtonsProps> = ({
  id,
  title,
  type,
  poster_path,
  release_date,
  first_air_date,
  vote_average,
  genre_ids,
  runtime,
  className = '',
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoritesContext();
  const { addToWantToWatch, removeFromWantToWatch, isInWantToWatch } =
    useWantToWatchContext();
  const { addToWatched, removeFromWatched, isWatched } = useWatchedContext();
  const { lists, addItemToList } = useCustomListsContext();
  const { user } = useAuth();

  const [details, setDetails] = useState<{
    poster_path?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    genre_ids?: number[];
    runtime?: number;
  } | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [listPopoverOpen, setListPopoverOpen] = useState(false);

  // Buscar detalhes se não foram fornecidos
  useEffect(() => {
    // Só buscar se realmente não temos o poster_path
    const needsFetch = !poster_path && !isLoadingDetails && !details;

    if (needsFetch) {
      setIsLoadingDetails(true);
      const fetchDetails = async () => {
        try {
          const data =
            type === 'movie'
              ? await getMovieDetails(id)
              : await getTVShowDetails(id);
          setDetails({
            poster_path: data.poster_path,
            release_date: data.release_date,
            first_air_date: data.first_air_date,
            vote_average: data.vote_average,
            genre_ids: data.genres?.map((g: any) => g.id) || [],
            runtime: data.runtime || data.episode_run_time?.[0],
          });
        } catch (error) {
          console.error('Erro ao buscar detalhes:', error);
        } finally {
          setIsLoadingDetails(false);
        }
      };
      fetchDetails();
    }
  }, [id, type, poster_path, isLoadingDetails, details]);

  // Usar dados fornecidos ou buscados
  const finalPosterPath = poster_path || details?.poster_path;
  const finalReleaseDate =
    release_date ||
    details?.release_date ||
    first_air_date ||
    details?.first_air_date;
  const finalVoteAverage = vote_average ?? details?.vote_average ?? 0;
  const finalGenreIds = genre_ids || details?.genre_ids || [];
  const finalRuntime = runtime ?? details?.runtime;

  const favorite = isFavorite(id, type);
  const wantToWatch = isInWantToWatch(id, type);
  const watched = isWatched(id, type);

  const isAuthenticated = !!user;

  const requireAuth = (e?: React.MouseEvent) => {
    if (!isAuthenticated) {
      e?.preventDefault();
      e?.stopPropagation();
      setInviteOpen(true);
      return true;
    }
    return false;
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireAuth(e)) return;

    try {
      if (favorite) {
        await removeFromFavorites(id, type);
        toast.success('Removido dos favoritos');
      } else {
        await addToFavorites({
          id,
          type: type as 'movie' | 'tv' | 'person',
          title,
          poster_path: finalPosterPath,
          release_date: finalReleaseDate,
          vote_average: finalVoteAverage,
          genre_ids: finalGenreIds,
        });
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar favoritos'
      );
    }
  };

  const handleWantToWatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireAuth(e)) return;

    if (wantToWatch) {
      removeFromWantToWatch(id, type);
      toast.success('Removido da lista');
    } else {
      addToWantToWatch({
        id,
        type,
        title,
        poster_path: finalPosterPath,
        release_date: finalReleaseDate || '',
        rating: finalVoteAverage,
        genres: finalGenreIds.map(String),
      });
      toast.success('Adicionado à lista "Quero Assistir"');
    }
  };

  const handleWatched = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireAuth(e)) return;

    if (watched) {
      removeFromWatched(id, type);
      toast.success('Removido dos assistidos');
    } else {
      addToWatched({
        id,
        type,
        title,
        poster_path: finalPosterPath,
        release_date: finalReleaseDate,
        vote_average: finalVoteAverage,
        genre_ids: finalGenreIds,
        runtime: finalRuntime,
      });

      // Se estava na lista "quero assistir", remover de lá
      if (wantToWatch) {
        removeFromWantToWatch(id, type);
      }

      toast.success('Marcado como assistido');
    }
  };

  return (
    <>
      <div
        className={`flex justify-center items-center gap-2 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleFavorite}
          className={`p-1.5 rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
            favorite
              ? 'text-red-500 hover:text-red-600'
              : 'text-muted-foreground hover:text-red-500'
          }`}
          title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleWantToWatch}
          className={`p-1.5 rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
            wantToWatch
              ? 'text-blue-500 hover:text-blue-600'
              : 'text-muted-foreground hover:text-blue-500'
          }`}
          title={wantToWatch ? 'Remover da lista' : 'Quero assistir'}
        >
          <Bookmark
            className={`w-3.5 h-3.5 ${wantToWatch ? 'fill-current' : ''}`}
          />
        </button>

        <button
          onClick={handleWatched}
          className={`p-1.5 rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
            watched
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'border border-muted-foreground/30 text-muted-foreground hover:text-green-500 hover:border-green-500'
          }`}
          title={watched ? 'Remover dos assistidos' : 'Marcar como assistido'}
        >
          <Check className="w-3.5 h-3.5" />
        </button>

        <Popover open={listPopoverOpen} onOpenChange={setListPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="p-1.5 rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10"
              title="Adicionar a uma lista"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ListPlus className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-48 p-0 bg-popover border-primary/20"
          >
            <div className="p-2">
              <div className="px-2 py-1.5 text-sm font-semibold">
                Adicionar à lista...
              </div>
              <div className="border-t border-border my-1"></div>
              {lists.length > 0 ? (
                <div className="space-y-1">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItemToList(list.id, {
                          id,
                          title,
                          poster_path: finalPosterPath,
                          type,
                        });
                        toast.success(`Adicionado à lista "${list.name}"`);
                        setListPopoverOpen(false);
                      }}
                    >
                      {list.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Nenhuma lista criada
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <SignupInviteModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
};
