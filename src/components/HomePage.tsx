import React, { useState, useEffect } from 'react';
import { SearchSection } from './home/SearchSection';
import { CategoryTabs } from './home/CategoryTabs';
import { ContentGrid } from './home/ContentGrid';
import { MovieFilters } from './home/MovieFilters';

import {
  getWatchProviders,
  getLanguages,
  getPopularPeople,
  searchPeople,
  getAllGenres,
  getNowPlayingMovies,
} from '@/utils/tmdb';
import { filterAdultContent } from '@/utils/adultContentFilter';
import { TMDBMovie, TMDBTVShow, TMDBPerson, TMDBGenre } from '@/utils/tmdb';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { useScrollManager } from '@/hooks/useScrollManager';

type ContentCategory = 'movies' | 'tv' | 'actors' | 'directors' | 'cinema';

export const HomePage: React.FC = () => {
  // Hook de persistência de filtros (removidas as referencias ao selectedStreamings)
  const {
    activeCategory,
    selectedProvider,
    selectedGenre,
    selectedOrder,
    selectedYear,
    selectedLanguage,
    setActiveCategory,
    setSelectedProvider,
    setSelectedGenre,
    setSelectedOrder,
    setSelectedYear,
    setSelectedLanguage,
    saveScrollPosition,
    isRestored,
  } = useFilterPersistence();

  const [content, setContent] = useState<
    (TMDBMovie | TMDBTVShow | TMDBPerson)[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [providerOptions, setProviderOptions] = useState([]);
  const [genreOptions, setGenreOptions] = useState<TMDBGenre[]>([]);
  const [orderOptions] = useState([
    { value: 'popularity.desc', label: 'Popular' },
    { value: 'release_date.desc', label: 'Novos' },
    { value: 'vote_average.desc', label: 'IMDB' },
  ]);
  const [yearOptions] = useState([
    { value: '', label: 'Todas' },
    { value: '2020', label: '2020s' },
    { value: '2010', label: '2010s' },
    { value: '2000', label: '2000s' },
    { value: '1990', label: '1990s' },
    { value: '1980', label: '1980s' },
    { value: '1970', label: '1970s' },
    { value: '1960', label: '1960s' },
    { value: '1950', label: '1950s' },
  ]);
  const [languageOptions, setLanguageOptions] = useState([]);

  // Lista de diretores com americanos primeiro, depois brasileiros, latino-americanos, europeus, asiáticos, africanos, australianos e mulheres diretoras
  const famousDirectors = [
    // AMERICANOS PRIMEIRO
    'Steven Spielberg',
    'Martin Scorsese',
    'Alfred Hitchcock',
    'Stanley Kubrick',
    'Quentin Tarantino',
    'James Cameron',
    'Francis Ford Coppola',
    'Clint Eastwood',
    'George Lucas',
    'Tim Burton',
    'David Fincher',
    'Woody Allen',
    'Billy Wilder',
    'Frank Capra',
    'John Ford',
    'Robert Zemeckis',
    'Brian De Palma',
    'Michael Mann',
    'Paul Thomas Anderson',
    'Wes Anderson',
    'Joel Coen',
    'Ethan Coen',
    'David Lynch',
    'Spike Lee',
    'Sam Mendes',
    'Ron Howard',
    'Richard Linklater',
    'Gus Van Sant',
    'Kathryn Bigelow',
    'Greta Gerwig',
    'Sofia Coppola',
    'Patty Jenkins',
    'Ava DuVernay',
    'Dee Rees',
    'Jennifer Kent',
    // BRASILEIROS
    'Glauber Rocha',
    'Walter Salles',
    'Fernando Meirelles',
    'Kleber Mendonça Filho',
    'Anna Muylaert',
    'Karim Aïnouz',
    'Bruno Barreto',
    'Cacá Diegues',
    'Héctor Babenco',
    'José Padilha',
    'Laís Bodanzky',
    'Jorge Furtado',
    'Carlos Diegues',
    'Beto Brant',
    'Andrucha Waddington',
    'Afonso Poyart',
    'Suzana Amaral',
    'Ruy Guerra',
    'Daniel Filho',
    'Jeferson De',
    'Gabriel Mascaro',
    'Aly Muritiba',
    'Carla Camurati',
    'Helvécio Ratton',
    'Cao Hamburger',
    'Fernando Coimbra',
    'Walter Lima Jr.',
    'Carlos Reichenbach',
    'André Klotzel',
    'Ugo Giorgetti',
    'Roberto Farias',
    'Humberto Mauro',
    'Mário Peixoto',
    'Joaquim Pedro de Andrade',
    'Leon Hirszman',
    'Arnaldo Jabor',
    'Eduardo Coutinho',
    'Maurício Sherman',
    'Luiz Carlos Barreto',
    'Paulo César Saraceni',
    'Nelson Rodrigues',
    'Domingos de Oliveira',
    'Joel Zito Araújo',
    'Eliane Caffé',
    'Tizuka Yamasaki',
    'André Ristum',
    'Allan Deberton',
    'Petrus Cariry',
    'Cristiano Burlan',
    'Vincent Carelli',
    'Paulo Nascimento',
    'Marcelo Galvão',
    'Chico Teixeira',
    'Murilo Salles',
    'Miguel Faria Jr.',
    // LATINO-AMERICANOS
    'Lucrecia Martel',
    'Juan José Campanella',
    'Fernando Solanas',
    'Eliseo Subiela',
    'Pablo Trapero',
    'Claudia Llosa',
    'Alejandro Jodorowsky',
    'Sebastián Lelio',
    'Patricio Guzmán',
    'Walter Tournier',
    'Arturo Ripstein',
    'Jorge Fons',
    'Bruno Stagnaro',
    'Israel Adrián Caetano',
    'Francisco José Lombardi',
    // EUROPEUS
    'Pedro Almodóvar',
    'Luis Buñuel',
    'Jean-Luc Godard',
    'François Truffaut',
    'Éric Rohmer',
    'Claude Chabrol',
    'Jacques Demy',
    'Jacques Tati',
    'Jean Cocteau',
    'Jean Vigo',
    'Jean-Pierre Melville',
    'Claude Lelouch',
    'Robert Bresson',
    'Andrei Tarkovsky',
    'Sergei Eisenstein',
    'Dziga Vertov',
    'Elem Klimov',
    'Nikita Mikhalkov',
    'Krzysztof Kieślowski',
    'Agnieszka Holland',
    'Jerzy Skolimowski',
    'Andrzej Wajda',
    'Jan Komasa',
    'Paweł Pawlikowski',
    'Michał Rosa',
    'Marek Koterski',
    'Michael Haneke',
    'Werner Herzog',
    'Wim Wenders',
    'Rainer Werner Fassbinder',
    'Fritz Lang',
    'Leni Riefenstahl',
    'Ingmar Bergman',
    'Lars von Trier',
    'Ken Loach',
    'Mike Leigh',
    'Stephen Frears',
    'Danny Boyle',
    'Ridley Scott',
    'Christopher Nolan',
    'Guy Ritchie',
    'Steve McQueen',
    'Andrea Arnold',
    'Matteo Garrone',
    'Paolo Sorrentino',
    'Bernardo Bertolucci',
    'Federico Fellini',
    'Roberto Rossellini',
    'Michelangelo Antonioni',
    'Pier Paolo Pasolini',
    'Sergio Leone',
    'Ettore Scola',
    'Jean Renoir',
    'Louis Malle',
    'Bertrand Tavernier',
    'Olivier Assayas',
    'Leos Carax',
    'Claude Sautet',
    'Costa-Gavras',
    'Jean-Jacques Annaud',
    'Luc Besson',
    'Jean-Pierre Jeunet',
    'Jean-Pierre Dardenne',
    'Luc Dardenne',
    'Michael Winterbottom',
    'Nuri Bilge Ceylan',
    'Fatih Akin',
    'Yorgos Lanthimos',
    'Theo Angelopoulos',
    'Béla Tarr',
    'István Szabó',
    'Aki Kaurismäki',
    // ASIÁTICOS
    'Akira Kurosawa',
    'Yasujiro Ozu',
    'Kenji Mizoguchi',
    'Hayao Miyazaki',
    'Isao Takahata',
    'Hirokazu Kore-eda',
    'Takeshi Kitano',
    'Kiyoshi Kurosawa',
    'Shinji Aoyama',
    'Sion Sono',
    'Park Chan-wook',
    'Bong Joon-ho',
    'Kim Ki-duk',
    'Lee Chang-dong',
    'Im Kwon-taek',
    'Hou Hsiao-hsien',
    'Edward Yang',
    'Ang Lee',
    'Tsai Ming-liang',
    'Ann Hui',
    'John Woo',
    'Wong Kar-wai',
    'Fruit Chan',
    'Stanley Kwan',
    'Raman Hui',
    'Apichatpong Weerasethakul',
    'Pen-Ek Ratanaruang',
    'Brillante Mendoza',
    'Lav Diaz',
    'Lino Brocka',
    'Satyajit Ray',
    'Guru Dutt',
    'Mira Nair',
    'Deepa Mehta',
    'Shekhar Kapur',
    'Anurag Kashyap',
    'Rajkumar Hirani',
    'Farah Khan',
    'Zhang Yimou',
    'Chen Kaige',
    'Jia Zhangke',
    // AFRICANOS
    'Ousmane Sembène',
    'Djibril Diop Mambéty',
    'Abderrahmane Sissako',
    'Mahamat-Saleh Haroun',
    'Haile Gerima',
    'Souleymane Cissé',
    'Youssef Chahine',
    'Moussa Touré',
    'Flora Gomes',
    'Idrissa Ouedraogo',
    'Safy Faye',
    'Jean-Pierre Bekolo',
    'Wanuri Kahiu',
    'Tunde Kelani',
    'Newton Aduaka',
    'Kemi Adetiba',
    'Jahmil X.T. Qubeka',
    'Akin Omotoso',
    'Amr Salama',
    'Hala Khalil',
    // AUSTRALIANOS/NZ
    'Peter Weir',
    'George Miller',
    'Baz Luhrmann',
    'Jane Campion',
    'Taika Waititi',
    'Andrew Dominik',
    'Gillian Armstrong',
    'Rolf de Heer',
    'Phillip Noyce',
    'Bruce Beresford',
    // Mulheres diretoras (internacionais e brasileiras)
    'Ava DuVernay',
    'Kathryn Bigelow',
    'Sofia Coppola',
    'Jane Campion',
    'Agnès Varda',
    'Claire Denis',
    'Lina Wertmüller',
    'Chantal Akerman',
    'Mira Nair',
    'Patty Jenkins',
    'Greta Gerwig',
    'Dee Rees',
    'Céline Sciamma',
    'Ana Lily Amirpour',
    'Haifaa al-Mansour',
    'Nadine Labaki',
    'Julia Ducournau',
    'Alice Rohrwacher',
    'Sarah Polley',
    'Jennifer Kent',
  ];

  const fetchDirectors = async (page: number = 1, batchSize: number = 20) => {
    try {
      const startIndex = (page - 1) * batchSize;
      const endIndex = startIndex + batchSize;
      const directorsToFetch = famousDirectors.slice(startIndex, endIndex);

      console.log(
        `🔍 Buscando diretores ${startIndex + 1}-${endIndex} de ${
          famousDirectors.length
        }...`
      );

      const results = [];

      // Dividir em sub-batches de 5 para evitar rate limiting
      const subBatchSize = 5;
      for (let i = 0; i < directorsToFetch.length; i += subBatchSize) {
        const subBatch = directorsToFetch.slice(i, i + subBatchSize);

        // Buscar sub-batch em paralelo
        const subBatchPromises = subBatch.map(async (name) => {
          try {
            console.log(`🔍 Buscando: ${name}`);
            const result = await searchPeople(name);
            const directors = result.results
              .filter(
                (person: TMDBPerson) =>
                  person.known_for_department === 'Directing'
              )
              .slice(0, 1);
            return directors;
          } catch (error) {
            console.warn(`Erro ao buscar ${name}:`, error);
            return [];
          }
        });

        const subBatchResults = await Promise.all(subBatchPromises);
        results.push(...subBatchResults.flat());

        // Aguardar entre sub-batches para evitar rate limiting
        if (i + subBatchSize < directorsToFetch.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      console.log(
        `✅ Encontrados ${results.length} diretores na página ${page}`
      );

      // Se não encontrou nenhum diretor, retornar pelo menos alguns resultados da API popular
      if (results.length === 0) {
        console.log('🔄 Fallback: buscando pessoas populares...');
        const popularPeople = await getPopularPeople(page);
        const fallbackDirectors = popularPeople.results
          .filter(
            (person: TMDBPerson) => person.known_for_department === 'Directing'
          )
          .slice(0, batchSize);
        console.log(
          `✅ Fallback: encontrados ${fallbackDirectors.length} diretores`
        );
        return fallbackDirectors;
      }

      return results;
    } catch (error) {
      console.error('Erro ao buscar diretores:', error);

      // Fallback final: retornar pessoas populares
      try {
        const popularPeople = await getPopularPeople(page);
        const fallbackDirectors = popularPeople.results
          .filter(
            (person: TMDBPerson) => person.known_for_department === 'Directing'
          )
          .slice(0, batchSize);
        console.log(
          `✅ Fallback final: encontrados ${fallbackDirectors.length} diretores`
        );
        return fallbackDirectors;
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        return [];
      }
    }
  };

  // Função de busca combinada para filmes e séries (removidas as referencias ao selectedStreamings)
  const loadContentComFiltros = async (
    category: ContentCategory,
    pageNum: number = 1,
    reset: boolean = true
  ) => {
    try {
      setIsLoading(true);
      let response: any;
      if (category === 'movies' || category === 'tv' || category === 'cinema') {
        // Montar parâmetros para discover
        const params: any = {
          page: pageNum,
          sort_by: selectedOrder,
        };
        if (selectedProvider && category !== 'cinema') {
          if (selectedProvider === 'my-streamings') {
            // Se for "Meus Streamings", pegar do localStorage
            const savedStreamings = localStorage.getItem('my_streamings');
            if (savedStreamings) {
              try {
                const streamingsList = JSON.parse(savedStreamings);
                if (streamingsList.length > 0) {
                  params.with_watch_providers = streamingsList.join('|');
                  params.watch_region = 'BR';
                }
              } catch (e) {
                console.error('Erro ao ler streamings para filtro:', e);
              }
            }
          } else {
            params.with_watch_providers = selectedProvider;
            params.watch_region = 'BR';
          }
        }
        if (selectedGenre && category !== 'cinema') {
          params.with_genres = selectedGenre;
        }
        if (selectedYear && category !== 'cinema') {
          if (category === 'movies' || (category as any) === 'cinema') {
            // Usar primary_release_date é mais confiável para filtragem
            params['primary_release_date.gte'] = `${selectedYear}-01-01`;
            params['primary_release_date.lte'] = `${
              Number(selectedYear) + 9
            }-12-31`;
            // Backup: também usar release_date para máxima cobertura
            params['release_date.gte'] = `${selectedYear}-01-01`;
            params['release_date.lte'] = `${Number(selectedYear) + 9}-12-31`;
          } else if (category === 'tv') {
            params['first_air_date.gte'] = `${selectedYear}-01-01`;
            params['first_air_date.lte'] = `${Number(selectedYear) + 9}-12-31`;
          }
        }
        if (selectedLanguage && category !== 'cinema') {
          params.with_original_language = selectedLanguage;
        }

        // Para a categoria 'cinema', usamos a função específica que filtra apenas filmes em cinemas
        if (category === 'cinema') {
          // Usar a função getNowPlayingMovies que filtra filmes exclusivamente em cinemas
          // (não disponíveis em streaming)
          response = await getNowPlayingMovies(pageNum, 'BR', true);
        } else {
          // Corrigido: endpoint correto (movie/tv no singular)
          const url = `/discover/${category === 'movies' ? 'movie' : 'tv'}`;
          const apiUrl = new URL('https://api.themoviedb.org/3' + url);
          Object.entries(params).forEach(([key, value]) => {
            apiUrl.searchParams.append(key, value as string);
          });
          apiUrl.searchParams.append(
            'api_key',
            localStorage.getItem('tmdb_api_key') || ''
          );
          apiUrl.searchParams.append('language', 'pt-BR');
          const res = await fetch(apiUrl.toString());
          response = await res.json();
        }
      } else {
        // Mantém lógica antiga para atores/diretores
        switch (category) {
          case 'actors':
            response = await getPopularPeople(pageNum);
            response.results = response.results.filter(
              (person: TMDBPerson) => person.known_for_department === 'Acting'
            );
            break;
          case 'directors':
            const directors = await fetchDirectors(pageNum, 20);
            console.log(
              '📊 Diretores retornados pela fetchDirectors:',
              directors
            );
            response = {
              results: directors,
              total_pages: Math.ceil(famousDirectors.length / 20),
            };
            break;
          default:
            return;
        }
      }
      // Filtrar resultados adicionalmente no frontend para garantir que estão na década correta
      let filteredResults =
        response && response.results ? response.results : [];

      console.log(
        `📊 Dados recebidos da API: ${filteredResults.length} itens para ${category}`
      );

      // Aplicar filtro de conteúdo adulto APENAS para filmes e pessoas
      if (category === 'movies' || (category as any) === 'cinema') {
        filteredResults = filterAdultContent(filteredResults);
        console.log(
          `📊 Filmes após filtro adulto: ${filteredResults.length} itens`
        );
      } else if (category === 'tv') {
        // Para séries (TV), não aplicar NENHUM filtro - manter todos os resultados
        console.log(
          `📺 Séries: mantendo todos os ${filteredResults.length} itens (sem filtro)`
        );
      } else {
        // Para pessoas (atores/diretores), aplicar filtro
        filteredResults = filterAdultContent(filteredResults);
        console.log(
          `👥 Pessoas após filtro adulto: ${filteredResults.length} itens`
        );
      }

      if (
        selectedYear &&
        category !== 'tv' &&
        category !== 'actors' &&
        category !== 'directors'
      ) {
        const startYear = Number(selectedYear);
        const endYear = startYear + 9;

        filteredResults = filteredResults.filter((movie: TMDBMovie) => {
          if (!movie.release_date) return false;
          const movieYear = new Date(movie.release_date).getFullYear();
          return movieYear >= startYear && movieYear <= endYear;
        });
        console.log(
          `📊 Filmes após filtro de ano: ${filteredResults.length} itens`
        );
      } else if (selectedYear && category === 'tv') {
        const startYear = Number(selectedYear);
        const endYear = startYear + 9;

        filteredResults = filteredResults.filter((show: TMDBTVShow) => {
          if (!show.first_air_date) return false;
          const showYear = new Date(show.first_air_date).getFullYear();
          return showYear >= startYear && showYear <= endYear;
        });
        console.log(
          `📺 Séries após filtro de ano: ${filteredResults.length} itens`
        );
      }

      console.log(
        `📊 FINAL: Definindo ${filteredResults.length} itens para exibição`
      );

      if (reset) {
        setContent(filteredResults);
      } else {
        setContent((prev) => [...prev, ...filteredResults]);
      }
      setHasMore(pageNum < (response.total_pages || 1));
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: ContentCategory) => {
    setActiveCategory(category as any); // Type assertion to avoid type error
    setPage(1);
    loadContentComFiltros(category, 1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadContentComFiltros(activeCategory, nextPage, false);
    }
  };

  // Buscar provedores, gêneros e idiomas ao montar
  useEffect(() => {
    getWatchProviders('BR').then((data) => {
      // Verificar se tem streamings salvos
      const savedStreamings = localStorage.getItem('my_streamings');
      let hasMyStreamings = false;

      if (savedStreamings) {
        try {
          const parsed = JSON.parse(savedStreamings);
          if (parsed.length > 0) hasMyStreamings = true;
        } catch (e) {}
      }

      // Filtrar e consolidar provedores duplicados/redundantes
      const deduplicatedProviders = data.filter((provider: any) => {
        const name = provider.provider_name.toLowerCase();

        // Remover versões "with ads" (mesmo catálogo)
        if (name.includes('with ads') || name.includes('basic with ads')) {
          return false;
        }

        // Remover TODOS os "Channels" (revendas através de outras plataformas)
        // Ex: "Amazon Channel", "Apple TV Channel", "Plex Channel", "Roku Channel"
        if (name.includes(' channel')) {
          return false;
        }

        // Remover "Amazon Video" (manter apenas "Amazon Prime Video")
        if (provider.provider_id === 10 && name.includes('amazon video')) {
          return false;
        }

        // Remover "Apple TV" (ID: 2) - manter apenas "Apple TV Plus" (ID: 350)
        if (provider.provider_id === 2 && name === 'apple tv') {
          return false;
        }

        // Remover duplicatas de Apple iTunes vs Apple TV
        if (
          name === 'apple itunes' &&
          data.some((p: any) => p.provider_name.toLowerCase() === 'apple tv')
        ) {
          return false;
        }

        // Remover "Plex" se existir "Plex Channel" ou vice-versa
        // Manter apenas um deles (o que não for channel)
        if (
          name === 'plex' &&
          data.some(
            (p: any) =>
              p.provider_name.toLowerCase().includes('plex') &&
              !p.provider_name.toLowerCase().includes('channel')
          )
        ) {
          // Se já existe outro Plex sem "channel", manter apenas um
          const plexProviders = data.filter((p: any) =>
            p.provider_name.toLowerCase().includes('plex')
          );
          if (
            plexProviders.length > 1 &&
            plexProviders.findIndex(
              (p: any) => p.provider_id === provider.provider_id
            ) > 0
          ) {
            return false;
          }
        }

        return true;
      });

      const all = [
        ...(hasMyStreamings
          ? [
              {
                provider_id: 'my-streamings',
                provider_name: 'Meus Streamings',
                logo_path: null,
              },
            ]
          : []),
        { provider_id: '', provider_name: 'Todos', logo_path: null },
        ...deduplicatedProviders,
      ];
      setProviderOptions(all);

      // Definir "Meus Streamings" como padrão se existir e não tiver outro selecionado
      if (hasMyStreamings && !selectedProvider) {
        setSelectedProvider('my-streamings');
      }
    });
    getAllGenres().then((data) => {
      setGenreOptions(data);
    });
    getLanguages().then((data) => {
      setLanguageOptions([{ value: '', label: 'Todos' }, ...data]);
    });
  }, []);

  // Atualizar busca ao mudar filtros (removidas as referencias ao selectedStreamings)
  useEffect(() => {
    if (!isRestored) return;

    if (activeCategory === 'movies' || activeCategory === 'tv') {
      setPage(1);
      loadContentComFiltros(activeCategory, 1, true);
    }
    // eslint-disable-next-line
  }, [
    activeCategory,
    selectedProvider,
    selectedGenre,
    selectedOrder,
    selectedYear,
    selectedLanguage,
    isRestored,
  ]);

  // Carregar conteúdo inicial após restaurar filtros
  useEffect(() => {
    if (isRestored) {
      loadContentComFiltros(activeCategory, 1, true);
    }
  }, [isRestored]);

  // Gerenciar scroll para persistência
  useScrollManager({
    saveScrollPosition,
    isRestored,
  });

  return (
    <div className="min-h-screen space-y-12">
      {/* Hero Section with Centralized Search */}
      <SearchSection />

      {/* Category Navigation */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Filtros avançados para filmes e séries (removidas as props do selectedStreamings) */}
      {(activeCategory === 'movies' || activeCategory === 'tv') && (
        <MovieFilters
          providers={providerOptions}
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          genres={genreOptions}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          orderOptions={orderOptions}
          selectedOrder={selectedOrder}
          onOrderChange={setSelectedOrder}
          yearOptions={yearOptions}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          languageOptions={languageOptions}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      )}

      {/* Infinite Content Grid */}
      <ContentGrid
        content={content}
        category={activeCategory}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onItemClick={saveScrollPosition}
      />
    </div>
  );
};
