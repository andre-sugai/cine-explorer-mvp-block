import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Check, Share, Bookmark, Shield, ListPlus } from 'lucide-react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import confetti from 'canvas-confetti';
import {
  isAdminUser,
  addToBlacklist,
  isInBlacklist,
  removeFromBlacklist,
} from '@/utils/adultContentFilter';
import SignupInviteModal from '@/components/auth/SignupInviteModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCustomListsContext } from '@/context/CustomListsContext';

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
  const { lists, addItemToList } = useCustomListsContext();
  const { user } = useAuth();

  const favorite = isFavorite(id, type);
  const watched = isWatched(id, type);
  const wantToWatch =
    type !== 'person' ? isInWantToWatch(id, type as 'movie' | 'tv') : false;
  const isAdmin = isAdminUser(user?.email);
  const isBlacklisted = isInBlacklist(title);

  const isAuthenticated = !!user;
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const requireAuth = () => {
    if (!isAuthenticated) {
      setInviteOpen(true);
      return true;
    }
    return false;
  };

  const handleFavorite = async () => {
    if (requireAuth()) return;
    try {
      if (favorite) {
        await removeFromFavorites(id, type);
        toast.success('Removido dos favoritos');
      } else {
        await addToFavorites({
          id,
          type,
          title,
          poster_path,
          profile_path,
        });
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar favoritos'
      );
    }
  };

  const handleWantToWatch = () => {
    if (requireAuth()) return;
    if (type === 'person') return;

    if (wantToWatch) {
      removeFromWantToWatch(id, type as 'movie' | 'tv');
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

  const handleWatched = (e: React.MouseEvent) => {
    if (requireAuth()) return;
    if (type === 'person') return;

    if (watched) {
      removeFromWatched(id, type);
      toast.success('Removido da lista de assistidos');
    } else {
      // Trigger confetti
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x, y },
        colors: ['#22c55e', '#ffffff', '#fbbf24'],
        disableForReducedMotion: true,
        zIndex: 9999,
      });

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
        removeFromWantToWatch(id, type as 'movie' | 'tv');
      }

      toast.success('Marcado como assistido');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('URL copiada para a área de transferência');
  };

  const handleAddToBlacklist = () => {
    if (!isAdmin) {
      toast.error(
        'Acesso negado: apenas administradores podem modificar a blacklist'
      );
      return;
    }

    try {
      if (isBlacklisted) {
        removeFromBlacklist(title, user?.email);
        toast.success(`"${title}" foi removido da blacklist`);
      } else {
        addToBlacklist(title, user?.email);
        toast.success(
          `"${title}" foi adicionado à blacklist de conteúdo adulto`
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao modificar blacklist'
      );
    }
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
            watched 
              ? 'bg-green-500 text-white hover:bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-110 active:scale-95 transition-all duration-300' 
              : 'hover:text-green-500 hover:border-green-500 hover:scale-110 active:scale-95 transition-all duration-200'
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

      {type !== 'person' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListPlus className="w-4 h-4 mr-2" />
              Adicionar à Lista
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border-primary/20">
            <DropdownMenuLabel>Adicionar à lista...</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {lists.length > 0 ? (
              lists.map((list) => (
                <DropdownMenuItem
                  key={list.id}
                  onClick={() => {
                    addItemToList(list.id, {
                      id,
                      title,
                      poster_path: poster_path || movie?.poster_path,
                      type: type as 'movie' | 'tv',
                    });
                  }}
                >
                  {list.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>Nenhuma lista criada</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Botão Blacklist - apenas para administrador André Sugai */}
      {isAdmin && type !== 'person' && (
        <Button
          variant={isBlacklisted ? 'destructive' : 'outline'}
          onClick={handleAddToBlacklist}
          className={
            isBlacklisted
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
          }
        >
          <Shield className="w-4 h-4 mr-2" />
          {isBlacklisted ? 'Remover da Blacklist' : 'Adicionar à Blacklist'}
        </Button>
      )}

      <SignupInviteModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
};

export default ActionButtons;
