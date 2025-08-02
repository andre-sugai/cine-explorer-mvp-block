/**
 * Utilitários para gerenciar a posição do scroll
 */

/**
 * Restaura a posição do scroll de forma robusta
 *
 * @param targetPosition - Posição do scroll a ser restaurada
 * @param maxAttempts - Número máximo de tentativas (padrão: 10)
 * @param delay - Delay entre tentativas em ms (padrão: 200)
 */
export const restoreScrollPosition = (
  targetPosition: number,
  maxAttempts: number = 10,
  delay: number = 200
): void => {
  if (targetPosition <= 0) {
    console.log('⚠️ Posição de scroll inválida:', targetPosition);
    return;
  }

  let attempts = 0;

  const attemptScroll = () => {
    attempts++;

    // Verificar se a página tem conteúdo suficiente
    const pageHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;

    console.log(
      `🔄 Tentativa ${attempts}/${maxAttempts} - Altura da página: ${pageHeight}px`
    );

    // Se a página tem altura suficiente ou já tentamos muitas vezes
    if (pageHeight > targetPosition || attempts >= maxAttempts) {
      console.log(
        `🎯 Aplicando scroll: target=${targetPosition}, pageHeight=${pageHeight}, attempts=${attempts}`
      );

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      console.log(
        `✅ Scroll restaurado para ${targetPosition}px (tentativa ${attempts})`
      );

      // Verificar se o scroll foi aplicado corretamente
      setTimeout(() => {
        const currentScroll = window.scrollY;
        console.log(
          `🔍 Verificando scroll: esperado=${targetPosition}, atual=${currentScroll}`
        );
        if (Math.abs(currentScroll - targetPosition) > 50) {
          console.log(
            `⚠️ Scroll não foi aplicado corretamente. Esperado: ${targetPosition}, Atual: ${currentScroll}`
          );
          // Tentar novamente com scroll instantâneo
          window.scrollTo(0, targetPosition);
          console.log(`🔄 Tentativa de correção com scroll instantâneo`);
        } else {
          console.log(`✅ Scroll verificado: ${currentScroll}px`);
        }
      }, 500);

      return;
    }

    // Tentar novamente
    console.log(
      `⏳ Conteúdo ainda não carregado, tentando novamente em ${delay}ms...`
    );
    setTimeout(attemptScroll, delay);
  };

  // Primeira tentativa
  attemptScroll();
};

/**
 * Salva a posição atual do scroll no Session Storage
 *
 * @param storageKey - Chave para salvar no storage
 */
export const saveCurrentScrollPosition = (storageKey: string): void => {
  const currentPosition = window.scrollY;

  try {
    const existingData = sessionStorage.getItem(storageKey);
    let data = {};

    if (existingData) {
      data = JSON.parse(existingData);
    }

    const updatedData = {
      ...data,
      scrollPosition: currentPosition,
      lastUpdated: Date.now(),
    };

    sessionStorage.setItem(storageKey, JSON.stringify(updatedData));
    console.log(`💾 Posição do scroll salva: ${currentPosition}px`);
  } catch (error) {
    console.error('❌ Erro ao salvar posição do scroll:', error);
  }
};

/**
 * Obtém a posição do scroll salva no Session Storage
 *
 * @param storageKey - Chave para buscar no storage
 * @returns Posição do scroll ou 0 se não encontrada
 */
export const getSavedScrollPosition = (storageKey: string): number => {
  try {
    const data = sessionStorage.getItem(storageKey);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.scrollPosition || 0;
    }
  } catch (error) {
    console.error('❌ Erro ao obter posição do scroll:', error);
  }

  return 0;
};

/**
 * Verifica se a página está pronta para restaurar o scroll
 *
 * @param minHeight - Altura mínima esperada da página
 * @returns true se a página está pronta
 */
export const isPageReadyForScroll = (minHeight: number = 1000): boolean => {
  const pageHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;

  return pageHeight > minHeight && pageHeight > viewportHeight;
};
