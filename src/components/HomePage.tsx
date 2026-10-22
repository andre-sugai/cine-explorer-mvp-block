import React, { useState, useEffect } from 'react';
import { SearchSection } from './home/SearchSection';
import { CategoryTabs } from './home/CategoryTabs';
import { ContentGrid } from './home/ContentGrid';
import { CollectionsGrid } from './home/CollectionsGrid';
import { MovieFilters } from './home/MovieFilters';

import {
  getWatchProviders,
  getLanguages,
  getPopularPeople,
  searchPeople,
  getAllGenres,
  getNowPlayingMovies,
  searchKeywords,
  getPopularCollections,
  getTVShowDetails, // NEW
} from '@/utils/tmdb';

import { filterAdultContent } from '@/utils/adultContentFilter';
import { TMDBMovie, TMDBTVShow, TMDBPerson, TMDBGenre } from '@/utils/tmdb';
import { useFilterPersistence } from '@/hooks/useFilterPersistence';
import { useScrollManager } from '@/hooks/useScrollManager';
import { useWatchedContext } from '@/context/WatchedContext'; // NEW

type ContentCategory =
  | 'watching'
  | 'movies'
  | 'tv'
  | 'actors'
  | 'directors'
  | 'cinema'
  | 'collections';

export const HomePage: React.FC = () => {
  // Hook de persistência de filtros (removidas as referencias ao selectedStreamings)
  const {
    activeCategory,
    selectedProvider,
    selectedGenre,
    selectedOrder,
    selectedYear,
    selectedLanguage,
    selectedStudio,
    searchTerm,
    selectedRuntime,
    selectedVoteCount,
    selectedKeyword,
    selectedRating,
    setActiveCategory,
    setSelectedProvider,
    setSelectedGenre,
    setSelectedOrder,
    setSelectedYear,
    setSelectedLanguage,
    setSelectedStudio,
    setSearchTerm,
    setSelectedRuntime,
    setSelectedVoteCount,
    setSelectedKeyword,
    setSelectedRating,
    saveScrollPosition,
    isRestored,
  } = useFilterPersistence();

  const { watched } = useWatchedContext(); // NEW

  const [content, setContent] = useState<
    (TMDBMovie | TMDBTVShow | TMDBPerson)[]
  >([]);
  const [collections, setCollections] = useState<any[]>([]);
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
    { value: 'current-month', label: 'Este Mês' },
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
  const [studioOptions] = useState([
    { value: '', label: 'Todos os estúdios' },
    { value: '174', label: 'Warner Bros.' },
    { value: '33', label: 'Universal Pictures' },
    { value: '4', label: 'Paramount Pictures' },
    { value: '25', label: '20th Century Studios' },
    { value: '5', label: 'Columbia Pictures' },
    { value: '2', label: 'Walt Disney Pictures' },
    { value: '420', label: 'Marvel Studios' },
    { value: '3', label: 'Pixar' },
    { value: '213', label: 'Netflix' },
    { value: '521', label: 'DreamWorks' },
    { value: '1632', label: 'Lionsgate' },
    { value: '34', label: 'Sony Pictures' },
    { value: '12', label: 'New Line Cinema' },
    { value: '21', label: 'MGM' },
    { value: '41077', label: 'A24' },
    { value: '3172', label: 'Blumhouse Productions' },
    { value: '923', label: 'Legendary Pictures' },
  ]);

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
    'Ruben Östlund',
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



      const results = [];

      // Dividir em sub-batches de 5 para evitar rate limiting
      const subBatchSize = 5;
      for (let i = 0; i < directorsToFetch.length; i += subBatchSize) {
        const subBatch = directorsToFetch.slice(i, i + subBatchSize);

        // Buscar sub-batch em paralelo
        const subBatchPromises = subBatch.map(async (name) => {
          try {
            // console.log(`🔍 Buscando: ${name}`);
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



      // Se não encontrou nenhum diretor, retornar pelo menos alguns resultados da API popular
      if (results.length === 0) {
        // console.log('🔄 Fallback: buscando pessoas populares...');
        const popularPeople = await getPopularPeople(page);
        const fallbackDirectors = popularPeople.results
          .filter(
            (person: TMDBPerson) => person.known_for_department === 'Directing'
          )
          .slice(0, batchSize);

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

      // Tratar categoria 'watching' separadamente
      if (category === 'watching') {
        const watchedShows = watched
          .filter(
            (item) =>
              (item.type === 'episode' && item.tvId) ||
              (item.type === 'tv' && item.status === 'following')
          )
          .map((item) => (item.type === 'tv' ? item.id : item.tvId))
          .filter((value): value is number => value !== undefined)
          .filter((value, index, self) => self.indexOf(value) === index); // Unique IDs

        // Sort by most recently watched (using checked item's watchedAt if available, otherwise order in list)
        // Simplification: Reverse order of 'watched' list gives rough approximation if we assume appends
        // Better: sort unique IDs by looking up latest watchedAt for that tvId
        const sortedShowIds = watchedShows.sort((a, b) => {
          const lastWatchedA = watched
            .filter((w) => w.tvId === a || (w.type === 'tv' && w.id === a))
            .sort(
              (x, y) =>
                new Date(y.watchedAt).getTime() -
                new Date(x.watchedAt).getTime()
            )[0];
          const lastWatchedB = watched
            .filter((w) => w.tvId === b || (w.type === 'tv' && w.id === b))
            .sort(
              (x, y) =>
                new Date(y.watchedAt).getTime() -
                new Date(x.watchedAt).getTime()
            )[0];
          return (
            new Date(lastWatchedB?.watchedAt || 0).getTime() -
            new Date(lastWatchedA?.watchedAt || 0).getTime()
          );
        });

        // Pagination for local items (client-side)
        const pageSize = 20;
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageIds = sortedShowIds.slice(startIndex, endIndex);

        if (pageIds.length === 0) {
          if (reset) setContent([]);
          setHasMore(false);
          setIsLoading(false);
          return;
        }

        const showDetailsPromises = pageIds.map((id) =>
          getTVShowDetails(Number(id))
        );
        const shows = await Promise.all(showDetailsPromises);

        // Filter out nulls/errors
        const validShows = shows.filter((s) => !!s);

        // Filter out completed shows
        const inProgressShows = validShows.filter((show) => {
          if (!show) return false;
          
          // Verifica se a série foi marcada como COMPLETADA (check button)
          const isCompleted = watched.some(
            (w) => w.type === 'tv' && w.id === show.id && w.status === 'completed'
          );
          if (isCompleted) return false;

          // Verifica se está seguindo (follow button)
          const isFollowing = watched.some(
            (w) => w.type === 'tv' && w.id === show.id && w.status === 'following'
          );

          // Se estiver seguindo, mostra mesmo sem episódios
          if (isFollowing) return true;

          const watchedEpisodeCount = watched.filter(
            (w) => w.type === 'episode' && w.tvId === show.id
          ).length;
          
          // Keep if not fully watched (and has episodes)
          return (
            show.number_of_episodes &&
            watchedEpisodeCount < show.number_of_episodes
          );
        });

        if (reset) {
          setContent(inProgressShows);
        } else {
          setContent((prev) => [...prev, ...inProgressShows]);
        }

        setHasMore(endIndex < sortedShowIds.length);
        setIsLoading(false);
        return;
      }

      // Tratar coleções separadamente
      if (category === 'collections') {
        // console.log('🔍 HomePage: Carregando coleções, página:', pageNum);
        const collectionsData = await getPopularCollections(pageNum);
        // console.log('📚 HomePage: Coleções recebidas:', collectionsData.length);
        if (reset) {
          setCollections(collectionsData);
          // console.log('✅ HomePage: Coleções definidas (reset)');
        } else {
          setCollections((prev) => [...prev, ...collectionsData]);
          // console.log('✅ HomePage: Coleções adicionadas');
        }
        setHasMore(collectionsData.length > 0);
        setIsLoading(false);
        return;
      }

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
          if (selectedYear === 'current-month') {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
              .toISOString()
              .split('T')[0];
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
              .toISOString()
              .split('T')[0];

            if (category === 'movies') {
              params['primary_release_date.gte'] = firstDay;
              params['primary_release_date.lte'] = lastDay;
            } else if (category === 'tv') {
              params['first_air_date.gte'] = firstDay;
              params['first_air_date.lte'] = lastDay;
            }
          } else {
            if (category === 'movies') {
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
              params['first_air_date.lte'] = `${
                Number(selectedYear) + 9
              }-12-31`;
            }
          }
        }
        if (selectedLanguage && category !== 'cinema') {
          params.with_original_language = selectedLanguage;
        }
        if (selectedStudio && category !== 'cinema') {
          params.with_companies = selectedStudio;
        }
        if (selectedRuntime && category === 'movies') {
          params['with_runtime.lte'] = selectedRuntime;
        }
        if (selectedVoteCount && category !== 'cinema') {
          params['vote_count.gte'] = selectedVoteCount;
        }
        if (selectedRating && category !== 'cinema') {
          params['vote_average.gte'] = selectedRating;
        }
        if (selectedKeyword && category !== 'cinema') {
          params.with_keywords = selectedKeyword; // Isso assume que o usuário digitou IDs. Para texto livre, precisaria buscar IDs primeiro.
          // Como o endpoint discover espera IDs, vamos tentar usar o texto como query se for possível ou implementar busca de keywords.
          // O endpoint discover NÃO aceita texto livre em with_keywords, apenas IDs.
          // Para MVP, vamos assumir que o usuário não vai digitar IDs.
          // Precisamos buscar o ID da keyword primeiro.
          // VOU IMPLEMENTAR ISSO ABAIXO ANTES DE CHAMAR O DISCOVER
        }

        // Para a categoria 'cinema', usamos a função específica que filtra apenas filmes em cinemas
        if (category === 'cinema') {
          // Usar a função getNowPlayingMovies que filtra filmes exclusivamente em cinemas
          // (não disponíveis em streaming)
          response = await getNowPlayingMovies(pageNum, 'BR', true);
        } else {
          // Se tiver keyword selecionada (texto), buscar o ID primeiro
          if (selectedKeyword) {
            try {
              // Mapeamento de termos em português para inglês
              const keywordTranslations: Record<string, string> = {
                'viagem no tempo': 'time travel',
                'viagem temporal': 'time travel',
                'super-herói': 'superhero',
                'super herói': 'superhero',
                'super-heróis': 'superhero',
                'super heróis': 'superhero',
                zumbi: 'zombie',
                zumbis: 'zombie',
                vampiro: 'vampire',
                vampiros: 'vampire',
                alienígena: 'alien',
                alienígenas: 'alien',
                alien: 'alien',
                aliens: 'alien',
                robô: 'robot',
                robôs: 'robot',
                'inteligência artificial': 'artificial intelligence',
                ia: 'artificial intelligence',
                espaço: 'space',
                espacial: 'space',
                guerra: 'war',
                'segunda guerra': 'world war ii',
                'segunda guerra mundial': 'world war ii',
                nazismo: 'nazi',
                nazista: 'nazi',
                apocalipse: 'apocalypse',
                'pós-apocalíptico': 'post apocalyptic',
                distopia: 'dystopia',
                distópico: 'dystopia',
                utopia: 'utopia',
                utópico: 'utopia',
                assassino: 'killer',
                'assassino em série': 'serial killer',
                'serial killer': 'serial killer',
                detetive: 'detective',
                investigação: 'investigation',
                mistério: 'mystery',
                suspense: 'suspense',
                terror: 'horror',
                medo: 'horror',
                assombração: 'haunting',
                fantasma: 'ghost',
                fantasmas: 'ghost',
                demônio: 'demon',
                demônios: 'demon',
                possessão: 'possession',
                exorcismo: 'exorcism',
                magia: 'magic',
                mágico: 'magic',
                bruxo: 'wizard',
                bruxa: 'witch',
                bruxas: 'witch',
                feitiço: 'spell',
                dragão: 'dragon',
                dragões: 'dragon',
                medieval: 'medieval',
                'idade média': 'medieval',
                cavaleiro: 'knight',
                cavaleiros: 'knight',
                rei: 'king',
                rainha: 'queen',
                príncipe: 'prince',
                princesa: 'princess',
                família: 'family',
                amizade: 'friendship',
                amor: 'love',
                romance: 'romance',
                casamento: 'marriage',
                divórcio: 'divorce',
                traição: 'betrayal',
                vingança: 'revenge',
                redenção: 'redemption',
                sobrevivência: 'survival',
                ilha: 'island',
                'ilha deserta': 'desert island',
                náufrago: 'castaway',
                naufrágio: 'shipwreck',
                oceano: 'ocean',
                mar: 'sea',
                pirata: 'pirate',
                piratas: 'pirate',
                tesouro: 'treasure',
                aventura: 'adventure',
                exploração: 'exploration',
                selva: 'jungle',
                floresta: 'forest',
                deserto: 'desert',
                montanha: 'mountain',
                neve: 'snow',
                gelo: 'ice',
                frio: 'cold',
                inverno: 'winter',
                verão: 'summer',
                escola: 'school',
                colégio: 'high school',
                universidade: 'university',
                faculdade: 'college',
                professor: 'teacher',
                estudante: 'student',
                adolescente: 'teenager',
                adolescência: 'coming of age',
                infância: 'childhood',
                criança: 'child',
                bebê: 'baby',
                gravidez: 'pregnancy',
                parto: 'childbirth',
                adoção: 'adoption',
                orfanato: 'orphanage',
                órfão: 'orphan',
                hospital: 'hospital',
                médico: 'doctor',
                enfermeira: 'nurse',
                doença: 'disease',
                câncer: 'cancer',
                aids: 'aids',
                pandemia: 'pandemic',
                vírus: 'virus',
                epidemia: 'epidemic',
                quarentena: 'quarantine',
                isolamento: 'isolation',
                prisão: 'prison',
                cadeia: 'jail',
                prisioneiro: 'prisoner',
                fuga: 'escape',
                polícia: 'police',
                policial: 'cop',
                crime: 'crime',
                criminoso: 'criminal',
                ladrão: 'thief',
                roubo: 'robbery',
                assalto: 'heist',
                sequestro: 'kidnapping',
                refém: 'hostage',
                terrorismo: 'terrorism',
                terrorista: 'terrorist',
                bomba: 'bomb',
                explosão: 'explosion',
                ação: 'action',
                luta: 'fight',
                'artes marciais': 'martial arts',
                'kung fu': 'kung fu',
                karatê: 'karate',
                boxe: 'boxing',
                mma: 'mixed martial arts',
                esporte: 'sport',
                futebol: 'soccer',
                basquete: 'basketball',
                beisebol: 'baseball',
                corrida: 'racing',
                carro: 'car',
                carros: 'car',
                velocidade: 'speed',
                perseguição: 'chase',
                motocicleta: 'motorcycle',
                moto: 'motorcycle',
                avião: 'airplane',
                helicóptero: 'helicopter',
                trem: 'train',
                navio: 'ship',
                submarino: 'submarine',
                música: 'music',
                musical: 'musical',
                banda: 'band',
                cantor: 'singer',
                cantora: 'singer',
                rock: 'rock music',
                jazz: 'jazz',
                'hip hop': 'hip hop',
                rap: 'rap',
                dança: 'dance',
                ballet: 'ballet',
                teatro: 'theater',
                circo: 'circus',
                palhaço: 'clown',
                mágica: 'magic trick',
                ilusionismo: 'illusion',
                casino: 'casino',
                jogo: 'gambling',
                apostas: 'betting',
                poker: 'poker',
                vício: 'addiction',
                drogas: 'drugs',
                narcotráfico: 'drug trafficking',
                cartel: 'cartel',
                máfia: 'mafia',
                gangster: 'gangster',
                gang: 'gang',
                favela: 'slum',
                pobreza: 'poverty',
                riqueza: 'wealth',
                dinheiro: 'money',
                poder: 'power',
                política: 'politics',
                político: 'politician',
                presidente: 'president',
                eleição: 'election',
                democracia: 'democracy',
                ditadura: 'dictatorship',
                revolução: 'revolution',
                protesto: 'protest',
                manifestação: 'demonstration',
                racismo: 'racism',
                preconceito: 'prejudice',
                discriminação: 'discrimination',
                escravidão: 'slavery',
                liberdade: 'freedom',
                justiça: 'justice',
                injustiça: 'injustice',
                corrupção: 'corruption',
                conspiração: 'conspiracy',
                espionagem: 'espionage',
                espião: 'spy',
                'agente secreto': 'secret agent',
                cia: 'cia',
                fbi: 'fbi',
                militar: 'military',
                soldado: 'soldier',
                exército: 'army',
                marinha: 'navy',
                'força aérea': 'air force',
                combate: 'combat',
                batalha: 'battle',
                invasão: 'invasion',
                ocupação: 'occupation',
                resistência: 'resistance',
                herói: 'hero',
                heroína: 'heroine',
                vilão: 'villain',
                vilã: 'villain',
                'bem vs mal': 'good versus evil',
                'luz vs trevas': 'light versus darkness',
                deus: 'god',
                religião: 'religion',
                fé: 'faith',
                igreja: 'church',
                padre: 'priest',
                pastor: 'pastor',
                bíblia: 'bible',
                jesus: 'jesus christ',
                cristianismo: 'christianity',
                budismo: 'buddhism',
                islamismo: 'islam',
                judaísmo: 'judaism',
                ateísmo: 'atheism',
                ciência: 'science',
                cientista: 'scientist',
                laboratório: 'laboratory',
                experimento: 'experiment',
                invenção: 'invention',
                inventor: 'inventor',
                tecnologia: 'technology',
                computador: 'computer',
                hacker: 'hacker',
                internet: 'internet',
                'realidade virtual': 'virtual reality',
                vr: 'virtual reality',
                simulação: 'simulation',
                matrix: 'matrix',
                futuro: 'future',
                passado: 'past',
                presente: 'present',
                história: 'history',
                biografia: 'biography',
                'baseado em fatos reais': 'based on true story',
                'história real': 'true story',
                documentário: 'documentary',
                natureza: 'nature',
                animal: 'animal',
                animais: 'animal',
                cachorro: 'dog',
                gato: 'cat',
                cavalo: 'horse',
                leão: 'lion',
                tigre: 'tiger',
                urso: 'bear',
                lobo: 'wolf',
                dinossauro: 'dinosaur',
                dinossauros: 'dinosaur',
                'pré-história': 'prehistory',
                extinção: 'extinction',
                evolução: 'evolution',
                clone: 'clone',
                clonagem: 'cloning',
                genética: 'genetics',
                dna: 'dna',
                mutante: 'mutant',
                mutação: 'mutation',
                superpoder: 'superpower',
                superpoderes: 'superpower',
                telepatia: 'telepathy',
                telecinese: 'telekinesis',
                invisibilidade: 'invisibility',
                voo: 'flight',
                voar: 'flying',
                força: 'strength',
                imortalidade: 'immortality',
                imortal: 'immortal',
                morte: 'death',
                'vida após a morte': 'afterlife',
                céu: 'heaven',
                inferno: 'hell',
                purgatório: 'purgatory',
                reencarnação: 'reincarnation',
                alma: 'soul',
                espírito: 'spirit',
                sobrenatural: 'supernatural',
                paranormal: 'paranormal',
                ovni: 'ufo',
                'disco voador': 'flying saucer',
                abdução: 'abduction',
                'área 51': 'area 51',
                'conspiração alienígena': 'alien conspiracy',
                'fim do mundo': 'end of the world',
                'apocalipse zumbi': 'zombie apocalypse',
                'invasão alienígena': 'alien invasion',
                meteoro: 'meteor',
                asteroide: 'asteroid',
                cometa: 'comet',
                'desastre natural': 'natural disaster',
                terremoto: 'earthquake',
                tsunami: 'tsunami',
                furacão: 'hurricane',
                tornado: 'tornado',
                vulcão: 'volcano',
                erupção: 'eruption',
                incêndio: 'fire',
                inundação: 'flood',
                seca: 'drought',
                fome: 'famine',
                refugiado: 'refugee',
                imigração: 'immigration',
                fronteira: 'border',
                muro: 'wall',
                separação: 'separation',
                reunião: 'reunion',
                encontro: 'meeting',
                despedida: 'farewell',
                partida: 'departure',
                chegada: 'arrival',
                jornada: 'journey',
                viagem: 'travel',
                turismo: 'tourism',
                férias: 'vacation',
                praia: 'beach',
                cidade: 'city',
                metrópole: 'metropolis',
                'nova york': 'new york',
                'los angeles': 'los angeles',
                paris: 'paris',
                londres: 'london',
                tóquio: 'tokyo',
                'rio de janeiro': 'rio de janeiro',
                'são paulo': 'sao paulo',
                brasil: 'brazil',
                eua: 'usa',
                américa: 'america',
                europa: 'europe',
                ásia: 'asia',
                áfrica: 'africa',
                austrália: 'australia',
              };

              // Tentar traduzir o termo para inglês
              const searchTerm =
                keywordTranslations[selectedKeyword.toLowerCase()] ||
                selectedKeyword;



              const keywordSearchUrl = `https://api.themoviedb.org/3/search/keyword?query=${encodeURIComponent(
                searchTerm
              )}&page=1&api_key=${localStorage.getItem('tmdb_api_key')}`;
              const keywordRes = await fetch(keywordSearchUrl);
              const keywordData = await keywordRes.json();
              if (keywordData.results && keywordData.results.length > 0) {
                // Pegar o ID da primeira keyword encontrada
                params.with_keywords = keywordData.results[0].id;

              } else {
                console.warn(
                  `⚠️ Keyword "${searchTerm}" não encontrada. Ignorando filtro.`
                );
              }
            } catch (e) {
              console.error('Erro ao buscar keyword:', e);
            }
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

          // Debug: log da URL completa
          // console.log('🔍 API URL:', apiUrl.toString());
          // console.log('📊 Params:', params);

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
          case 'directors': {
            const directors = await fetchDirectors(pageNum, 20);

            response = {
              results: directors,
              total_pages: Math.ceil(famousDirectors.length / 20),
            };
            break;
          }
          default:
            return;
        }
      }
      // Filtrar resultados adicionalmente no frontend para garantir que estão na década correta
      let filteredResults =
        response && response.results ? response.results : [];



      // Aplicar filtro de conteúdo adulto APENAS para filmes e pessoas
      if (category === 'movies' || (category as any) === 'cinema') {
        filteredResults = filterAdultContent(filteredResults);

      } else if (category === 'tv') {
        // Para séries (TV), não aplicar NENHUM filtro - manter todos os resultados

      } else {
        // Para pessoas (atores/diretores), aplicar filtro
        filteredResults = filterAdultContent(filteredResults);

      }

      if (
        selectedYear &&
        selectedYear !== 'current-month' &&
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

      } else if (
        selectedYear &&
        selectedYear !== 'current-month' &&
        category === 'tv'
      ) {
        const startYear = Number(selectedYear);
        const endYear = startYear + 9;

        filteredResults = filteredResults.filter((show: TMDBTVShow) => {
          if (!show.first_air_date) return false;
          const showYear = new Date(show.first_air_date).getFullYear();
          return showYear >= startYear && showYear <= endYear;
        });

      }

      if (category === 'actors' || category === 'directors') {
        // Para atores e diretores, a busca é diferente
        const results =
          category === 'actors'
            ? await getPopularPeople(pageNum)
            : await fetchDirectors(pageNum);

        if (reset) {
          setContent(results.results || results); // fetchDirectors retorna array direto
        } else {
          setContent((prev) => [...prev, ...(results.results || results)]);
        }
        setHasMore(true); // Assumindo sempre mais por enquanto
      } else {
        // Processar resultados de filmes/séries.


        if (reset) {
          setContent(filteredResults);
        } else {
          setContent((prev) => [...prev, ...filteredResults]);
        }
        setHasMore(pageNum < (response.total_pages || 1));
      }
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
        } catch (e) {
          // Ignore invalid JSON in localStorage
        }
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

      // CORREÇÃO: Só definir "Meus Streamings" como padrão se:
      // 1. Existir "Meus Streamings"
      // 2. Não tiver outro selecionado
      // 3. E os filtros já foram restaurados (para não sobrescrever filtro restaurado)
      if (hasMyStreamings && !selectedProvider && isRestored) {
        setSelectedProvider('my-streamings');
      }
    });
    getAllGenres().then((data) => {
      setGenreOptions(data);
    });
    getLanguages().then((data) => {
      setLanguageOptions([{ value: '', label: 'Todos' }, ...data]);
    });
  }, [isRestored]); // Adicionado isRestored como dependência

  // Atualizar busca ao mudar filtros (removidas as referencias ao selectedStreamings)
  useEffect(() => {
    if (!isRestored) return;

    // Carregar conteúdo quando mudar categoria ou filtros
    // Para actors, directors e collections, carregar apenas quando mudar a categoria
    if (
      activeCategory === 'actors' ||
      activeCategory === 'directors' ||
      activeCategory === 'collections'
    ) {
      // Não recarregar quando mudar filtros, apenas quando mudar categoria
      return;
    }

    // Para movies e tv, recarregar quando mudar filtros
    setPage(1);
    loadContentComFiltros(activeCategory, 1, true);
    // eslint-disable-next-line
  }, [
    activeCategory,
    selectedProvider,
    selectedGenre,
    selectedOrder,
    selectedYear,
    selectedLanguage,
    selectedStudio,
    selectedRuntime,
    selectedVoteCount,
    selectedKeyword,
    selectedRating,
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
          studios={studioOptions}
          selectedStudio={selectedStudio}
          onStudioChange={setSelectedStudio}
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
          selectedRuntime={selectedRuntime}
          onRuntimeChange={setSelectedRuntime}
          selectedVoteCount={selectedVoteCount}
          onVoteCountChange={setSelectedVoteCount}
          selectedKeyword={selectedKeyword}
          onKeywordChange={setSelectedKeyword}
          selectedRating={selectedRating}
          onRatingChange={setSelectedRating}
        />
      )}

      {/* Infinite Content Grid */}
      {activeCategory === 'collections' ? (
        <CollectionsGrid
          collections={collections}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      ) : (
        <ContentGrid
          content={content}
          category={activeCategory}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onItemClick={saveScrollPosition}
        />
      )}
    </div>
  );
};
