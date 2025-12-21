import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggleFollowButton } from '../ToggleFollowButton';
import { useWatchedContext } from '@/context/WatchedContext';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));
jest.mock('@/context/WatchedContext');
jest.mock('sonner');
jest.mock('lucide-react', () => ({
  PlayCircle: () => <div data-testid="play-circle-icon" />,
}));

describe('ToggleFollowButton', () => {
  const mockAddToWatched = jest.fn();
  const mockRemoveFromWatched = jest.fn();
  
  // Need to mock 'watched' array returning from context
  const mockWatched: any[] = [];

  beforeEach(() => {
    (useWatchedContext as jest.Mock).mockImplementation(() => ({
      addToWatched: mockAddToWatched,
      removeFromWatched: mockRemoveFromWatched,
      watched: mockWatched,
    }));
    // Clear array
    mockWatched.length = 0;
    jest.clearAllMocks();
  });

  it('checks if the button renders correctly for TV shows', () => {
    render(
      <ToggleFollowButton
        id={123}
        title="Test Show"
        type="tv"
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('play-circle-icon')).toBeInTheDocument();
  });

  it('checks if the button does not render for non-TV shows', () => {
    render(
      <ToggleFollowButton
        id={123}
        title="Test Movie"
        type="movie"
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('adds to watched list when clicked and not yet followed', () => {
    render(
      <ToggleFollowButton
        id={123}
        title="Test Show"
        type="tv"
        vote_average={8.5}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockAddToWatched).toHaveBeenCalledWith({
      id: 123,
      type: 'tv',
      title: 'Test Show',
      poster_path: undefined,
      release_date: undefined,
      vote_average: 8.5,
      genre_ids: undefined,
      status: 'following',
    });
    expect(toast.success).toHaveBeenCalledWith('Série adicionada a Continuar');
  });

  it('removes from watched list when clicked and already followed', () => {
    mockWatched.push({ id: 123, type: 'tv', status: 'following' });
    
    render(
      <ToggleFollowButton
        id={123}
        title="Test Show"
        type="tv"
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockRemoveFromWatched).toHaveBeenCalledWith(123, 'tv');
    expect(toast.success).toHaveBeenCalledWith('Série removida de Continuar');
  });
});
