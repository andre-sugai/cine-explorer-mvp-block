/**
 * Utilitário para filtrar conteúdo adulto (+18)
 * Baseado em padrões identificados em filmes eróticos/adultos
 */
import { supabase } from '@/integrations/supabase/client';

const ADULT_KEYWORDS = [
  'erotico',
  'adulto',
  'sensual',
  'sexual',
  'sexo',
  'nudez',
  'porno',
  'seducao',
  'tesao',
  'gostosa',
  'gostoso',
  'strip',
  'stripper',
  'prostituta',
  'prostituto',
  'escort',
  'acompanhante',
  'erotic',
  'adult',
  'nude',
  'nudity',
  'pornographic',
  'seduction',
  'seductive',
  'provocative',
  'steamy',
  'lust',
  'temptation',
  'forbidden',
  'call girl',
  'gigolo',
  'infidelity',
  'mistress',
  'desnudo',
  'desnuda',
  'lujuria',
  'tentacion',
  'sexuel',
  'sexe',
  'luxure',
  'tentation',
  'sessuale',
  'sesso',
  'seduzione',
  'erotisch',
  'sexuell',
  'nackt',
  'verfuhrung',
  'verfuhrerisch',
  'leidenschaft',
  'begierde',
  'hentai',
  'ecchi',
  'seong-in',
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
  'kalakal',
  'kiskisan',
  'bubu',
  'gyohwan',
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
  'scandal',
  'ероти',
  'порно',
  'эроти',
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

    // Se a palavra-chave for muito curta (menos de 4 caracteres), exigir limites de palavra
    // Isso evita que "nu" bloqueie "Nuremberg" ou "ai" bloqueie "Natal"
    // Nota: \b funciona para caracteres latinos. Para japonês/coreano, usamos includes se for longo o suficiente.
    const isLatin = /^[a-z0-9\s]+$/i.test(normalizedKeyword);

    if (normalizedKeyword.length < 4) {
      if (isLatin) {
        const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
        return regex.test(normalizedText);
      }
      // Para não-latinos curtos, ainda usamos includes (mas idealmente limpar a lista de curtos)
      return normalizedText.includes(normalizedKeyword);
    }

    if (isLatin) {
      const regex = new RegExp(`\\b${normalizedKeyword}`, 'i');
      return regex.test(normalizedText);
    }
    
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

  if (!filterEnabled) {
    return false;
  }

  // Para séries de TV, aplicar filtros mais brandos
  const isTVShow = item.first_air_date !== undefined || item.name !== undefined;

  if (isTVShow) {

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
    'o poderoso chefão',
    'the godfather',
    'diário de um banana',
    'diario de um banana',
    'nuremberg',
    'hamnet',
    'hamlet',
    'natal',
    'christmas',
    'vovó',
    'vovo',
    'shrek',
    'toy story',
    'pixar',
    'disney',
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
    skipKeywordChecks = true;
    // Ainda verificar flag 'adult' do TMDB e classificação etária, mas não palavras-chave
    if (item.adult === true) {
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

  // Removido o loop de teste agressivo redundante que causava falsos positivos
  // A verificação agora é feita apenas pela função isAdultContent principal.

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

  const popularity = item.popularity || 0;
  const voteCount = item.vote_count || 0;
  const voteAverage = item.vote_average || 0;

  // FILTRO GERAL DE RELEVÂNCIA (Bloqueia filmes obscuros independentemente do país)
  // Quase todos os filmes adultos/spam têm vote_count < 5 e popularidade muito baixa.
  if (!skipKeywordChecks && popularity < 5 && voteCount < 5) {
    // Para não bloquear filmes super recentes recém adicionados, validamos também a data
    const releaseYear = item.release_date ? new Date(item.release_date).getFullYear() : 0;
    const currentYear = new Date().getFullYear();
    
    // Se for filme antigo ou do ano passado e tiver < 5 votos, bloqueia.
    // Se for do ano atual/futuro, damos uma chance a menos que tenha palavras suspeitas.
    if (releaseYear < currentYear) {
      console.log(`🔞 BLOQUEIO POR RELEVÂNCIA (Possível Spam/Adulto): "${title}" (pop: ${popularity}, votes: ${voteCount})`);
      return true;
    }
  }

  if (isAsian) {
    // DETECÇÃO para filmes asiáticos (menos agressiva)
    // Só bloqueia se tiver índices de popularidade MUITO baixos E for recente
    // OU se tiver palavras suspeitas (verificado adiante)
    if (
      popularity < 5 &&
      voteCount < 50 &&
      voteAverage > 4 &&
      voteAverage < 9 &&
      item.release_date && new Date(item.release_date).getFullYear() >= 2020
    ) {
      // Mas ainda verificar se não tem palavras-chave antes de bater o martelo
      if (hasAdultKeywords(title) || hasAdultKeywords(overview)) {
        console.log(
          `🔞 FILME ASIÁTICO BLOQUEADO: "${title}" (pop: ${popularity}, votes: ${voteCount})`
        );
        return true;
      }
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

  if (!filterEnabled) {
    return items;
  }

  const originalCount = items.length;
  const filtered = items.filter((item) => {
    const isAdult = isAdultContent(item);
    return !isAdult;
  });

  // const blockedCount = originalCount - filtered.length;
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

/**
 * Sincroniza a blacklist local com a do Supabase (tabela reported_movies)
 * Traz filmes banidos pelo admin ou com 2 ou mais denúncias
 */
export const syncBlacklistWithSupabase = async (): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('reported_movies')
      .select('title, status, reports_count')
      .or('status.eq.banned,reports_count.gte.2');

    if (error) {
      console.warn('Erro ao sincronizar blacklist global:', error);
      return;
    }

    if (data && data.length > 0) {
      const currentTitles = getBlacklistedTitles();
      const dbTitles = data.map(d => d.title.toLowerCase().trim());
      
      // Mesclar listas, sem duplicatas
      const mergedTitles = Array.from(new Set([...currentTitles, ...dbTitles]));
      
      localStorage.setItem('blacklisted_titles', JSON.stringify(mergedTitles));
      console.log(`✅ Blacklist global sincronizada: ${data.length} filmes bloqueados recuperados.`);
    }
  } catch (error) {
    console.error('Falha ao sincronizar blacklist:', error);
  }
};

