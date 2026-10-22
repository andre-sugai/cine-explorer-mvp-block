import { test, expect } from '@playwright/test';

test.describe('Teste Final - Detecção de sequências funcionando', () => {
  test('deve detectar sequências reais e mostrar mensagem quando não há sequências', async ({
    page,
  }) => {
    console.log('🚀 Teste final da detecção de sequências...');

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
      await page.goto('http://localhost:8080/filme/11', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção de sequências existe
      const sequelsSection = page.locator('text=Sequências do Filme').first();
      await expect(sequelsSection).toBeVisible();

      // Verificar se os títulos dos filmes estão visíveis no DOM
      const especialNatalElement = page
        .locator('text=Especial de Natal')
        .first();
      await expect(especialNatalElement).toBeVisible();

      const frangoRoboElement = page.locator('text=Frango Robô').first();
      await expect(frangoRoboElement).toBeVisible();

      // Verificar se a mensagem de "sem sequências" NÃO aparece
      const noSequelsMessage = page.locator(
        'text=Este filme não possui sequências conhecidas'
      );
      await expect(noSequelsMessage).not.toBeVisible();

      console.log('✅ Star Wars: Sequências detectadas corretamente');
    });

    // --- Teste para filme sem sequências (The Shawshank Redemption) ---
    await test.step('Testando The Shawshank Redemption (sem sequências)', async () => {
      await page.goto('http://localhost:8080/filme/278', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se a seção de sequências existe
      const sequelsSection = page.locator('text=Sequências do Filme').first();
      await expect(sequelsSection).toBeVisible();

      // Verificar se a mensagem de "sem sequências" aparece
      const noSequelsMessage = page.locator(
        'text=Este filme não possui sequências conhecidas'
      );
      await expect(noSequelsMessage).toBeVisible();

      // Verificar se os títulos dos filmes NÃO estão visíveis
      const especialNatalElement = page.locator('text=Especial de Natal');
      await expect(especialNatalElement).not.toBeVisible();

      const frangoRoboElement = page.locator('text=Frango Robô');
      await expect(frangoRoboElement).not.toBeVisible();

      console.log(
        '✅ The Shawshank Redemption: Mensagem de "sem sequências" exibida corretamente'
      );
    });

    console.log('✅ Todos os testes de sequências concluídos com sucesso!');
  });
});
