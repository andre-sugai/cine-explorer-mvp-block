/**
 * Utilitário para filtrar conteúdo adulto (+18)
 * Baseado em padrões identificados em filmes eróticos/adultos
 */

// Palavras-chave que indicam conteúdo adulto (em diferentes idiomas)
const ADULT_KEYWORDS = [
  // Português
  'erótico',
  'erotico',
  'adulto',
  'sensual',
  'sexual',
  'sexo',
  'nudez',
  'pornô',
  'porno',
  'sedução',
  'seducao',
  'tesão',
  'tesao',
  'prazer',
  'desejo',
  'paixão',
  'paixao',
  'íntimo',
  'intimo',
  'provocante',
  'safado',
  'safada',
  'gostosa',
  'gostoso',
  'strip',
  'stripper',
  'prostituta',
  'prostituto',
  'escort',
  'acompanhante',

  // Inglês
  'erotic',
  'adult',
  'sexual',
  'sex',
  'nude',
  'nudity',
  'porn',
  'pornographic',
  'seduction',
  'seductive',
  'sensual',
  'intimate',
  'provocative',
  'steamy',
  'hot',
  'sexy',
  'lust',
  'desire',
  'passion',
  'temptation',
  'forbidden',
  'strip',
  'stripper',
  'prostitute',
  'escort',
  'call girl',
  'gigolo',
  'affair',
  'infidelity',
  'cheating',
  'mistress',
  'lover',

  // Espanhol
  'erótico',
  'adulto',
  'sexual',
  'sexo',
  'desnudo',
  'desnuda',
  'sensual',
  'seducción',
  'seduccion',
  'provocativo',
  'provocativa',
  'caliente',
  'pasión',
  'pasion',
  'deseo',
  'lujuria',
  'tentación',
  'tentacion',

  // Francês
  'érotique',
  'adulte',
  'sexuel',
  'sexe',
  'nu',
  'nue',
  'sensuel',
  'séduction',
  'seduction',
  'provocant',
  'provocante',
  'chaud',
  'passion',
  'désir',
  'desir',
  'luxure',
  'tentation',

  // Italiano
  'erotico',
  'adulto',
  'sessuale',
  'sesso',
  'nudo',
  'nuda',
  'sensuale',
  'seduzione',
  'provocante',
  'caldo',
  'passione',
  'desiderio',

  // Alemão
  'erotisch',
  'erwachsen',
  'sexuell',
  'sex',
  'nackt',
  'sinnlich',
  'verführung',
  'verführerisch',
  'heiß',
  'leidenschaft',
  'begierde',

  // Japonês (romanizado)
  'ecchi',
  'hentai',
  'ero',
  'seijin',
  'otona',

  // Coreano (romanizado)
  'seong-in',
  'ero',
  'sekseu',

  // Termos específicos de filmes adultos
  'sorority',
  'fraternity',
  'college girls',
  'schoolgirl',
  'schoolboy',
  'milf',
  'cougar',
  'sugar daddy',
  'sugar baby',
  'webcam',
  'cam girl',
  'bdsm',
  'fetish',
  'kink',
  'dominatrix',
  'submissive',
  'bondage',
  'swinger',
  'threesome',
  'orgy',
  'gangbang',
  'bukkake',

  // Títulos comuns em filmes adultos asiáticos
  'kalakal',
  'sorority',
  'kiskisan',
  'bubu',
  'gyohwan',

  // Termos asiáticos específicos
  'pink film',
  'roman porno',
  'category iii',
  'cat iii',
  'av idol',
  'gravure',
  'jav',
  'pinku eiga',
  'eroduction',
  'softcore',
  'hardcore',
  'erotic thriller',
  'erotic drama',
  'sexual',
  'sensual',
  'seductive',
  'temptation',
  'desire',
  'lust',
  'passion',
  'intimate',
  'forbidden',
  'taboo',
  'scandal',
  'affair',
  'mistress',
  'lover',
  'seduction',

  // Termos em outros idiomas asiáticos (romanizados)
  'sarang', // amor em coreano
  'ai', // amor em japonês
  'ren ai', // romance em japonês
  'ecchi na', // pervertido em japonês
  'ero guro', // erótico grotesco em japonês
];

// Gêneros que frequentemente contêm conteúdo adulto
const ADULT_GENRE_IDS = [
  // Não há gênero específico "adulto" no TMDB, mas alguns podem indicar
  // Vamos usar uma abordagem mais conservadora baseada em outros critérios
];

