import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useSyncContext } from '@/context/SyncContext';
import { safeLocalStorageSetItem } from '@/utils/storage';

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
  removeFromWantToWatch: (id: number, type?: 'movie' | 'tv') => void;
  isInWantToWatch: (id: number, type?: 'movie' | 'tv') => boolean;
  getWantToWatchCount: () => number;
  refresh: () => Promise<void>;
}

const WantToWatchContext = createContext<WantToWatchContextData | undefined>(
  undefined
);

const WANT_TO_WATCH_KEY = 'queroAssistir';

export const WantToWatchProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { reportSyncStart, reportSyncSuccess, reportSyncError, registerSyncService, isSyncEnabled } = useSyncContext();
  const [wantToWatchList, setWantToWatchList] = useState<WantToWatchItem[]>([]);

  // Register sync service for auto-retry
  useEffect(() => {
    registerSyncService('watchlist', async () => {
      if (user) await loadWantToWatchFromSupabase();
    });
  }, [user]);

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

    // Verificar se a sincronização está ativada

    if (!isSyncEnabled) {
      loadWantToWatchFromLocalStorage();
      return;
    }

    reportSyncStart('watchlist');

    // INSTANT LOADING: Load from localStorage immediately so the user doesn't wait
    loadWantToWatchFromLocalStorage();

    try {
      // Fetch data from Supabase in background
      let allRemoteWatchlist: any[] = [];
      let page = 0;
      const PAGE_SIZE = 50;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) {
          console.error('Error loading watchlist page', page, error);
          reportSyncError('watchlist', error);
          // Local data is already loaded, just stop the sync process
          return;
        }

        if (data && data.length > 0) {
          allRemoteWatchlist = [...allRemoteWatchlist, ...data];
          if (data.length < PAGE_SIZE) {
            hasMore = false;
          } else {
            page++;
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
        } else {
          hasMore = false;
        }
      }

      const formattedWatchlist =
        allRemoteWatchlist.map((item) => ({
          ...(item.item_data as any),
          added_date: item.created_at,
        })) || [];

      // Remover duplicatas baseado em id e type
      const uniqueWatchlist = formattedWatchlist.filter(
        (item, index, self) =>
          index ===
          self.findIndex((w) => w.id === item.id && w.type === item.type)
      );

      // CRITICAL FIX: Read localStorage AFTER the network fetch completes.
      const localData = localStorage.getItem(WANT_TO_WATCH_KEY);
      const localWatchlist: WantToWatchItem[] = localData
        ? JSON.parse(localData)
        : [];

      // Fazer merge com dados locais (priorizar dados do Supabase, mas manter dados locais não sincronizados)
      const mergedWatchlist = [...uniqueWatchlist];
      localWatchlist.forEach((localItem) => {
        const existsInSupabase = uniqueWatchlist.some(
          (supabaseItem) =>
            supabaseItem.id === localItem.id &&
            supabaseItem.type === localItem.type
        );
        if (!existsInSupabase) {
          // Item existe localmente mas não no Supabase - adicionar ao merge
          mergedWatchlist.push(localItem);
          console.log(
            `Item local encontrado não sincronizado: ${localItem.title} (${localItem.id})`
          );
        }
      });

      // Remover duplicatas finais
      const finalWatchlist = mergedWatchlist.filter(
        (item, index, self) =>
          index ===
          self.findIndex((w) => w.id === item.id && w.type === item.type)
      );

      setWantToWatchList(finalWatchlist);
      reportSyncSuccess('watchlist', `${finalWatchlist.length} itens encontrados`);

      // Sincronizar com localStorage como backup
      safeLocalStorageSetItem(WANT_TO_WATCH_KEY, JSON.stringify(finalWatchlist));

      // Se houver itens locais não sincronizados, tentar sincronizar
      if (mergedWatchlist.length > uniqueWatchlist.length) {
        const itemsToSync = localWatchlist.filter((localItem) =>
          !uniqueWatchlist.some(
            (supabaseItem) =>
              supabaseItem.id === localItem.id &&
              supabaseItem.type === localItem.type
          )
        );
        // Sincronizar itens locais com Supabase em background
        // Sincronizar itens locais com Supabase em background - BULK INSERT
        if (itemsToSync.length > 0) {
          const BATCH_SIZE = 5;
          for (let i = 0; i < itemsToSync.length; i += BATCH_SIZE) {
            const batch = itemsToSync.slice(i, i + BATCH_SIZE);
            const rowsToInsert = batch.map(item => ({
              user_id: user.id,
              item_id: item.id,
              item_type: item.type,
              item_data: item as any,
            }));

            try {
              const { error } = await supabase.from('user_watchlist').insert(rowsToInsert);
              if (error) throw error;
              console.log(`Sincronizados ${batch.length} itens da watchlist em background (lote ${i / BATCH_SIZE + 1}).`);
            } catch (error) {
              console.error('Erro ao sincronizar lote da watchlist:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
      reportSyncError('watchlist', error);
      // Fallback para localStorage em caso de erro
      loadWantToWatchFromLocalStorage();
    }
  };

  const addToWantToWatch = async (
    item: Omit<WantToWatchItem, 'added_date'>
  ) => {
    // Verificar se o item já existe para evitar duplicatas
    const existingItem = wantToWatchList.find(
      (w) => w.id === item.id && w.type === item.type
    );
    if (existingItem) {
      console.log('Item já existe na lista de quero assistir:', item.title);
      return;
    }

    const newItem: WantToWatchItem = {
      ...item,
      added_date: new Date().toISOString(),
    };



    if (isAuthenticated && user && isSyncEnabled) {
      reportSyncStart('watchlist_add');
      // Add to Supabase
      try {
        const { error } = await supabase.from('user_watchlist').insert({
          user_id: user.id,
          item_id: item.id,
          item_type: item.type,
          item_data: newItem as any,
        });

        if (error) {
          console.error('Error adding to watchlist in Supabase:', error);
          reportSyncError('watchlist_add', error);
          return; // Stop here, error already reported
        }

        // Update local state only after successful Supabase insert
        setWantToWatchList((prev) => {
          const updatedList = [...prev, newItem];
          // Sincronizar com localStorage como backup
          safeLocalStorageSetItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
          return updatedList;
        });
        reportSyncSuccess('watchlist_add');
      } catch (error) {
        console.error('Error adding to watchlist in Supabase:', error);
        reportSyncError('watchlist_add', error);
        // Em caso de erro, ainda salvar no localStorage como fallback
        setWantToWatchList((prev) => {
          const updatedList = [...prev, newItem];
          safeLocalStorageSetItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
          return updatedList;
        });
      }
    } else {
      // Add to localStorage for non-authenticated users
      setWantToWatchList((prev) => {
        const updatedList = [...prev, newItem];
        safeLocalStorageSetItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
        return updatedList;
      });
    }
  };

  const removeFromWantToWatch = async (id: number, type?: 'movie' | 'tv') => {
    // Backup do item antes de remover para possível restauração
    const itemToRemove = wantToWatchList.find(
      (w) => w.id === id && (type ? w.type === type : true)
    );

    // Atualizar estado local otimisticamente
    setWantToWatchList((prev) => {
      const updatedList = prev.filter(
        (item) => !(item.id === id && (type ? item.type === type : true))
      );
      // Atualizar localStorage imediatamente
      safeLocalStorageSetItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
      return updatedList;
    });



    if (isAuthenticated && user && isSyncEnabled) {
      // Remove from Supabase
      try {
        let query = supabase
          .from('user_watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id);
        
        if (type) {
          query = query.eq('item_type', type);
        }

        const { error } = await query;

        if (error) {
          console.error('Error removing from watchlist in Supabase:', error);
          // Se falhar, restaurar item no estado local e localStorage
          if (itemToRemove) {
            setWantToWatchList((prev) => {
              const restoredList = [...prev, itemToRemove];
              safeLocalStorageSetItem(
                WANT_TO_WATCH_KEY,
                JSON.stringify(restoredList)
              );
              return restoredList;
            });
          }
        }
      } catch (error) {
        console.error('Error removing from watchlist in Supabase:', error);
        // Se falhar, restaurar item no estado local e localStorage
        if (itemToRemove) {
          setWantToWatchList((prev) => {
            const restoredList = [...prev, itemToRemove];
            safeLocalStorageSetItem(
              WANT_TO_WATCH_KEY,
              JSON.stringify(restoredList)
            );
            return restoredList;
          });
        }
      }
    }
  };

  const isInWantToWatch = (id: number, type?: 'movie' | 'tv'): boolean => {
    return wantToWatchList.some(
      (item) => item.id === id && (type ? item.type === type : true)
    );
  };

  const getWantToWatchCount = (): number => {
    return wantToWatchList.length;
  };

  // Expose load function for manual sync
  const refresh = async () => {
    if (isAuthenticated && user) {
      await loadWantToWatchFromSupabase();
    } else {
      loadWantToWatchFromLocalStorage();
    }
  };

  return (
    <WantToWatchContext.Provider
      value={{
        wantToWatchList,
        addToWantToWatch,
        removeFromWantToWatch,
        isInWantToWatch,
        getWantToWatchCount,
        refresh,
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
