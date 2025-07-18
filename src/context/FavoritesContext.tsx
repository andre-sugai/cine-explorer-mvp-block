import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

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

interface FavoritesContextData {
  favorites: FavoriteItem[];
  addToFavorites: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFromFavorites: (id: number, type: string) => void;
  clearAllFavorites: () => void;
  getFavoritesByType: (type: 'movie' | 'tv' | 'person') => FavoriteItem[];
  getStats: () => {
    total: number;
    movies: number;
    series: number;
    people: number;
  };
  isFavorite: (id: number, type: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
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
      addedAt: new Date().toISOString(),
    };
    setFavorites((prev) => {
      const newFavorites = [...prev, favoriteItem];
      localStorage.setItem(
        'cine-explorer-favorites',
        JSON.stringify(newFavorites)
      );
      return newFavorites;
    });
  };

  const removeFromFavorites = (id: number, type: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter(
        (fav) => !(fav.id === id && fav.type === type)
      );
      localStorage.setItem(
        'cine-explorer-favorites',
        JSON.stringify(newFavorites)
      );
      return newFavorites;
    });
  };

  const clearAllFavorites = () => {
    setFavorites(() => {
      localStorage.removeItem('cine-explorer-favorites');
      return [];
    });
  };

  const getFavoritesByType = (type: 'movie' | 'tv' | 'person') => {
    return favorites
      .filter((fav) => fav.type === type)
      .sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
  };

  const getStats = () => {
    const movies = getFavoritesByType('movie');
    const series = getFavoritesByType('tv');
    const people = getFavoritesByType('person');
    return {
      total: favorites.length,
      movies: movies.length,
      series: series.length,
      people: people.length,
    };
  };

  const isFavorite = (id: number, type: string) => {
    return favorites.some((fav) => fav.id === id && fav.type === type);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        clearAllFavorites,
        getFavoritesByType,
        getStats,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavoritesContext(): FavoritesContextData {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error(
      'useFavoritesContext deve ser usado dentro de um FavoritesProvider'
    );
  }
  return context;
}

/**
 * Contexto global para favoritos usando Context API.
 * Fornece métodos para adicionar, remover, limpar e consultar favoritos de qualquer lugar da aplicação.
 * Deve envolver o App ou o componente de mais alto nível que precisa acessar favoritos.
 */
