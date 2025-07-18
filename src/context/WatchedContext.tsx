import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

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
    yearFilter: string
  ) => WatchedItem[];
  isWatched: (id: number, type: string) => boolean;
  exportWatchedList: () => void;
}

const WatchedContext = createContext<WatchedContextData | undefined>(undefined);

export const WatchedProvider = ({ children }: { children: ReactNode }) => {
  const [watched, setWatched] = useState<WatchedItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cine-explorer-watched');
    if (stored) {
      setWatched(JSON.parse(stored));
    }
  }, []);

  const addToWatched = (item: Omit<WatchedItem, 'watchedAt' | 'year'>) => {
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
    setWatched((prev) => {
      const newWatched = [...prev, watchedItem];
      localStorage.setItem('cine-explorer-watched', JSON.stringify(newWatched));
      return newWatched;
    });
  };

  const removeFromWatched = (id: number, type: string) => {
    setWatched((prev) => {
      const newWatched = prev.filter(
        (item) => !(item.id === id && item.type === type)
      );
      localStorage.setItem('cine-explorer-watched', JSON.stringify(newWatched));
      return newWatched;
    });
  };

  const clearAllWatched = () => {
    setWatched(() => {
      localStorage.removeItem('cine-explorer-watched');
      return [];
    });
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
    yearFilter: string
  ) => {
    return watched.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesGenre =
        !genreFilter || item.genre_ids?.includes(Number(genreFilter));
      const matchesYear = !yearFilter || item.year === Number(yearFilter);
      return matchesSearch && matchesGenre && matchesYear;
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
