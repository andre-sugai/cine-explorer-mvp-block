// Teste ESPECÍFICO para os filmes adultos que você mostrou
// Execute no console do navegador (F12)

console.log('🎯 TESTE ESPECÍFICO - FILMES QUE DEVEM SER BLOQUEADOS');

// Forçar ativação do filtro
localStorage.setItem('adult_content_filter', 'true');
console.log('✅ Filtro ATIVADO');

// Filmes específicos das suas imagens
const problematicMovies = [
  {
    title: '부부 교환 - 무삭제',
    year: 2023,
    rating: 9.8,
    country: 'KR',
  },
  {
    title: 'Благословите женщину',
    year: 2003,
    rating: 5.7,
    country: 'RU',
  },
  {
    title: '가슴 큰 을 엄마',
    year: 2020,
    rating: 6.2,
    country: 'KR',
  },
  {
    title: '내 친구의 엄마',
    year: 2016,
    rating: 4.8,
    country: 'KR',
  },
  {
    title: 'Excitation au soleil',
    year: 1978,
    rating: 2.5,
    country: 'IT',
  },
  {
    title: '바람난 아내들2',
    year: 2018,
    rating: 6.0,
    country: 'KR',
  },
  {
    title: '배달노출: 알몸으로 유혹하기',
    year: 2020,
    rating: 6.6,
    country: 'KR',
  },
  {
    title: '새엄마의 욕망',
    year: 2020,
    rating: 7.2,
    country: 'KR',
  },
  {
    title: 'Ligaw',
    year: 2025,
    rating: 7.3,
    country: 'PH',
  },
  {
    title: '동창회의 목적',
    year: 2015,
    rating: 6.4,
    country: 'KR',
  },
  {
    title: 'Tuhog',
    year: 2023,
    rating: 5.2,
    country: 'PH',
  },
  {
    title: 'Maalikaya',
    year: 2025,
    rating: 7.3,
    country: 'PH',
  },
];

console.log('\n🎬 ANALISANDO FILMES PROBLEMÁTICOS:');

problematicMovies.forEach((movie, index) => {
  console.log(
    `\n${index + 1}. "${movie.title}" (${movie.year}) - ${movie.country} - ⭐${
      movie.rating
    }`
  );

  // Verificar critérios que DEVEM bloquear
  const reasons = [];

  // Lista negra de títulos
  const blacklist = [
    '부부 교환',
    '교환',
    '엄마',
    '아내',
    '노출',
    '욕망',
    '목적',
    '유혹',
    '바람',
    'ligaw',
    'tuhog',
    'maalikaya',
  ];
  const hasBlacklistedWord = blacklist.some((word) =>
    movie.title.toLowerCase().includes(word.toLowerCase())
  );
  if (hasBlacklistedWord) reasons.push('Palavra na lista negra');

  // País filipino (bloqueio automático)
  if (movie.country === 'PH') reasons.push('Filme filipino');

  // Filme asiático recente
  if (
    ['KR', 'JP', 'CN', 'TH', 'PH'].includes(movie.country) &&
    movie.year >= 2015
  ) {
    reasons.push('Filme asiático recente');
  }

  // Título curto
  if (movie.title.length < 15) reasons.push('Título curto');

  console.log(`   Razões para bloqueio: ${reasons.join(', ')}`);
  console.log(
    `   Status esperado: ${
      reasons.length > 0 ? '🚫 DEVE SER BLOQUEADO' : '⚠️ PODE PASSAR'
    }`
  );
});

console.log('\n📋 INSTRUÇÕES:');
console.log('1. Certifique-se que o filtro está ativo');
console.log('2. Recarregue a página');
console.log('3. Procure no console por:');
console.log('   - 🚫 "TÍTULO NA LISTA NEGRA"');
console.log('   - 🔞 "FILME FILIPINO DETECTADO"');
console.log('   - 🔞 "FILME ASIÁTICO ULTRA SUSPEITO"');
console.log('   - 🔞 "TESTE AGRESSIVO: Bloqueando"');

console.log('\n🔧 SE AINDA APARECEM:');
console.log('Significa que o filtro não está sendo aplicado corretamente.');
console.log(
  'Verifique se aparecem logs de "📊 Antes/Após filtro adulto" no console.'
);
