import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { safeLocalStorageSetItem } from '@/utils/storage';

export interface CustomListItem {
  id: number;
  title: string;
  poster_path?: string;
  type: 'movie' | 'tv';
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  overview?: string;
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
  createList: (name: string, description?: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addItemToList: (listId: string, item: CustomListItem) => Promise<void>;
  removeItemFromList: (listId: string, itemId: number) => Promise<void>;
}

const CustomListsContext = createContext<CustomListsContextData | undefined>(undefined);

const CUSTOM_LISTS_KEY = 'cine-explorer-custom-lists';

export const CustomListsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [lists, setLists] = useState<CustomList[]>([]);

  // Load data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadListsFromSupabase();
    } else {
      loadListsFromLocalStorage();
    }
  }, [isAuthenticated, user]);

  const loadListsFromLocalStorage = () => {
    const savedLists = localStorage.getItem(CUSTOM_LISTS_KEY);
    if (savedLists) {
      try {
        setLists(JSON.parse(savedLists));
      } catch (error) {
        console.error('Error parsing custom lists:', error);
      }
    }
  };

  const loadListsFromSupabase = async () => {
    if (!user) return;

    const isSyncEnabled = localStorage.getItem('cine-explorer-sync-enabled') !== 'false';
    if (!isSyncEnabled) {
      loadListsFromLocalStorage();
      return;
    }

    try {
      // Load local data first
      const localData = localStorage.getItem(CUSTOM_LISTS_KEY);
      const localLists: CustomList[] = localData ? JSON.parse(localData) : [];

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('user_custom_lists')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading custom lists from Supabase:', error);
        if (localLists.length > 0) setLists(localLists);
        return;
      }

      const remoteLists = data?.map(item => ({
        id: item.id, // Use UUID from Supabase
        name: item.name,
        description: item.description || undefined,
        items: (item.items as unknown) as CustomListItem[],
        createdAt: item.created_at
      })) || [];

      // Merge strategy:
      // 1. Remote lists are the base
      // 2. Local lists that don't exist remotely (by name/content heuristic or ID if we tracked it) are added
      // Since local IDs might be UUIDs generated locally, we check if they exist in remote
      
      const mergedLists = [...remoteLists];
      const listsToSync: CustomList[] = [];

      for (const localList of localLists) {
        // Check if this list exists in remote (by ID or exact name match as fallback)
        const existsRemote = remoteLists.some(r => r.id === localList.id || r.name === localList.name);
        
        if (!existsRemote) {
          mergedLists.push(localList);
          listsToSync.push({
            ...localList,
            description: localList.description || '' // Ensure description is string for Supabase
          });
        }
      }

      setLists(mergedLists);
      safeLocalStorageSetItem(CUSTOM_LISTS_KEY, JSON.stringify(mergedLists));

      // Sync local-only lists to Supabase
      if (listsToSync.length > 0) {
        Promise.all(listsToSync.map(async (list) => {
          try {
            // Remove ID to let Supabase generate a new one, or use the local UUID?
            // Let's try to use the local UUID if it's a valid UUID, otherwise let Supabase generate
            // Ideally we should respect the local ID to avoid duplicates if we sync back
            
            await supabase.from('user_custom_lists').insert({
              id: list.id, // Try to keep the ID
              user_id: user.id,
              name: list.name,
              description: list.description,
              items: list.items as any
            });
          } catch (e) {
            console.error('Error syncing list:', list.name, e);
          }
        }));
      }

    } catch (error) {
      console.error('Error loading custom lists:', error);
      loadListsFromLocalStorage();
    }
  };

  const saveListsLocally = (newLists: CustomList[]) => {
    setLists(newLists);
    safeLocalStorageSetItem(CUSTOM_LISTS_KEY, JSON.stringify(newLists));
  };

  const createList = async (name: string, description?: string) => {
    const newList: CustomList = {
      id: crypto.randomUUID(),
      name,
      description,
      items: [],
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    const updatedLists = [...lists, newList];
    saveListsLocally(updatedLists);
    toast.success(`Lista "${name}" criada com sucesso!`);

    const isSyncEnabled = localStorage.getItem('cine-explorer-sync-enabled') !== 'false';
    if (isAuthenticated && user && isSyncEnabled) {
      try {
        const { error } = await supabase.from('user_custom_lists').insert({
          id: newList.id,
          user_id: user.id,
          name: newList.name,
          description: newList.description,
          items: []
        });
        
        if (error) throw error;
      } catch (error) {
        console.error('Error creating list in Supabase:', error);
        toast.error('Erro ao sincronizar criação da lista');
      }
    }
  };

  const deleteList = async (id: string) => {
    // Optimistic update
    const updatedLists = lists.filter((l) => l.id !== id);
    saveListsLocally(updatedLists);
    toast.success('Lista removida com sucesso');

    const isSyncEnabled = localStorage.getItem('cine-explorer-sync-enabled') !== 'false';
    if (isAuthenticated && user && isSyncEnabled) {
      try {
        const { error } = await supabase
          .from('user_custom_lists')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting list in Supabase:', error);
        // Revert? For now just log
      }
    }
  };

  const addItemToList = async (listId: string, item: CustomListItem) => {
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
    
    // Optimistic update
    saveListsLocally(newLists);
    toast.success(`Adicionado à lista "${list.name}"`);

    const isSyncEnabled = localStorage.getItem('cine-explorer-sync-enabled') !== 'false';
    if (isAuthenticated && user && isSyncEnabled) {
      try {
        const { error } = await supabase
          .from('user_custom_lists')
          .update({ items: updatedList.items as any, updated_at: new Date().toISOString() })
          .eq('id', listId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error updating list in Supabase:', error);
        toast.error('Erro ao sincronizar atualização da lista');
      }
    }
  };

  const removeItemFromList = async (listId: string, itemId: number) => {
    const listIndex = lists.findIndex((l) => l.id === listId);
    if (listIndex === -1) return;

    const list = lists[listIndex];
    const updatedList = { ...list, items: list.items.filter((i) => i.id !== itemId) };
    const newLists = [...lists];
    newLists[listIndex] = updatedList;
    
    // Optimistic update
    saveListsLocally(newLists);
    toast.success('Item removido da lista');

    const isSyncEnabled = localStorage.getItem('cine-explorer-sync-enabled') !== 'false';
    if (isAuthenticated && user && isSyncEnabled) {
      try {
        const { error } = await supabase
          .from('user_custom_lists')
          .update({ items: updatedList.items as any, updated_at: new Date().toISOString() })
          .eq('id', listId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error updating list in Supabase:', error);
      }
    }
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
