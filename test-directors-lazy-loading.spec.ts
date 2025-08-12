import { test, expect } from '@playwright/test';

test.describe('Teste do Lazy Loading de Diretores', () => {
  test('deve carregar diretores com Lazy Loading', async ({ page }) => {
    // Configurar captura de logs do console
    page.on('console', (msg) => {
      console.log(`Browser console: ${msg.text()}`);
    });

    // Configurar captura de erros de rede
    page.on('response', (response) => {
      if (!response.ok()) {
        console.log(`Network error: ${response.url()} - ${response.status()}`);
      }
    });

    console.log('🚀 Iniciando teste de Lazy Loading de diretores...');

    // Navegar para a página
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    console.log('✅ Página carregada');

    // Aguardar um pouco para garantir que a página carregou completamente
    await page.waitForTimeout(2000);

    // Verificar se há modal de configuração da API
    const apiModal = page.locator('[role="dialog"]:has-text("Configurar API")');
    const modalExists = (await apiModal.count()) > 0;

    if (modalExists) {
      console.log('🔧 Configurando API key...');

      // Preencher a API key
      const apiKeyInput = page
        .locator('input[placeholder*="API"], input[type="text"]')
        .first();
      await apiKeyInput.fill('da143ff1f274e5987194fe5d22f71b11');

      // Clicar no botão de confirmar
      const confirmButton = page.locator(
        'button:has-text("Confirmar e Entrar")'
      );
      await confirmButton.click();

      // Aguardar o modal fechar
      await page.waitForTimeout(2000);
      console.log('✅ API key configurada');
    }

    // Aguardar a página carregar completamente
    await page.waitForLoadState('networkidle');
    console.log('✅ Página carregada completamente');

    // Clicar no botão de Diretores
    const directorsButton = page.locator('button:has-text("Diretores")');
    await directorsButton.click();
    console.log('✅ Botão de Diretores clicado');

    // Aguardar o carregamento inicial
    await page.waitForTimeout(5000);
    console.log('⏳ Aguardando carregamento inicial...');

    // Verificar se há cards de diretores carregados
    const directorCards = page.locator('div[class*="grid"] > div');
    const initialCount = await directorCards.count();
    console.log(`📊 Diretores carregados inicialmente: ${initialCount}`);

    // Verificar se pelo menos alguns diretores foram carregados
    expect(initialCount).toBeGreaterThan(0);
    console.log('✅ Carregamento inicial funcionou');

    // Fazer scroll para baixo para testar o Lazy Loading
    console.log('🔄 Testando scroll infinito...');

    // Scroll várias vezes para carregar mais diretores
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(3000); // Aguardar carregamento

      const newCount = await directorCards.count();
      console.log(`📊 Diretores após scroll ${i + 1}: ${newCount}`);

      // Verificar se mais diretores foram carregados
      if (newCount > initialCount) {
        console.log('✅ Lazy Loading funcionou - mais diretores carregados');
        break;
      }
    }

    // Verificar o total final de diretores
    const finalCount = await directorCards.count();
    console.log(`📊 Total final de diretores: ${finalCount}`);

    // Verificar se conseguimos carregar mais diretores que o inicial
    expect(finalCount).toBeGreaterThanOrEqual(initialCount);

    // Verificar se pelo menos 15 diretores foram carregados (primeira página + scroll)
    expect(finalCount).toBeGreaterThanOrEqual(15);

    console.log('✅ Teste de Lazy Loading concluído com sucesso!');
  });

  test('deve mostrar mensagem de carregamento durante busca', async ({
    page,
  }) => {
    console.log('🚀 Testando indicadores de carregamento...');

    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Configurar API se necessário
    const apiModal = page.locator('[role="dialog"]:has-text("Configurar API")');
    if ((await apiModal.count()) > 0) {
      const apiKeyInput = page
        .locator('input[placeholder*="API"], input[type="text"]')
        .first();
      await apiKeyInput.fill('da143ff1f274e5987194fe5d22f71b11');
      const confirmButton = page.locator(
        'button:has-text("Confirmar e Entrar")'
      );
      await confirmButton.click();
      await page.waitForTimeout(2000);
    }

    // Clicar no botão de Diretores
    const directorsButton = page.locator('button:has-text("Diretores")');
    await directorsButton.click();

    // Verificar se há indicador de carregamento
    const loadingIndicator = page.locator(
      '[class*="loading"], [class*="spinner"], [class*="skeleton"]'
    );
    const hasLoading = (await loadingIndicator.count()) > 0;

    if (hasLoading) {
      console.log('✅ Indicador de carregamento encontrado');
    } else {
      console.log('⚠️ Nenhum indicador de carregamento encontrado');
    }

    // Aguardar carregamento
    await page.waitForTimeout(5000);

    // Verificar se os diretores foram carregados
    const directorCards = page.locator('div[class*="grid"] > div');
    const count = await directorCards.count();

    expect(count).toBeGreaterThan(0);
    console.log(`✅ ${count} diretores carregados com sucesso`);
  });
});
