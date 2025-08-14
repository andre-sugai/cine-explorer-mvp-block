import { useState } from 'react';
import {
  getPopularMovies,
  getTopRatedMovies,
  getPopularTVShows,
  getTrendingMovies,
  getMoviesByGenre,
  getTVShowsByGenre,
  getMoviesByDecade,
  getTVShowsByDecade,
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
}

interface TrailerCategory {
  id: string;
  name: string;
  weight: number;
  function: () => Promise<any>;
  type: 'movie' | 'tv' | 'mixed';
}

// Definição das categorias de trailers com pesos
const trailerCategories: TrailerCategory[] = [
  // Categorias principais (maior peso)
  {
    id: 'popular_movies',
    name: 'Filmes Populares',
    weight: 15,
    function: () => getPopularMovies(Math.floor(Math.random() * 5) + 1),
    type: 'movie',
  },
  {
    id: 'top_rated_movies',
    name: 'Filmes Bem Avaliados',
    weight: 15,
    function: () => getTopRatedMovies(Math.floor(Math.random() * 5) + 1),
    type: 'movie',
  },
  {
    id: 'popular_tv',
    name: 'Séries Populares',
    weight: 12,
    function: () => getPopularTVShows(Math.floor(Math.random() * 5) + 1),
    type: 'tv',
  },
  {
    id: 'trending',
    name: 'Em Tendência',
    weight: 10,
    function: () => getTrendingMovies('week'),
    type: 'movie',
  },

  // Categorias por gênero (peso médio)
  {
    id: 'action',
    name: 'Ação e Aventura',
    weight: 8,
    function: () => getMoviesByGenre(28, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: 'comedy',
    name: 'Comédia',
    weight: 8,
    function: () => getMoviesByGenre(35, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: 'drama',
    name: 'Drama',
    weight: 8,
    function: () => getMoviesByGenre(18, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: 'horror',
    name: 'Terror',
    weight: 6,
    function: () => getMoviesByGenre(27, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: 'scifi',
    name: 'Ficção Científica',
    weight: 6,
    function: () => getMoviesByGenre(878, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: 'animation',
    name: 'Animação',
    weight: 5,
    function: () => getMoviesByGenre(16, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },

  // Categorias por década (peso menor)
  {
    id: '2020s',
    name: 'Anos 2020',
    weight: 4,
    function: () => getMoviesByDecade(2020, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: '2010s',
    name: 'Anos 2010',
    weight: 4,
    function: () => getMoviesByDecade(2010, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: '2000s',
    name: 'Anos 2000',
    weight: 3,
    function: () => getMoviesByDecade(2000, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: '1990s',
    name: 'Anos 1990',
    weight: 3,
    function: () => getMoviesByDecade(1990, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
  {
    id: '1980s',
    name: 'Anos 1980',
    weight: 2,
    function: () => getMoviesByDecade(1980, Math.floor(Math.random() * 3) + 1),
    type: 'movie',
  },
];

/**
 * Seleciona uma categoria aleatória baseada nos pesos definidos
 * @returns Categoria selecionada
 */
const selectRandomCategory = (): TrailerCategory => {
  const totalWeight = trailerCategories.reduce(
    (sum, cat) => sum + cat.weight,
    0
  );
  let random = Math.random() * totalWeight;

  for (const category of trailerCategories) {
    random -= category.weight;
    if (random <= 0) {
      return category;
    }
  }

  return trailerCategories[0]; // Fallback
};

export const useTrailers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<Trailer | null>(null);
  const [recentTrailers, setRecentTrailers] = useState<number[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');

  const getRandomTrailer = async (): Promise<Trailer | null> => {
    setIsLoading(true);

    try {
      // Selecionar categoria aleatória
      const selectedCategory = selectRandomCategory();
      setCurrentCategory(selectedCategory.name);

      console.log(
        `🎬 Selecionando trailer da categoria: ${selectedCategory.name}`
      );

      const response = await selectedCategory.function();

      if (!response || !response.results || response.results.length === 0) {
        console.log(
          `❌ Nenhum resultado encontrado para categoria: ${selectedCategory.name}`
        );
        return null;
      }

      // Filtrar filmes/séries que não foram vistos recentemente
      const availableItems = response.results.filter(
        (item) => !recentTrailers.includes(item.id)
      );

      // Se todos foram vistos, limpar histórico
      const itemsToCheck =
        availableItems.length > 0 ? availableItems : response.results;

      // Tentar até 5 itens diferentes para encontrar um trailer
      for (let i = 0; i < Math.min(5, itemsToCheck.length); i++) {
        const randomItem =
          itemsToCheck[Math.floor(Math.random() * itemsToCheck.length)];

        try {
          // Determinar o endpoint baseado no tipo de conteúdo
          const endpoint = selectedCategory.type === 'tv' ? 'tv' : 'movie';

          // Buscar vídeos do item
          const videosResponse = await fetch(
            `https://api.themoviedb.org/3/${endpoint}/${
              randomItem.id
            }/videos?api_key=${localStorage.getItem(
              'tmdb_api_key'
            )}&language=pt-BR`
          );
          const videosData = await videosResponse.json();

          if (videosData.results && videosData.results.length > 0) {
            // Filtrar apenas trailers do YouTube
            const trailers = videosData.results.filter(
              (video: any) =>
                video.type === 'Trailer' && video.site === 'YouTube'
            );

            if (trailers.length > 0) {
              const trailer = trailers[0]; // Pegar o primeiro trailer

              // Atualizar histórico de trailers recentes
              setRecentTrailers((prev) => {
                const updated = [randomItem.id, ...prev].slice(0, 50); // Manter últimos 50
                return updated;
              });

              // Extract year from release date
              const releaseDate =
                selectedCategory.type === 'tv'
                  ? randomItem.first_air_date
                  : randomItem.release_date;

              const releaseYear = releaseDate
                ? new Date(releaseDate).getFullYear().toString()
                : undefined;

              const title =
                selectedCategory.type === 'tv'
                  ? randomItem.name || randomItem.original_name
                  : randomItem.title || randomItem.original_title;

              const trailerData: Trailer = {
                id: trailer.id,
                key: trailer.key,
                name: trailer.name,
                type: trailer.type,
                site: trailer.site,
                movieTitle: title,
                movieId: randomItem.id,
                releaseYear,
                contentType: selectedCategory.type as 'movie' | 'tv',
              };

              setCurrentTrailer(trailerData);
              console.log(
                `✅ Trailer encontrado: ${title} (${selectedCategory.name})`
              );
              return trailerData;
            }
          }
        } catch (error) {
          console.error(
            `❌ Erro ao buscar vídeos para ${selectedCategory.type} ${randomItem.id}:`,
            error
          );
          continue; // Tentar próximo item
        }
      }

      console.log(
        `❌ Nenhum trailer encontrado após 5 tentativas na categoria: ${selectedCategory.name}`
      );
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter trailer aleatório:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getRandomTrailer,
    currentTrailer,
    isLoading,
    setCurrentTrailer,
    currentCategory,
  };
};
