import { test, expect } from '@playwright/test';

test.describe('Teste - Debug da seção de sequências', () => {
  test('deve verificar se a seção está sendo renderizada', async ({ page }) => {
    console.log('🚀 Teste de debug da seção de sequências...');

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
    await test.step('Testando The Shawshank Redemption (debug)', async () => {
      await page.goto('http://localhost:8080/filme/278', {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(5000);

      // Verificar se existe alguma seção relacionada a sequências
      const sequelsSection = page
        .locator('text=Sequências do Filme, text=Sugestão com Base neste filme')
        .first();
      const sectionExists = await sequelsSection.count();
      console.log(
        `📊 Seção de sequências encontrada: ${
          sectionExists > 0 ? 'Sim' : 'Não'
        }`
      );

      if (sectionExists > 0) {
        // Verificar o título da seção
        const title = await sequelsSection.textContent();
        console.log(`📊 Título da seção: ${title}`);

        // Verificar se há mensagem de "sem sequências"
        const noSequelsMessage = page
          .locator('text=Não foram encontradas sequências para este filme')
          .first();
        const messageExists = await noSequelsMessage.count();
        console.log(
          `📊 Mensagem de "sem sequências" encontrada: ${
            messageExists > 0 ? 'Sim' : 'Não'
          }`
        );

        // Verificar se há cards
        const movieCards = sequelsSection
          .locator('xpath=..')
          .locator('xpath=..')
          .locator('.grid > div');
        const cardCount = await movieCards.count();
        console.log(`📊 Cards encontrados: ${cardCount}`);

        // Verificar se há badge de estratégia
        const strategyBadge = page.locator('text=Filmes similares').first();
        const badgeExists = await strategyBadge.count();
        console.log(
          `📊 Badge de estratégia encontrada: ${
            badgeExists > 0 ? 'Sim' : 'Não'
          }`
        );
      } else {
        console.log('❌ Seção de sequências não encontrada');
      }

      // Verificar se há outras seções na página
      const allSections = page.locator('h3, h2, h1').all();
      const sections = await allSections;
      console.log('📊 Seções encontradas na página:');
      for (const section of sections) {
        const text = await section.textContent();
        if (text) {
          console.log(`  - ${text}`);
        }
      }
    });

    console.log('✅ Teste de debug concluído!');
  });
});
