import React from 'react';
import { handleCardLinkClick } from '../cardNavigation';

describe('handleCardLinkClick', () => {
  const originalOpen = window.open;

  beforeEach(() => {
    window.open = jest.fn();
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  test('abre em uma nova aba ao usar Option + Clique (altKey) no Mac e previne o download padrão', () => {
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    const onNormalClick = jest.fn();

    const mockEvent = {
      altKey: true,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      button: 0,
      preventDefault,
      stopPropagation,
    } as unknown as React.MouseEvent<HTMLElement>;

    handleCardLinkClick(mockEvent, '/filme/123', onNormalClick);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith(
      '/filme/123',
      '_blank',
      'noopener,noreferrer'
    );
    expect(onNormalClick).not.toHaveBeenCalled();
  });

  test('mantém o comportamento nativo do link <a> ao usar Cmd + Clique (metaKey) ou Ctrl + Clique (ctrlKey)', () => {
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    const onNormalClick = jest.fn();

    const mockEvent = {
      altKey: false,
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      button: 0,
      preventDefault,
      stopPropagation,
    } as unknown as React.MouseEvent<HTMLElement>;

    handleCardLinkClick(mockEvent, '/filme/123', onNormalClick);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
    expect(onNormalClick).not.toHaveBeenCalled();
  });

  test('executa o clique normal sem abrir nova aba quando nenhuma tecla modificadora está pressionada', () => {
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    const onNormalClick = jest.fn();

    const mockEvent = {
      altKey: false,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      button: 0,
      preventDefault,
      stopPropagation,
    } as unknown as React.MouseEvent<HTMLElement>;

    handleCardLinkClick(mockEvent, '/filme/123', onNormalClick);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
    expect(onNormalClick).toHaveBeenCalledTimes(1);
  });
});
