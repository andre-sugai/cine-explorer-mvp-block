import React, { useState, useEffect } from 'react';
import { SearchSection } from './home/SearchSection';
import { CategoryTabs } from './home/CategoryTabs';
import { ContentGrid } from './home/ContentGrid';
import {
  getPopularMovies,
  getPopularTVShows,
  getPopularPeople,
  searchPeople,
} from '@/utils/tmdb';
import { TMDBMovie, TMDBTVShow, TMDBPerson } from '@/utils/tmdb';

type ContentCategory = 'movies' | 'tv' | 'actors' | 'directors';

export const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] =
    useState<ContentCategory>('movies');
  const [content, setContent] = useState<
    (TMDBMovie | TMDBTVShow | TMDBPerson)[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  const loadContent = async (
    category: ContentCategory,
    pageNum: number = 1,
    reset: boolean = false
  ) => {
    try {
      setIsLoading(true);
      let response;

      switch (category) {
        case 'movies':
          response = await getPopularMovies(pageNum);
          break;
        case 'tv':
          response = await getPopularTVShows(pageNum);
          break;
        case 'actors':
          response = await getPopularPeople(pageNum);
          // Filtra apenas atores
          response.results = response.results.filter(
            (person: TMDBPerson) => person.known_for_department === 'Acting'
          );
          break;
        case 'directors':
          const directors = await fetchDirectors();
          response = {
            results: directors,
            total_pages: 1,
          };
          break;
        default:
          return;
      }

      if (reset) {
        setContent(response.results);
      } else {
        setContent((prev) => [...prev, ...response.results]);
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
    loadContent(category, 1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadContent(activeCategory, nextPage, false);
    }
  };

  const handleLuckyPick = () => {
    if (content.length > 0) {
      const randomItem = content[Math.floor(Math.random() * content.length)];

      if ('title' in randomItem) {
        // It's a movie
        window.location.href = `/filme/${randomItem.id}`;
      } else if ('name' in randomItem && 'first_air_date' in randomItem) {
        // It's a TV show
        window.location.href = `/serie/${randomItem.id}`;
      } else if ('name' in randomItem) {
        // It's a person
        window.location.href = `/pessoa/${randomItem.id}`;
      }
    }
  };

  useEffect(() => {
    loadContent(activeCategory, 1, true);
  }, []);

  return (
    <div className="min-h-screen space-y-12">
      {/* Hero Section with Centralized Search */}
      <SearchSection onLuckyPick={handleLuckyPick} />

      {/* Category Navigation */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Infinite Content Grid */}
      <ContentGrid
        content={content}
        category={activeCategory}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
};
