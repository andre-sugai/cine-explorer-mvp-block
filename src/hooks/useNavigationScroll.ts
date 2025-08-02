import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Hook personalizado para gerenciar a posição do scroll durante a navegação
 */
export const useNavigationScroll = (
  saveScrollPosition: () => void,
  restoreScrollPosition: () => void,
  filtersLoaded: boolean = false
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRestoredScroll = useRef<boolean>(false);

  /**
   * Salva a posição do scroll antes de navegar para outra página
   */
  const navigateWithScrollSave = useCallback(
    (to: string) => {
      console.log('🚀 Navegando para:', to, 'Salvando scroll...');
      saveScrollPosition();
      navigate(to);
    },
    [navigate, saveScrollPosition]
  );

  /**
   * Função para salvar scroll em chave separada
   */
  const saveScrollToStorage = useCallback((position: number) => {
    try {
      sessionStorage.setItem('homeScrollPosition', position.toString());
      console.log('💾 Scroll salvo em chave separada:', position);
    } catch (error) {
      console.error('❌ Erro ao salvar scroll:', error);
    }
  }, []);

  /**
   * Função para restaurar scroll de chave separada
   */
  const restoreScrollFromStorage = useCallback(() => {
    try {
      const savedPosition = sessionStorage.getItem('homeScrollPosition');
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        if (position > 0) {
          console.log('�� Restaurando scroll:', position);

          // Tentar imediatamente
          window.scrollTo(0, position);

          // Tentar com delays
          [100, 300, 500, 1000, 2000].forEach((delay, index) => {
            setTimeout(() => {
              window.scrollTo({
                top: position,
                behavior: index === 0 ? 'smooth' : 'instant',
              });

              // Verificar se funcionou
              setTimeout(() => {
                const currentScroll = window.scrollY;
                if (Math.abs(currentScroll - position) < 50) {
                  console.log('✅ Scroll restaurado com sucesso!');
                  hasRestoredScroll.current = true;
                }
              }, 100);
            }, delay);
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao restaurar scroll:', error);
    }
  }, []);

  /**
   * Salvar scroll quando a página fica oculta
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 0) {
        saveScrollToStorage(currentScroll);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const currentScroll = window.scrollY;
        if (currentScroll > 0) {
          saveScrollToStorage(currentScroll);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveScrollToStorage]);

  /**
   * Restaurar scroll quando chegamos na home
   */
  useEffect(() => {
    if (location.pathname === '/') {
      hasRestoredScroll.current = false;

      // Tentar restaurar imediatamente
      restoreScrollFromStorage();

      // Tentar novamente após delays
      [500, 1000, 2000].forEach((delay) => {
        setTimeout(() => {
          if (!hasRestoredScroll.current) {
            restoreScrollFromStorage();
          }
        }, delay);
      });
    }
  }, [location.pathname, restoreScrollFromStorage]);

  /**
   * Restaurar scroll quando os filtros são carregados
   */
  useEffect(() => {
    if (
      filtersLoaded &&
      location.pathname === '/' &&
      !hasRestoredScroll.current
    ) {
      restoreScrollFromStorage();
    }
  }, [filtersLoaded, location.pathname, restoreScrollFromStorage]);

  /**
   * Monitorar eventos de navegação do browser
   */
  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname === '/') {
        hasRestoredScroll.current = false;
        setTimeout(() => restoreScrollFromStorage(), 100);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, restoreScrollFromStorage]);

  return {
    navigateWithScrollSave,
  };
};
