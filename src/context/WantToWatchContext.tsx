import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getMovieWatchProviders, getTVShowWatchProviders } from '@/utils/tmdb';

export interface WantToWatchItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster_path?: string;
  release_date: string;
  added_date: string;
  rating: number;
  genres: string[];
  streamingData?: {
    BR?: {
      flatrate?: Array<{
        provider_id: number;
        provider_name: string;
        logo_path?: string;
      }>;
      rent?: Array<{
        provider_id: number;
        provider_name: string;
        logo_path?: string;
      }>;
      buy?: Array<{
        provider_id: number;
        provider_name: string;
        logo_path?: string;
      }>;
    };
  };
}

interface WantToWatchContextData {
  wantToWatchList: WantToWatchItem[];
  addToWantToWatch: (item: Omit<WantToWatchItem, 'added_date'>) => void;
  removeFromWantToWatch: (id: number) => void;
  isInWantToWatch: (id: number) => boolean;
  getWantToWatchCount: () => number;
}

const WantToWatchContext = createContext<WantToWatchContextData | undefined>(
  undefined
);

const WANT_TO_WATCH_KEY = 'queroAssistir';

export const WantToWatchProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [wantToWatchList, setWantToWatchList] = useState<WantToWatchItem[]>([]);

  // Load data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWantToWatchFromSupabase();
    } else {
      loadWantToWatchFromLocalStorage();
    }
  }, [isAuthenticated, user]);

  const loadWantToWatchFromLocalStorage = () => {
    const savedList = localStorage.getItem(WANT_TO_WATCH_KEY);
    if (savedList) {
      try {
        setWantToWatchList(JSON.parse(savedList));
      } catch (error) {
        console.error(
          'Error parsing want to watch list from localStorage:',
          error
        );
        setWantToWatchList([]);
      }
    }
  };

  const loadWantToWatchFromSupabase = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading watchlist:', error);
        return;
      }

      const formattedWatchlist = data?.map((item) => ({
        ...(item.item_data as any),
        added_date: item.created_at,
      })) || [];

      setWantToWatchList(formattedWatchlist);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const addToWantToWatch = async (item: Omit<WantToWatchItem, 'added_date'>) => {
    const newItem: WantToWatchItem = {
      ...item,
      added_date: new Date().toISOString(),
    };

    // Fetch streaming data
    try {
      const watchProviders = item.type === 'movie' 
        ? await getMovieWatchProviders(item.id)
        : await getTVShowWatchProviders(item.id);
      
      if (watchProviders?.results?.BR) {
        newItem.streamingData = {
          BR: watchProviders.results.BR
        };
      }
    } catch (error) {
      console.warn('Failed to fetch streaming data:', error);
    }

    if (isAuthenticated && user) {
      // Add to Supabase
      try {
        await supabase.from('user_watchlist').insert({
          user_id: user.id,
          item_id: item.id,
          item_type: item.type,
          item_data: newItem as any,
        });
      } catch (error) {
        console.error('Error adding to watchlist in Supabase:', error);
      }
    } else {
      // Add to localStorage for non-authenticated users
      setWantToWatchList((prev) => {
        const updatedList = [...prev, newItem];
        localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
        return updatedList;
      });
    }

    // Update local state
    setWantToWatchList((prev) => [...prev, newItem]);
  };

  const removeFromWantToWatch = async (id: number) => {
    if (isAuthenticated && user) {
      // Remove from Supabase
      try {
        await supabase
          .from('user_watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id);
      } catch (error) {
        console.error('Error removing from watchlist in Supabase:', error);
      }
    } else {
      // Remove from localStorage for non-authenticated users
      setWantToWatchList((prev) => {
        const updatedList = prev.filter((item) => item.id !== id);
        localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
        return updatedList;
      });
    }

    // Update local state
    setWantToWatchList((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWantToWatch = (id: number): boolean => {
    return wantToWatchList.some((item) => item.id === id);
  };

  const getWantToWatchCount = (): number => {
    return wantToWatchList.length;
  };

  return (
    <WantToWatchContext.Provider
      value={{
        wantToWatchList,
        addToWantToWatch,
        removeFromWantToWatch,
        isInWantToWatch,
        getWantToWatchCount,
      }}
    >
      {children}
    </WantToWatchContext.Provider>
  );
};

export function useWantToWatchContext(): WantToWatchContextData {
  const context = useContext(WantToWatchContext);
  if (!context) {
    throw new Error(
      'useWantToWatchContext deve ser usado dentro de um WantToWatchProvider'
    );
  }
  return context;
}

/**
 * Contexto global para "Quero Assistir" usando Context API.
 * Fornece métodos para adicionar, remover e consultar a lista de qualquer lugar da aplicação.
 * Deve envolver o App ou o componente de mais alto nível que precisa acessar a lista.
 */
