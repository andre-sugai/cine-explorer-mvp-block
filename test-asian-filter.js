// Teste AGRESSIVO do Filtro para Filmes Asiáticos
// Execute este código no console do navegador (F12)

console.log('🧪 TESTE AGRESSIVO - FILTRO PARA FILMES ASIÁTICOS');

// 1. Forçar ativação do filtro
localStorage.setItem('adult_content_filter', 'true');
console.log('✅ Filtro forçadamente ATIVADO');

// 2. Testar filmes asiáticos suspeitos
const asianTestMovies = [
  {
    id: 1,
    title: 'Korean Erotic Drama',
    overview: 'A sensual story about forbidden love',
    adult: false,
    popularity: 3.2,
    vote_count: 25,
    vote_average: 6.8,
    origin_country: ['KR'],
  },
  {
    id: 2,
    title: 'Pink Film',
    overview: 'Japanese adult cinema',
    adult: false,
    popularity: 1.5,
    vote_count: 12,
    vote_average: 5.5,
    origin_country: ['JP'],
  },
  {
    id: 3,
    title: 'Kalakal',
    overview: 'Filipino independent film',
    adult: false,
    popularity: 2.1,
    vote_count: 8,
    vote_average: 6.2,
    origin_country: ['PH'],
  },
  {
    id: 4,
    title: 'Parasite',
    overview: 'Oscar-winning thriller',
    adult: false,
    popularity: 85.2,
    vote_count: 15000,
    vote_average: 8.5,
    origin_country: ['KR'],
  },
  {
    id: 5,
    title: 'Obscure Asian Film',
    overview: 'Very low popularity film',
    adult: false,
    popularity: 0.8,
    vote_count: 3,
    vote_average: 7.0,
    origin_country: ['TH'],
  },
];

console.log('\n🎬 TESTANDO FILMES ASIÁTICOS:');
console.log('Esperado: Filmes 1, 2, 3, 5 devem ser BLOQUEADOS');
console.log('Esperado: Filme 4 (Parasite) deve ser PERMITIDO');

// Simular o filtro (se as funções estiverem disponíveis)
asianTestMovies.forEach((movie, index) => {
  console.log(`\n📽️ Filme ${index + 1}: "${movie.title}"`);
  console.log(`   País: ${movie.origin_country[0]}`);
  console.log(`   Popularidade: ${movie.popularity}`);
  console.log(`   Votos: ${movie.vote_count}`);

  // Critérios que devem bloquear
  const shouldBlock =
    movie.title.toLowerCase().includes('erotic') ||
    movie.title.toLowerCase().includes('pink') ||
    movie.title.toLowerCase().includes('kalakal') ||
    movie.overview.toLowerCase().includes('sensual') ||
    movie.overview.toLowerCase().includes('adult') ||
    movie.popularity < 5 ||
    (movie.popularity < 10 && movie.vote_count < 100);

  console.log(
    `   Resultado esperado: ${shouldBlock ? '🚫 BLOQUEADO' : '✅ PERMITIDO'}`
  );
});

console.log('\n📋 INSTRUÇÕES PARA TESTE REAL:');
console.log('1. Certifique-se que o filtro está ativado');
console.log('2. Navegue pela homepage');
console.log('3. Procure por logs no console:');
console.log('   - 🔞 "FILME ASIÁTICO SUSPEITO"');
console.log('   - 🔞 "TESTE AGRESSIVO: Bloqueando"');
console.log('   - 📊 "Antes/Após filtro adulto"');
console.log(
  '4. Se ainda aparecem filmes asiáticos suspeitos, reporte os títulos'
);

console.log('\n🔧 FORÇAR TESTE:');
console.log('Execute: localStorage.setItem("adult_content_filter", "true")');
console.log('Depois recarregue a página e observe o console');
