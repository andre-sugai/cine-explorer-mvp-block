import { test, expect } from '@playwright/test';

test.describe('Debug - Verificação dos dados de sequências', () => {
  test('deve verificar se os dados estão chegando ao componente MovieSequels', async ({
    page,
  }) => {
    console.log('🚀 Debug - Verificação dos dados de sequências...');

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
    await page.waitForTimeout(10000);

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

        if (!messageExists) {
          console.log('❌ PROBLEMA: Não há cards nem mensagem!');

          // Verificar se há algum conteúdo na seção
          const sectionContent = sequelsSection
            .locator('xpath=..')
            .locator('xpath=..');
          const sectionHTML = await sectionContent.innerHTML();
          console.log(
            '📽️ HTML da seção de sequências:',
            sectionHTML.substring(0, 500) + '...'
          );
        }
      } else {
        console.log('✅ Cards encontrados!');

        // Verificar os títulos dos cards
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const cardTitle = await movieCards
            .nth(i)
            .locator('h3, h4, .title')
            .first()
            .textContent();
          console.log(`📽️ Card ${i + 1}: ${cardTitle}`);
        }
      }
    } else {
      console.log('❌ PROBLEMA: Seção de sequências não encontrada!');
    }

    console.log('✅ Debug concluído!');
  });
});
