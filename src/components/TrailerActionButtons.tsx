import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Check, ListPlus, Plus, X } from 'lucide-react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import SignupInviteModal from '@/components/auth/SignupInviteModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCustomListsContext } from '@/context/CustomListsContext';
import { getMovieDetails, getTVShowDetails } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
  const [listDialogOpen, setListDialogOpen] = useState(false);

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
      // Trigger confetti
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { x, y },
        colors: ['#22c55e', '#ffffff', '#fbbf24'],
        disableForReducedMotion: true,
        zIndex: 9999,
      });

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
          className={`p-1.5 rounded-full transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
            watched
              ? 'bg-green-500 text-white hover:bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-110 active:scale-95 duration-300'
              : 'border border-muted-foreground/30 text-muted-foreground hover:text-green-500 hover:border-green-500 hover:scale-110 active:scale-95 duration-200'
          }`}
          title={watched ? 'Remover dos assistidos' : 'Marcar como assistido'}
        >
          <Check className="w-3.5 h-3.5" />
        </button>

        <button
          className="p-1.5 rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10"
          title="Adicionar a uma lista"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (requireAuth(e)) return;
            setListDialogOpen(true);
          }}
        >
          <ListPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <SignupInviteModal open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* Dialog de Listas */}
      <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListPlus className="w-5 h-5" />
              Adicionar à Lista
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Selecione uma lista para adicionar <strong>{title}</strong>
            </div>

            {lists.length > 0 ? (
              <ScrollArea className="max-h-[300px] pr-4">
                <div className="space-y-2">
                  {lists.map((list) => {
                    const itemInList = list.items?.some(
                      (item) => item.id === id && item.type === type
                    );
                    return (
                      <button
                        key={list.id}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between border ${
                          itemInList
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-background border-border hover:bg-accent hover:border-accent-foreground/20'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (itemInList) {
                            toast.info(
                              `"${title}" já está na lista "${list.name}"`
                            );
                          } else {
                            addItemToList(list.id, {
                              id,
                              title,
                              poster_path: finalPosterPath,
                              type,
                            });
                            setListDialogOpen(false);
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {list.name}
                          </div>
                          {list.description && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {list.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {list.items?.length || 0}{' '}
                            {list.items?.length === 1 ? 'item' : 'itens'}
                          </div>
                        </div>
                        {itemInList && (
                          <Check className="w-5 h-5 ml-3 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <ListPlus className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  Você ainda não criou nenhuma lista
                </p>
                <p className="text-xs text-muted-foreground/70 mb-4">
                  Crie listas personalizadas para organizar seus filmes e séries
                </p>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setListDialogOpen(false);
                    navigate('/listas');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Lista
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
