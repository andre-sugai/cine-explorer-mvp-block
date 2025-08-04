import { useEffect, useCallback } from 'react';

interface UseScrollManagerProps {
  saveScrollPosition: () => void;
  isRestored: boolean;
}

export const useScrollManager = ({ saveScrollPosition, isRestored }: UseScrollManagerProps) => {
  // Salvar posição do scroll periodicamente durante navegação
  const handleScroll = useCallback(() => {
    if (!isRestored) return;
    saveScrollPosition();
  }, [saveScrollPosition, isRestored]);

  // Adicionar listener de scroll com throttle
  useEffect(() => {
    if (!isRestored) return;

    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 500); // Salvar a cada 500ms
    };

    window.addEventListener('scroll', throttledHandleScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll, isRestored]);

  // Salvar posição antes de sair da página
  useEffect(() => {
    if (!isRestored) return;

    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveScrollPosition, isRestored]);
};