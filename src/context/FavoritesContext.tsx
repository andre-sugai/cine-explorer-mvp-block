import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavoritesFromSupabase();
    } else {
      loadFavoritesFromLocalStorage();
    }
  }, [isAuthenticated, user]);

  const loadFavoritesFromLocalStorage = () => {
    const stored = localStorage.getItem('cine-explorer-favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  };

  const loadFavoritesFromSupabase = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading favorites:', error);
        return;
      }

      const formattedFavorites = data?.map((item) => ({
        ...(item.item_data as any),
        addedAt: item.created_at,
      })) || [];

      setFavorites(formattedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (item: Omit<FavoriteItem, 'addedAt'>) => {
    const favoriteItem: FavoriteItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };

    if (isAuthenticated && user) {
      // Add to Supabase
      try {
        await supabase.from('user_favorites').insert({
          user_id: user.id,
          item_id: item.id,
          item_type: item.type,
          item_data: favoriteItem as any,
        });
      } catch (error) {
        console.error('Error adding to favorites in Supabase:', error);
      }
    } else {
      // Add to localStorage for non-authenticated users
      setFavorites((prev) => {
        const newFavorites = [...prev, favoriteItem];
        localStorage.setItem(
          'cine-explorer-favorites',
          JSON.stringify(newFavorites)
        );
        return newFavorites;
      });
    }

    // Update local state
    setFavorites((prev) => [...prev, favoriteItem]);
  };

  const removeFromFavorites = async (id: number, type: string) => {
    if (isAuthenticated && user) {
      // Remove from Supabase
      try {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', type);
      } catch (error) {
        console.error('Error removing from favorites in Supabase:', error);
      }
    } else {
      // Remove from localStorage for non-authenticated users
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
    }

    // Update local state
    setFavorites((prev) => 
      prev.filter((fav) => !(fav.id === id && fav.type === type))
    );
  };

  const clearAllFavorites = async () => {
    if (isAuthenticated && user) {
      // Clear from Supabase
      try {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error clearing favorites in Supabase:', error);
      }
    } else {
      // Clear from localStorage
      localStorage.removeItem('cine-explorer-favorites');
    }

    // Update local state
    setFavorites([]);
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
