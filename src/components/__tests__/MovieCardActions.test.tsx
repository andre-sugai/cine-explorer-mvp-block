import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MovieCardActions } from '@/components/MovieCardActions';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { WantToWatchProvider } from '@/context/WantToWatchContext';
import { WatchedProvider } from '@/context/WatchedContext';

// Mock das funções de blacklist
jest.mock('@/utils/adultContentFilter', () => ({
  isAdminUser: jest.fn(),
  addToBlacklist: jest.fn(),
}));

// Mock do toast
jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
  },
}));

const { isAdminUser, addToBlacklist } = require('@/utils/adultContentFilter');
const { toast } = require('@/components/ui/sonner');

// Wrapper para testes com todos os provedores necessários
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FavoritesProvider>
            <WantToWatchProvider>
              <WatchedProvider>{children}</WatchedProvider>
            </WantToWatchProvider>
          </FavoritesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const defaultProps = {
  id: 1,
  title: 'Filme de Teste',
  poster_path: '/poster.jpg',
  release_date: '2023-01-01',
  vote_average: 7.5,
  genre_ids: [28, 12],
  type: 'movie' as const,
};

describe('MovieCardActions - Sistema de Blacklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve mostrar ícone de blacklist apenas para administrador logado', () => {
    isAdminUser.mockReturnValue(true);

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    const blacklistButton = screen.getByTitle('Adicionar à blacklist (admin)');
    expect(blacklistButton).toBeInTheDocument();
    expect(blacklistButton).toHaveClass('text-muted-foreground');
  });

  test('não deve mostrar ícone de blacklist para usuários não-administradores', () => {
    isAdminUser.mockReturnValue(false);

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    const blacklistButton = screen.queryByTitle(
      'Adicionar à blacklist (admin)'
    );
    expect(blacklistButton).not.toBeInTheDocument();
  });

  test('não deve mostrar ícone de blacklist para pessoas', () => {
    isAdminUser.mockReturnValue(true);

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} type="person" />
      </TestWrapper>
    );

    const blacklistButton = screen.queryByTitle(
      'Adicionar à blacklist (admin)'
    );
    expect(blacklistButton).not.toBeInTheDocument();
  });

  test('deve adicionar filme à blacklist quando administrador clica no ícone', async () => {
    isAdminUser.mockReturnValue(true);
    addToBlacklist.mockImplementation(() => {});

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    const blacklistButton = screen.getByTitle('Adicionar à blacklist (admin)');
    fireEvent.click(blacklistButton);

    await waitFor(() => {
      expect(addToBlacklist).toHaveBeenCalledWith('Filme de Teste', undefined);
      expect(toast.success).toHaveBeenCalledWith(
        '"Filme de Teste" foi adicionado à blacklist',
        expect.objectContaining({
          description: 'O filme será bloqueado pelo filtro de conteúdo adulto',
        })
      );
    });
  });

  test('deve mostrar erro quando usuário não-admin tenta usar blacklist', async () => {
    isAdminUser.mockReturnValue(false);

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    // Como o botão não aparece para não-admins, vamos simular o caso
    // onde o isAdmin retorna false dentro da função
    isAdminUser.mockReturnValue(true);

    const { rerender } = render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    const blacklistButton = screen.getByTitle('Adicionar à blacklist (admin)');

    // Mudar o retorno do isAdminUser para simular perda de permissão
    isAdminUser.mockReturnValue(false);

    fireEvent.click(blacklistButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Acesso negado: apenas administradores podem modificar a blacklist'
      );
    });
  });

  test('deve mostrar erro quando addToBlacklist falha', async () => {
    isAdminUser.mockReturnValue(true);
    addToBlacklist.mockImplementation(() => {
      throw new Error('Erro de teste');
    });

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    const blacklistButton = screen.getByTitle('Adicionar à blacklist (admin)');
    fireEvent.click(blacklistButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro de teste');
    });
  });

  test('deve parar propagação do evento ao clicar no ícone de blacklist', () => {
    isAdminUser.mockReturnValue(true);
    const mockStopPropagation = jest.fn();

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    const blacklistButton = screen.getByTitle('Adicionar à blacklist (admin)');

    // Simular evento com stopPropagation
    const event = new MouseEvent('click', { bubbles: true });
    event.stopPropagation = mockStopPropagation;

    fireEvent(blacklistButton, event);

    expect(mockStopPropagation).toHaveBeenCalled();
  });

  test('deve ter a aparência correta do ícone Shield', () => {
    isAdminUser.mockReturnValue(true);

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    const blacklistButton = screen.getByTitle('Adicionar à blacklist (admin)');
    const shieldIcon = blacklistButton.querySelector('svg');

    expect(shieldIcon).toBeInTheDocument();
    expect(shieldIcon).toHaveClass('w-3.5', 'h-3.5');
    expect(blacklistButton).toHaveClass('hover:text-red-600');
  });

  test('deve funcionar junto com outros botões do card', () => {
    isAdminUser.mockReturnValue(true);

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    // Verificar se todos os botões estão presentes
    expect(screen.getByTitle('Adicionar aos favoritos')).toBeInTheDocument();
    expect(screen.getByTitle('Quero assistir')).toBeInTheDocument();
    expect(screen.getByTitle('Marcar como assistido')).toBeInTheDocument();
    expect(
      screen.getByTitle('Adicionar à blacklist (admin)')
    ).toBeInTheDocument();

    // Verificar que todos funcionam independentemente
    const favoriteButton = screen.getByTitle('Adicionar aos favoritos');
    const blacklistButton = screen.getByTitle('Adicionar à blacklist (admin)');

    fireEvent.click(favoriteButton);
    fireEvent.click(blacklistButton);

    // Ambos devem ter funcionado
    expect(addToBlacklist).toHaveBeenCalled();
  });
});
