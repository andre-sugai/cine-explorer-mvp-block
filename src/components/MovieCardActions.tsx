import React from 'react';
import { Heart, Bookmark, Check } from 'lucide-react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { toast } from '@/components/ui/sonner';

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

  const favorite = isFavorite(id, type);
  const wantToWatch = type !== 'person' ? isInWantToWatch(id) : false;
  const watched =
    type !== 'person' ? isWatched(id, type as 'movie' | 'tv') : false;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (favorite) {
      removeFromFavorites(id, type);
      toast.success('Removido dos favoritos');
    } else {
      addToFavorites({
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

  return (
    <div className="flex justify-center items-center gap-4 mt-2 pt-2 border-t border-border/20">
      <button
        onClick={handleFavorite}
        className={`p-1 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
          favorite
            ? 'text-red-500 hover:text-red-600'
            : 'text-muted-foreground hover:text-red-500'
        }`}
        title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
      </button>

      {type !== 'person' && (
        <>
          <button
            onClick={handleWantToWatch}
            className={`p-1 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              wantToWatch
                ? 'text-blue-500 hover:text-blue-600'
                : 'text-muted-foreground hover:text-blue-500'
            }`}
            title={wantToWatch ? 'Remover da lista' : 'Quero assistir'}
          >
            <Bookmark
              className={`w-4 h-4 ${wantToWatch ? 'fill-current' : ''}`}
            />
          </button>

          <button
            onClick={handleWatched}
            className={`p-1 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              watched
                ? 'text-green-500 hover:text-green-600'
                : 'text-muted-foreground hover:text-green-500'
            }`}
            title={watched ? 'Remover dos assistidos' : 'Marcar como assistido'}
          >
            <Check className={`w-4 h-4 ${watched ? 'fill-current' : ''}`} />
          </button>
        </>
      )}
    </div>
  );
};
