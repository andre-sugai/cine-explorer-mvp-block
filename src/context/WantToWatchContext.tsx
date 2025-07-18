import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

export interface WantToWatchItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster_path?: string;
  release_date: string;
  added_date: string;
  rating: number;
  genres: string[];
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
  const [wantToWatchList, setWantToWatchList] = useState<WantToWatchItem[]>([]);

  useEffect(() => {
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
  }, []);

  const addToWantToWatch = (item: Omit<WantToWatchItem, 'added_date'>) => {
    const newItem: WantToWatchItem = {
      ...item,
      added_date: new Date().toISOString(),
    };
    setWantToWatchList((prev) => {
      const updatedList = [...prev, newItem];
      localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const removeFromWantToWatch = (id: number) => {
    setWantToWatchList((prev) => {
      const updatedList = prev.filter((item) => item.id !== id);
      localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
      return updatedList;
    });
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
