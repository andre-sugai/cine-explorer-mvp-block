import { useState, useEffect, useCallback } from 'react';

type ContentCategory = 'movies' | 'tv' | 'actors' | 'directors' | 'cinema';

interface FiltersState {
  activeCategory: ContentCategory;
  selectedProvider: string;
  selectedGenre: string;
  selectedOrder: string;
  selectedYear: string;
  selectedLanguage: string;
  selectedStreamings: number[];
  searchTerm: string;
  scrollPosition: number;
}

const FILTERS_STORAGE_KEY = 'cine_explorer_home_filters';

// Salvar filtros no Session Storage
const saveFiltersToStorage = (filters: FiltersState) => {
  try {
    sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn('Erro ao salvar filtros:', error);
  }
};

// Carregar filtros do Session Storage
const loadFiltersFromStorage = (): FiltersState | null => {
  try {
    const saved = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Erro ao carregar filtros:', error);
    return null;
  }
};

// Limpar filtros do Session Storage
const clearFiltersFromStorage = () => {
  try {
    sessionStorage.removeItem(FILTERS_STORAGE_KEY);
  } catch (error) {
    console.warn('Erro ao limpar filtros:', error);
  }
};

export const useFilterPersistence = () => {
  const [activeCategory, setActiveCategory] =
    useState<ContentCategory>('movies');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('popularity.desc');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedStreamings, setSelectedStreamings] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRestored, setIsRestored] = useState(false);

  // Carregar filtros salvos ao montar componente
  useEffect(() => {
    const savedFilters = loadFiltersFromStorage();
    if (savedFilters) {
      setActiveCategory(savedFilters.activeCategory || 'movies');
      setSelectedProvider(savedFilters.selectedProvider || '');
      setSelectedGenre(savedFilters.selectedGenre || '');
      setSelectedOrder(savedFilters.selectedOrder || 'popularity.desc');
      setSelectedYear(savedFilters.selectedYear || '');
      setSelectedLanguage(savedFilters.selectedLanguage || '');
      setSelectedStreamings(savedFilters.selectedStreamings || []);
      setSearchTerm(savedFilters.searchTerm || '');

      // Restaurar scroll position após um pequeno delay
      setTimeout(() => {
        if (savedFilters.scrollPosition > 0) {
          window.scrollTo({
            top: savedFilters.scrollPosition,
            behavior: 'smooth',
          });
        }
      }, 200);
    }
    setIsRestored(true);
  }, []);

  // Salvar filtros sempre que mudarem (após a restauração inicial)
  useEffect(() => {
    if (!isRestored) return;

    const currentFilters: FiltersState = {
      activeCategory,
      selectedProvider,
      selectedGenre,
      selectedOrder,
      selectedYear,
      selectedLanguage,
      selectedStreamings,
      searchTerm,
      scrollPosition: window.scrollY || 0,
    };

    saveFiltersToStorage(currentFilters);
  }, [
    activeCategory,
    selectedProvider,
    selectedGenre,
    selectedOrder,
    selectedYear,
    selectedLanguage,
    selectedStreamings,
    searchTerm,
    isRestored,
  ]);

  // Salvar posição do scroll antes de navegar
  const saveScrollPosition = useCallback(() => {
    if (!isRestored) return;

    const currentFilters: FiltersState = {
      activeCategory,
      selectedProvider,
      selectedGenre,
      selectedOrder,
      selectedYear,
      selectedLanguage,
      selectedStreamings,
      searchTerm,
      scrollPosition: window.scrollY || 0,
    };

    saveFiltersToStorage(currentFilters);
  }, [
    activeCategory,
    selectedProvider,
    selectedGenre,
    selectedOrder,
    selectedYear,
    selectedLanguage,
    selectedStreamings,
    searchTerm,
    isRestored,
  ]);

  // Resetar todos os filtros
  const resetFilters = useCallback(() => {
    setActiveCategory('movies');
    setSelectedProvider('');
    setSelectedGenre('');
    setSelectedOrder('popularity.desc');
    setSelectedYear('');
    setSelectedLanguage('');
    setSelectedStreamings([]);
    setSearchTerm('');
    clearFiltersFromStorage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    // Estados dos filtros
    activeCategory,
    selectedProvider,
    selectedGenre,
    selectedOrder,
    selectedYear,
    selectedLanguage,
    selectedStreamings,
    searchTerm,

    // Setters
    setActiveCategory,
    setSelectedProvider,
    setSelectedGenre,
    setSelectedOrder,
    setSelectedYear,
    setSelectedLanguage,
    setSelectedStreamings,
    setSearchTerm,

    // Utilitários
    saveScrollPosition,
    resetFilters,
    isRestored,
  };
};
