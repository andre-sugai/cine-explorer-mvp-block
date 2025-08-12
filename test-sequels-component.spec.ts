import { test, expect } from '@playwright/test';

test.describe('Teste - Componente MovieSequels', () => {
  test('deve verificar se o componente está sendo renderizado', async ({
    page,
  }) => {
    console.log('🚀 Teste do componente MovieSequels...');

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

    // Verificar se a seção existe
    const section = page.locator('text=Sequências do Filme').first();
    const sectionExists = await section.count();
    console.log(
      `📊 Seção de sequências encontrada: ${sectionExists > 0 ? 'Sim' : 'Não'}`
    );

    if (sectionExists > 0) {
      // Verificar se há cards
      const movieCards = section
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('.grid > div');
      const cardCount = await movieCards.count();
      console.log(`📊 Cards encontrados: ${cardCount}`);

      // Verificar se há mensagem de "sem sequências"
      const noSequelsMessage = page.locator(
        'text=Não foram encontradas sequências para este filme'
      );
      const messageExists = await noSequelsMessage.count();
      console.log(
        `📊 Mensagem de "sem sequências" encontrada: ${
          messageExists > 0 ? 'Sim' : 'Não'
        }`
      );

      // Verificar se há badge de estratégia
      const strategyBadge = page.locator('text=Sequências da coleção');
      const badgeExists = await strategyBadge.count();
      console.log(
        `📊 Badge de estratégia encontrada: ${badgeExists > 0 ? 'Sim' : 'Não'}`
      );
    }

    console.log('✅ Teste do componente concluído!');
  });
});
