import { test, expect } from '@playwright/test';

test('Teste extenso do botão de Diretores com verificação de logs', async ({
  page,
}) => {
  console.log('🚀 Iniciando teste extenso do botão de diretores...');

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

  // Verificar estado inicial
  const initialCards = page.locator('.person-card, .movie-card, .card');
  const initialCount = await initialCards.count();
  console.log(`📊 Cards iniciais: ${initialCount}`);

  // Clicar no botão de diretores
  await directorsButton.click();
  console.log('✅ Botão de diretores clicado');

  // Aguardar carregamento com timeout muito maior
  console.log('⏳ Aguardando carregamento dos diretores...');
  await page.waitForTimeout(30000); // 30 segundos

  // Verificar se há indicador de loading
  const loadingIndicator = page.locator(
    '.skeleton, .loading, [data-testid="loading"], .animate-pulse'
  );
  const isLoading = await loadingIndicator.isVisible();
  console.log('⏳ Indicador de loading visível:', isLoading);

  if (isLoading) {
    console.log('⏳ Aguardando carregamento adicional...');
    await page.waitForTimeout(10000);
  }

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
    console.log('❌ FALHA: Nenhum card foi carregado após 30 segundos');

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

    // Verificar se há qualquer conteúdo na página
    const pageContent = await page.textContent('body');
    console.log(
      `📄 Conteúdo da página (primeiros 500 chars): ${pageContent?.substring(
        0,
        500
      )}...`
    );
  }

  // Capturar screenshot final
  await page.screenshot({ path: 'test-results/directors-extended-test.png' });
  console.log('📸 Screenshot final salvo');

  console.log('🏁 Teste concluído!');
});
