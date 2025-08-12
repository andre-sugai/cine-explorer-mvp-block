import { test, expect } from '@playwright/test';

test.describe('Teste - Sem cards quando estratégia for similar_movies', () => {
  test('deve mostrar apenas mensagem quando estratégia for similar_movies', async ({
    page,
  }) => {
    console.log('🚀 Teste sem cards para similar_movies...');

    // Navegar para a página
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });

    // Configurar API se necessário
    const modalExists = await page
      .locator('[role="dialog"]:has-text("Configurar API")')
      .count();

    if (modalExists > 0) {
      const apiKeyInput = page.locator('input[placeholder*="API"]');
      await apiKeyInput.fill('da143ff1f274e5987194fe5d22f71b11');

      const saveButton = page.locator('button:has-text("Confirmar e Entrar")');
      await saveButton.click();
      await page.waitForTimeout(2000);
    }

    // --- Teste para filme sem sequências (The Shawshank Redemption) ---
    await test.step('Testando The Shawshank Redemption (sem cards)', async () => {
      await page.goto('http://localhost:8080/filme/278', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe
      const section = page.locator('text=Sequências do Filme').first();
      await expect(section).toBeVisible();

      // Verificar se a mensagem está sendo exibida
      const message = page
        .locator('text=Não foram encontradas sequências para este filme')
        .first();
      await expect(message).toBeVisible();

      // Verificar se a mensagem contém o texto sobre explorar outras seções
      const exploreMessage = page
        .locator('text=Explore outras seções da página')
        .first();
      await expect(exploreMessage).toBeVisible();

      // Verificar se NÃO há cards sendo exibidos
      const movieCards = page
        .locator('text=Sugestão com Base neste filme')
        .first()
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('.grid > div');
      const cardCount = await movieCards.count();

      console.log(
        `📊 The Shawshank Redemption: ${cardCount} cards encontrados`
      );
      expect(cardCount).toBe(0);

      // Verificar se a badge de estratégia está sendo exibida
      const strategyBadge = page.locator('text=Filmes similares').first();
      await expect(strategyBadge).toBeVisible();

      console.log(
        '✅ The Shawshank Redemption: Sem cards, apenas mensagem (correto)'
      );
    });

    // --- Teste para filme com sequências (Star Wars) - deve ter cards ---
    await test.step('Testando Star Wars (com cards)', async () => {
      await page.goto('http://localhost:8080/filme/11', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe
      const section = page.locator('text=Sequências do Filme').first();
      await expect(section).toBeVisible();

      // Verificar se há cards sendo exibidos
      const movieCards = page
        .locator('text=Sequências do Filme')
        .first()
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('.grid > div');
      const cardCount = await movieCards.count();

      console.log(`📊 Star Wars: ${cardCount} sequências exibidas`);
      expect(cardCount).toBeGreaterThan(0);

      // Verificar se a mensagem de "sem sequências" NÃO aparece
      const noSequelsMessage = page.locator(
        'text=Não foram encontradas sequências para este filme'
      );
      await expect(noSequelsMessage).not.toBeVisible();

      // Verificar se a mensagem sobre explorar outras seções NÃO aparece
      const exploreMessageStarWars = page.locator(
        'text=Explore outras seções da página'
      );
      await expect(exploreMessageStarWars).not.toBeVisible();

      console.log('✅ Star Wars: Com cards (correto)');
    });

    console.log('✅ Todos os testes concluídos com sucesso!');
  });
});
