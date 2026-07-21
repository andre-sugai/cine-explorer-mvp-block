export const getTotalWatchedFact = (total: number): string => {
  if (total === 0) return 'Comece sua jornada cinematográfica!';
  if (total < 10) return 'Todo cinéfilo tem um começo. Continue assistindo!';
  if (total < 50) return 'Você já assistiu mais filmes que um festival de cinema indie médio.';
  if (total < 150) return 'Você poderia montar sua própria mini-locadora de bairro!';
  if (total < 500) return 'Você já viu mais produções do que muitos atores participam na vida toda.';
  if (total < 1000) return 'Uma locadora Blockbuster média costumava ter cerca de 10.000 títulos. Você já viu quase 10% de uma loja inteira!';
  if (total < 2500) return 'Impressionante! Você já assistiu a um acervo maior que a biblioteca inicial do Netflix.';
  if (total < 5000) return 'Um verdadeiro crítico! Você seria um membro vitalício de ouro na Blockbuster.';
  return 'Inacreditável. Você é praticamente uma enciclopédia ambulante do cinema!';
};

export const getTotalTimeFact = (hours: number): string => {
  if (hours === 0) return 'O tempo voa quando você (ainda não) se diverte.';
  if (hours < 24) return 'Menos de um dia inteiro. Dá pra fazer uma maratona para resolver isso!';
  if (hours < 72) return 'O equivalente em tempo de viagem da nave Apollo 11 da Terra até a Lua.';
  if (hours < 168) return 'Você passou uma semana inteira, 24h por dia, assistindo à tela.';
  if (hours < 500) return 'Tempo suficiente para aprender a tocar o básico de um novo instrumento musical.';
  if (hours < 1000) return 'Tempo suficiente para se tornar fluente em um idioma, dedicando-se do zero.';
  if (hours < 2000) return 'Com esse tempo de dedicação, você poderia ter se formado em um curso técnico ou especialização.';
  if (hours < 4000) return 'Esta é a quantidade de horas equivalente à duração média de um curso de graduação universitário inteiro!';
  if (hours < 8000) return 'Quase um ano ininterrupto (24 horas por dia, 7 dias por semana) focado apenas na tela!';
  return 'Tempo suficiente para se tornar um mestre absoluto na teoria das 10.000 horas!';
};

export const getGenreFact = (genreName: string): string => {
  if (!genreName || genreName === '-') return 'Um mundo de descobertas aguarda você.';
  const normalizedGenre = genreName.toLowerCase();
  
  const facts: Record<string, string> = {
    'ação': 'Keanu Reeves e Tom Cruise curtiriam sua lista de filmes.',
    'animação': 'Walt Disney e Hayao Miyazaki ficariam orgulhosos de você.',
    'aventura': 'Steven Spielberg adoraria bater um papo com você.',
    'comédia': 'Você deve dar boas risadas. Adam Sandler seria seu amigo.',
    'crime': 'Martin Scorsese aprovaria totalmente sua curadoria de filmes.',
    'documentário': 'Michael Moore e Werner Herzog têm o mesmo gosto que você.',
    'drama': 'Você é dos meus. Quentin Tarantino também é um grande fã de Drama!',
    'família': 'Você sabe como escolher um filme que agrada a todos na sala.',
    'fantasia': 'Peter Jackson e George R.R. Martin estão sorrindo para você.',
    'história': 'Ridley Scott adoraria debater esses filmes com você.',
    'terror': 'Stephen King e John Carpenter se sentiriam em casa com você.',
    'música': 'Damien Chazelle tem uma playlist de filmes parecida com a sua.',
    'mistério': 'Alfred Hitchcock e David Fincher aprovariam suas escolhas.',
    'romance': 'Nora Ephron e Richard Curtis diriam que você é um(a) romântico(a).',
    'ficção científica': 'Christopher Nolan e Denis Villeneuve achariam seu gosto estelar.',
    'thriller': 'Você tem coração forte! Bong Joon-ho faria um filme pra você.',
    'guerra': 'Stanley Kubrick e Francis Ford Coppola concordariam com você.',
    'faroeste': 'Clint Eastwood tira o chapéu para o seu gosto cinematográfico.',
    'outros': 'Seu gosto é tão único e variado que é difícil de classificar!'
  };

  return facts[normalizedGenre] || facts['outros'];
};

