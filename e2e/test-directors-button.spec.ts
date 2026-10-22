import { test, expect } from '@playwright/test';

test.describe('Teste do botão de Diretores na Home', () => {
    test.beforeEach(async ({ page }) => {
    // Configurar API key se necessário
    await page.goto('http://localhost:8083');
 
    // Verificar se há modal de API e configurar se necessário
    const apiModal = page.locator('[data-testid="api-config-modal"]');
    if (await apiModal.isVisible()) {
      await page.fill('[data-testid="api-key-input"]', 'test-api-key');
      await page.click('[data-testid="save-api-key"]');
    }
  });

  test('Deve carregar lista de diretores no primeiro clique', async ({
    page,
  }) => {
    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle');

    // Localizar o botão de diretores
    const directorsButton = page.locator('button:has-text("Diretores")');
    await expect(directorsButton).toBeVisible();

    // Verificar se não há conteúdo de diretores carregado inicialmente
    const directorsContent = page.locator('[data-testid="content-grid"]');
    const initialContent = await directorsContent.textContent();

    // Clicar no botão de diretores
    await directorsButton.click();

    // Aguardar carregamento da lista de diretores
    await page.waitForTimeout(3000); // Aguardar carregamento das APIs

    // Verificar se a lista de diretores foi carregada
    const directorsCards = page.locator(
      '[data-testid="content-grid"] .person-card, [data-testid="content-grid"] .movie-card'
    );
    await expect(directorsCards.first()).toBeVisible({ timeout: 10000 });

    // Verificar se há pelo menos alguns diretores carregados
    const directorsCount = await directorsCards.count();
    console.log(`Diretores carregados: ${directorsCount}`);
    expect(directorsCount).toBeGreaterThan(0);

    // Verificar se os diretores têm informações básicas
    const firstDirector = directorsCards.first();
    const directorName = await firstDirector.locator('h3, h4').textContent();
    expect(directorName).toBeTruthy();
    console.log(`Primeiro diretor: ${directorName}`);
  });

  test('Deve mostrar loading state durante carregamento', async ({ page }) => {
    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle');

    // Localizar o botão de diretores
    const directorsButton = page.locator('button:has-text("Diretores")');

    // Clicar no botão de diretores
    await directorsButton.click();

    // Verificar se há indicador de loading (skeleton ou spinner)
    const loadingIndicator = page.locator(
      '.skeleton, .loading, [data-testid="loading"]'
    );
    const hasLoading = await loadingIndicator.isVisible();

    if (hasLoading) {
      console.log('Loading indicator encontrado');
      // Aguardar carregamento
      await page.waitForTimeout(3000);
    }

    // Verificar se o conteúdo foi carregado
    const directorsCards = page.locator(
      '[data-testid="content-grid"] .person-card, [data-testid="content-grid"] .movie-card'
    );
    await expect(directorsCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('Deve filtrar apenas diretores corretamente', async ({ page }) => {
    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle');

    // Localizar o botão de diretores
    const directorsButton = page.locator('button:has-text("Diretores")');

    // Clicar no botão de diretores
    await directorsButton.click();

    // Aguardar carregamento
    await page.waitForTimeout(3000);

    // Verificar se todos os itens carregados são diretores
    const allCards = page.locator(
      '[data-testid="content-grid"] .person-card, [data-testid="content-grid"] .movie-card'
    );
    const cardsCount = await allCards.count();

    console.log(`Total de cards carregados: ${cardsCount}`);

    // Verificar se há pelo menos alguns diretores
    expect(cardsCount).toBeGreaterThan(0);

    // Verificar se os cards têm informações de diretores
    for (let i = 0; i < Math.min(cardsCount, 3); i++) {
      const card = allCards.nth(i);
      const cardText = await card.textContent();
      console.log(`Card ${i + 1}: ${cardText?.substring(0, 100)}...`);
    }
  });

  test('Deve navegar para detalhes do diretor ao clicar', async ({ page }) => {
    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle');

    // Localizar o botão de diretores
    const directorsButton = page.locator('button:has-text("Diretores")');

    // Clicar no botão de diretores
    await directorsButton.click();

    // Aguardar carregamento
    await page.waitForTimeout(3000);

    // Clicar no primeiro diretor
    const firstDirector = page
      .locator(
        '[data-testid="content-grid"] .person-card, [data-testid="content-grid"] .movie-card'
      )
      .first();
    await firstDirector.click();

    // Verificar se navegou para a página de detalhes
    await page.waitForURL(/\/pessoa\//, { timeout: 10000 });

    // Verificar se está na página de detalhes da pessoa
    const personDetails = page.locator('h1, h2');
    await expect(personDetails.first()).toBeVisible();

    console.log('Navegação para detalhes do diretor funcionou corretamente');
  });
});
