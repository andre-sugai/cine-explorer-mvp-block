import { useState, useCallback } from 'react';
import {
  getPopularMovies,
  getTopRatedMovies,
  getPopularTVShows,
  getTopRatedTVShows,
  getTrendingMovies,
  getTrendingTVShows,
  getMoviesByGenre,
  getTVShowsByGenre,
  getMoviesByDecade,
  getTVShowsByDecade,
  buildApiUrl,
  fetchWithQuota,
} from '@/utils/tmdb';

interface Trailer {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  movieTitle: string;
  movieId: number;
  releaseYear?: string;
  contentType: 'movie' | 'tv';
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

interface TrailerCategory {
  id: string;
  name: string;
  function: () => Promise<any>;
  type: 'movie' | 'tv';
}

// Categorias de Filmes
const movieCategories: TrailerCategory[] = [
  {
    id: 'popular_movies',
    name: 'Filmes Populares',
    function: () => getPopularMovies(Math.floor(Math.random() * 10) + 1),
    type: 'movie',
  },
  {
    id: 'top_rated_movies',
    name: 'Filmes Bem Avaliados',
    function: () => getTopRatedMovies(Math.floor(Math.random() * 10) + 1),
    type: 'movie',
  },
  {
    id: 'trending_movies',
    name: 'Filmes em Alta',
    function: () => getTrendingMovies('week'),
    type: 'movie',
  },
  // Gêneros de Filmes
  {
    id: 'action_movies',
    name: 'Filmes de Ação',
    function: () => getMoviesByGenre(28, Math.floor(Math.random() * 5) + 1),
    type: 'movie',
  },
  {
    id: 'comedy_movies',
    name: 'Comédias',
    function: () => getMoviesByGenre(35, Math.floor(Math.random() * 5) + 1),
    type: 'movie',
  },
  {
    id: 'drama_movies',
    name: 'Dramas',
    function: () => getMoviesByGenre(18, Math.floor(Math.random() * 5) + 1),
    type: 'movie',
  },
  {
    id: 'horror_movies',
    name: 'Filmes de Terror',
    function: () => getMoviesByGenre(27, Math.floor(Math.random() * 5) + 1),
    type: 'movie',
  },
  {
    id: 'scifi_movies',
    name: 'Ficção Científica',
    function: () => getMoviesByGenre(878, Math.floor(Math.random() * 5) + 1),
    type: 'movie',
  },
  // Décadas de Filmes
  {
    id: '2020s_movies',
    name: 'Filmes dos Anos 2020',
    function: () => getMoviesByDecade(2020, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: '2010s_movies',
    name: 'Filmes dos Anos 2010',
    function: () => getMoviesByDecade(2010, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: '2000s_movies',
    name: 'Filmes dos Anos 2000',
    function: () => getMoviesByDecade(2000, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: '1990s_movies',
    name: 'Filmes dos Anos 90',
    function: () => getMoviesByDecade(1990, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: '1980s_movies',
    name: 'Filmes dos Anos 80',
    function: () => getMoviesByDecade(1980, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
];

// Categorias de Séries
const tvCategories: TrailerCategory[] = [
  {
    id: 'popular_tv',
    name: 'Séries Populares',
    function: () => getPopularTVShows(Math.floor(Math.random() * 10) + 1),
    type: 'tv',
  },
  {
    id: 'top_rated_tv',
    name: 'Séries Bem Avaliadas',
    function: () => getTopRatedTVShows(Math.floor(Math.random() * 10) + 1),
    type: 'tv',
  },
  {
    id: 'trending_tv',
    name: 'Séries em Alta',
    function: () => getTrendingTVShows('week'),
    type: 'tv',
  },
  // Gêneros de Séries (IDs padrão do TMDB para TV)
  {
    id: 'action_adventure_tv',
    name: 'Séries de Ação e Aventura',
    function: () => getTVShowsByGenre(10759, Math.floor(Math.random() * 5) + 1),
    type: 'tv',
  },
  {
    id: 'comedy_tv',
    name: 'Séries de Comédia',
    function: () => getTVShowsByGenre(35, Math.floor(Math.random() * 5) + 1),
    type: 'tv',
  },
  {
    id: 'drama_tv',
    name: 'Séries de Drama',
    function: () => getTVShowsByGenre(18, Math.floor(Math.random() * 5) + 1),
    type: 'tv',
  },
  {
    id: 'scifi_fantasy_tv',
    name: 'Séries de Sci-Fi e Fantasia',
    function: () => getTVShowsByGenre(10765, Math.floor(Math.random() * 5) + 1),
    type: 'tv',
  },
  {
    id: 'animation_tv',
    name: 'Séries de Animação',
    function: () => getTVShowsByGenre(16, Math.floor(Math.random() * 5) + 1),
    type: 'tv',
  },
  // Décadas de Séries
  {
    id: '2020s_tv',
    name: 'Séries dos Anos 2020',
    function: () => getTVShowsByDecade(2020, Math.floor(Math.random() * 3) + 1),
    type: 'tv',
  },
  {
    id: '2010s_tv',
    name: 'Séries dos Anos 2010',
    function: () => getTVShowsByDecade(2010, Math.floor(Math.random() * 3) + 1),
    type: 'tv',
  },
  {
    id: '2000s_tv',
    name: 'Séries dos Anos 2000',
    function: () => getTVShowsByDecade(2000, Math.floor(Math.random() * 3) + 1),
    type: 'tv',
  },
];

export const useTrailers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<Trailer | null>(null);
  const [recentTrailers, setRecentTrailers] = useState<number[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');

  const getRandomTrailer = useCallback(async (): Promise<Trailer | null> => {
    console.log('🎬 Iniciando busca de trailer aleatório...');
    setIsLoading(true);

    const maxAttempts = 5; // Aumentado para garantir sucesso

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // 1. Decidir aleatoriamente entre Filme (50%) e Série (50%)
        const isMovie = Math.random() < 0.5;
        const categoryList = isMovie ? movieCategories : tvCategories;
        
        // 2. Selecionar uma categoria aleatória da lista escolhida
        const selectedCategory = categoryList[Math.floor(Math.random() * categoryList.length)];
        
        setCurrentCategory(selectedCategory.name);
        console.log(`🎬 Tentativa ${attempt + 1}: Buscando em ${selectedCategory.name} (${selectedCategory.type})`);

        // 3. Buscar resultados da categoria
        const response = await selectedCategory.function();

        if (!response || !response.results || response.results.length === 0) {
          console.log(`❌ Nenhum resultado na categoria: ${selectedCategory.name}`);
          continue;
        }

        // 4. Filtrar itens já vistos
        const availableItems = response.results.filter(
          (item: any) => !recentTrailers.includes(item.id)
        );

        // Se todos foram vistos, usar todos (reset suave)
        const itemsToCheck = availableItems.length > 0 ? availableItems : response.results;
        
        // Embaralhar itens para não pegar sempre os primeiros
        const shuffledItems = [...itemsToCheck].sort(() => Math.random() - 0.5);

        // 5. Tentar encontrar um trailer válido nos itens
        for (const item of shuffledItems.slice(0, 5)) { // Tentar até 5 itens da lista
          try {
            const endpoint = selectedCategory.type === 'tv' ? 'tv' : 'movie';
            const url = buildApiUrl(`/${endpoint}/${item.id}/videos`);
            
            const videosResponse = await fetchWithQuota(url);
            if (!videosResponse.ok) continue;

            const videosData = await videosResponse.json();
            
            if (videosData.results && videosData.results.length > 0) {
              // Filtrar trailers do YouTube
              const trailers = videosData.results.filter(
                (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
              );

              if (trailers.length > 0) {
                // Sucesso! Encontramos um trailer
                const trailer = trailers[0];
                
                // Atualizar histórico
                setRecentTrailers((prev) => {
                  const updated = [item.id, ...prev].slice(0, 50);
                  return updated;
                });

                // Extrair dados
                const releaseDate = selectedCategory.type === 'tv' 
                  ? item.first_air_date 
                  : item.release_date;

                const releaseYear = releaseDate
                  ? new Date(releaseDate).getFullYear().toString()
                  : undefined;

                const title = selectedCategory.type === 'tv'
                  ? item.name || item.original_name
                  : item.title || item.original_title;

                const trailerData: Trailer = {
                  id: trailer.id,
                  key: trailer.key,
                  name: trailer.name,
                  type: trailer.type,
                  site: trailer.site,
                  movieTitle: title,
                  movieId: item.id,
                  releaseYear,
                  contentType: selectedCategory.type,
                  poster_path: item.poster_path,
                  release_date: item.release_date,
                  first_air_date: item.first_air_date,
                  vote_average: item.vote_average,
                  genre_ids: item.genre_ids,
                };

                setCurrentTrailer(trailerData);
                setIsLoading(false);
                return trailerData;
              }
            }
          } catch (err) {
            console.error(`Erro ao verificar item ${item.id}`, err);
          }
        }
      } catch (error) {
        console.error(`Erro na tentativa ${attempt + 1}`, error);
      }
    }

    console.error('❌ Falha ao encontrar trailer após todas as tentativas');
    setIsLoading(false);
    return null;
  }, [recentTrailers]);

  return {
    getRandomTrailer,
    currentTrailer,
    isLoading,
    setCurrentTrailer,
    currentCategory,
  };
};
