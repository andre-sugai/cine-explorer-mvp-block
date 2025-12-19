import { useState, useEffect, useCallback } from 'react';

interface WantToWatchFiltersState {
  searchTerm: string;
  activeTab: string;
  orderBy: 'date' | 'rating';
  orderDirection: 'asc' | 'desc';
  selectedStreaming: string;
  selectedRating: string;
  scrollPosition: number;
}

const WANT_TO_WATCH_FILTERS_KEY = 'cine_explorer_want_to_watch_filters';

// Salvar filtros no sessionStorage para persistir apenas na sessão atual
const saveFiltersToStorage = (filters: WantToWatchFiltersState) => {
  try {
    sessionStorage.setItem(WANT_TO_WATCH_FILTERS_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn('Erro ao salvar filtros da página Quero Assistir:', error);
  }
};

// Carregar filtros do sessionStorage
const loadFiltersFromStorage = (): WantToWatchFiltersState | null => {
  try {
    const saved = sessionStorage.getItem(WANT_TO_WATCH_FILTERS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Erro ao carregar filtros da página Quero Assistir:', error);
    return null;
  }
};

// Limpar filtros do sessionStorage
const clearFiltersFromStorage = () => {
  try {
    sessionStorage.removeItem(WANT_TO_WATCH_FILTERS_KEY);
  } catch (error) {
    console.warn('Erro ao limpar filtros da página Quero Assistir:', error);
  }
};

export const useWantToWatchFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [orderBy, setOrderBy] = useState<'date' | 'rating'>('date');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedStreaming, setSelectedStreaming] = useState('0');
  const [selectedRating, setSelectedRating] = useState('');
  const [isRestored, setIsRestored] = useState(false);

  // Carregar filtros salvos ao montar o componente
  useEffect(() => {
    const savedFilters = loadFiltersFromStorage();
    if (savedFilters) {
      setSearchTerm(savedFilters.searchTerm || '');
      setActiveTab(savedFilters.activeTab || 'all');
      setOrderBy(savedFilters.orderBy || 'date');
      setOrderDirection(savedFilters.orderDirection || 'desc');
      setSelectedStreaming(savedFilters.selectedStreaming || '0');
      setSelectedRating(savedFilters.selectedRating || '');

      // Restaurar posição do scroll após um pequeno delay
      setTimeout(() => {
        if (savedFilters.scrollPosition > 0) {
          window.scrollTo({
            top: savedFilters.scrollPosition,
            behavior: 'smooth',
          });
        }
      }, 300);
    }
    setIsRestored(true);
  }, []);

  // Salvar filtros sempre que mudarem (após restauração inicial)
  useEffect(() => {
    if (!isRestored) return;

    const currentFilters: WantToWatchFiltersState = {
      searchTerm,
      activeTab,
      orderBy,
      orderDirection,
      selectedStreaming,
      scrollPosition: window.scrollY || 0,
    };

    saveFiltersToStorage(currentFilters);
  }, [
    searchTerm,
    activeTab,
    orderBy,
    orderDirection,
    selectedStreaming,
    isRestored,
  ]);

  // Salvar posição do scroll antes de navegar
  const saveScrollPosition = useCallback(() => {
    if (!isRestored) return;

    const currentFilters: WantToWatchFiltersState = {
      searchTerm,
      activeTab,
      orderBy,
      orderDirection,
      selectedStreaming,
      scrollPosition: window.scrollY || 0,
    };

    saveFiltersToStorage(currentFilters);
  }, [
    searchTerm,
    activeTab,
    orderBy,
    orderDirection,
    selectedStreaming,
    isRestored,
  ]);

  // Resetar todos os filtros
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setActiveTab('all');
    setOrderBy('date');
    setOrderDirection('desc');
    setSelectedStreaming('0');
    setSelectedRating('');
    clearFiltersFromStorage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    // Estados dos filtros
    searchTerm,
    activeTab,
    orderBy,
    orderDirection,
    selectedStreaming,
    selectedRating,

    // Setters
    setSearchTerm,
    setActiveTab,
    setOrderBy,
    setOrderDirection,
    setSelectedStreaming,
    setSelectedRating,

    // Utilitários
    saveScrollPosition,
    resetFilters,
    isRestored,
  };
};
