
import { useState, useEffect } from 'react';

export interface WantToWatchItem {
  id: number;
  title: string;
  poster_path?: string;
  release_date: string;
  added_date: string;
  rating: number;
  genres: string[];
}

const WANT_TO_WATCH_KEY = 'queroAssistir';

export const useWantToWatch = () => {
  const [wantToWatchList, setWantToWatchList] = useState<WantToWatchItem[]>([]);

  useEffect(() => {
    const savedList = localStorage.getItem(WANT_TO_WATCH_KEY);
    if (savedList) {
      try {
        setWantToWatchList(JSON.parse(savedList));
      } catch (error) {
        console.error('Error parsing want to watch list from localStorage:', error);
        setWantToWatchList([]);
      }
    }
  }, []);

  const saveToLocalStorage = (list: WantToWatchItem[]) => {
    localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(list));
    setWantToWatchList(list);
  };

  const addToWantToWatch = (item: Omit<WantToWatchItem, 'added_date'>) => {
    const newItem: WantToWatchItem = {
      ...item,
      added_date: new Date().toISOString()
    };
    
    const updatedList = [...wantToWatchList, newItem];
    saveToLocalStorage(updatedList);
  };

  const removeFromWantToWatch = (id: number) => {
    const updatedList = wantToWatchList.filter(item => item.id !== id);
    saveToLocalStorage(updatedList);
  };

  const isInWantToWatch = (id: number): boolean => {
    return wantToWatchList.some(item => item.id === id);
  };

  const getWantToWatchCount = (): number => {
    return wantToWatchList.length;
  };

  const getWantToWatchList = (): WantToWatchItem[] => {
    // Ordenar por data adicionada (mais recente primeiro)
    return [...wantToWatchList].sort((a, b) => 
      new Date(b.added_date).getTime() - new Date(a.added_date).getTime()
    );
  };

  return {
    wantToWatchList: getWantToWatchList(),
    addToWantToWatch,
    removeFromWantToWatch,
    isInWantToWatch,
    getWantToWatchCount
  };
};
