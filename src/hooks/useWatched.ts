
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
  year?: number;
}

export const useWatched = () => {
  const [watched, setWatched] = useState<WatchedItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cine-explorer-watched');
    if (stored) {
      setWatched(JSON.parse(stored));
    }
  }, []);

  const addToWatched = (item: Omit<WatchedItem, 'watchedAt' | 'year'>) => {
    const releaseYear = item.release_date ? new Date(item.release_date).getFullYear() : 
                       item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined;
    
    const watchedItem: WatchedItem = {
      ...item,
      watchedAt: new Date().toISOString(),
      year: releaseYear
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
    
    // Calcular gênero mais assistido
    const genreCount: { [key: number]: number } = {};
    watched.forEach(item => {
      item.genre_ids?.forEach(genreId => {
        genreCount[genreId] = (genreCount[genreId] || 0) + 1;
      });
    });
    
    const mostWatchedGenreId = Object.keys(genreCount).reduce((a, b) => 
      genreCount[Number(a)] > genreCount[Number(b)] ? a : b, '0'
    );
    
    return {
      total: watched.length,
      movies: movies.length,
      series: series.length,
      totalHours: Math.round(totalRuntime / 60),
      mostWatchedGenre: Number(mostWatchedGenreId),
      thisMonth: watched.filter(w => {
        const watchedDate = new Date(w.watchedAt);
        const now = new Date();
        return watchedDate.getMonth() === now.getMonth() && 
               watchedDate.getFullYear() === now.getFullYear();
      }).length
    };
  };

  const getFilteredWatched = (searchTerm: string, genreFilter: string, yearFilter: string) => {
    return watched.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !genreFilter || item.genre_ids?.includes(Number(genreFilter));
      const matchesYear = !yearFilter || item.year === Number(yearFilter);
      
      return matchesSearch && matchesGenre && matchesYear;
    });
  };

  const isWatched = (id: number, type: string) => {
    return watched.some(item => item.id === id && item.type === type);
  };

  const exportWatchedList = () => {
    const dataStr = JSON.stringify(watched, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cine-explorer-watched-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return { 
    watched, 
    addToWatched, 
    removeFromWatched, 
    clearAllWatched,
    getStats,
    getFilteredWatched,
    exportWatchedList,
    isWatched 
  };
};
