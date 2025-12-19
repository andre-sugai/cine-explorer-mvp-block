import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MovieCardActions } from '../MovieCardActions';
import { AuthProvider } from '../../context/AuthContext';
import { FavoritesProvider } from '../../context/FavoritesContext';
import { WantToWatchProvider } from '../../context/WantToWatchContext';
import { WatchedProvider } from '../../context/WatchedContext';
import { SyncProvider } from '../../context/SyncContext';

// Mock das funções de blacklist
jest.mock('../../utils/adultContentFilter', () => ({
  isAdminUser: jest.fn(),
  addToBlacklist: jest.fn(),
  isInBlacklist: jest.fn(),
  removeFromBlacklist: jest.fn(),
}));

// Mock do toast
jest.mock('../ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do hook de streaming
jest.mock('../../hooks/useStreamingProvider', () => ({
  useStreamingProvider: jest.fn(() => ({
    logoPath: null,
    providerName: null,
    isLoading: false,
  })),
}));

// Mock do hook do YouTube
jest.mock('../../hooks/useYouTubePlayer', () => ({
  useYouTubePlayer: jest.fn(() => ({
    isPlaying: false,
    setIsPlaying: jest.fn(),
    togglePlay: jest.fn(),
  })),
}));

// Mock do Supabase
jest.mock('../../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
  },
}));

const { isAdminUser, addToBlacklist, isInBlacklist, removeFromBlacklist } = require('../../utils/adultContentFilter');
const { toast } = require('../ui/sonner');

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
          <SyncProvider>
            <FavoritesProvider>
              <WantToWatchProvider>
                <WatchedProvider>{children}</WatchedProvider>
              </WantToWatchProvider>
            </FavoritesProvider>
          </SyncProvider>
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
    isInBlacklist.mockReturnValue(false);

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    const blacklistButton = screen.getByTitle('Adicionar à blacklist (admin)');
    expect(blacklistButton).toBeInTheDocument();
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

  test('deve adicionar filme à blacklist quando administrador clica no ícone', async () => {
    isAdminUser.mockReturnValue(true);
    isInBlacklist.mockReturnValue(false);
    addToBlacklist.mockImplementation(() => {});

    render(
      <TestWrapper>
        <MovieCardActions {...defaultProps} />
      </TestWrapper>
    );

    const blacklistButton = screen.getByTitle('Adicionar à blacklist (admin)');
    fireEvent.click(blacklistButton);

    await waitFor(() => {
      expect(addToBlacklist).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  test('deve mostrar erro quando addToBlacklist falha', async () => {
    isAdminUser.mockReturnValue(true);
    isInBlacklist.mockReturnValue(false);
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
});
