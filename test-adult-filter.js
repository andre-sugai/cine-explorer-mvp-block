// Teste do Filtro de Conteúdo Adulto
// Execute este código no console do navegador (F12)

console.log('🧪 INICIANDO TESTE DO FILTRO DE CONTEÚDO ADULTO');

// 1. Verificar se o filtro está ativado
const filterEnabled = localStorage.getItem('adult_content_filter') === 'true';
console.log(`🔍 Status do filtro: ${filterEnabled ? 'ATIVADO' : 'DESATIVADO'}`);

if (!filterEnabled) {
  console.log('⚠️ ATENÇÃO: O filtro está DESATIVADO!');
  console.log(
    '💡 Para ativar: Vá em Configurações → Filtrar Conteúdo Adulto (+18)'
  );
} else {
  console.log('✅ Filtro está ATIVADO - testando detecção...');
}

// 2. Testar filmes de exemplo
const testMovies = [
  {
    id: 1,
    title: 'Sorority House Massacre',
    overview: 'A horror movie about a sorority house',
    adult: false,
    popularity: 5.2,
    vote_count: 45,
    vote_average: 6.1,
  },
  {
    id: 2,
    title: 'Kalakal',
    overview: 'Filipino erotic drama',
    adult: false,
    popularity: 2.1,
    vote_count: 12,
    vote_average: 6.5,
    origin_country: ['PH'],
  },
  {
    id: 3,
    title: 'The Avengers',
    overview: 'Superhero action movie',
    adult: false,
    popularity: 85.2,
    vote_count: 15000,
    vote_average: 8.1,
  },
  {
    id: 4,
    title: 'Adult Movie Example',
    overview: 'This is clearly adult content',
    adult: true,
    popularity: 1.5,
    vote_count: 8,
    vote_average: 5.5,
  },
];

console.log('\n🎬 TESTANDO FILMES:');

// Importar a função de filtro (assumindo que está disponível globalmente)
if (typeof window !== 'undefined' && window.filterAdultContent) {
  const filtered = window.filterAdultContent(testMovies);
  console.log(
    `📊 Resultado: ${
      testMovies.length - filtered.length
    } filmes bloqueados de ${testMovies.length} total`
  );
} else {
  console.log('⚠️ Função filterAdultContent não encontrada no escopo global');
  console.log(
    '💡 Teste manual: Verifique o console durante a navegação normal'
  );
}

console.log('\n📋 INSTRUÇÕES PARA TESTE MANUAL:');
console.log('1. Ative o filtro em Configurações se ainda não estiver ativo');
console.log('2. Navegue pela homepage ou faça uma busca');
console.log('3. Observe os logs no console:');
console.log('   - 🔍 "Filtro de conteúdo adulto: ATIVADO"');
console.log('   - 🚫 "BLOQUEADO: [título do filme]"');
console.log('   - 🔞 "FILTRO APLICADO: X de Y itens bloqueados"');
console.log(
  '4. Se não aparecer nenhum log, o filtro pode estar desativado ou não há conteúdo adulto nos resultados'
);

console.log('\n🔧 TROUBLESHOOTING:');
console.log(
  '- Se o filtro não funcionar, verifique se localStorage.getItem("adult_content_filter") retorna "true"'
);
console.log('- Recarregue a página após ativar o filtro');
console.log('- Procure por logs que começam com 🔍, 🚫, ou 🔞');
