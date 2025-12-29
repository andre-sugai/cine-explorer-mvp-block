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
  status?: 'following' | 'completed';
}

interface WatchedContextData {
  watched: WatchedItem[];
  addToWatched: (item: Omit<WatchedItem, 'watchedAt' | 'year'>) => void;
  bulkAddToWatched: (items: Omit<WatchedItem, 'watchedAt' | 'year'>[]) => void;
  removeFromWatched: (id: number, type: 'movie' | 'tv' | 'episode') => void;
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
    
    // INSTANT LOADING: Load from localStorage immediately so the user doesn't wait
    loadWatchedFromLocalStorage();

    try {
      // Fetch all data from Supabase with pagination in background
      let allRemoteWatched: any[] = [];
      let page = 0;
      const PAGE_SIZE = 1000; // MUCH larger page size for 200k items
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
          // Local data is already loaded, just stop the sync process
          return;
        }

        if (data && data.length > 0) {
          allRemoteWatched = [...allRemoteWatched, ...data];
          if (data.length < PAGE_SIZE) {
            hasMore = false;
          } else {
            page++;
            // No more delay needed with large pages, but yielded to event loop
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } else {
          hasMore = false;
        }

        // Safety break to prevent infinite loops if something goes wrong with 200k items
        if (page > 250) { 
           console.warn('Reached safety limit of 250k items. Stopping sync.');
           break;
        }
      }

      // CRITICAL FIX: Read localStorage AFTER the network fetch completes.
      // This ensures that any optimistic updates (addToWatched) that happened
      // WHILE the fetch was running are captured here and preserved.
      const localData = localStorage.getItem('cine-explorer-watched');
      const localWatched: WatchedItem[] = localData
        ? JSON.parse(localData)
        : [];

      // 1. Create a Map of remote items for O(1) deduplication and merge
      const remoteMap = new Map<string, WatchedItem>();
      
      allRemoteWatched.forEach(item => {
        const id = Number(item.item_id);
        const type = item.item_type;
        const key = `${id}-${type}`;
        
        // If multiple entries exist in remote (due to redundancy bug), 
        // the last one (most recent due to order) will be kept
        if (!remoteMap.has(key)) {
          remoteMap.set(key, {
            ...(item.item_data as any),
            id,
            watchedAt: item.watched_date,
          });
        }
      });

      const uniqueSupabaseWatched = Array.from(remoteMap.values());

      // 2. Merge with local data
      const finalWatchedMap = new Map<string, WatchedItem>(remoteMap);
      
      localWatched.forEach((localItem) => {
        const key = `${Number(localItem.id)}-${localItem.type}`;
        if (!finalWatchedMap.has(key)) {
          finalWatchedMap.set(key, {
            ...localItem,
            id: Number(localItem.id)
          });
          console.log(`Item local não sincronizado adicionado ao merge: ${localItem.title}`);
        }
      });

      const finalWatched = Array.from(finalWatchedMap.values());
      setWatched(finalWatched);
      reportSyncSuccess('watched', `${finalWatched.length} itens encontrados`);

      // Sincronizar com localStorage como backup
      safeLocalStorageSetItem(
        'cine-explorer-watched',
        JSON.stringify(finalWatched)
      );

      // Se houver itens locais não sincronizados, tentar sincronizar
      if (finalWatched.length > uniqueSupabaseWatched.length) {
        const itemsToSync = localWatched.filter((localItem) => {
          const key = `${Number(localItem.id)}-${localItem.type}`;
          return !remoteMap.has(key);
        });

        if (itemsToSync.length > 0) {
            console.log(`Iniciando sincronismo de ${itemsToSync.length} itens locais...`);
            const BATCH_SIZE = 100; // Larger batches for performance
            for (let i = 0; i < itemsToSync.length; i += BATCH_SIZE) {
                const batch = itemsToSync.slice(i, i + BATCH_SIZE);
                const rowsToInsert = batch.map(item => ({
                  user_id: user.id,
                  item_id: Number(item.id),
                  item_type: item.type,
                  item_data: {
                    ...item,
                    id: Number(item.id)
                  } as any,
                  watched_date: item.watchedAt,
                }));

                try {
                  const { error } = await supabase.from('user_watched').insert(rowsToInsert);
                  if (error) {
                    if (error.code === '23505') {
                        console.log('Alguns itens já existem no Supabase (conflito de unique), ignorando lote.');
                    } else {
                        throw error;
                    }
                  }
                  console.log(`Sincronizados ${batch.length} itens assistidos (lote ${i / BATCH_SIZE + 1}).`);
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
    await bulkAddToWatched([item]);
  };

  const bulkAddToWatched = async (
    items: Omit<WatchedItem, 'watchedAt' | 'year'>[]
  ) => {
    // 1. Optimistic Update Local State
    setWatched((prev) => {
      const newWatched = [...prev];
      const now = new Date().toISOString();

      items.forEach((item) => {
        const numericId = Number(item.id);
        const existingItemIndex = newWatched.findIndex(
          (w) =>
            w.id === numericId &&
            w.type === item.type &&
            // Para episódios, verifica temporada e numero
            (item.type === 'episode'
              ? w.seasonNumber === item.seasonNumber && w.tvId === item.tvId
              : true)
        );

        const releaseYear = item.release_date
          ? new Date(item.release_date).getFullYear()
          : item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : undefined;

        const watchedItem: WatchedItem = {
          ...item,
          id: numericId,
          watchedAt: now,
          year: releaseYear,
        };

        if (existingItemIndex > -1) {
          // Update existing
          newWatched[existingItemIndex] = {
            ...newWatched[existingItemIndex],
            ...watchedItem,
          };
          console.log(`Updated: ${item.title}`);
        } else {
          // Add new
          newWatched.push(watchedItem);
        }
      });

      safeLocalStorageSetItem(
        'cine-explorer-watched',
        JSON.stringify(newWatched)
      );
      return newWatched;
    });

    // 2. Sync to Supabase in background (if user is logged in)
    if (user && isSyncEnabled) {
      const syncService = items.length === 1 ? 'watched_add' : 'watched_bulk_add';
      reportSyncStart(syncService);
      
      const rowsToInsert = items.map(item => {
        const now = new Date().toISOString();
        return {
          user_id: user.id,
          item_id: Number(item.id),
          item_type: item.type,
          item_data: {
            ...item,
            id: Number(item.id),
            watchedAt: now,
          } as any,
          watched_date: now,
        };
      });

      try {
        const { error } = await supabase.from('user_watched').insert(rowsToInsert);
        if (error) throw error;
        reportSyncSuccess(syncService);
      } catch (error) {
        console.error(`Error syncing ${syncService} to Supabase:`, error);
        reportSyncError(syncService, error);
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
        bulkAddToWatched,
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
