import { useState, useEffect } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let isScriptLoaded = false;
let isApiReady = false;
const apiReadyListeners: (() => void)[] = [];

const loadYouTubeScript = () => {
  if (isScriptLoaded) return;
  isScriptLoaded = true;

  // Se a API já estiver disponível (ex: carregada por outra lib ou extensão)
  if (window.YT && window.YT.Player) {
    isApiReady = true;
    return;
  }

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = () => {
    isApiReady = true;
    apiReadyListeners.forEach((listener) => listener());
  };
};

export const useYouTubePlayer = () => {
  const [isReady, setIsReady] = useState(isApiReady);

  useEffect(() => {
    // Se já estiver pronto, atualiza estado e retorna
    if (isApiReady) {
      setIsReady(true);
      return;
    }

    // Adiciona listener
    const listener = () => setIsReady(true);
    apiReadyListeners.push(listener);

    // Inicia carregamento se necessário
    loadYouTubeScript();

    // Cleanup
    return () => {
      const index = apiReadyListeners.indexOf(listener);
      if (index > -1) {
        apiReadyListeners.splice(index, 1);
      }
    };
  }, []);

  return { isReady };
};
