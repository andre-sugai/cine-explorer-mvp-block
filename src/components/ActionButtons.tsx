
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Check, Share } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useWatched } from '@/hooks/useWatched';
import { toast } from '@/components/ui/sonner';

interface ActionButtonsProps {
  id: number;
  type: 'movie' | 'tv' | 'person';
  title: string;
  poster_path?: string;
  profile_path?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ id, type, title, poster_path, profile_path }) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToWatched, removeFromWatched, isWatched } = useWatched();

  const favorite = isFavorite(id, type);
  const watched = isWatched(id, type);

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
        profile_path
      });
      toast.success('Adicionado aos favoritos');
    }
  };

  const handleWatched = () => {
    if (type === 'person') return;
    
    if (watched) {
      removeFromWatched(id, type);
      toast.success('Removido da lista de assistidos');
    } else {
      addToWatched({
        id,
        type: type as 'movie' | 'tv',
        title
      });
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
        className={favorite ? "bg-red-500 hover:bg-red-600" : "bg-gradient-gold text-cinema-dark hover:opacity-90"}
      >
        <Heart className={`w-4 h-4 mr-2 ${favorite ? 'fill-current' : ''}`} />
        {favorite ? 'Favorito' : 'Adicionar aos Favoritos'}
      </Button>
      
      {type !== 'person' && (
        <Button 
          variant="outline"
          onClick={handleWatched}
          className={watched ? "bg-green-500 text-white hover:bg-green-600" : ""}
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
