import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Search, Film } from 'lucide-react';
import { TMDBMovie, buildImageUrl } from '@/utils/tmdb';

interface ArenaSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMovie: (movie: TMDBMovie) => void;
}

export const ArenaSearchModal: React.FC<ArenaSearchModalProps> = ({ open, onOpenChange, onSelectMovie }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const searchMovies = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const apiKey = localStorage.getItem('tmdb_api_key');
        if (!apiKey) return;

        const url = new URL('https://api.themoviedb.org/3/search/movie');
        url.searchParams.append('api_key', apiKey);
        url.searchParams.append('language', 'pt-BR');
        url.searchParams.append('query', query);
        url.searchParams.append('include_adult', 'false');

        const res = await fetch(url.toString());
        if (!res.ok) return;
        const data = await res.json();
        
        // Filter out movies without posters to keep the arena looking good
        const validMovies = (data.results || []).filter((m: TMDBMovie) => m.poster_path);
        setResults(validMovies.slice(0, 5)); // Limit to top 5 results for simplicity
      } catch (err) {
        console.error('Error searching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchMovies, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-secondary/95 border-primary/20 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-primary flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Filme
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o nome do filme..."
              className="pl-9 bg-black/40 border-primary/20 focus-visible:ring-primary/50"
              autoFocus
            />
          </div>

          <div className="space-y-2 min-h-[200px]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : results.length > 0 ? (
              results.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => {
                    onSelectMovie(movie);
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-primary/20 border border-transparent hover:border-primary/30 transition-all text-left"
                >
                  <div className="w-10 h-14 bg-black/50 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={buildImageUrl(movie.poster_path, 'w92')}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-bold text-white truncate">{movie.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </p>
                  </div>
                </button>
              ))
            ) : query.trim() ? (
              <div className="flex flex-col justify-center items-center h-32 text-muted-foreground gap-2">
                <Film className="w-6 h-6 opacity-50" />
                <span className="text-sm">Nenhum filme encontrado.</span>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32 text-muted-foreground/50 text-sm">
                Busque um filme para a arena.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
