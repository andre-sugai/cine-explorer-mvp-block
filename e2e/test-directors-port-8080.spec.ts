import { test, expect } from '@playwright/test';

test('Teste do botão de Diretores na porta 8080', async ({ page }) => {
  console.log('🚀 Iniciando teste na porta 8080...');

  // Acessar a página na porta 8080 (configurada no vite.config.ts)
  await page.goto('http://localhost:8080');
  console.log('✅ Página acessada na porta 8080');

  // Aguardar carregamento básico
  await page.waitForLoadState('domcontentloaded');
  console.log('✅ DOM carregado');

  // Aguardar um pouco mais
  await page.waitForTimeout(3000);

  // Verificar se a página carregou
  const title = await page.title();
  console.log(`📄 Título da página: ${title}`);

  // Procurar pelo botão de diretores
  const directorsButton = page.locator('button:has-text("Diretores")');

  // Aguardar o botão aparecer
  await directorsButton.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✅ Botão de diretores encontrado');

  // Verificar estado inicial
  const initialCards = page.locator('.person-card, .movie-card, .card');
  const initialCount = await initialCards.count();
  console.log(`📊 Cards iniciais: ${initialCount}`);

  // Clicar no botão de diretores
  await directorsButton.click();
  console.log('✅ Botão de diretores clicado');

  // Aguardar carregamento (com timeout maior)
  await page.waitForTimeout(10000);

  // Verificar se há cards carregados
  const finalCards = page.locator('.person-card, .movie-card, .card');
  const finalCount = await finalCards.count();
  console.log(`📊 Cards finais: ${finalCount}`);

  if (finalCount > 0) {
    console.log('🎉 SUCESSO: Lista de diretores carregada!');

    // Verificar conteúdo do primeiro card
    const firstCard = finalCards.first();
    const cardText = await firstCard.textContent();
    console.log(`📝 Primeiro card: ${cardText?.substring(0, 100)}...`);

    // Verificar se há nomes
    const names = page.locator('h3, h4, .name, .title');
    const namesCount = await names.count();
    console.log(`👤 Nomes encontrados: ${namesCount}`);

    if (namesCount > 0) {
      const firstName = await names.first().textContent();
      console.log(`👤 Primeiro nome: ${firstName}`);
    }
  } else {
    console.log('❌ FALHA: Nenhum card foi carregado');

    // Verificar se há erros
    const errorElements = page.locator('.error, .alert, .text-red-500');
    const hasError = await errorElements.isVisible();
    console.log('🚨 Elementos de erro visíveis:', hasError);

    if (hasError) {
      const errorText = await errorElements.textContent();
      console.log(`🚨 Erro: ${errorText}`);
    }
  }

  // Capturar screenshot
  await page.screenshot({ path: 'test-results/directors-port-8080-test.png' });
  console.log('📸 Screenshot salvo');

  console.log('🏁 Teste concluído!');
});
