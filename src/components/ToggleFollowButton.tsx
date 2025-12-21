import React from 'react';
import { PlayCircle } from 'lucide-react';
import { useWatchedContext } from '@/context/WatchedContext';
import { toast } from 'sonner';

interface ToggleFollowButtonProps {
  id: number;
  title: string;
  poster_path?: string;
  type: 'movie' | 'tv';
  className?: string;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export const ToggleFollowButton: React.FC<ToggleFollowButtonProps> = ({
  id,
  title,
  poster_path,
  type,
  className,
  release_date,
  vote_average,
  genre_ids,
}) => {
  const { addToWatched, removeFromWatched, watched } = useWatchedContext();
  
  // Check if specifically followed (type='tv' AND status='following')
  const isFollowed = watched.some(
    (w) => w.id === id && w.type === type && w.status === 'following'
  );

  // Only render for TV shows as per requirement
  if (type !== 'tv') return null;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFollowed) {
      removeFromWatched(id, type);
      toast.success('Série removida de Continuar');
    } else {
      addToWatched({
        id,
        type,
        title,
        poster_path,
        release_date,
        vote_average,
        genre_ids,
        status: 'following',
      });
      toast.success('Série adicionada a Continuar');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-1.5 rounded-full transition-colors flex items-center justify-center backdrop-blur-sm ${
        isFollowed
          ? 'bg-yellow-500 text-black hover:bg-yellow-600'
          : 'bg-black/40 text-white/70 hover:bg-yellow-500 hover:text-black'
      } ${className}`}
      title={isFollowed ? 'Parar de Acompanhar' : 'Acompanhar Série'}
    >
      <PlayCircle className="w-4 h-4" />
    </button>
  );
};
