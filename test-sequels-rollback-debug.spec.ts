import { test, expect } from '@playwright/test';

test.describe('Teste - Debug do rollback da função getMovieSequels', () => {
  test('deve verificar o que está sendo exibido após o rollback', async ({
    page,
  }) => {
    console.log('🚀 Teste de debug do rollback da função getMovieSequels...');

    // Configurar captura de logs do console
    page.on('console', (msg) => {
      console.log(`Browser console: ${msg.text()}`);
    });

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

    // --- Teste para filme com sequências (Star Wars) ---
    await test.step('Testando Star Wars (debug)', async () => {
      await page.goto('http://localhost:8080/filme/11', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe
      const sequelsSection = page
        .locator('text=Sequências do Filme, text=Sugestão com Base neste filme')
        .first();
      await expect(sequelsSection).toBeVisible();

      // Verificar se há cards sendo exibidos
      const movieCards = sequelsSection
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('.grid > div');
      const cardCount = await movieCards.count();

      console.log(`📊 Star Wars: ${cardCount} cards encontrados`);

      // Se há cards, verificar os títulos
      if (cardCount > 0) {
        for (let i = 0; i < Math.min(cardCount, 5); i++) {
          const card = movieCards.nth(i);
          const title = await card.locator('h3').textContent();
          console.log(`📊 Star Wars - Card ${i + 1}: ${title}`);
        }
      }

      // Verificar se a mensagem de "sem sequências" NÃO aparece
      const noSequelsMessage = page.locator(
        'text=Este filme não possui sequências conhecidas'
      );
      await expect(noSequelsMessage).not.toBeVisible();

      console.log('✅ Star Wars: Conteúdo verificado');
    });

    // --- Teste para filme sem sequências (The Shawshank Redemption) ---
    await test.step('Testando The Shawshank Redemption (debug)', async () => {
      await page.goto('http://localhost:8080/filme/278', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe
      const section = page
        .locator('text=Sequências do Filme, text=Filmes Similares')
        .first();
      await expect(section).toBeVisible();

      // Verificar se há cards sendo exibidos
      const movieCards = section
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('.grid > div');
      const cardCount = await movieCards.count();

      console.log(
        `📊 The Shawshank Redemption: ${cardCount} cards encontrados`
      );

      // Se há cards, verificar os títulos
      if (cardCount > 0) {
        for (let i = 0; i < Math.min(cardCount, 5); i++) {
          const card = movieCards.nth(i);
          const title = await card.locator('h3').textContent();
          console.log(`📊 The Shawshank Redemption - Card ${i + 1}: ${title}`);
        }
      }

      // Verificar se a mensagem de "sem sequências" NÃO aparece
      const noSequelsMessage = page.locator(
        'text=Este filme não possui sequências conhecidas'
      );
      await expect(noSequelsMessage).not.toBeVisible();

      console.log('✅ The Shawshank Redemption: Conteúdo verificado');
    });

    console.log('✅ Todos os testes de debug concluídos com sucesso!');
  });
});
