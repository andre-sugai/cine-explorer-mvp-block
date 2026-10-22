import React from 'react';

/**
 * Manipula cliques em links de cards para suportar:
 * - Option + Clique (macOS) / Alt + Clique: abre o conteúdo em uma nova aba
 *   (evitando o comportamento padrão do navegador de fazer download do link no Option+Clique).
 * - Cmd + Clique / Ctrl + Clique / Botão do meio / Botão direito -> "Abrir link em uma nova guia":
 *   funcionam nativamente pelo elemento <a> (<Link>).
 * - Clique normal: mantém a navegação SPA atual do React Router.
 */
export function handleCardLinkClick(
  e: React.MouseEvent<HTMLElement>,
  targetUrl: string,
  onNormalClick?: () => void
) {
  if (e.altKey) {
    e.preventDefault();
    e.stopPropagation();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
    return;
  }

  if (onNormalClick) {
    onNormalClick();
  }
}
