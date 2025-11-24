import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface CustomListItem {
  id: number;
  title: string;
  poster_path?: string;
  type: 'movie' | 'tv';
}

export interface CustomList {
  id: string;
  name: string;
  description?: string;
  items: CustomListItem[];
  createdAt: string;
}

interface CustomListsContextData {
  lists: CustomList[];
  createList: (name: string, description?: string) => void;
  deleteList: (id: string) => void;
  addItemToList: (listId: string, item: CustomListItem) => void;
  removeItemFromList: (listId: string, itemId: number) => void;
}

const CustomListsContext = createContext<CustomListsContextData | undefined>(undefined);

const CUSTOM_LISTS_KEY = 'cine-explorer-custom-lists';

export const CustomListsProvider = ({ children }: { children: ReactNode }) => {
  const [lists, setLists] = useState<CustomList[]>([]);

  useEffect(() => {
    const savedLists = localStorage.getItem(CUSTOM_LISTS_KEY);
    if (savedLists) {
      try {
        setLists(JSON.parse(savedLists));
      } catch (error) {
        console.error('Error parsing custom lists:', error);
      }
    }
  }, []);

  const saveLists = (newLists: CustomList[]) => {
    setLists(newLists);
    localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(newLists));
  };

  const createList = (name: string, description?: string) => {
    const newList: CustomList = {
      id: crypto.randomUUID(),
      name,
      description,
      items: [],
      createdAt: new Date().toISOString(),
    };
    saveLists([...lists, newList]);
    toast.success(`Lista "${name}" criada com sucesso!`);
  };

  const deleteList = (id: string) => {
    saveLists(lists.filter((l) => l.id !== id));
    toast.success('Lista removida com sucesso');
  };

  const addItemToList = (listId: string, item: CustomListItem) => {
    const listIndex = lists.findIndex((l) => l.id === listId);
    if (listIndex === -1) return;

    const list = lists[listIndex];
    if (list.items.some((i) => i.id === item.id)) {
      toast.error('Este item já está na lista');
      return;
    }

    const updatedList = { ...list, items: [...list.items, item] };
    const newLists = [...lists];
    newLists[listIndex] = updatedList;
    saveLists(newLists);
    toast.success(`Adicionado à lista "${list.name}"`);
  };

  const removeItemFromList = (listId: string, itemId: number) => {
    const listIndex = lists.findIndex((l) => l.id === listId);
    if (listIndex === -1) return;

    const list = lists[listIndex];
    const updatedList = { ...list, items: list.items.filter((i) => i.id !== itemId) };
    const newLists = [...lists];
    newLists[listIndex] = updatedList;
    saveLists(newLists);
    toast.success('Item removido da lista');
  };

  return (
    <CustomListsContext.Provider
      value={{
        lists,
        createList,
        deleteList,
        addItemToList,
        removeItemFromList,
      }}
    >
      {children}
    </CustomListsContext.Provider>
  );
};

export function useCustomListsContext(): CustomListsContextData {
  const context = useContext(CustomListsContext);
  if (!context) {
    throw new Error('useCustomListsContext deve ser usado dentro de um CustomListsProvider');
  }
  return context;
}
