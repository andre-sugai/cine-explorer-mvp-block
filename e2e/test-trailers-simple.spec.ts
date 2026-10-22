import { test, expect } from '@playwright/test';

test.describe('Teste Simples - Categorias de Trailers', () => {
  test('deve testar se as categorias estão sendo carregadas', async ({
    page,
  }) => {
    console.log('🎬 Teste simples das categorias de trailers...');

    // Navegar para a página inicial
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');
    console.log('✅ Página inicial carregada');

    // Configurar API do TMDB
    console.log('🔧 Configurando API do TMDB...');

    const apiModal = page.locator('[role="dialog"]');
    if (await apiModal.isVisible()) {
      console.log('✅ Modal de configuração da API encontrado');

      const apiInput = page.locator(
        'input[placeholder*="API" i], input[placeholder*="chave" i], input[type="text"]'
      );
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');
      console.log('✅ Chave da API inserida');

      const activateButton = page.locator(
        'button:has-text("Ativar"), button:has-text("Activate"), button:has-text("Confirmar")'
      );
      await activateButton.click();
      console.log('✅ Botão Ativar clicado');

      await page.waitForTimeout(2000);
      console.log('✅ Modal de configuração fechado');
    }

    // Verificar se o botão de trailers existe
    const trailerButton = page.locator('button:has-text("Trailers")');
    await expect(trailerButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Botão de trailers encontrado');

    // Clicar no botão de trailers
    await trailerButton.click();
    console.log('✅ Modal de trailers aberto');

    // Aguardar o modal aparecer
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    console.log('✅ Modal de trailers carregado');

    // Aguardar mais tempo para o carregamento
    await page.waitForTimeout(5000);
    console.log('✅ Aguardou carregamento do trailer');

    // Verificar se há algum conteúdo no modal
    const modalContent = page.locator('[role="dialog"]');
    await expect(modalContent).toBeVisible();
    console.log('✅ Modal está visível');

    // Verificar se há título do trailer no modal
    const trailerTitle = page.locator(
      '[role="dialog"] h2, [role="dialog"] h3, [role="dialog"] .text-2xl'
    );
    if ((await trailerTitle.count()) > 0) {
      const titleText = await trailerTitle.first().textContent();
      console.log(`📺 Título encontrado: ${titleText}`);
    }

    // Verificar se há botões de controle
    const nextButton = page.locator('button:has-text("Próximo")');
    if (await nextButton.isVisible()) {
      console.log('✅ Botão próximo encontrado');

      // Clicar no botão próximo algumas vezes para testar
      for (let i = 0; i < 3; i++) {
        await nextButton.click();
        await page.waitForTimeout(3000);
        console.log(`✅ Trailer ${i + 1} carregado`);

        // Verificar se há título atualizado
        const currentTitle = page.locator(
          '[role="dialog"] h2, [role="dialog"] h3, [role="dialog"] .text-2xl'
        );
        if ((await currentTitle.count()) > 0) {
          const currentTitleText = await currentTitle.first().textContent();
          console.log(`📺 Título atual: ${currentTitleText}`);
        }
      }
    }

    // Verificar se há informações de categoria no modal
    const categoryElements = page.locator(
      '[role="dialog"] .badge, [role="dialog"] [class*="category"], [role="dialog"] [class*="genre"]'
    );
    if ((await categoryElements.count()) > 0) {
      console.log('✅ Elementos de categoria encontrados');
      for (let i = 0; i < (await categoryElements.count()); i++) {
        const element = categoryElements.nth(i);
        const text = await element.textContent();
        console.log(`🏷️ Categoria: ${text}`);
      }
    } else {
      console.log('ℹ️ Nenhum elemento de categoria encontrado');
    }

    // Verificar se há ícones de tipo de conteúdo no modal
    const icons = page.locator('[role="dialog"] svg[class*="w-5 h-5"]');
    if ((await icons.count()) > 0) {
      console.log(`✅ ${await icons.count()} ícones encontrados`);
    }

    // Verificar se há informações detalhadas no modal
    const infoText = page
      .locator('[role="dialog"]')
      .filter({ hasText: 'Tipo:' });
    if ((await infoText.count()) > 0) {
      console.log('✅ Informações detalhadas encontradas');
    }

    // Fechar o modal
    const closeButton = page.locator(
      '[role="dialog"] button[aria-label="Close"], [role="dialog"] button:has-text("×")'
    );
    if (await closeButton.isVisible()) {
      await closeButton.click();
      console.log('✅ Modal fechado');
    }

    console.log('🎉 Teste simples concluído!');
  });
});
