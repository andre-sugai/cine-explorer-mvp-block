import { test, expect } from '@playwright/test';

test.describe('Teste - Rollback da função getMovieSequels', () => {
  test('deve mostrar sequências quando há e filmes similares quando não há', async ({ page }) => {
    console.log('🚀 Teste do rollback da função getMovieSequels...');

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
    await test.step('Testando Star Wars (com sequências)', async () => {
      await page.goto('http://localhost:8080/filme/11', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);

      // Verificar se a seção de sequências existe
      const sequelsSection = page.locator('text=Sequências do Filme').first();
      await expect(sequelsSection).toBeVisible();

      // Verificar se os títulos dos filmes estão visíveis no DOM
      const especialNatalElement = page.locator('text=Especial de Natal').first();
      await expect(especialNatalElement).toBeVisible();

      const frangoRoboElement = page.locator('text=Frango Robô').first();
      await expect(frangoRoboElement).toBeVisible();

      // Verificar se a mensagem de "sem sequências" NÃO aparece
      const noSequelsMessage = page.locator('text=Este filme não possui sequências conhecidas');
      await expect(noSequelsMessage).not.toBeVisible();

      console.log('✅ Star Wars: Sequências detectadas corretamente');
    });

    // --- Teste para filme sem sequências (The Shawshank Redemption) ---
    await test.step('Testando The Shawshank Redemption (filmes similares)', async () => {
      await page.goto('http://localhost:8080/filme/278', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);

      // Verificar se a seção de filmes similares existe
      const similarSection = page.locator('text=Filmes Similares').first();
      await expect(similarSection).toBeVisible();

      // Verificar se há filmes similares sendo exibidos (pelo menos um card)
      const movieCards = page.locator('text=Sequências do Filme').first().locator('xpath=..').locator('xpath=..').locator('.grid > div');
      const cardCount = await movieCards.count();
      
      // Deve ter pelo menos alguns filmes similares
      expect(cardCount).toBeGreaterThan(0);

      // Verificar se a mensagem de "sem sequências" NÃO aparece
      const noSequelsMessage = page.locator('text=Este filme não possui sequências conhecidas');
      await expect(noSequelsMessage).not.toBeVisible();

      console.log(`✅ The Shawshank Redemption: ${cardCount} filmes similares exibidos`);
    });

    // --- Teste para filme com nome genérico (The) ---
    await test.step('Testando filme com nome genérico', async () => {
      await page.goto('http://localhost:8080/filme/550', { waitUntil: 'domcontentloaded' }); // Fight Club
      await page.waitForTimeout(5000);

      // Verificar se a seção existe
      const section = page.locator('text=Sequências do Filme, text=Filmes Similares').first();
      await expect(section).toBeVisible();

      // Verificar se há conteúdo sendo exibido
      const movieCards = section.locator('xpath=..').locator('xpath=..').locator('.grid > div');
      const cardCount = await movieCards.count();
      
      // Deve ter algum conteúdo (sequências ou similares)
      expect(cardCount).toBeGreaterThan(0);

      console.log(`✅ Fight Club: ${cardCount} filmes relacionados exibidos`);
    });

    console.log('✅ Todos os testes do rollback concluídos com sucesso!');
  });
});
