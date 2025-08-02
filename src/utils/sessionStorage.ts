/**
 * Utilitários para gerenciar o Session Storage do Cine Explorer
 */

const STORAGE_KEYS = {
  HOME_FILTERS: 'cine_explorer_home_filters',
  USER_PREFERENCES: 'cine_explorer_user_preferences',
  SEARCH_HISTORY: 'cine_explorer_search_history',
} as const;

/**
 * Interface para dados de filtros da home page
 */
export interface HomeFiltersData {
  activeCategory: 'movies' | 'tv' | 'actors' | 'directors';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  yearFilter: string;
  genreFilter: string;
  providerFilter: string;
  languageFilter: string;
  searchTerm: string;
  scrollPosition: number;
  lastUpdated: number;
}

/**
 * Salva dados no Session Storage com tratamento de erro
 *
 * @param key - Chave para armazenar os dados
 * @param data - Dados a serem salvos
 * @returns true se salvou com sucesso, false caso contrário
 */
export const saveToSessionStorage = <T>(key: string, data: T): boolean => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn(`Erro ao salvar dados no Session Storage (${key}):`, error);

    // Tentar limpar dados antigos se o storage estiver cheio
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      clearOldSessionData();
      try {
        sessionStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (retryError) {
        console.error(`Falha ao salvar após limpeza (${key}):`, retryError);
        return false;
      }
    }

    return false;
  }
};

/**
 * Carrega dados do Session Storage com tratamento de erro
 *
 * @param key - Chave dos dados a serem carregados
 * @returns Dados carregados ou null se não existir/erro
 */
export const loadFromSessionStorage = <T>(key: string): T | null => {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn(`Erro ao carregar dados do Session Storage (${key}):`, error);
    return null;
  }
};

/**
 * Remove dados específicos do Session Storage
 *
 * @param key - Chave dos dados a serem removidos
 */
export const removeFromSessionStorage = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Erro ao remover dados do Session Storage (${key}):`, error);
  }
};

/**
 * Limpa dados antigos do Session Storage para liberar espaço
 */
export const clearOldSessionData = (): void => {
  try {
    const keys = Object.keys(sessionStorage);
    const cineExplorerKeys = keys.filter((key) =>
      key.startsWith('cine_explorer_')
    );

    // Remover dados com mais de 24 horas
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    cineExplorerKeys.forEach((key) => {
      try {
        const data = sessionStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.lastUpdated && parsed.lastUpdated < oneDayAgo) {
            sessionStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Se não conseguir parsear, remover de qualquer forma
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Erro ao limpar dados antigos do Session Storage:', error);
  }
};

/**
 * Obtém informações sobre o uso do Session Storage
 *
 * @returns Objeto com informações sobre o uso do storage
 */
export const getSessionStorageInfo = () => {
  try {
    const totalSpace = 5 * 1024 * 1024; // 5MB (estimativa)
    let usedSpace = 0;
    const keys = Object.keys(sessionStorage);

    keys.forEach((key) => {
      usedSpace += sessionStorage.getItem(key)?.length || 0;
    });

    return {
      usedSpace,
      totalSpace,
      usagePercentage: (usedSpace / totalSpace) * 100,
      itemCount: keys.length,
    };
  } catch (error) {
    console.warn('Erro ao obter informações do Session Storage:', error);
    return null;
  }
};

/**
 * Salva filtros da home page no Session Storage
 *
 * @param filters - Dados dos filtros a serem salvos
 * @returns true se salvou com sucesso
 */
export const saveHomeFilters = (filters: HomeFiltersData): boolean => {
  return saveToSessionStorage(STORAGE_KEYS.HOME_FILTERS, filters);
};

/**
 * Carrega filtros da home page do Session Storage
 *
 * @returns Dados dos filtros ou null se não existir
 */
export const loadHomeFilters = (): HomeFiltersData | null => {
  return loadFromSessionStorage<HomeFiltersData>(STORAGE_KEYS.HOME_FILTERS);
};

/**
 * Remove filtros da home page do Session Storage
 */
export const clearHomeFilters = (): void => {
  removeFromSessionStorage(STORAGE_KEYS.HOME_FILTERS);
};

/**
 * Verifica se os dados salvos ainda são válidos (não expiraram)
 *
 * @param data - Dados salvos com timestamp
 * @param maxAge - Idade máxima em milissegundos (padrão: 24 horas)
 * @returns true se os dados são válidos
 */
export const isDataValid = (
  data: { lastUpdated?: number },
  maxAge: number = 24 * 60 * 60 * 1000
): boolean => {
  if (!data.lastUpdated) return false;
  return Date.now() - data.lastUpdated < maxAge;
};

export { STORAGE_KEYS };