// Classificações etárias que indicam conteúdo adulto
const ADULT_RATINGS = [
  'NC-17', // Estados Unidos - Nenhum menor de 17 anos
  'X', // Antiga classificação adulta
  'XXX', // Conteúdo explícito
  'R18+', // Austrália - Restrito a maiores de 18
  '18', // Reino Unido - Maiores de 18
  'M18', // Singapura - Maiores de 18
  'CAT III', // Hong Kong - Categoria III (adulto)
  'Unrated', // Sem classificação (pode ser adulto)
];

// Países conhecidos por produção de conteúdo adulto
const ADULT_CONTENT_COUNTRIES = [
  'PH', // Filipinas (muitos filmes eróticos independentes)
  'KR', // Coreia do Sul (alguns filmes eróticos)
  'JP', // Japão (filmes pink/roman porno)
  'TH', // Tailândia (alguns filmes eróticos)
  'CN', // China (alguns filmes eróticos independentes)
  'HK', // Hong Kong (Category III films)
  'TW', // Taiwan (alguns filmes eróticos)
  'VN', // Vietnã (alguns filmes eróticos)
  'ID', // Indonésia (alguns filmes eróticos)
  'MY', // Malásia (alguns filmes eróticos)
];

// Produtoras/estúdios conhecidos por conteúdo adulto
const ADULT_STUDIOS = [
  'Viva Films', // Filipinas - produz alguns filmes eróticos
  'Regal Entertainment', // Filipinas - alguns filmes adultos
  'Pink Film', // Japão - gênero de filmes eróticos
  'Roman Porno', // Japão - subgênero erótico
];

/**
 * Verifica se um título contém palavras-chave adultas
 */
const hasAdultKeywords = (text: string): boolean => {
  if (!text) return false;

  const normalizedText = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos

  return ADULT_KEYWORDS.some((keyword) => {
    const normalizedKeyword = keyword
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return normalizedText.includes(normalizedKeyword);
  });
};

/**
 * Verifica se a classificação etária indica conteúdo adulto
 */
const hasAdultRating = (certification: string): boolean => {
  if (!certification) return false;

  return ADULT_RATINGS.some((rating) =>
    certification.toUpperCase().includes(rating.toUpperCase())
  );
};

/**
 * Verifica se o país de origem é conhecido por conteúdo adulto
 */
const isFromAdultContentCountry = (countries: string[]): boolean => {
  if (!countries || countries.length === 0) return false;

  return countries.some((country) =>
    ADULT_CONTENT_COUNTRIES.includes(country.toUpperCase())
  );
};

/**
 * Verifica se a produtora é conhecida por conteúdo adulto
 */
const hasAdultStudio = (studios: any[]): boolean => {
  if (!studios || studios.length === 0) return false;

  return studios.some((studio) =>
    ADULT_STUDIOS.some((adultStudio) =>
      studio.name?.toLowerCase().includes(adultStudio.toLowerCase())
    )
  );
};

/**
 * Verifica se o conteúdo tem características de filme adulto baseado na popularidade e avaliação
 */
const hasAdultContentPattern = (item: any): boolean => {
  // Filmes adultos tendem a ter:
  // - Popularidade baixa no TMDB (não são mainstream)
  // - Avaliação média (nem muito alta nem muito baixa)
  // - Poucos votos (nicho específico)

  const popularity = item.popularity || 0;
  const voteAverage = item.vote_average || 0;
  const voteCount = item.vote_count || 0;

  // Padrão suspeito: baixa popularidade + poucos votos + avaliação média
  if (
    popularity < 10 &&
    voteCount < 100 &&
    voteAverage > 5 &&
    voteAverage < 8
  ) {
    return true;
  }

  return false;
};

/**
 * Função principal para verificar se um item contém conteúdo adulto
 */
