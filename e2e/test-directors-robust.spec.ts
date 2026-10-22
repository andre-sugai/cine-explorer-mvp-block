import { test, expect } from '@playwright/test';

test('Teste robusto do botão de Diretores', async ({ page }) => {
  console.log('🚀 Iniciando teste do botão de diretores...');

  // Acessar a página com timeout maior
  await page.goto('http://localhost:8083', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  console.log('✅ Página carregada com sucesso');

  // Aguardar um pouco para garantir que tudo carregou
  await page.waitForTimeout(2000);

  // Verificar se a página tem conteúdo básico
  const pageTitle = await page.title();
  console.log(`📄 Título da página: ${pageTitle}`);

  // Procurar pelo botão de diretores com diferentes seletores
  const directorsButton = page.locator(
    'button:has-text("Diretores"), button:has-text("DIRETORES")'
  );
  const buttonExists = await directorsButton.isVisible();
  console.log('🔍 Botão de diretores encontrado:', buttonExists);

  if (!buttonExists) {
    // Tentar encontrar outros elementos para debug
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`🔍 Total de botões na página: ${buttonCount}`);

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const buttonText = await allButtons.nth(i).textContent();
      console.log(`🔍 Botão ${i + 1}: ${buttonText}`);
    }

    // Capturar screenshot para debug
    await page.screenshot({ path: 'test-results/debug-page.png' });
    console.log('📸 Screenshot de debug salvo');
    return;
  }

  // Verificar estado inicial
  const initialCards = page.locator(
    '.person-card, .movie-card, .card, [data-testid="content-card"]'
  );
  const initialCount = await initialCards.count();
  console.log(`📊 Cards iniciais: ${initialCount}`);

  // Clicar no botão de diretores
  await directorsButton.click();
  console.log('✅ Botão de diretores clicado');

  // Aguardar carregamento com timeout maior
  await page.waitForTimeout(8000);

  // Verificar se há loading
  const loadingElements = page.locator(
    '.skeleton, .loading, [data-testid="loading"], .animate-pulse'
  );
  const isLoading = await loadingElements.isVisible();
  console.log('⏳ Elementos de loading visíveis:', isLoading);

  if (isLoading) {
    console.log('⏳ Aguardando carregamento adicional...');
    await page.waitForTimeout(5000);
  }

  // Verificar resultado final
  const finalCards = page.locator(
    '.person-card, .movie-card, .card, [data-testid="content-card"]'
  );
  const finalCount = await finalCards.count();
  console.log(`📊 Cards finais: ${finalCount}`);

  if (finalCount > 0) {
    console.log('🎉 SUCESSO: Lista de diretores carregada!');

    // Verificar conteúdo dos cards
    const firstCard = finalCards.first();
    const cardText = await firstCard.textContent();
    console.log(`📝 Primeiro card: ${cardText?.substring(0, 150)}...`);

    // Verificar se há nomes
    const names = page.locator(
      'h3, h4, .name, .title, [data-testid="person-name"]'
    );
    const namesCount = await names.count();
    console.log(`👤 Nomes encontrados: ${namesCount}`);

    if (namesCount > 0) {
      const firstName = await names.first().textContent();
      console.log(`👤 Primeiro nome: ${firstName}`);
    }
  } else {
    console.log('❌ FALHA: Nenhum card foi carregado');

    // Verificar se há erros
    const errorElements = page.locator(
      '.error, .alert, [data-testid="error"], .text-red-500'
    );
    const hasError = await errorElements.isVisible();
    console.log('🚨 Elementos de erro visíveis:', hasError);

    if (hasError) {
      const errorText = await errorElements.textContent();
      console.log(`🚨 Erro: ${errorText}`);
    }

    // Verificar se há mensagens de "sem resultados"
    const noResults = page.locator(
      'text=Sem resultados, text=No results, text=Nenhum resultado'
    );
    const hasNoResults = await noResults.isVisible();
    console.log('📭 Mensagem de "sem resultados":', hasNoResults);
  }

  // Capturar screenshot final
  await page.screenshot({ path: 'test-results/directors-final-result.png' });
  console.log('📸 Screenshot final salvo');

  console.log('🏁 Teste concluído!');
});
