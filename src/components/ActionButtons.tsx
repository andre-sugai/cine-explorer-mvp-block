import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Check, Share, Bookmark } from 'lucide-react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { toast } from '@/components/ui/sonner';

interface ActionButtonsProps {
  id: number;
  type: 'movie' | 'tv' | 'person';
  title: string;
  poster_path?: string;
  profile_path?: string;
  movie?: any; // Para dados completos do filme
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  id,
  type,
  title,
  poster_path,
  profile_path,
  movie,
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoritesContext();
  const { addToWatched, removeFromWatched, isWatched } = useWatchedContext();
  const { addToWantToWatch, removeFromWantToWatch, isInWantToWatch } =
    useWantToWatchContext();

  const favorite = isFavorite(id, type);
  const watched = isWatched(id, type);
  const wantToWatch = isInWantToWatch(id);

  const handleFavorite = () => {
    if (favorite) {
      removeFromFavorites(id, type);
      toast.success('Removido dos favoritos');
    } else {
      addToFavorites({
        id,
        type,
        title,
        poster_path,
        profile_path,
      });
      toast.success('Adicionado aos favoritos');
    }
  };

  const handleWantToWatch = () => {
    if (type === 'person') return;

    if (wantToWatch) {
      removeFromWantToWatch(id);
      toast.success('Removido da lista de filmes para assistir');
    } else {
      addToWantToWatch({
        id,
        type, // Adicionado para corrigir o erro de tipagem
        title,
        poster_path,
        release_date: movie?.release_date || '',
        rating: movie?.vote_average || 0,
        genres: movie?.genres?.map((g: any) => g.name) || [],
      });
      toast.success('Adicionado à lista de filmes para assistir');
    }
  };

  const handleWatched = () => {
    if (type === 'person') return;

    if (watched) {
      removeFromWatched(id, type);
      toast.success('Removido da lista de assistidos');
    } else {
      // Salvar dados completos incluindo poster_path
      addToWatched({
        id,
        type: type as 'movie' | 'tv',
        title,
        poster_path: poster_path || movie?.poster_path,
        release_date: movie?.release_date,
        first_air_date: movie?.first_air_date,
        vote_average: movie?.vote_average,
        genre_ids: movie?.genre_ids,
        runtime: movie?.runtime,
      });

      // Se estava na lista "quero assistir", remover de lá
      if (wantToWatch) {
        removeFromWantToWatch(id);
      }

      toast.success('Marcado como assistido');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('URL copiada para a área de transferência');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={handleFavorite}
        className={
          favorite
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gradient-gold text-cinema-dark hover:opacity-90'
        }
      >
        <Heart className={`w-4 h-4 mr-2 ${favorite ? 'fill-current' : ''}`} />
        {favorite ? 'Favorito' : 'Adicionar aos Favoritos'}
      </Button>

      {type !== 'person' && (
        <Button
          onClick={handleWantToWatch}
          className={
            wantToWatch
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gradient-cinema border-primary/20 hover:bg-primary/10'
          }
          variant={wantToWatch ? 'default' : 'outline'}
        >
          <Bookmark
            className={`w-4 h-4 mr-2 ${wantToWatch ? 'fill-current' : ''}`}
          />
          {wantToWatch ? 'Na Lista' : 'Quero Assistir'}
        </Button>
      )}

      {type !== 'person' && (
        <Button
          variant="outline"
          onClick={handleWatched}
          className={
            watched ? 'bg-green-500 text-white hover:bg-green-600' : ''
          }
        >
          <Check className={`w-4 h-4 mr-2 ${watched ? 'fill-current' : ''}`} />
          {watched ? 'Assistido' : 'Marcar como Assistido'}
        </Button>
      )}

      <Button variant="outline" onClick={handleShare}>
        <Share className="w-4 h-4 mr-2" />
        Compartilhar
      </Button>
    </div>
  );
};

export default ActionButtons;
