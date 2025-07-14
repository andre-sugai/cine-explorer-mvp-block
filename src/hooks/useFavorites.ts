
import { useState, useEffect } from 'react';

interface FavoriteItem {
  id: number;
  type: 'movie' | 'tv' | 'person';
  title: string;
  poster_path?: string;
  profile_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  known_for_department?: string;
  addedAt: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cine-explorer-favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const addToFavorites = (item: Omit<FavoriteItem, 'addedAt'>) => {
    const favoriteItem: FavoriteItem = {
      ...item,
      addedAt: new Date().toISOString()
    };
    const newFavorites = [...favorites, favoriteItem];
    setFavorites(newFavorites);
    localStorage.setItem('cine-explorer-favorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (id: number, type: string) => {
    const newFavorites = favorites.filter(fav => !(fav.id === id && fav.type === type));
    setFavorites(newFavorites);
    localStorage.setItem('cine-explorer-favorites', JSON.stringify(newFavorites));
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('cine-explorer-favorites');
  };

  const getFavoritesByType = (type: 'movie' | 'tv' | 'person') => {
    return favorites.filter(fav => fav.type === type);
  };

  const getStats = () => {
    const movies = getFavoritesByType('movie');
    const series = getFavoritesByType('tv');
    const people = getFavoritesByType('person');
    
    return {
      total: favorites.length,
      movies: movies.length,
      series: series.length,
      people: people.length
    };
  };

  const isFavorite = (id: number, type: string) => {
    return favorites.some(fav => fav.id === id && fav.type === type);
  };

  return { 
    favorites, 
    addToFavorites, 
    removeFromFavorites, 
    clearAllFavorites,
    getFavoritesByType,
    getStats,
    isFavorite 
  };
};
