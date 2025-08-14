import { test, expect } from '@playwright/test';

test.describe('Debug - Categorias de Trailers', () => {
  test('deve debugar por que as categorias não aparecem', async ({ page }) => {
    console.log('🔍 Debug das categorias de trailers...');

    // Coletar logs do console
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    // Navegar para a página inicial
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Configurar API do TMDB
    const apiModal = page.locator('[role="dialog"]');
    if (await apiModal.isVisible()) {
      const apiInput = page.locator(
        'input[placeholder*="API" i], input[placeholder*="chave" i], input[type="text"]'
      );
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');

      const activateButton = page.locator(
        'button:has-text("Ativar"), button:has-text("Activate"), button:has-text("Confirmar")'
      );
      await activateButton.click();
      await page.waitForTimeout(2000);
    }

    // Abrir modal de trailers
    const trailerButton = page.locator('button:has-text("Trailers")');
    await trailerButton.click();
    await page.waitForSelector('[role="dialog"]');

    // Aguardar carregamento
    await page.waitForTimeout(3000);

    // Verificar se há logs de categoria no console
    console.log('📋 Logs do console:');
    consoleLogs.forEach((log) => {
      if (
        log.includes('categoria') ||
        log.includes('category') ||
        log.includes('🎬')
      ) {
        console.log(`  ${log}`);
      }
    });

    // Verificar se o badge está sendo renderizado
    const badge = page.locator('[role="dialog"] .badge');
    console.log(
      `🏷️ Badge encontrado: ${(await badge.count()) > 0 ? 'Sim' : 'Não'}`
    );

    if ((await badge.count()) > 0) {
      const badgeText = await badge.textContent();
      console.log(`🏷️ Texto do badge: ${badgeText}`);
    }

    // Verificar se currentCategory está sendo definido
    const categoryInfo = page
      .locator('[role="dialog"]')
      .filter({ hasText: 'Categoria:' });
    if ((await categoryInfo.count()) > 0) {
      console.log('✅ Informação de categoria encontrada na seção de detalhes');
    }

    // Verificar se há algum elemento com texto de categoria
    const allText = await page.locator('[role="dialog"]').textContent();
    console.log('📄 Conteúdo do modal:');
    console.log(allText?.substring(0, 500) + '...');

    // Verificar se há elementos com classe badge em todo o modal
    const allBadges = page.locator('[role="dialog"] [class*="badge"]');
    console.log(
      `🔍 Total de elementos com classe badge: ${await allBadges.count()}`
    );

    // Verificar se há elementos com a estrutura do badge
    const badgeStructure = page.locator(
      '[role="dialog"] div[class*="inline-flex"][class*="rounded-full"]'
    );
    console.log(
      `🔍 Elementos com estrutura de badge: ${await badgeStructure.count()}`
    );

    // Verificar se há elementos com texto de categoria em qualquer lugar
    const categoryElements = page.locator('[role="dialog"]').filter({
      hasText:
        /Filmes Populares|Filmes Bem Avaliados|Séries Populares|Em Tendência|Ação|Comédia|Drama|Terror|Ficção Científica|Animação|Anos 2020|Anos 2010|Anos 2000|Anos 1990|Anos 1980/,
    });
    console.log(
      `🔍 Elementos com texto de categoria: ${await categoryElements.count()}`
    );

    // Testar próximo trailer para ver se a categoria muda
    const nextButton = page.locator('button:has-text("Próximo")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(3000);

      console.log('🔄 Após clicar em próximo:');

      const newBadge = page.locator('[role="dialog"] .badge');
      console.log(
        `🏷️ Badge após próximo: ${(await newBadge.count()) > 0 ? 'Sim' : 'Não'}`
      );

      if ((await newBadge.count()) > 0) {
        const newBadgeText = await newBadge.textContent();
        console.log(`🏷️ Texto do novo badge: ${newBadgeText}`);
      }

      // Verificar novamente os elementos com estrutura de badge
      const newBadgeStructure = page.locator(
        '[role="dialog"] div[class*="inline-flex"][class*="rounded-full"]'
      );
      console.log(
        `🔍 Elementos com estrutura de badge após próximo: ${await newBadgeStructure.count()}`
      );
    }

    // Verificar se há erros específicos
    const errors = consoleLogs.filter(
      (log) => log.includes('error') || log.includes('Error')
    );
    if (errors.length > 0) {
      console.log('❌ Erros encontrados:');
      errors.forEach((error) => console.log(`  ${error}`));
    }

    console.log('🎉 Debug concluído!');
  });
});
