import { test, expect } from '@playwright/test';

test('Teste simples do botão de Diretores', async ({ page }) => {
  console.log('🚀 Iniciando teste simples...');

  // Acessar a página com configuração mais simples
  await page.goto('http://localhost:8083', { waitUntil: 'domcontentloaded' });
  console.log('✅ Página carregada');

  // Aguardar um pouco
  await page.waitForTimeout(3000);

  // Verificar se a página carregou
  const title = await page.title();
  console.log(`📄 Título: ${title}`);

  // Procurar pelo botão de diretores
  const directorsButton = page.locator('button:has-text("Diretores")');
  const buttonVisible = await directorsButton.isVisible();
  console.log('🔍 Botão de diretores visível:', buttonVisible);

  if (buttonVisible) {
    // Clicar no botão
    await directorsButton.click();
    console.log('✅ Botão clicado');

    // Aguardar carregamento
    await page.waitForTimeout(5000);

    // Verificar se há cards
    const cards = page.locator('.person-card, .movie-card, .card');
    const cardCount = await cards.count();
    console.log(`📊 Cards encontrados: ${cardCount}`);

    if (cardCount > 0) {
      console.log('🎉 SUCESSO: Diretores carregados!');
    } else {
      console.log('❌ FALHA: Nenhum card encontrado');
    }
  } else {
    console.log('❌ Botão não encontrado');
  }

  // Screenshot
  await page.screenshot({ path: 'test-results/simple-test.png' });
  console.log('📸 Screenshot salvo');
});
