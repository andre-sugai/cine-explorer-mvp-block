
import { useState, useEffect } from 'react';

interface FavoriteItem {
  id: number;
  type: 'movie' | 'tv' | 'person';
  title: string;
  poster_path?: string;
  profile_path?: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cine-explorer-favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const addToFavorites = (item: FavoriteItem) => {
    const newFavorites = [...favorites, item];
    setFavorites(newFavorites);
    localStorage.setItem('cine-explorer-favorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (id: number, type: string) => {
    const newFavorites = favorites.filter(fav => !(fav.id === id && fav.type === type));
    setFavorites(newFavorites);
    localStorage.setItem('cine-explorer-favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (id: number, type: string) => {
    return favorites.some(fav => fav.id === id && fav.type === type);
  };

  return { favorites, addToFavorites, removeFromFavorites, isFavorite };
};
