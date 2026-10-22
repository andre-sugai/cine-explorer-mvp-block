import { test, expect } from '@playwright/test';

test.describe('Teste - Remoção dos badges de estratégia', () => {
  test('deve não exibir badges de estratégia na seção de sequências', async ({
    page,
  }) => {
    console.log('🚀 Teste de remoção dos badges de estratégia...');

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
    await test.step('Testando The Shawshank Redemption (sem badge)', async () => {
      await page.goto('http://localhost:8080/filme/278', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe
      const section = page
        .locator('text=Este filme não possui sequência')
        .first();
      await expect(section).toBeVisible();

      // Verificar se NÃO há badges de estratégia na seção de sequências
      // Procurar por badges dentro da seção de sequências
      const badgesInSection = section
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('[class*="badge"], [class*="Badge"]');

      const badgeCount = await badgesInSection.count();
      console.log(`📊 Badges encontrados na seção: ${badgeCount}`);
      expect(badgeCount).toBe(0);

      console.log('✅ The Shawshank Redemption: Sem badges (correto)');
    });

    // --- Teste para filme com sequências (Star Wars) ---
    await test.step('Testando Star Wars (sem badge)', async () => {
      await page.goto('http://localhost:8080/filme/11', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção existe
      const section = page.locator('text=Sequências do Filme').first();
      await expect(section).toBeVisible();

      // Verificar se NÃO há badges de estratégia na seção de sequências
      const badgesInSection = section
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('[class*="badge"], [class*="Badge"]');

      const badgeCount = await badgesInSection.count();
      console.log(`📊 Badges encontrados na seção: ${badgeCount}`);
      expect(badgeCount).toBe(0);

      console.log('✅ Star Wars: Sem badges (correto)');
    });

    console.log('✅ Todos os testes concluídos com sucesso!');
  });
});