export const getDecadeFact = (decade: string): string => {
  if (!decade || decade === '-') return 'Você assiste um pouco de tudo, sem foco em uma década específica!';
  
  const facts: Record<string, string> = {
    '1970s': 'Fã dos clássicos! A Nova Hollywood e o surgimento dos grandes blockbusters dominam sua tela.',
    '1980s': 'A década de ouro da cultura pop, das jaquetas de couro e da magia sem CGI.',
    '1990s': 'Você curte a era das locadoras, de Matrix, Tarantino e efeitos visuais práticos incríveis.',
    '2000s': 'Sua praia é a transição para a era digital, a febre do DVD e o início da revolução dos super-heróis.',
    '2010s': 'O auge da era do streaming, maratonas épicas e universos cinematográficos gigantescos.',
    '2020s': 'Sempre ligado(a) nas novidades e tendências fresquinhas do mundo audiovisual.'
  };

  return facts[decade] || 'Uma excelente escolha, cheia de pérolas escondidas nessa época!';
};

export const getWeekdayFact = (weekday: string): string => {
  if (!weekday || weekday === '-') return 'Seus hábitos são bem divididos durante a semana.';
  
  const facts: Record<string, string> = {
    'Domingo': 'Nada melhor do que terminar o fim de semana com uma boa sessão pipoca no sofá!',
    'Segunda-feira': 'Você gosta de começar a semana relaxando e escapando da rotina.',
    'Terça-feira': 'Terça é o seu dia oficial para recarregar as energias em frente à tela.',
    'Quarta-feira': 'Exatamente no meio da semana, uma pausa audiovisual para quebrar o gelo.',
    'Quinta-feira': 'O esquenta oficial para o fim de semana começa com você dando play.',
    'Sexta-feira': 'A semana de trabalho acabou! Hora de pegar um drink, pipoca e relaxar.',
    'Sábado': 'Sábado é dia de diversão, e pelo visto sua principal escolha é maratonar!'
  };

  return facts[weekday] || 'Qualquer dia é dia para uma boa história.';
};

export const getRatingFact = (rating: number): string => {
  if (!rating || rating === 0) return 'Você não se importa com notas, o que importa é a diversão!';
  if (rating < 5) return 'Você adora os chamados "guilty pleasures" ou filmes trash divertidos!';
  if (rating < 6) return 'Você não se importa com a crítica, assiste o que quer para se divertir.';
  if (rating < 7.5) return 'Seu gosto é bem equilibrado, curte grandes clássicos e entretenimento pipoca.';
  if (rating < 8.5) return 'Você é exigente! Seu tempo é precioso e você foge de produções mal avaliadas.';
  return 'Gosto extremamente refinado. Você só assiste à nata da aclamação mundial da crítica!';
};

export const getMovieVsTvFact = (moviePercent: number): string => {
  if (moviePercent >= 80) return 'Você tem alma de cinéfilo(a). Histórias fechadas em 2 horinhas são sua especialidade.';
  if (moviePercent >= 60) return 'Mais focado(a) no cinema, mas não dispensa uma boa série para equilibrar.';
  if (moviePercent > 40) return 'Seu coração é perfeitamente dividido entre a tela grande e as longas maratonas.';
  if (moviePercent >= 20) return 'Você é um(a) verdadeiro(a) maratonista de séries, e de vez em quando vê um filmezinho.';
  return 'O rei/rainha das temporadas! Séries são, sem dúvidas, sua maior paixão e investimento de tempo.';
};
