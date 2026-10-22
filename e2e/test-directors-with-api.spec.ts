import { test, expect } from '@playwright/test';

test('Teste do botão de Diretores com configuração da API', async ({
  page,
}) => {
  console.log('🚀 Iniciando teste com configuração da API...');

  // Acessar a página na porta 8080
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

    // Debug: verificar quais botões estão no modal
    const modalButtons = page.locator('[role="dialog"] button');
    const buttonCount = await modalButtons.count();
    console.log(`🔍 Botões no modal: ${buttonCount}`);

    for (let i = 0; i < buttonCount; i++) {
      const buttonText = await modalButtons.nth(i).textContent();
      console.log(`🔍 Botão ${i + 1}: ${buttonText}`);
    }

    // Procurar pelo botão de salvar/ativar
    const saveButton = page.locator('button:has-text("Confirmar e Entrar")');
    await saveButton.click();
    console.log('✅ Botão de ativação clicado');

    // Aguardar fechamento do modal
    await page.waitForTimeout(2000);
    console.log('✅ Modal fechado');
  } else {
    console.log('ℹ️ Modal de API não encontrado, continuando...');
  }

  // Aguardar um pouco para a página carregar completamente
  await page.waitForTimeout(3000);

  // Procurar pelo botão de diretores
  const directorsButton = page.locator('button:has-text("Diretores")');

  // Verificar se o botão existe
  const buttonExists = await directorsButton.isVisible();
  console.log('🔍 Botão de diretores visível:', buttonExists);

  if (!buttonExists) {
    // Tentar encontrar outros botões para debug
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`🔍 Total de botões na página: ${buttonCount}`);

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const buttonText = await allButtons.nth(i).textContent();
      console.log(`🔍 Botão ${i + 1}: ${buttonText}`);
    }

    // Capturar screenshot para debug
    await page.screenshot({ path: 'test-results/debug-buttons.png' });
    console.log('📸 Screenshot de debug salvo');
    return;
  }

  // Verificar estado inicial
  const initialCards = page.locator('.person-card, .movie-card, .card');
  const initialCount = await initialCards.count();
  console.log(`📊 Cards iniciais: ${initialCount}`);

  // Clicar no botão de diretores
  await directorsButton.click();
  console.log('✅ Botão de diretores clicado');

  // Aguardar carregamento (com timeout maior)
  await page.waitForTimeout(15000);

  // Verificar se há cards carregados
  const finalCards = page.locator('.person-card, .movie-card, .card');
  const finalCount = await finalCards.count();
  console.log(`📊 Cards finais: ${finalCount}`);

  if (finalCount > 0) {
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

    // Verificar se há erros
    const errorElements = page.locator('.error, .alert, .text-red-500');
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
  await page.screenshot({ path: 'test-results/directors-with-api-test.png' });
  console.log('📸 Screenshot final salvo');

  console.log('🏁 Teste concluído!');
});
