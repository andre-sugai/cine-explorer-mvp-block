import { test, expect } from '@playwright/test';

test.describe('Teste - Mensagem explicativa para filmes similares', () => {
  test('deve mostrar mensagem explicativa quando não há sequências e mostra filmes similares', async ({
    page,
  }) => {
    console.log('🚀 Teste da mensagem explicativa para filmes similares...');

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

    // --- Teste para filme sem sequências (The Shawshank Redemption) ---
    await test.step('Testando The Shawshank Redemption (filmes similares com mensagem)', async () => {
      await page.goto('http://localhost:8080/filme/278', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe
      const section = page
        .locator('text=Sugestão com Base neste filme')
        .first();
      await expect(section).toBeVisible();

      // Verificar se a mensagem explicativa está sendo exibida
      const explanatoryMessage = page
        .locator('text=Não foram encontradas sequências')
        .first();
      await expect(explanatoryMessage).toBeVisible();

      // Verificar se a mensagem contém o texto completo
      const fullMessage = page
        .locator('text=sugestões baseadas neste filme')
        .first();
      await expect(fullMessage).toBeVisible();

      // Verificar se há filmes similares sendo exibidos
      const movieCards = page
        .locator('text=Sugestão com Base neste filme')
        .first()
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('.grid > div');
      const cardCount = await movieCards.count();

      console.log(
        `📊 The Shawshank Redemption: ${cardCount} filmes similares exibidos`
      );
      expect(cardCount).toBeGreaterThan(0);

      // Verificar se a badge de estratégia está sendo exibida
      const strategyBadge = page.locator('text=Filmes similares').first();
      await expect(strategyBadge).toBeVisible();

      console.log(
        '✅ The Shawshank Redemption: Mensagem explicativa exibida corretamente'
      );
    });

    // --- Teste para filme com sequências (Star Wars) - não deve mostrar a mensagem ---
    await test.step('Testando Star Wars (sequências - sem mensagem explicativa)', async () => {
      await page.goto('http://localhost:8080/filme/11', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe
      const section = page.locator('text=Sequências do Filme').first();
      await expect(section).toBeVisible();

      // Verificar se a mensagem explicativa NÃO está sendo exibida
      const explanatoryMessage = page
        .locator('text=Não foram encontradas sequências')
        .first();
      await expect(explanatoryMessage).not.toBeVisible();

      // Verificar se há sequências sendo exibidas
      const movieCards = page
        .locator('text=Sequências do Filme')
        .first()
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('.grid > div');
      const cardCount = await movieCards.count();

      console.log(`📊 Star Wars: ${cardCount} sequências exibidas`);
      expect(cardCount).toBeGreaterThan(0);

      console.log('✅ Star Wars: Mensagem explicativa não exibida (correto)');
    });

    console.log(
      '✅ Todos os testes da mensagem explicativa concluídos com sucesso!'
    );
  });
});
