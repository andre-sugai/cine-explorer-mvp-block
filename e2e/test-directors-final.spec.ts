import { test, expect } from '@playwright/test';

test('Teste final do botão de Diretores com seletores corretos', async ({
  page,
}) => {
  console.log('🚀 Iniciando teste final do botão de diretores...');

  // Acessar a página na porta 8080
  await page.goto('http://localhost:8080');
  console.log('✅ Página acessada na porta 8080');

  // Aguardar carregamento básico
  await page.waitForLoadState('domcontentloaded');
  console.log('✅ DOM carregado');

  // Aguardar um pouco mais
  await page.waitForTimeout(3000);

  // Verificar se há modal de configuração da API
  const apiModal = page.locator('[role="dialog"]:has-text("Configurar API")');
  const modalVisible = await apiModal.isVisible();
  console.log('🔍 Modal de API encontrado:', modalVisible);

  if (modalVisible) {
    console.log('🔧 Configurando API key...');

    // Procurar pelo campo de input da API key
    const apiKeyInput = page.locator(
      'input[placeholder*="API"], input[placeholder*="key"], [data-testid="api-key-input"], input[type="text"]'
    );
    await apiKeyInput.fill('da143ff1f274e5987194fe5d22f71b11');
    console.log('✅ API key inserida');

    // Procurar pelo botão de salvar/ativar
    const saveButton = page.locator('button:has-text("Confirmar e Entrar")');
    await saveButton.click();
    console.log('✅ Botão de ativação clicado');

    // Aguardar fechamento do modal
    await page.waitForTimeout(3000);
    console.log('✅ Modal fechado');
  } else {
    console.log('ℹ️ Modal de API não encontrado, continuando...');
  }

  // Aguardar um pouco para a página carregar completamente
  await page.waitForTimeout(5000);

  // Procurar pelo botão de diretores
  const directorsButton = page.locator('button:has-text("Diretores")');

  // Verificar se o botão existe
  const buttonExists = await directorsButton.isVisible();
  console.log('🔍 Botão de diretores visível:', buttonExists);

  if (!buttonExists) {
    console.log('❌ Botão de diretores não encontrado');
    return;
  }

  // Verificar estado inicial - usar seletor correto para cards
  const initialCards = page.locator(
    '[role="article"], .card, [data-radix-collection-item]'
  );
  const initialCount = await initialCards.count();
  console.log(`📊 Cards iniciais: ${initialCount}`);

  // Clicar no botão de diretores
  await directorsButton.click();
  console.log('✅ Botão de diretores clicado');

  // Aguardar carregamento
  console.log('⏳ Aguardando carregamento dos diretores...');
  await page.waitForTimeout(10000);

  // Verificar se há cards carregados - usar múltiplos seletores
  const cardSelectors = [
    '[role="article"]',
    '.card',
    '[data-radix-collection-item]',
    'div[class*="grid"] > div',
    'section div[class*="grid"] > div',
  ];

  let finalCount = 0;
  let finalCards = null;

  for (const selector of cardSelectors) {
    const cards = page.locator(selector);
    const count = await cards.count();
    console.log(`🔍 Seletor "${selector}": ${count} cards`);

    if (count > 0) {
      finalCount = count;
      finalCards = cards;
      console.log(`✅ Encontrados ${count} cards com seletor: ${selector}`);
      break;
    }
  }

  if (finalCount > 0 && finalCards) {
    console.log('🎉 SUCESSO: Lista de diretores carregada!');

    // Verificar conteúdo do primeiro card
    const firstCard = finalCards.first();
    const cardText = await firstCard.textContent();
    console.log(`📝 Primeiro card: ${cardText?.substring(0, 150)}...`);

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

    // Verificar se há qualquer conteúdo na página
    const pageContent = await page.textContent('body');
    console.log(
      `📄 Conteúdo da página (primeiros 1000 chars): ${pageContent?.substring(
        0,
        1000
      )}...`
    );

    // Verificar se há elementos de grid
    const gridElements = page.locator('div[class*="grid"]');
    const gridCount = await gridElements.count();
    console.log(`🔍 Elementos de grid encontrados: ${gridCount}`);
  }

  // Capturar screenshot final
  await page.screenshot({ path: 'test-results/directors-final-test.png' });
  console.log('📸 Screenshot final salvo');

  console.log('🏁 Teste concluído!');
});
