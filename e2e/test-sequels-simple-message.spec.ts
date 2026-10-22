import { test, expect } from '@playwright/test';

test.describe('Teste - Mensagem explicativa simples', () => {
  test('deve mostrar mensagem explicativa quando estratégia for similar_movies', async ({
    page,
  }) => {
    console.log('🚀 Teste da mensagem explicativa simples...');

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
    await test.step('Testando The Shawshank Redemption (verificar mensagem)', async () => {
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

      // Verificar se a badge de estratégia está sendo exibida
      const strategyBadge = page.locator('text=Filmes similares').first();
      await expect(strategyBadge).toBeVisible();

      console.log(
        '✅ The Shawshank Redemption: Mensagem explicativa exibida corretamente'
      );
    });

    console.log('✅ Teste da mensagem explicativa concluído com sucesso!');
  });
});
