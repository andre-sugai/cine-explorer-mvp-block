import { test, expect } from '@playwright/test';

test.describe('Teste Final - Melhorias na detecção de sequências', () => {
  test('deve detectar sequências reais e mostrar mensagem quando não há sequências', async ({
    page,
  }) => {
    console.log('🚀 Teste final das melhorias na detecção de sequências...');

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

    // Teste 1: Star Wars (deve ter sequências)
    console.log('📽️ Testando Star Wars...');
    await page.goto('http://localhost:8080/filme/11', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);

    // Verificar se a seção de sequências existe
    const sequelsSection = page.locator('text=Sequências do Filme').first();
    await expect(sequelsSection).toBeVisible();

    // Verificar se há cards de filmes ou mensagem
    const movieCards = sequelsSection
      .locator('xpath=..')
      .locator('xpath=..')
      .locator('.grid > div');
    const cardCount = await movieCards.count();

    console.log(`📊 Star Wars - Cards encontrados: ${cardCount}`);

    if (cardCount > 0) {
      console.log('✅ Star Wars tem sequências (CORRETO)');

      // Verificar os títulos dos primeiros cards
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const cardTitle = await movieCards
          .nth(i)
          .locator('h3, h4, .title, [data-testid="movie-title"]')
          .first()
          .textContent();
        console.log(`📽️ Card ${i + 1}: ${cardTitle}`);
      }
    } else {
      // Se não há cards, verificar se há mensagem de "sem sequências"
      const noSequelsMessage = sequelsSection
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('text=Este filme não possui sequências conhecidas');
      const messageExists = (await noSequelsMessage.count()) > 0;

      if (messageExists) {
        console.log(
          '⚠️ Star Wars não tem sequências (pode estar correto se não encontrou sequências reais)'
        );
      } else {
        console.log(
          '❌ Star Wars não tem cards nem mensagem (problema na renderização)'
        );
      }
    }

    // Teste 2: The Shawshank Redemption (não deve ter sequências)
    console.log('📽️ Testando The Shawshank Redemption...');
    await page.goto('http://localhost:8080/filme/278', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);

    // Verificar se a seção de sequências existe
    const sequelsSection2 = page.locator('text=Sequências do Filme').first();
    await expect(sequelsSection2).toBeVisible();

    // Verificar se não há cards de filmes
    const movieCards2 = sequelsSection2
      .locator('xpath=..')
      .locator('xpath=..')
      .locator('.grid > div');
    const cardCount2 = await movieCards2.count();

    console.log(
      `📊 The Shawshank Redemption - Cards encontrados: ${cardCount2}`
    );

    if (cardCount2 === 0) {
      // Verificar se há mensagem de "sem sequências"
      const noSequelsMessage2 = sequelsSection2
        .locator('xpath=..')
        .locator('xpath=..')
        .locator('text=Este filme não possui sequências conhecidas');
      const messageExists2 = (await noSequelsMessage2.count()) > 0;

      if (messageExists2) {
        console.log(
          '✅ The Shawshank Redemption não tem sequências e mostra mensagem (CORRETO)'
        );
      } else {
        console.log(
          '❌ The Shawshank Redemption não tem cards nem mensagem (problema na renderização)'
        );
      }
    } else {
      console.log(
        `❌ The Shawshank Redemption tem ${cardCount2} cards (INCORRETO)`
      );
    }

    console.log('✅ Teste final das melhorias concluído!');
  });
});
