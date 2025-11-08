import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
      // Carregar dados do localStorage primeiro (backup local)
      const localData = localStorage.getItem(WANT_TO_WATCH_KEY);
      const localWatchlist: WantToWatchItem[] = localData
        ? JSON.parse(localData)
        : [];

      const { data, error } = await supabase
        .from('user_watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading watchlist:', error);
        // Em caso de erro, usar dados do localStorage
        if (localWatchlist.length > 0) {
          setWantToWatchList(localWatchlist);
        }
        return;
      }

      const formattedWatchlist =
        data?.map((item) => ({
          ...(item.item_data as any),
          added_date: item.created_at,
        })) || [];

      // Remover duplicatas baseado em id e type
      const uniqueWatchlist = formattedWatchlist.filter(
        (item, index, self) =>
          index ===
          self.findIndex((w) => w.id === item.id && w.type === item.type)
      );

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

      // Sincronizar com localStorage como backup
      localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(finalWatchlist));

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
        Promise.all(
          itemsToSync.map(async (item) => {
            try {
              await supabase.from('user_watchlist').insert({
                user_id: user.id,
                item_id: item.id,
                item_type: item.type,
                item_data: item as any,
              });
            } catch (error) {
              // Ignorar erros de duplicata (item já existe)
              console.log('Item já sincronizado ou erro ao sincronizar:', item.title);
            }
          })
        ).catch((error) => {
          console.error('Erro ao sincronizar itens em background:', error);
        });
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
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

    if (isAuthenticated && user) {
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
          throw error;
        }

        // Update local state only after successful Supabase insert
        setWantToWatchList((prev) => {
          const updatedList = [...prev, newItem];
          // Sincronizar com localStorage como backup
          localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
          return updatedList;
        });
      } catch (error) {
        console.error('Error adding to watchlist in Supabase:', error);
        // Em caso de erro, ainda salvar no localStorage como fallback
        setWantToWatchList((prev) => {
          const updatedList = [...prev, newItem];
          localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
          return updatedList;
        });
      }
    } else {
      // Add to localStorage for non-authenticated users
      setWantToWatchList((prev) => {
        const updatedList = [...prev, newItem];
        localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
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
      localStorage.setItem(WANT_TO_WATCH_KEY, JSON.stringify(updatedList));
      return updatedList;
    });

    if (isAuthenticated && user) {
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
              localStorage.setItem(
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
            localStorage.setItem(
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
