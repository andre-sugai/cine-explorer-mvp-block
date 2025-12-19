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

interface WatchedItem {
  id: number;
  type: 'movie' | 'tv' | 'episode';
  title: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  runtime?: number;
  watchedAt: string;
  year?: number;
  tvId?: number;
  seasonNumber?: number;
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
  refresh: () => Promise<void>;
}

const WatchedContext = createContext<WatchedContextData | undefined>(undefined);

export const WatchedProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { reportSyncStart, reportSyncSuccess, reportSyncError, registerSyncService, isSyncEnabled } = useSyncContext();
  const [watched, setWatched] = useState<WatchedItem[]>([]);

  // Register sync service for auto-retry
  useEffect(() => {
    registerSyncService('watched', async () => {
      if (user) await loadWatchedFromSupabase();
    });
  }, [user]);

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
      try {
        const parsedWatched = JSON.parse(stored);

        // Remover duplicatas baseado em id e type
        const uniqueWatched = parsedWatched.filter(
          (item: WatchedItem, index: number, self: WatchedItem[]) =>
            index ===
            self.findIndex((w) => w.id === item.id && w.type === item.type)
        );

        setWatched(uniqueWatched);

        // Atualizar localStorage com dados limpos se houve duplicatas
        if (uniqueWatched.length !== parsedWatched.length) {
          safeLocalStorageSetItem(
            'cine-explorer-watched',
            JSON.stringify(uniqueWatched)
          );
          console.log(
            `Removidas ${
              parsedWatched.length - uniqueWatched.length
            } duplicatas da lista de assistidos`
          );
        }
      } catch (error) {
        console.error('Error parsing watched list from localStorage:', error);
        setWatched([]);
      }
    }
  };

  const loadWatchedFromSupabase = async () => {
    if (!user) return;

    // Verificar se a sincronização está ativada
    if (!isSyncEnabled) {
      loadWatchedFromLocalStorage();
      return;
    }

    reportSyncStart('watched');
    try {
      // Fetch all data from Supabase with pagination
      let allRemoteWatched: any[] = [];
      let page = 0;
      const PAGE_SIZE = 50; // Reduced from 100 to 50 to further prevent statement timeouts
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('user_watched')
          .select('*')
          .eq('user_id', user.id)
          .order('watched_date', { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) {
          console.error('Error loading watched list page', page, error);
          reportSyncError('watched', error);
          
          // CRITICAL: Read localStorage HERE, in case of error
          const currentLocalData = localStorage.getItem('cine-explorer-watched');
          if (currentLocalData) {
            setWatched(JSON.parse(currentLocalData));
            return;
          }
          break;
        }

        if (data && data.length > 0) {
          allRemoteWatched = [...allRemoteWatched, ...data];
          if (data.length < PAGE_SIZE) {
            hasMore = false;
          } else {
            page++;
            // Optimization: Small delay to let Supabase API breathe
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        } else {
          hasMore = false;
        }
      }

      // CRITICAL FIX: Read localStorage AFTER the network fetch completes.
      // This ensures that any optimistic updates (addToWatched) that happened
      // WHILE the fetch was running are captured here and preserved.
      const localData = localStorage.getItem('cine-explorer-watched');
      const localWatched: WatchedItem[] = localData
        ? JSON.parse(localData)
        : [];

      const formattedWatched =
        allRemoteWatched.map((item) => ({
          ...(item.item_data as any),
          id: Number(item.item_id), // Ensure ID is always a number from the source of truth
          watchedAt: item.watched_date,
        })) || [];

      // Remover duplicatas baseado em id e type
      const uniqueWatched = formattedWatched.filter(
        (item, index, self) =>
          index ===
          self.findIndex((w) => w.id === item.id && w.type === item.type)
      );

      // Fazer merge com dados locais (priorizar dados do Supabase, mas manter dados locais não sincronizados)
      const mergedWatched = [...uniqueWatched];
      localWatched.forEach((localItem) => {
        const existsInSupabase = uniqueWatched.some(
          (supabaseItem) =>
            supabaseItem.id === Number(localItem.id) && // Ensure local comparison is also numeric
            supabaseItem.type === localItem.type
        );
        if (!existsInSupabase) {
          // Item existe localmente mas não no Supabase - adicionar ao merge
          mergedWatched.push({
             ...localItem,
             id: Number(localItem.id) // Ensure local item ID is number
          });
          console.log(
            `Item local encontrado não sincronizado: ${localItem.title} (${localItem.id})`
          );
        }
      });

      // Remover duplicatas finais
      const finalWatched = mergedWatched.filter(
        (item, index, self) =>
          index ===
          self.findIndex((w) => w.id === item.id && w.type === item.type)
      );

      setWatched(finalWatched);
      reportSyncSuccess('watched');

      // Sincronizar com localStorage como backup
      safeLocalStorageSetItem(
        'cine-explorer-watched',
        JSON.stringify(finalWatched)
      );

      // Se houver itens locais não sincronizados, tentar sincronizar
      if (mergedWatched.length > uniqueWatched.length) {
        const itemsToSync = localWatched.filter(
          (localItem) =>
            !uniqueWatched.some(
              (supabaseItem) =>
                supabaseItem.id === Number(localItem.id) &&
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
                  item_id: Number(item.id),
                  item_type: item.type,
                  item_data: item as any,
                  watched_date: item.watchedAt,
                }));

                try {
                  const { error } = await supabase.from('user_watched').insert(rowsToInsert);
                  if (error) throw error;
                  console.log(`Sincronizados ${batch.length} itens assistidos em background (lote ${i / BATCH_SIZE + 1}).`);
                } catch (error) {
                  console.error('Erro ao sincronizar lote de itens assistidos:', error);
                }
            }
        }
      }
    } catch (error) {
      console.error('Error loading watched list:', error);
      reportSyncError('watched', error);
      // Fallback para localStorage em caso de erro
      loadWatchedFromLocalStorage();
    }
  };

  const addToWatched = async (
    item: Omit<WatchedItem, 'watchedAt' | 'year'>
  ) => {
    // Ensure item ID is a number
    const numericId = Number(item.id);
    
    // Verificar se o item já existe para evitar duplicatas
    const existingItem = watched.find(
      (w) => w.id === numericId && w.type === item.type
    );
    if (existingItem) {
      console.log('Item já existe na lista de assistidos:', item.title);
      return;
    }

    const releaseYear = item.release_date
      ? new Date(item.release_date).getFullYear()
      : item.first_air_date
      ? new Date(item.first_air_date).getFullYear()
      : undefined;
    const watchedItem: WatchedItem = {
      ...item,
      id: numericId, // Use numeric ID
      watchedAt: new Date().toISOString(),
      year: releaseYear,
    };

    // OPTIMISTIC UPDATE: Update local state and localStorage immediately
    setWatched((prev) => {
      const newWatched = [...prev, watchedItem];
      safeLocalStorageSetItem(
        'cine-explorer-watched',
        JSON.stringify(newWatched)
      );
      return newWatched;
    });



    if (isAuthenticated && user && isSyncEnabled) {
      // Sync with Supabase in the background
      try {
        const { error } = await supabase.from('user_watched').insert({
          user_id: user.id,
          item_id: item.id,
          item_type: item.type,
          item_data: watchedItem as any,
          watched_date: watchedItem.watchedAt,
        });

        if (error) {
          console.error('Error adding to watched list in Supabase:', error);
          // Silent fail for user, but log error. State is already updated locally.
          // Consider a toast or retry mechanism if critical sync is needed.
        }
      } catch (error) {
        console.error('Error adding to watched list in Supabase:', error);
      }
    }
  };

  const removeFromWatched = async (id: number, type: string) => {
    // Backup do item antes de remover para possível restauração
    const itemToRemove = watched.find((w) => w.id === id && w.type === type);

    // Atualizar estado local otimisticamente
    setWatched((prev) => {
      const newWatched = prev.filter(
        (item) => !(item.id === id && item.type === type)
      );
      // Atualizar localStorage imediatamente
      safeLocalStorageSetItem('cine-explorer-watched', JSON.stringify(newWatched));
      return newWatched;
    });



    if (isAuthenticated && user && isSyncEnabled) {
      // Remove from Supabase
      try {
        const { error } = await supabase
          .from('user_watched')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', type);

        if (error) {
          console.error('Error removing from watched list in Supabase:', error);
          // Se falhar, restaurar item no estado local e localStorage
          if (itemToRemove) {
            setWatched((prev) => {
              const restoredWatched = [...prev, itemToRemove];
              safeLocalStorageSetItem(
                'cine-explorer-watched',
                JSON.stringify(restoredWatched)
              );
              return restoredWatched;
            });
          }
        }
      } catch (error) {
        console.error('Error removing from watched list in Supabase:', error);
        // Se falhar, restaurar item no estado local e localStorage
        if (itemToRemove) {
          setWatched((prev) => {
            const restoredWatched = [...prev, itemToRemove];
            safeLocalStorageSetItem(
              'cine-explorer-watched',
              JSON.stringify(restoredWatched)
            );
            return restoredWatched;
          });
        }
      }
    }
  };

  const clearAllWatched = async () => {
    // Backup dos dados antes de limpar
    const watchedBackup = [...watched];

    // Limpar estado local e localStorage otimisticamente
    setWatched([]);
    localStorage.removeItem('cine-explorer-watched');



    if (isAuthenticated && user && isSyncEnabled) {
      // Clear from Supabase
      try {
        const { error } = await supabase
          .from('user_watched')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error clearing watched list in Supabase:', error);
          // Se falhar, restaurar dados
          setWatched(watchedBackup);
          safeLocalStorageSetItem(
            'cine-explorer-watched',
            JSON.stringify(watchedBackup)
          );
        }
      } catch (error) {
        console.error('Error clearing watched list in Supabase:', error);
        // Se falhar, restaurar dados
        setWatched(watchedBackup);
        safeLocalStorageSetItem(
          'cine-explorer-watched',
          JSON.stringify(watchedBackup)
        );
      }
    }
  };

  const cleanInvalidWatched = () => {
    setWatched((prev) => {
      // Removido filtro de poster_path que deletava episódios sem imagem
      // Mantendo apenas validação básica de ID e Type
      const validWatched = prev.filter((item) => item.id && item.type);
      
      if (validWatched.length !== prev.length) {
        safeLocalStorageSetItem(
          'cine-explorer-watched',
          JSON.stringify(validWatched)
        );
        console.log(
          `Removidos ${prev.length - validWatched.length} itens inválidos (sem ID/Type)`
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

  // Expose load function for manual sync
  const refresh = async () => {
    if (isAuthenticated && user) {
      await loadWatchedFromSupabase();
    } else {
      loadWatchedFromLocalStorage();
    }
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
        refresh,
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
