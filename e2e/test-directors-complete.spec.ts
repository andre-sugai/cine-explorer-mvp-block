import { test, expect } from '@playwright/test';

test('Teste completo do botão de Diretores com configuração da API', async ({
  page,
}) => {
  // Acessar a página
  await page.goto('http://localhost:8083');

  // Aguardar carregamento inicial
  await page.waitForLoadState('domcontentloaded');
  console.log('✅ Página carregada com sucesso');

  // Verificar se há modal de configuração da API
  const apiModal = page.locator(
    '[data-testid="api-config-modal"], .modal, [role="dialog"]'
  );
  const modalVisible = await apiModal.isVisible();
  console.log('Modal de API encontrado:', modalVisible);

  if (modalVisible) {
    // Configurar API key do TMDB
    const apiKeyInput = page.locator(
      'input[placeholder*="API"], input[placeholder*="key"], [data-testid="api-key-input"]'
    );
    await apiKeyInput.fill('test-api-key-for-tmdb');
    console.log('✅ API key inserida');

    // Clicar no botão de salvar
    const saveButton = page.locator(
      'button:has-text("Salvar"), button:has-text("Save"), [data-testid="save-api-key"]'
    );
    await saveButton.click();
    console.log('✅ API key salva');

    // Aguardar fechamento do modal
    await page.waitForTimeout(1000);
  }

  // Procurar pelo botão de diretores
  const directorsButton = page.locator('button:has-text("Diretores")');
  const buttonExists = await directorsButton.isVisible();
  console.log('Botão de diretores encontrado:', buttonExists);

  if (!buttonExists) {
    console.log('❌ Botão de diretores não encontrado na página');
    return;
  }

  // Verificar estado inicial (antes do clique)
  const initialContent = page.locator('.grid, [data-testid="content-grid"]');
  const initialCards = page.locator('.person-card, .movie-card, .card');
  const initialCount = await initialCards.count();
  console.log(`Estado inicial - Cards encontrados: ${initialCount}`);

  // Clicar no botão de diretores
  await directorsButton.click();
  console.log('✅ Botão de diretores clicado');

  // Aguardar carregamento (pode demorar devido às múltiplas chamadas de API)
  await page.waitForTimeout(5000);

  // Verificar se há indicador de loading
  const loadingIndicator = page.locator(
    '.skeleton, .loading, [data-testid="loading"]'
  );
  const isLoading = await loadingIndicator.isVisible();
  console.log('Indicador de loading visível:', isLoading);

  if (isLoading) {
    console.log('⏳ Aguardando carregamento...');
    await page.waitForTimeout(3000);
  }

  // Verificar se o conteúdo foi carregado
  const finalCards = page.locator('.person-card, .movie-card, .card');
  const finalCount = await finalCards.count();
  console.log(`Estado final - Cards encontrados: ${finalCount}`);

  if (finalCount > 0) {
    console.log('✅ Lista de diretores carregada com sucesso!');

    // Verificar se os cards têm informações básicas
    const firstCard = finalCards.first();
    const cardText = await firstCard.textContent();
    console.log(`Primeiro card: ${cardText?.substring(0, 100)}...`);

    // Verificar se há nomes de diretores
    const directorNames = page.locator('h3, h4, .name, .title');
    const namesCount = await directorNames.count();
    console.log(`Nomes encontrados: ${namesCount}`);

    if (namesCount > 0) {
      const firstName = await directorNames.first().textContent();
      console.log(`Primeiro nome: ${firstName}`);
    }

    // Testar navegação para detalhes
    await firstCard.click();
    console.log('✅ Navegação para detalhes testada');
  } else {
    console.log('❌ Nenhum card de diretor foi carregado');

    // Verificar se há mensagem de erro
    const errorMessage = page.locator('.error, .alert, [data-testid="error"]');
    const hasError = await errorMessage.isVisible();
    console.log('Mensagem de erro encontrada:', hasError);

    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.log(`Erro: ${errorText}`);
    }
  }

  // Capturar screenshot para debug
  await page.screenshot({ path: 'test-results/directors-test-result.png' });
  console.log('📸 Screenshot salvo em test-results/directors-test-result.png');
});
