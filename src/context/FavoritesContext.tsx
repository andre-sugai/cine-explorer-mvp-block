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

interface FavoriteItem {
  id: number;
  type: 'movie' | 'tv' | 'person';
  title: string;
  poster_path?: string;
  profile_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  known_for_department?: string;
  addedAt: string;
}

interface FavoritesContextData {
  favorites: FavoriteItem[];
  addToFavorites: (item: Omit<FavoriteItem, 'addedAt'>) => Promise<void>;
  removeFromFavorites: (id: number, type: string) => Promise<void>;
  clearAllFavorites: () => Promise<void>;
  getFavoritesByType: (type: 'movie' | 'tv' | 'person') => FavoriteItem[];
  getStats: () => {
    total: number;
    movies: number;
    series: number;
    people: number;
  };
  isFavorite: (id: number, type: string) => boolean;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextData | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { reportSyncStart, reportSyncSuccess, reportSyncError, registerSyncService, isSyncEnabled } = useSyncContext();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Register sync service for auto-retry
  useEffect(() => {
    registerSyncService('favorites', async () => {
      if (user) await loadFavoritesFromSupabase();
    });
  }, [user]);

  // Load data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavoritesFromSupabase();
    } else {
      loadFavoritesFromLocalStorage();
    }
  }, [isAuthenticated, user]);

  const loadFavoritesFromLocalStorage = () => {
    const stored = localStorage.getItem('cine-explorer-favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  };

  const loadFavoritesFromSupabase = async () => {
    if (!user) return;

    // Verificar se a sincronização está ativada
    if (!isSyncEnabled) {
      loadFavoritesFromLocalStorage();
      return;
    }

    reportSyncStart('favorites');
    setIsLoading(true);

    // INSTANT LOADING: Load from localStorage immediately
    loadFavoritesFromLocalStorage();

    try {
      // Fetch data from Supabase in background
      let allRemoteFavorites: any[] = [];
      let page = 0;
      const PAGE_SIZE = 50;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) {
          console.error('Error loading favorites page', page, error);
          reportSyncError('favorites', error);
          // Local data is already loaded, no need to return or fallback
          return; // STOP synchronization instead of just breaking the loop
        }

        if (data && data.length > 0) {
          allRemoteFavorites = [...allRemoteFavorites, ...data];
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

      const formattedFavorites =
        allRemoteFavorites.map((item) => ({
          ...(item.item_data as any),
          addedAt: item.created_at,
        })) || [];

      // Remover duplicatas baseado em id e type
      const uniqueFavorites = formattedFavorites.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (f) => f.id === item.id && f.type === item.type
          )
      );

      // CRITICAL FIX: Read localStorage AFTER the network fetch completes.
      const localData = localStorage.getItem('cine-explorer-favorites');
      const localFavorites: FavoriteItem[] = localData
        ? JSON.parse(localData)
        : [];

      // Fazer merge com dados locais (priorizar dados do Supabase, mas manter dados locais não sincronizados)
      const mergedFavorites = [...uniqueFavorites];
      localFavorites.forEach((localItem) => {
        const existsInSupabase = uniqueFavorites.some(
          (supabaseItem) =>
            supabaseItem.id === localItem.id &&
            supabaseItem.type === localItem.type
        );
        if (!existsInSupabase) {
          // Item existe localmente mas não no Supabase - adicionar ao merge
          mergedFavorites.push(localItem);
          console.log(
            `Item local encontrado não sincronizado: ${localItem.title} (${localItem.id})`
          );
        }
      });

      // Remover duplicatas finais
      const finalFavorites = mergedFavorites.filter(
        (item, index, self) =>
          index ===
          self.findIndex((f) => f.id === item.id && f.type === item.type)
      );

      setFavorites(finalFavorites);
      reportSyncSuccess('favorites', `${finalFavorites.length} itens encontrados`);

      // Sincronizar com localStorage como backup
      safeLocalStorageSetItem(
        'cine-explorer-favorites',
        JSON.stringify(finalFavorites)
      );

      // Se houver itens locais não sincronizados, tentar sincronizar
      if (mergedFavorites.length > uniqueFavorites.length) {
        const itemsToSync = localFavorites.filter((localItem) =>
          !uniqueFavorites.some(
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
              const { error } = await supabase.from('user_favorites').insert(rowsToInsert);
              if (error) throw error;
              console.log(`Sincronizados ${batch.length} favoritos em background (lote ${i / BATCH_SIZE + 1}).`);
            } catch (error) {
              console.error('Erro ao sincronizar lote de favoritos:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      reportSyncError('favorites', error);
      // Fallback para localStorage em caso de erro
      loadFavoritesFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (item: Omit<FavoriteItem, 'addedAt'>) => {
    const favoriteItem: FavoriteItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };

    // Atualizar estado local otimisticamente
    setFavorites((prev) => [...prev, favoriteItem]);



    if (isAuthenticated && user && isSyncEnabled) {
      reportSyncStart('favorites_add');
      // Tentar adicionar ao Supabase
      try {
        const { error } = await supabase.from('user_favorites').insert({
          user_id: user.id,
          item_id: item.id,
          item_type: item.type,
          item_data: favoriteItem as any,
        });

        if (error) {
          reportSyncError('favorites_add', error);
          // Se falhar, reverter estado local
          setFavorites((prev) =>
            prev.filter(
              (fav) => !(fav.id === item.id && fav.type === item.type)
            )
          );
          console.error('Error adding to favorites in Supabase:', error);
          return; // Stop here, error already reported
        }

        // Se sucesso, atualizar localStorage como backup
        setFavorites((current) => {
          safeLocalStorageSetItem(
            'cine-explorer-favorites',
            JSON.stringify(current)
          );
          return current;
        });
        reportSyncSuccess('favorites_add');
      } catch (error) {
        reportSyncError('favorites_add', error);
        // Reverter estado local em caso de erro
        setFavorites((prev) =>
          prev.filter((fav) => !(fav.id === item.id && fav.type === item.type))
        );
        throw error; // Propagar erro para componente tratar
      }
    } else {
      // Usuário não logado - usar localStorage
      setFavorites((current) => {
        safeLocalStorageSetItem(
          'cine-explorer-favorites',
          JSON.stringify(current)
        );
        return current;
      });
    }
  };

  const removeFromFavorites = async (id: number, type: string) => {
    // Backup do item antes de remover
    const itemToRemove = favorites.find(
      (fav) => fav.id === id && fav.type === type
    );

    // Remover do estado local otimisticamente
    setFavorites((prev) =>
      prev.filter((fav) => !(fav.id === id && fav.type === type))
    );



    if (isAuthenticated && user && isSyncEnabled) {
      // Tentar remover do Supabase
      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', type);

        if (error) {
          // Se falhar, restaurar item no estado local
          if (itemToRemove) {
            setFavorites((prev) => [...prev, itemToRemove]);
          }
          console.error('Error removing from favorites in Supabase:', error);
          throw new Error('Falha ao remover favorito. Tente novamente.');
        }

        // Se sucesso, atualizar localStorage
        setFavorites((current) => {
          safeLocalStorageSetItem(
            'cine-explorer-favorites',
            JSON.stringify(current)
          );
          return current;
        });
      } catch (error) {
        // Restaurar item em caso de erro
        if (itemToRemove) {
          setFavorites((prev) => [...prev, itemToRemove]);
        }
        throw error;
      }
    } else {
      // Usuário não logado - atualizar localStorage
      setFavorites((current) => {
        safeLocalStorageSetItem(
          'cine-explorer-favorites',
          JSON.stringify(current)
        );
        return current;
      });
    }
  };

  const clearAllFavorites = async () => {
    // Backup dos favoritos antes de limpar
    const favoritesBackup = [...favorites];

    // Limpar estado local otimisticamente
    setFavorites([]);



    if (isAuthenticated && user && isSyncEnabled) {
      // Tentar limpar do Supabase
      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          // Se falhar, restaurar favoritos
          setFavorites(favoritesBackup);
          console.error('Error clearing favorites in Supabase:', error);
          throw new Error('Falha ao limpar favoritos. Tente novamente.');
        }

        // Se sucesso, limpar localStorage
        localStorage.removeItem('cine-explorer-favorites');
      } catch (error) {
        // Restaurar favoritos em caso de erro
        setFavorites(favoritesBackup);
        throw error;
      }
    } else {
      // Usuário não logado - limpar localStorage
      localStorage.removeItem('cine-explorer-favorites');
    }
  };

  const getFavoritesByType = (type: 'movie' | 'tv' | 'person') => {
    return favorites
      .filter((fav) => fav.type === type)
      .sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
  };

  const getStats = () => {
    const movies = getFavoritesByType('movie');
    const series = getFavoritesByType('tv');
    const people = getFavoritesByType('person');
    return {
      total: favorites.length,
      movies: movies.length,
      series: series.length,
      people: people.length,
    };
  };

  const isFavorite = (id: number, type: string) => {
    return favorites.some((fav) => fav.id === id && fav.type === type);
  };

  // Expose load function for manual sync
  const refresh = async () => {
    if (isAuthenticated && user) {
      await loadFavoritesFromSupabase();
    } else {
      loadFavoritesFromLocalStorage();
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        clearAllFavorites,
        getFavoritesByType,
        getStats,
        isFavorite,
        refresh,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavoritesContext(): FavoritesContextData {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error(
      'useFavoritesContext deve ser usado dentro de um FavoritesProvider'
    );
  }
  return context;
}

/**
 * Contexto global para favoritos usando Context API.
 * Fornece métodos para adicionar, remover, limpar e consultar favoritos de qualquer lugar da aplicação.
 * Deve envolver o App ou o componente de mais alto nível que precisa acessar favoritos.
 */
