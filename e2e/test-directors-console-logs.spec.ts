import { test, expect } from '@playwright/test';

test('Teste do botão de Diretores com captura de logs do console', async ({
  page,
}) => {
  console.log('🚀 Iniciando teste com captura de logs...');

  // Capturar logs do console
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    console.log(`📝 Console: ${msg.type()} - ${msg.text()}`);
  });

  // Capturar erros de rede
  const networkErrors: string[] = [];
  page.on('response', (response) => {
    if (!response.ok()) {
      const error = `Network Error: ${response.status()} ${response.statusText()} - ${response.url()}`;
      networkErrors.push(error);
      console.log(`🌐 ${error}`);
    }
  });

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

  // Aguardar carregamento com timeout maior
  console.log('⏳ Aguardando carregamento dos diretores...');
  await page.waitForTimeout(20000); // 20 segundos

  // Verificar se há cards carregados
  const finalCards = page.locator('.person-card, .movie-card, .card');
  const finalCount = await finalCards.count();
  console.log(`📊 Cards finais: ${finalCount}`);

  // Mostrar logs do console
  console.log('\n📋 LOGS DO CONSOLE:');
  consoleLogs.forEach((log, index) => {
    console.log(`${index + 1}. ${log}`);
  });

  // Mostrar erros de rede
  console.log('\n🌐 ERROS DE REDE:');
  networkErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`);
  });

  if (finalCount > 0) {
    console.log('🎉 SUCESSO: Lista de diretores carregada!');

    // Verificar conteúdo do primeiro card
    const firstCard = finalCards.first();
    const cardText = await firstCard.textContent();
    console.log(`📝 Primeiro card: ${cardText?.substring(0, 150)}...`);
  } else {
    console.log('❌ FALHA: Nenhum card foi carregado');

    // Verificar se há erros específicos nos logs
    const apiErrors = consoleLogs.filter(
      (log) =>
        log.includes('Error') ||
        log.includes('error') ||
        log.includes('API') ||
        log.includes('TMDB')
    );

    if (apiErrors.length > 0) {
      console.log('\n🚨 ERROS DE API ENCONTRADOS:');
      apiErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
  }

  // Capturar screenshot final
  await page.screenshot({
    path: 'test-results/directors-console-logs-test.png',
  });
  console.log('📸 Screenshot final salvo');

  console.log('🏁 Teste concluído!');
});
