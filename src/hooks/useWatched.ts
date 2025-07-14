
import { useState, useEffect } from 'react';

interface WatchedItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  runtime?: number;
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

  const clearAllWatched = () => {
    setWatched([]);
    localStorage.removeItem('cine-explorer-watched');
  };

  const getStats = () => {
    const movies = watched.filter(w => w.type === 'movie');
    const series = watched.filter(w => w.type === 'tv');
    const totalRuntime = watched.reduce((total, item) => total + (item.runtime || 120), 0);
    
    return {
      total: watched.length,
      movies: movies.length,
      series: series.length,
      totalHours: Math.round(totalRuntime / 60),
      thisMonth: watched.filter(w => {
        const watchedDate = new Date(w.watchedAt);
        const now = new Date();
        return watchedDate.getMonth() === now.getMonth() && 
               watchedDate.getFullYear() === now.getFullYear();
      }).length
    };
  };

  const isWatched = (id: number, type: string) => {
    return watched.some(item => item.id === id && item.type === type);
  };

  return { 
    watched, 
    addToWatched, 
    removeFromWatched, 
    clearAllWatched,
    getStats,
    isWatched 
  };
};