export const isAdultContent = (item: any): boolean => {
  if (!item) return false;

  // Verificar se o filtro está ativado
  const filterEnabled = localStorage.getItem('adult_content_filter') === 'true';
  const title =
    item.title || item.name || item.original_title || item.original_name || '';
  const overview = item.overview || '';
  const tagline = item.tagline || '';

  // Log detalhado para debugging
  console.log(
    `🔍 Verificando item: "${title}" | Filtro ativado: ${filterEnabled}`
  );

  if (!filterEnabled) {
    console.log(`⚠️ Filtro desativado - item "${title}" não será verificado`);
    return false;
  }

  // Para séries de TV, aplicar filtros mais brandos
  const isTVShow = item.first_air_date !== undefined || item.name !== undefined;

  if (isTVShow) {
    console.log(`📺 Aplicando filtro leve para série: "${title}"`);

    // Para séries, apenas bloquear conteúdo explicitamente adulto
    const explicitAdultKeywords = [
      'porn',
      'xxx',
      'adult film',
      'erotic film',
      'sex tape',
      'pornographic',
      'hardcore',
      'softcore',
    ];

    const titleLower = title.toLowerCase();
    const overviewLower = overview.toLowerCase();

    // Verificar se é explicitamente adulto
    const hasExplicitContent = explicitAdultKeywords.some(
      (keyword) =>
        titleLower.includes(keyword) || overviewLower.includes(keyword)
    );

    if (hasExplicitContent || item.adult === true) {
      console.log(`🔞 Série bloqueada por conteúdo explícito: ${title}`);
      return true;
    }

    // Para séries, não aplicar filtros baseados em país/popularidade
    console.log(`✅ Série aprovada: ${title}`);
    return false;
  }

  // WHITELIST DE FILMES MAINSTREAM (para evitar falsos positivos)
  const whitelistedTitles = [
    'predador',
    'predator',
    'alien',
    'terminator',
    'matrix',
    'avengers',
    'batman',
    'superman',
    'spider-man',
    'homem-aranha',
    'iron man',
    'homem de ferro',
    'thor',
    'captain america',
    'capitão américa',
    'guardians of the galaxy',
    'guardioes da galaxia',
    'star wars',
    'guerra nas estrelas',
    'jurassic',
    'jurassico',
    'fast and furious',
    'velozes e furiosos',
    'mission impossible',
    'missão impossível',
    'james bond',
    '007',
    'john wick',
    'titanic',
    'avatar',
    'inception',
    'a origem',
    'interstellar',
    'interestelar',
    'dune',
    'duna',
    'blade runner',
    'o exterminador do futuro',
    'the lord of the rings',
    'o senhor dos aneis',
    'harry potter',
    'game of thrones',
    'breaking bad',
  ];

  const titleLower = title.toLowerCase();
  const overviewLower = overview.toLowerCase();

  // Verificar whitelist primeiro (filmes conhecidos não devem ser bloqueados)
  const isWhitelisted = whitelistedTitles.some((whitelisted) =>
    titleLower.includes(whitelisted.toLowerCase())
  );

  // Variável para controlar se devemos pular verificações de palavras-chave
  let skipKeywordChecks = false;

  if (isWhitelisted) {
    console.log(
      `✅ Filme na whitelist: "${title}" - pulando verificações de palavras-chave (filme mainstream conhecido)`
    );
    skipKeywordChecks = true;
    // Ainda verificar flag 'adult' do TMDB e classificação etária, mas não palavras-chave
    if (item.adult === true) {
      console.log(`🔞 Conteúdo adulto detectado por flag 'adult': ${title}`);
      return true;
    }
  }

  // LISTA NEGRA DE TÍTULOS ESPECÍFICOS (dinâmica)
  const blacklistedTitles = getBlacklistedTitles();

  // Verificar lista negra (tem prioridade sobre whitelist)
  for (const blacklisted of blacklistedTitles) {
    if (titleLower.includes(blacklisted.toLowerCase())) {
      console.log(
        `🚫 TÍTULO NA LISTA NEGRA: "${title}" contém "${blacklisted}"`
      );
      return true;
    }
  }

  // TESTE AGRESSIVO: Bloquear qualquer filme com palavras específicas
  const testWords = [
    'sorority',
    'kalakal',
    'kiskisan',
    'bubu',
    'gyohwan',
    'pink',
    'erotic',
    'sexy',
    'hot',
    'sensual',
    'desire',
    'lust',
    'passion',
    'temptation',
    'seduction',
    'affair',
    'mistress',
    'forbidden',
    'taboo',
    // Palavras coreanas/asiáticas específicas
    '교환',
    '엄마',
    '아내',
    '노출',
    '욕망',
    '목적',
    '유혹',
    '바람',
    '새엄마',
    '친구의',
    '가슴',
    '동창회',
    '배달',
  ];

  for (const word of testWords) {
    if (titleLower.includes(word) || overviewLower.includes(word)) {
      console.log(
        `🔞 TESTE AGRESSIVO: Bloqueando "${title}" por conter "${word}"`
      );
      return true;
    }
  }

  // DETECÇÃO ESPECÍFICA PARA FILMES ASIÁTICOS OBSCUROS
  const asianCountries = [
    'KR',
    'JP',
    'CN',
    'TH',
    'PH',
    'HK',
    'TW',
    'VN',
    'ID',
    'MY',
  ];
  const itemCountries =
    item.production_countries?.map((c: any) => c.iso_3166_1) ||
    item.origin_country ||
    [];
  const isAsian = itemCountries.some((country) =>
    asianCountries.includes(country)
  );

  if (isAsian) {
    const popularity = item.popularity || 0;
    const voteCount = item.vote_count || 0;
    const voteAverage = item.vote_average || 0;

    // DETECÇÃO ULTRA AGRESSIVA para filmes asiáticos
    // Baseada nos filmes mostrados que têm avaliações 2.5-9.8
    if (
      // Qualquer filme com popularidade baixa
      popularity < 20 ||
      // Ou poucos votos (independente da nota)
      voteCount < 500 ||
      // Ou combinação suspeita de nota e votos
      (voteCount < 1000 && voteAverage > 5) ||
      // Ou título muito curto (comum em filmes adultos)
      title.length < 15 ||
      // Ou qualquer filme de 2015-2025 (período comum de filmes adultos asiáticos)
      (item.release_date && new Date(item.release_date).getFullYear() >= 2015)
    ) {
      console.log(
        `🔞 FILME ASIÁTICO ULTRA SUSPEITO: "${title}" (pop: ${popularity}, votes: ${voteCount}, avg: ${voteAverage}, year: ${item.release_date})`
      );
      return true;
    }
  }

  // DETECÇÃO ESPECÍFICA PARA FILMES FILIPINOS (muito comum conteúdo adulto)
  const isFilipino =
    itemCountries.includes('PH') ||
    titleLower.includes('ligaw') ||
    titleLower.includes('tuhog') ||
    titleLower.includes('maalikaya');

  if (isFilipino) {
    console.log(`🔞 FILME FILIPINO DETECTADO - BLOQUEANDO: "${title}"`);
    return true;
  }

  // 1. Verificar palavras-chave no título (pular se estiver na whitelist)
  if (!skipKeywordChecks && hasAdultKeywords(title)) {
    console.log(`🔞 Conteúdo adulto detectado por título: ${title}`);
    return true;
  }

  // 2. Verificar palavras-chave na sinopse (mas ser menos agressivo para filmes populares/mainstream)
  if (!skipKeywordChecks && hasAdultKeywords(overview)) {
    // Verificar se é filme mainstream/popular antes de bloquear
    const popularity = item.popularity || 0;
    const voteCount = item.vote_count || 0;
    const voteAverage = item.vote_average || 0;

    // Filmes muito populares, com muitos votos ou boa avaliação provavelmente não são adultos
    // Isso evita falsos positivos em filmes mainstream como "Predador: Terras Selvagens"
    const isMainstreamFilm =
      popularity > 30 || // Popularidade alta
      voteCount > 500 || // Muitos votos (filme conhecido)
      (voteCount > 100 && voteAverage > 6.0); // Boa avaliação com votos suficientes

    if (isMainstreamFilm) {
      console.log(
        `✅ Filme mainstream "${title}" (pop: ${popularity}, votes: ${voteCount}, avg: ${voteAverage}) - ignorando palavra-chave na sinopse (provável falso positivo)`
      );
      // Não bloquear filmes mainstream por palavras na sinopse
    } else {
      console.log(
        `🔞 Conteúdo adulto detectado por sinopse: ${title} (pop: ${popularity}, votes: ${voteCount})`
      );
      return true;
    }
  }

  // 3. Verificar palavras-chave no tagline (pular se estiver na whitelist)
  if (!skipKeywordChecks && hasAdultKeywords(tagline)) {
    console.log(`🔞 Conteúdo adulto detectado por tagline: ${title}`);
    return true;
  }

  // 4. Verificar se é filme adulto baseado no campo 'adult' do TMDB
  if (item.adult === true) {
    console.log(`🔞 Conteúdo adulto detectado por flag 'adult': ${title}`);
    return true;
  }

  // 5. Verificar classificação etária
  if (item.release_dates?.results) {
    const hasAdultCert = item.release_dates.results.some((release: any) =>
      release.release_dates?.some((date: any) =>
        hasAdultRating(date.certification)
      )
    );
    if (hasAdultCert) {
      console.log(`🔞 Conteúdo adulto detectado por classificação: ${title}`);
      return true;
    }
  }

  // 6. Verificar país de origem (MUITO AGRESSIVO para países asiáticos)
  const countries =
    item.production_countries?.map((c: any) => c.iso_3166_1) ||
    item.origin_country ||
    [];
  if (!skipKeywordChecks && isFromAdultContentCountry(countries)) {
    const popularity = item.popularity || 0;
    const voteCount = item.vote_count || 0;

    // Para filmes asiáticos, ser MUITO mais restritivo
    if (
      // Qualquer palavra-chave suspeita
      hasAdultKeywords(title) ||
      hasAdultKeywords(overview) ||
      hasAdultKeywords(tagline) ||
      // OU baixa popularidade (indicativo de filme nicho/adulto)
      popularity < 15 ||
      // OU poucos votos (filme obscuro)
      voteCount < 200 ||
      // OU padrão suspeito
      hasAdultContentPattern(item)
    ) {
      console.log(
        `🔞 Conteúdo adulto detectado por país asiático + critérios: ${title} (pop: ${popularity}, votes: ${voteCount})`
      );
      return true;
    }
  }

  // 7. Verificar produtoras
  if (hasAdultStudio(item.production_companies || [])) {
    console.log(`🔞 Conteúdo adulto detectado por produtora: ${title}`);
    return true;
  }

  // 8. Detecção por padrão de popularidade baixa + palavras suspeitas (pular se estiver na whitelist)
  if (!skipKeywordChecks && hasAdultContentPattern(item)) {
    // Se tem padrão suspeito E alguma palavra-chave, bloquear
    const suspiciousText = `${title} ${overview} ${tagline}`.toLowerCase();
    const hasSuspiciousWords = [
      'sorority',
      'kalakal',
      'kiskisan',
      'bubu',
      'gyohwan',
      'sexy',
      'hot',
      'sensual',
    ].some((word) => suspiciousText.includes(word));

    if (hasSuspiciousWords) {
      console.log(
        `🔞 Conteúdo adulto detectado por padrão + palavras suspeitas: ${title}`
      );
      return true;
    }
  }

  return false;
};

