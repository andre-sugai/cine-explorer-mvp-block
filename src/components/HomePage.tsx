import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchSection } from './home/SearchSection';
import { CategoryTabs } from './home/CategoryTabs';
import { MovieFilters } from './home/MovieFilters';
import { ContentGrid } from './home/ContentGrid';
import { useFiltersPersistence } from '@/hooks/useFiltersPersistence';
import { useNavigationScroll } from '@/hooks/useNavigationScroll';
import {
  getWatchProviders,
  getLanguages,
  getPopularMovies,
  getPopularTVShows,
  getPopularPeople,
  searchPeople,
  getAllGenres,
  TMDBMovie,
  TMDBTVShow,
  TMDBPerson,
  TMDBGenre,
} from '@/utils/tmdb';

type ContentCategory = 'movies' | 'tv' | 'actors' | 'directors';

export const HomePage: React.FC = () => {
  // Hook para persistência de filtros
  const {
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    yearFilter,
    setYearFilter,
    genreFilter,
    setGenreFilter,
    providerFilter,
    setProviderFilter,
    languageFilter,
    setLanguageFilter,
    searchTerm,
    setSearchTerm,
    filtersLoaded,
    saveScrollPosition,
  } = useFiltersPersistence();

  // Hook para navegação com scroll
  const { navigateWithScrollSave } = useNavigationScroll(
    saveScrollPosition,
    () => {}, // Função vazia já que a restauração é feita diretamente no hook
    filtersLoaded
  );

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
    // ...adicione mais se quiser!
  ];

  const fetchDirectors = async () => {
    const results = await Promise.all(
      famousDirectors.map((name) => searchPeople(name))
    );
    // Pega até 3 resultados de cada busca que sejam diretores
    return results.flatMap((res) =>
      res.results
        .filter((person) => person.known_for_department === 'Directing')
        .slice(0, 3)
    );
  };

  // Função de busca combinada para filmes e séries
  const loadContentComFiltros = async (
    category: ContentCategory,
    pageNum: number = 1,
    reset: boolean = true
  ) => {
    try {
      setIsLoading(true);
      let response;
      if (category === 'movies' || category === 'tv') {
        // Montar parâmetros para discover
        const params: any = {
          page: pageNum,
          sort_by: sortBy,
        };
        if (providerFilter) {
          params.with_watch_providers = providerFilter;
          params.watch_region = 'BR';
        }
        if (genreFilter) {
          params.with_genres = genreFilter;
        }
        if (yearFilter) {
          if (category === 'movies') {
            // Usar primary_release_date é mais confiável para filtragem
            params['primary_release_date.gte'] = `${yearFilter}-01-01`;
            params['primary_release_date.lte'] = `${
              Number(yearFilter) + 9
            }-12-31`;
            // Backup: também usar release_date para máxima cobertura
            params['release_date.gte'] = `${yearFilter}-01-01`;
            params['release_date.lte'] = `${Number(yearFilter) + 9}-12-31`;
          } else if (category === 'tv') {
            params['first_air_date.gte'] = `${yearFilter}-01-01`;
            params['first_air_date.lte'] = `${Number(yearFilter) + 9}-12-31`;
          }
        }
        if (languageFilter) {
          params.with_original_language = languageFilter;
        }
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
            const directors = await fetchDirectors();
            response = { results: directors, total_pages: 1 };
            break;
          default:
            return;
        }
      }
      // Filtrar resultados adicionalmente no frontend para garantir que estão na década correta
      let filteredResults =
        response && response.results ? response.results : [];

      if (yearFilter && category === 'movies') {
        const startYear = Number(yearFilter);
        const endYear = startYear + 9;

        filteredResults = filteredResults.filter((movie: TMDBMovie) => {
          if (!movie.release_date) return false;
          const movieYear = new Date(movie.release_date).getFullYear();
          return movieYear >= startYear && movieYear <= endYear;
        });
      } else if (yearFilter && category === 'tv') {
        const startYear = Number(yearFilter);
        const endYear = startYear + 9;

        filteredResults = filteredResults.filter((show: TMDBTVShow) => {
          if (!show.first_air_date) return false;
          const showYear = new Date(show.first_air_date).getFullYear();
          return showYear >= startYear && showYear <= endYear;
        });
      }

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
    setActiveCategory(category);
    setPage(1);
    loadContentComFiltros(category, 1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadContentComFiltros(activeCategory, page + 1, false);
    }
  };

  // Buscar provedores, gêneros e idiomas ao montar
  useEffect(() => {
    getWatchProviders('BR').then((data) => {
      const all = [
        { provider_id: '', provider_name: 'Todos', logo_path: null },
        ...data,
      ];
      setProviderOptions(all);
    });
    getAllGenres().then((data) => {
      setGenreOptions(data);
    });
    getLanguages().then((data) => {
      setLanguageOptions([{ value: '', label: 'Todos' }, ...data]);
    });
  }, []);

  // Atualizar busca ao mudar filtros
  useEffect(() => {
    if (activeCategory === 'movies' || activeCategory === 'tv') {
      loadContentComFiltros(activeCategory, 1, true);
    }
    // eslint-disable-next-line
  }, [
    activeCategory,
    providerFilter,
    genreFilter,
    sortBy,
    yearFilter,
    languageFilter,
  ]);

  useEffect(() => {
    // Carregar conteúdo apenas quando os filtros estiverem carregados
    if (filtersLoaded) {
      loadContentComFiltros(activeCategory, 1, true);
    }
  }, [filtersLoaded, activeCategory]);

  return (
    <div className="min-h-screen space-y-12">
      {/* Hero Section with Centralized Search */}
      <SearchSection />

      {/* Category Navigation */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Filtros avançados para filmes e séries */}
      {(activeCategory === 'movies' || activeCategory === 'tv') && (
        <MovieFilters
          providers={providerOptions}
          selectedProvider={providerFilter}
          onProviderChange={setProviderFilter}
          genres={genreOptions}
          selectedGenre={genreFilter}
          onGenreChange={setGenreFilter}
          orderOptions={orderOptions}
          selectedOrder={sortBy}
          onOrderChange={setSortBy}
          yearOptions={yearOptions}
          selectedYear={yearFilter}
          onYearChange={setYearFilter}
          languageOptions={languageOptions}
          selectedLanguage={languageFilter}
          onLanguageChange={setLanguageFilter}
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
