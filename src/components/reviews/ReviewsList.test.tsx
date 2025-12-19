import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewsList from './ReviewsList';
import * as tmdb from '../../utils/tmdb';

// Mock the tmdb module
jest.mock('../../utils/tmdb', () => ({
  ...jest.requireActual('../../utils/tmdb'),
  getMovieReviews: jest.fn(),
  getTVShowReviews: jest.fn(),
  buildImageUrl: jest.fn((path) => `https://image.tmdb.org/t/p/w200${path}`),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock shadcn Carousel components with relative path to be safe
jest.mock('../ui/carousel', () => ({
  Carousel: ({ children, className }: any) => <div className={className} data-testid="carousel">{children}</div>,
  CarouselContent: ({ children, className }: any) => <div className={className} data-testid="carousel-content">{children}</div>,
  CarouselItem: ({ children, className }: any) => <div className={className} data-testid="carousel-item">{children}</div>,
  CarouselPrevious: () => <button data-testid="carousel-previous">Previous</button>,
  CarouselNext: () => <button data-testid="carousel-next">Next</button>,
}));

// Mock do utilitário de tradução
jest.mock('../../utils/translationService', () => ({
  translateText: jest.fn((text) => Promise.resolve(text)),
}));

const mockReviews = [
  {
    id: '1',
    author: 'John Doe',
    author_details: {
      name: 'John Doe',
      username: 'johndoe',
      avatar_path: '/avatar.jpg',
      rating: 8,
    },
    content: 'This is a great movie!',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    url: 'https://tmdb.org/review/1',
  },
  {
    id: '2',
    author: 'Jane Smith',
    author_details: {
      name: 'Jane Smith',
      username: 'janesmith',
      avatar_path: null,
      rating: null,
    },
    content: 'Not my cup of tea.',
    created_at: '2023-01-02T00:00:00.000Z',
    updated_at: '2023-01-02T00:00:00.000Z',
    url: 'https://tmdb.org/review/2',
  },
];

describe('ReviewsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (tmdb.getMovieReviews as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<ReviewsList id={1} type="movie" />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders reviews when loaded for movie', async () => {
    (tmdb.getMovieReviews as jest.Mock).mockResolvedValue({
      id: 123,
      page: 1,
      results: mockReviews,
      total_pages: 1,
      total_results: 2,
    });

    await act(async () => {
      render(<ReviewsList id={1} type="movie" />);
    });

    await waitFor(() => {
      expect(screen.getByText('Opiniões da Comunidade')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('This is a great movie!')).toBeInTheDocument();
    expect(screen.getByText(/8\/10/)).toBeInTheDocument();
  });

  it('renders empty state when no reviews found', async () => {
     (tmdb.getMovieReviews as jest.Mock).mockResolvedValue({ results: [], total_pages: 0, total_results: 0 });
     render(<ReviewsList id={1} type="movie" />);
     await waitFor(() => {
        expect(screen.getByText('Nenhuma avaliação encontrada.')).toBeInTheDocument();
     });
  });

  it('handles error gracefully', async () => {
    (tmdb.getMovieReviews as jest.Mock).mockRejectedValue(new Error('API Error'));
    const { container } = render(<ReviewsList id={1} type="movie" />);
    await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
    });
  });
});