/**
 * Filtra uma lista de itens removendo conteúdo adulto
 */
export const filterAdultContent = (items: any[]): any[] => {
  const filterEnabled = localStorage.getItem('adult_content_filter') === 'true';

  console.log(
    `🔍 Filtro de conteúdo adulto: ${filterEnabled ? 'ATIVADO' : 'DESATIVADO'}`
  );

  if (!filterEnabled) {
    console.log(`📋 Retornando ${items.length} itens sem filtrar`);
    return items;
  }

  const originalCount = items.length;
  const filtered = items.filter((item) => {
    const isAdult = isAdultContent(item);
    if (isAdult) {
      const title = item.title || item.name || 'Título desconhecido';
      console.log(`🚫 BLOQUEADO: ${title}`);
    }
    return !isAdult;
  });

  const blockedCount = originalCount - filtered.length;

  if (blockedCount > 0) {
    console.log(
      `🔞 FILTRO APLICADO: ${blockedCount} de ${originalCount} itens bloqueados`
    );
  } else {
    console.log(
      `✅ Nenhum conteúdo adulto detectado em ${originalCount} itens`
    );
  }

  return filtered;
};

/**
 * Filtra especificamente séries de TV com critérios mais brandos
 */
export const filterTVShowsAdultContent = (tvShows: any[]): any[] => {
  const filterEnabled = localStorage.getItem('adult_content_filter') === 'true';

  console.log(
    `📺 Filtro de séries: ${filterEnabled ? 'ATIVADO' : 'DESATIVADO'}`
  );

  if (!filterEnabled) {
    console.log(`📋 Retornando ${tvShows.length} séries sem filtrar`);
    return tvShows;
  }

  const originalCount = tvShows.length;
  const filtered = tvShows.filter((show) => {
    const title = show.name || show.original_name || '';
    const overview = show.overview || '';

    // Aplicar apenas filtros básicos para séries
    const explicitKeywords = [
      'porn',
      'xxx',
      'adult film',
      'erotic film',
      'sex tape',
      'pornographic',
      'hardcore',
      'softcore',
    ];

    const hasExplicitContent = explicitKeywords.some(
      (keyword) =>
        title.toLowerCase().includes(keyword) ||
        overview.toLowerCase().includes(keyword)
    );

    const isBlocked = hasExplicitContent || show.adult === true;

    if (isBlocked) {
      console.log(`🚫 SÉRIE BLOQUEADA: ${title}`);
    }

    return !isBlocked;
  });

  const blockedCount = originalCount - filtered.length;

  if (blockedCount > 0) {
    console.log(
      `📺 FILTRO DE SÉRIES: ${blockedCount} de ${originalCount} séries bloqueadas`
    );
  } else {
    console.log(`✅ Nenhuma série bloqueada em ${originalCount} itens`);
  }

  return filtered;
};
export const isAdultContentFilterEnabled = (): boolean => {
  return localStorage.getItem('adult_content_filter') === 'true';
};

