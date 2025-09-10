import React from 'react';
import { Heart, Bookmark, Check, Shield } from 'lucide-react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { isAdminUser, addToBlacklist } from '@/utils/adultContentFilter';

interface MovieCardActionsProps {
  id: number;
  title: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  type?: 'movie' | 'tv' | 'person';
  runtime?: number;
}

export const MovieCardActions: React.FC<MovieCardActionsProps> = ({
  id,
  title,
  poster_path,
  release_date,
  vote_average,
  genre_ids,
  type = 'movie',
  runtime,
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoritesContext();
  const { addToWantToWatch, removeFromWantToWatch, isInWantToWatch } =
    useWantToWatchContext();
  const { addToWatched, removeFromWatched, isWatched } = useWatchedContext();
  const { user } = useAuth();

  const favorite = isFavorite(id, type);
  const wantToWatch = type !== 'person' ? isInWantToWatch(id) : false;
  const watched =
    type !== 'person' ? isWatched(id, type as 'movie' | 'tv') : false;
  const isAdmin = isAdminUser(user?.email);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (favorite) {
        await removeFromFavorites(id, type);
        toast.success('Removido dos favoritos');
      } else {
        await addToFavorites({
          id,
          type: type as 'movie' | 'tv' | 'person',
          title,
          poster_path,
          release_date,
          vote_average,
          genre_ids,
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
    e.stopPropagation();
    if (type === 'person') return;

    if (wantToWatch) {
      removeFromWantToWatch(id);
      toast.success('Removido da lista');
    } else {
      addToWantToWatch({
        id,
        type, // garantir que o campo type seja passado
        title,
        poster_path,
        release_date: release_date || '',
        rating: vote_average || 0,
        genres: (genre_ids || []).map(String), // converter para string[]
      });
      toast.success('Adicionado à lista "Quero Assistir"');
    }
  };

  const handleWatched = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'person') return;

    if (watched) {
      removeFromWatched(id, type as 'movie' | 'tv');
      toast.success('Removido dos assistidos');
    } else {
      addToWatched({
        id,
        type: type as 'movie' | 'tv',
        title,
        poster_path,
        release_date,
        vote_average,
        genre_ids,
        runtime,
      });

      // Se estava na lista "quero assistir", remover de lá
      if (wantToWatch) {
        removeFromWantToWatch(id);
      }

      toast.success('Marcado como assistido');
    }
  };

  const handleAddToBlacklist = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAdmin) {
      toast.error(
        'Acesso negado: apenas administradores podem modificar a blacklist'
      );
      return;
    }

    if (type === 'person') return;

    try {
      addToBlacklist(title, user?.email);
      toast.success(`"${title}" foi adicionado à blacklist`, {
        description: 'O filme será bloqueado pelo filtro de conteúdo adulto',
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao adicionar à blacklist'
      );
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-2 pt-2 border-t border-border/20">
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

      {type !== 'person' && (
        <>
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

          {/* Botão Blacklist - apenas para administrador André Sugai */}
          {isAdmin && (
            <button
              onClick={handleAddToBlacklist}
              className="p-1.5 rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Adicionar à blacklist (admin)"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
};
