
import { useState, useEffect } from 'react';

interface WatchedItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  watchedAt: string;
}

export const useWatched = () => {
  const [watched, setWatched] = useState<WatchedItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cine-explorer-watched');
    if (stored) {
      setWatched(JSON.parse(stored));
    }
  }, []);

  const addToWatched = (item: Omit<WatchedItem, 'watchedAt'>) => {
    const watchedItem: WatchedItem = {
      ...item,
      watchedAt: new Date().toISOString()
    };
    const newWatched = [...watched, watchedItem];
    setWatched(newWatched);
    localStorage.setItem('cine-explorer-watched', JSON.stringify(newWatched));
  };

  const removeFromWatched = (id: number, type: string) => {
    const newWatched = watched.filter(item => !(item.id === id && item.type === type));
    setWatched(newWatched);
    localStorage.setItem('cine-explorer-watched', JSON.stringify(newWatched));
  };

  const isWatched = (id: number, type: string) => {
    return watched.some(item => item.id === id && item.type === type);
  };

  return { watched, addToWatched, removeFromWatched, isWatched };
};
