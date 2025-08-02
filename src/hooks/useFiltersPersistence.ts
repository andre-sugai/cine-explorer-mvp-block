import { useState, useEffect, useCallback } from 'react';
import {
  saveHomeFilters,
  loadHomeFilters,
  clearHomeFilters,
  isDataValid,
  type HomeFiltersData,
} from '@/utils/sessionStorage';
import { restoreScrollPosition as robustRestoreScroll } from '@/utils/scrollManager';

/**
 * Interface que define a estrutura dos filtros salvos no Session Storage
 */
type FiltersState = HomeFiltersData;

/**
 * Hook personalizado para gerenciar a persistência dos filtros da home page
 *
 * Este hook fornece funcionalidades para:
 * - Salvar filtros no Session Storage quando o usuário faz alterações
 * - Restaurar filtros automaticamente quando volta para a home
 * - Manter categoria ativa, ordenação e outros filtros aplicados
 * - Gerenciar a posição do scroll da página
 *
 * @returns Objeto contendo estados dos filtros e funções para gerenciá-los
 */
export const useFiltersPersistence = () => {
  // Estados dos filtros
  const [activeCategory, setActiveCategory] = useState<
    'movies' | 'tv' | 'actors' | 'directors'
  >('movies');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [yearFilter, setYearFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  /**
   * Salva os filtros atuais no Session Storage
   *
   * @param filters - Objeto contendo todos os filtros a serem salvos
   */
  const saveFiltersToStorage = useCallback((filters: FiltersState) => {
    saveHomeFilters(filters);
  }, []);

  /**
   * Carrega os filtros salvos do Session Storage
   *
   * @returns Objeto com os filtros salvos ou null se não houver dados
   */
  const loadFiltersFromStorage = useCallback((): FiltersState | null => {
    return loadHomeFilters();
  }, []);

  /**
   * Limpa todos os filtros salvos do Session Storage
   */
  const clearFiltersFromStorage = useCallback(() => {
    clearHomeFilters();
  }, []);

  /**
   * Salva a posição atual do scroll
   */
  const saveScrollPosition = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollPosition(currentScrollY);

    console.log('🔄 Salvando posição do scroll:', currentScrollY);

    // Salvar diretamente no sessionStorage
    try {
      const savedFilters = loadFiltersFromStorage();
      const updatedFilters = {
        ...savedFilters,
        scrollPosition: currentScrollY,
        lastUpdated: Date.now(),
      };
      saveFiltersToStorage(updatedFilters);
      console.log('✅ Scroll salvo no storage:', currentScrollY);

      // Também salvar em chave separada para maior confiabilidade
      sessionStorage.setItem('homeScrollPosition', currentScrollY.toString());
      console.log('✅ Scroll salvo em chave separada:', currentScrollY);
    } catch (error) {
      console.error('❌ Erro ao salvar scroll:', error);
    }
  }, [loadFiltersFromStorage, saveFiltersToStorage]);

  /**
   * Aplica os filtros salvos aos estados do componente
   */
  const applySavedFilters = useCallback((savedFilters: FiltersState) => {
    console.log('🔧 Aplicando filtros salvos:', {
      activeCategory: savedFilters.activeCategory,
      sortBy: savedFilters.sortBy,
      yearFilter: savedFilters.yearFilter,
      genreFilter: savedFilters.genreFilter,
      providerFilter: savedFilters.providerFilter,
      languageFilter: savedFilters.languageFilter,
      scrollPosition: savedFilters.scrollPosition,
    });

    setActiveCategory(savedFilters.activeCategory || 'movies');
    setSortBy(savedFilters.sortBy || 'popularity.desc');
    setSortOrder(savedFilters.sortOrder || 'desc');
    setYearFilter(savedFilters.yearFilter || '');
    setGenreFilter(savedFilters.genreFilter || '');
    setProviderFilter(savedFilters.providerFilter || '');
    setLanguageFilter(savedFilters.languageFilter || '');
    setSearchTerm(savedFilters.searchTerm || '');
    setScrollPosition(savedFilters.scrollPosition || 0);
    setFiltersLoaded(true);

    console.log('✅ Filtros aplicados com sucesso');
  }, []);

  /**
   * Carrega e aplica os filtros salvos ao montar o componente
   */
  useEffect(() => {
    console.log('🔄 Carregando filtros do storage...');
    const savedFilters = loadFiltersFromStorage();
    if (savedFilters) {
      console.log('📦 Filtros encontrados:', savedFilters);
      // Verificar se os dados ainda são válidos (não expiraram)
      if (isDataValid(savedFilters)) {
        console.log('✅ Filtros válidos, aplicando...');
        applySavedFilters(savedFilters);

        // Não restaurar scroll aqui - deixar para o useNavigationScroll
        console.log(
          '📋 Filtros aplicados, scroll será restaurado pela navegação'
        );
      } else {
        console.log('⏰ Filtros expirados, limpando...');
        // Limpar filtros expirados
        clearFiltersFromStorage();
        setFiltersLoaded(true);
      }
    } else {
      console.log('📭 Nenhum filtro salvo encontrado');
      // Não há filtros salvos, mas ainda precisamos marcar como carregado
      setFiltersLoaded(true);
    }
  }, [loadFiltersFromStorage, applySavedFilters, clearFiltersFromStorage]);

  /**
   * Salva os filtros sempre que qualquer um deles mudar
   */
  useEffect(() => {
    // Só salvar se os filtros já foram carregados (para evitar salvar valores padrão)
    if (filtersLoaded) {
      // Preservar o valor do scroll salvo, não sobrescrever com window.scrollY
      const savedFilters = loadFiltersFromStorage();
      const preservedScrollPosition =
        savedFilters?.scrollPosition || scrollPosition || window.scrollY;

      const currentFilters: FiltersState = {
        activeCategory,
        sortBy,
        sortOrder,
        yearFilter,
        genreFilter,
        providerFilter,
        languageFilter,
        searchTerm,
        scrollPosition: preservedScrollPosition, // ✅ Preserva valor salvo
        lastUpdated: Date.now(),
      };
      saveFiltersToStorage(currentFilters);
      console.log('💾 Filtros salvos:', {
        activeCategory,
        sortBy,
        yearFilter,
        genreFilter,
        providerFilter,
        languageFilter,
        scrollPosition: preservedScrollPosition, // ✅ Log do valor preservado
      });
    }
  }, [
    filtersLoaded,
    activeCategory,
    sortBy,
    sortOrder,
    yearFilter,
    genreFilter,
    providerFilter,
    languageFilter,
    searchTerm,
    scrollPosition, // ✅ Adicionar scrollPosition como dependência
    saveFiltersToStorage,
    loadFiltersFromStorage,
  ]);

  /**
   * Salva a posição do scroll antes de navegar para outra página
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔄 Página sendo fechada, salvando scroll...');
      saveScrollPosition();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('🔄 Página ficando oculta, salvando scroll...');
        saveScrollPosition();
      }
    };

    // Salvar scroll quando a página perde o foco
    const handleBlur = () => {
      console.log('🔄 Página perdendo foco, salvando scroll...');
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [saveScrollPosition]);

  /**
   * Reseta todos os filtros para os valores padrão
   */
  const resetFilters = useCallback(() => {
    setActiveCategory('movies');
    setSortBy('popularity.desc');
    setSortOrder('desc');
    setYearFilter('');
    setGenreFilter('');
    setProviderFilter('');
    setLanguageFilter('');
    setSearchTerm('');
    setScrollPosition(0);
    clearFiltersFromStorage();
  }, [clearFiltersFromStorage]);

  return {
    // Estados dos filtros
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    yearFilter,
    setYearFilter,
    genreFilter,
    setGenreFilter,
    providerFilter,
    setProviderFilter,
    languageFilter,
    setLanguageFilter,
    searchTerm,
    setSearchTerm,
    scrollPosition,
    filtersLoaded,

    // Funções utilitárias
    saveScrollPosition,
    resetFilters,
    clearFiltersFromStorage,
  };
};