/**
 * Ativa ou desativa o filtro de conteúdo adulto
 */
export const setAdultContentFilter = (enabled: boolean): void => {
  localStorage.setItem('adult_content_filter', enabled.toString());
};

/**
 * Verifica se o usuário atual é o administrador André Sugai
 * Esta função deve ser usada dentro de um componente React que tem acesso ao contexto de autenticação
 */
export const isAdminUser = (userEmail?: string): boolean => {
  // Se o email for passado como parâmetro, usar ele
  if (userEmail) {
    return userEmail === 'guitarfreaks@gmail.com';
  }

  // Fallback para localStorage (para compatibilidade)
  const storedEmail = localStorage.getItem('user_email');
  return storedEmail === 'guitarfreaks@gmail.com';
};

/**
 * Obtém a lista atual de títulos na blacklist
 */
export const getBlacklistedTitles = (): string[] => {
  const stored = localStorage.getItem('blacklisted_titles');
  const defaultTitles = [
    '부부 교환',
    '부부교환',
    '부부 교환 - 무삭제',
    'благословите женщину',
    'благословите',
    '가슴 큰 을 엄마',
    '가슴큰을엄마',
    '가슴 큰을 엄마',
    '내 친구의 엄마',
    '내친구의엄마',
    'excitation au soleil',
    'eccitazione carnale',
    '바람난 아내들2',
    '바람난아내들',
    '배달노출',
    '배달노출:',
    '알몸으로 유혹하기',
    '새엄마의 욕망',
    '새엄마의욕망',
    'ligaw',
    '동창회의 목적',
    '동창회의목적',
    'tuhog',
    'maalikaya',
    'dirty ice cream',
    'dirty ice cream',
  ];

  if (!stored) {
    return defaultTitles;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultTitles;
  } catch {
    return defaultTitles;
  }
};

