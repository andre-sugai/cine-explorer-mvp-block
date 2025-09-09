import { useEffect } from 'react';

interface UseWantToWatchScrollManagerProps {
  saveScrollPosition: () => void;
  isRestored: boolean;
}

export const useWantToWatchScrollManager = ({
  saveScrollPosition,
  isRestored,
}: UseWantToWatchScrollManagerProps) => {
  // Salvar posição do scroll ao sair da página (beforeunload)
  useEffect(() => {
    if (!isRestored) return;

    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    // Salvar ao fechar/atualizar a página
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveScrollPosition, isRestored]);

  // Salvar posição do scroll periodicamente durante navegação
  useEffect(() => {
    if (!isRestored) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Debounce para evitar muitas chamadas
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        saveScrollPosition();
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [saveScrollPosition, isRestored]);
};
