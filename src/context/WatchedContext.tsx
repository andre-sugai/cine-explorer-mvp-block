import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { StreamingData } from '@/utils/streamingProviders';

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
  streamingData?: StreamingData;
}

interface WatchedContextData {
  watched: WatchedItem[];
  addToWatched: (item: Omit<WatchedItem, 'watchedAt' | 'year'>) => void;
  removeFromWatched: (id: number, type: string) => void;
  clearAllWatched: () => void;
  cleanInvalidWatched: () => void;
  getStats: () => {
    total: number;
    movies: number;
    series: number;
    totalHours: number;
    mostWatchedGenre: number;
    thisMonth: number;
  };
  getFilteredWatched: (
    searchTerm: string,
    genreFilter: string,
    yearFilter: string,
    streamingFilter?: number | null
  ) => WatchedItem[];
  isWatched: (id: number, type: string) => boolean;
  exportWatchedList: () => void;
}

const WatchedContext = createContext<WatchedContextData | undefined>(undefined);

export const WatchedProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [watched, setWatched] = useState<WatchedItem[]>([]);

  // Load data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWatchedFromSupabase();
    } else {
      loadWatchedFromLocalStorage();
    }
  }, [isAuthenticated, user]);

  const loadWatchedFromLocalStorage = () => {
    const stored = localStorage.getItem('cine-explorer-watched');
    if (stored) {
      setWatched(JSON.parse(stored));
    }
  };

  const loadWatchedFromSupabase = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_watched')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_date', { ascending: false });

      if (error) {
        console.error('Error loading watched list:', error);
        return;
      }

      const formattedWatched = data?.map((item) => ({
        ...(item.item_data as any),
        watchedAt: item.watched_date,
      })) || [];

      setWatched(formattedWatched);
    } catch (error) {
      console.error('Error loading watched list:', error);
    }
  };

  const addToWatched = async (item: Omit<WatchedItem, 'watchedAt' | 'year'>) => {
    const releaseYear = item.release_date
      ? new Date(item.release_date).getFullYear()
      : item.first_air_date
      ? new Date(item.first_air_date).getFullYear()
      : undefined;
    const watchedItem: WatchedItem = {
      ...item,
      watchedAt: new Date().toISOString(),
      year: releaseYear,
    };

    if (isAuthenticated && user) {
      // Add to Supabase
      try {
        await supabase.from('user_watched').insert({
          user_id: user.id,
          item_id: item.id,
          item_type: item.type,
          item_data: watchedItem as any,
          watched_date: watchedItem.watchedAt,
        });
      } catch (error) {
        console.error('Error adding to watched list in Supabase:', error);
      }
    } else {
      // Add to localStorage for non-authenticated users
      setWatched((prev) => {
        const newWatched = [...prev, watchedItem];
        localStorage.setItem('cine-explorer-watched', JSON.stringify(newWatched));
        return newWatched;
      });
    }

    // Update local state
    setWatched((prev) => [...prev, watchedItem]);
  };

  const removeFromWatched = async (id: number, type: string) => {
    if (isAuthenticated && user) {
      // Remove from Supabase
      try {
        await supabase
          .from('user_watched')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', type);
      } catch (error) {
        console.error('Error removing from watched list in Supabase:', error);
      }
    } else {
      // Remove from localStorage for non-authenticated users
      setWatched((prev) => {
        const newWatched = prev.filter(
          (item) => !(item.id === id && item.type === type)
        );
        localStorage.setItem('cine-explorer-watched', JSON.stringify(newWatched));
        return newWatched;
      });
    }

    // Update local state
    setWatched((prev) => 
      prev.filter((item) => !(item.id === id && item.type === type))
    );
  };

  const clearAllWatched = async () => {
    if (isAuthenticated && user) {
      // Clear from Supabase
      try {
        await supabase
          .from('user_watched')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error clearing watched list in Supabase:', error);
      }
    } else {
      // Clear from localStorage
      localStorage.removeItem('cine-explorer-watched');
    }

    // Update local state
    setWatched([]);
  };

  const cleanInvalidWatched = () => {
    setWatched((prev) => {
      const validWatched = prev.filter((item) => item.poster_path);
      if (validWatched.length !== prev.length) {
        localStorage.setItem(
          'cine-explorer-watched',
          JSON.stringify(validWatched)
        );
        console.log(
          `Removidos ${prev.length - validWatched.length} itens sem poster`
        );
      }
      return validWatched;
    });
  };

  const getStats = () => {
    const movies = watched.filter((w) => w.type === 'movie');
    const series = watched.filter((w) => w.type === 'tv');
    const totalRuntime = watched.reduce(
      (total, item) => total + (item.runtime || 120),
      0
    );
    const genreCount: { [key: number]: number } = {};
    watched.forEach((item) => {
      item.genre_ids?.forEach((genreId) => {
        genreCount[genreId] = (genreCount[genreId] || 0) + 1;
      });
    });
    const mostWatchedGenreId = Object.keys(genreCount).reduce(
      (a, b) => (genreCount[Number(a)] > genreCount[Number(b)] ? a : b),
      '0'
    );
    return {
      total: watched.length,
      movies: movies.length,
      series: series.length,
      totalHours: Math.round(totalRuntime / 60),
      mostWatchedGenre: Number(mostWatchedGenreId),
      thisMonth: watched.filter((w) => {
        const watchedDate = new Date(w.watchedAt);
        const now = new Date();
        return (
          watchedDate.getMonth() === now.getMonth() &&
          watchedDate.getFullYear() === now.getFullYear()
        );
      }).length,
    };
  };

  const getFilteredWatched = (
    searchTerm: string,
    genreFilter: string,
    yearFilter: string,
    streamingFilter?: number | null
  ) => {
    return watched.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesGenre =
        !genreFilter || item.genre_ids?.includes(Number(genreFilter));
      const matchesYear = !yearFilter || item.year === Number(yearFilter);
      const matchesStreaming = !streamingFilter || 
        (item.streamingData && item.streamingData.providers.includes(streamingFilter));
      return matchesSearch && matchesGenre && matchesYear && matchesStreaming;
    });
  };

  const isWatched = (id: number, type: string) => {
    return watched.some((item) => item.id === id && item.type === type);
  };

  const exportWatchedList = () => {
    const dataStr = JSON.stringify(watched, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `cine-explorer-watched-${
      new Date().toISOString().split('T')[0]
    }.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <WatchedContext.Provider
      value={{
        watched,
        addToWatched,
        removeFromWatched,
        clearAllWatched,
        cleanInvalidWatched,
        getStats,
        getFilteredWatched,
        isWatched,
        exportWatchedList,
      }}
    >
      {children}
    </WatchedContext.Provider>
  );
};

export function useWatchedContext(): WatchedContextData {
  const context = useContext(WatchedContext);
  if (!context) {
    throw new Error(
      'useWatchedContext deve ser usado dentro de um WatchedProvider'
    );
  }
  return context;
}

/**
 * Contexto global para "Vistos" usando Context API.
 * Fornece métodos para adicionar, remover, limpar e consultar a lista de qualquer lugar da aplicação.
 * Deve envolver o App ou o componente de mais alto nível que precisa acessar a lista.
 */