/**
 * Adiciona um título à blacklist
 */
export const addToBlacklist = (title: string, userEmail?: string): void => {
  if (!isAdminUser(userEmail)) {
    throw new Error(
      'Acesso negado: apenas administradores podem modificar a blacklist'
    );
  }

  const currentTitles = getBlacklistedTitles();
  const normalizedTitle = title.toLowerCase().trim();

  // Verificar se já está na lista
  if (currentTitles.some((t) => t.toLowerCase() === normalizedTitle)) {
    throw new Error('Este título já está na blacklist');
  }

  const updatedTitles = [...currentTitles, normalizedTitle];
  localStorage.setItem('blacklisted_titles', JSON.stringify(updatedTitles));

  console.log(`🚫 ADMINISTRADOR: Título "${title}" adicionado à blacklist`);
};

/**
 * Remove um título da blacklist
 */
export const removeFromBlacklist = (
  title: string,
  userEmail?: string
): void => {
  if (!isAdminUser(userEmail)) {
    throw new Error(
      'Acesso negado: apenas administradores podem modificar a blacklist'
    );
  }

  const currentTitles = getBlacklistedTitles();
  const normalizedTitle = title.toLowerCase().trim();

  const updatedTitles = currentTitles.filter(
    (t) => t.toLowerCase() !== normalizedTitle
  );
  localStorage.setItem('blacklisted_titles', JSON.stringify(updatedTitles));

  console.log(`✅ ADMINISTRADOR: Título "${title}" removido da blacklist`);
};

/**
 * Verifica se um título está na blacklist
 */
export const isInBlacklist = (title: string): boolean => {
  const blacklistedTitles = getBlacklistedTitles();
  const normalizedTitle = title.toLowerCase().trim();

  return blacklistedTitles.some((blacklisted) => {
    const normalizedBlacklisted = blacklisted.toLowerCase().trim();
    return (
      normalizedTitle.includes(normalizedBlacklisted) ||
      normalizedBlacklisted.includes(normalizedTitle)
    );
  });
};
