import { test, expect } from '@playwright/test';

test.describe('Teste - Debug simples da função getMovieSequels', () => {
  test('deve verificar se a função está sendo chamada', async ({ page }) => {
    console.log('🚀 Teste de debug simples...');

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

    // Navegar para Star Wars
    await page.goto('http://localhost:8080/filme/11', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(8000); // Aguardar mais tempo para carregar

    console.log('✅ Teste de debug simples concluído!');
  });
});
