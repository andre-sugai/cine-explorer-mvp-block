import { test, expect } from '@playwright/test';

test.describe('Teste - Novo título para estratégia similar_movies', () => {
  test('deve mostrar "Este filme não possui sequência" quando estratégia for similar_movies', async ({
    page,
  }) => {
    console.log('🚀 Teste do novo título para similar_movies...');

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
    await test.step('Testando The Shawshank Redemption (novo título)', async () => {
      await page.goto('http://localhost:8080/filme/278', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe com o novo título
      const section = page
        .locator('text=Este filme não possui sequência')
        .first();
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
        .locator('text=Este filme não possui sequência')
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
        '✅ The Shawshank Redemption: Novo título exibido corretamente'
      );
    });

    // --- Teste para filme com sequências (Star Wars) - deve manter título original ---
    await test.step('Testando Star Wars (título original)', async () => {
      await page.goto('http://localhost:8080/filme/11', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe com o título original
      const section = page.locator('text=Sequências do Filme').first();
      await expect(section).toBeVisible();

      // Verificar se o novo título NÃO aparece
      const newTitle = page.locator('text=Este filme não possui sequência');
      await expect(newTitle).not.toBeVisible();

      console.log('✅ Star Wars: Título original mantido (correto)');
    });

    console.log('✅ Todos os testes concluídos com sucesso!');
  });
});
