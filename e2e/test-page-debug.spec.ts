import { test, expect } from '@playwright/test';

test.describe('Debug da página de detalhes do filme', () => {
  test('deve verificar se a página está carregando corretamente', async ({
    page,
  }) => {
    console.log('🚀 Debug da página de detalhes do filme...');

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
    console.log('📽️ Navegando para Star Wars...');
    await page.goto('http://localhost:8080/filme/11', {
      waitUntil: 'domcontentloaded',
    });

    // Aguardar mais tempo para carregar
    await page.waitForTimeout(10000);

    // Verificar se a página carregou
    const title = await page.locator('h1').first().textContent();
    console.log(`📽️ Título da página: ${title}`);

    // Verificar se a seção de sequências existe
    const sequelsSection = page.locator('text=Sequências do Filme').first();
    const sectionExists = (await sequelsSection.count()) > 0;
    console.log(`📽️ Seção de sequências existe: ${sectionExists}`);

    if (sectionExists) {
      // Verificar se há cards ou mensagem
      const movieCards = sequelsSection
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('.grid > div');
      const cardCount = await movieCards.count();
      console.log(`📽️ Cards encontrados: ${cardCount}`);

      if (cardCount === 0) {
        const noSequelsMessage = sequelsSection
          .locator('xpath=..')
          .locator('xpath=..')
          .locator('text=Este filme não possui sequências conhecidas');
        const messageExists = (await noSequelsMessage.count()) > 0;
        console.log(`📽️ Mensagem de "sem sequências" existe: ${messageExists}`);
      }
    }

    console.log('✅ Debug da página concluído!');
  });
});
