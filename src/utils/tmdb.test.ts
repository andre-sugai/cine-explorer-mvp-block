import { getMovieReviews, getTVShowReviews, buildApiUrl } from './tmdb';

// Mock global fetch
global.fetch = jest.fn();

describe('TMDB Multi-language Reviews', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    localStorage.setItem('tmdb_api_key', 'test-api-key');
  });

  describe('buildApiUrl', () => {
    it('should use pt-BR by default if no language is provided', () => {
      const url = buildApiUrl('/movie/123');
      expect(url).toContain('language=pt-BR');
    });

    it('should respect language param if provided', () => {
      const url = buildApiUrl('/movie/123', { language: 'en-US' });
      expect(url).toContain('language=en-US');
      // Should also contain pt-BR because it's set as default query param before the loop?
      // Wait, let's check the implementation logic again.
      // logic: if (!params.language) url.searchParams.append('language', 'pt-BR');
      // then loop appends params.
      // So if params.language is passed, it is NOT appended initially, but appended in loop.
      // So it should contain language=en-US and NOT language=pt-BR? 
      // Actually URLSearchParams handles multiples.
      // My logic was: if (!params.language) append default
      // then loop appends all params.
      // So if params has language, default is skipped, and params language is appended.
      // Correct.
      expect(url).not.toContain('language=pt-BR');
    });
  });

  describe('getMovieReviews', () => {
    it('should fetch both pt-BR and en-US reviews', async () => {
      const mockPtResponse = {
        ok: true,
        headers: { get: jest.fn() },
        json: async () => ({
          id: 1,
          results: [{ id: 'r1', content: 'PT Review', created_at: '2023-01-01' }],
          total_pages: 1
        })
      };

      const mockEnResponse = {
        ok: true,
        headers: { get: jest.fn() },
        json: async () => ({
          id: 1,
          results: [{ id: 'r2', content: 'EN Review', created_at: '2023-01-02' }],
          total_pages: 1
        })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockPtResponse)
        .mockResolvedValueOnce(mockEnResponse);

      const response = await getMovieReviews(1);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('language=pt-BR'));
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('language=en-US'));
      
      expect(response.results).toHaveLength(2);
      expect(response.results[0].id).toBe('r2'); // Newer first
      expect(response.results[1].id).toBe('r1');
    });

    it('should handle duplicates (same author)', async () => {
      const mockResponse = {
        ok: true,
        headers: { get: jest.fn() },
        json: async () => ({
          results: [{ id: 'r1', author: 'User', content: 'Content A', created_at: '2023-01-01' }]
        })
      };

      const mockResponseDiffContent = {
        ok: true,
        headers: { get: jest.fn() },
        json: async () => ({
          results: [{ id: 'r2', author: 'User', content: 'Content B (Updated)', created_at: '2023-01-02' }]
        })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponseDiffContent);

      const response = await getMovieReviews(1);
      
      // Should keep only one review per author (the latest one)
      expect(response.results).toHaveLength(1);
      expect(response.results[0].content).toBe('Content B (Updated)');
    });
  });
});
