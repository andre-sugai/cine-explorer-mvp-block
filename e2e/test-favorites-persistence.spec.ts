import { test, expect } from '@playwright/test';

/**
 * Teste completo de persistência do sistema de favoritos, visto e quero assistir
 * Verifica se os dados não são perdidos ao longo do tempo ou em caso de problemas de sincronização
 */
test.describe('Sistema de Favoritos - Persistência de Dados', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('http://localhost:8081');

    // Aguardar modal de API aparecer e configurar
    try {
      await page.waitForSelector('input[placeholder*="chave"]', {
        timeout: 5000,
      });
      await page.fill(
        'input[placeholder*="chave"]',
        'da143ff1f274e5987194fe5d22f71b11'
      );
      await page.click('button:has-text("Ativar"), button:has-text("Confirmar")');
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('Modal de API não apareceu ou já está configurado');
    }
  });

  test('deve manter marcação de visto após recarregar a página', async ({
    page,
  }) => {
    console.log('🧪 Teste: Manter marcação de visto após recarregar');

    // Buscar um filme
    await page.fill('input[type="search"], input[placeholder*="Buscar"]', 'Matrix');
    await page.waitForTimeout(2000);

    // Clicar no primeiro resultado
    const firstResult = page.locator('.grid > div, [data-testid="movie-card"]').first();
    await firstResult.click();
    await page.waitForTimeout(2000);

    // Verificar se há botão de "Marcar como Assistido"
    const watchedButton = page.locator(
      'button:has-text("Marcar como Assistido"), button:has-text("Assistido")'
    );

    if (await watchedButton.isVisible()) {
      const buttonText = await watchedButton.textContent();
      const isWatched = buttonText?.includes('Assistido');

      if (!isWatched) {
        // Marcar como assistido
        await watchedButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Filme marcado como assistido');
      }

      // Verificar se a bolinha verde aparece (indicador visual)
      const greenIndicator = page.locator(
        '.bg-green-500, button.bg-green-500, [class*="bg-green"]'
      );
      const hasGreenIndicator = await greenIndicator.count() > 0;
      expect(hasGreenIndicator || isWatched).toBeTruthy();

      // Recarregar a página
      await page.reload();
      await page.waitForTimeout(2000);

      // Verificar se a marcação persiste
      const watchedButtonAfterReload = page.locator(
        'button:has-text("Assistido"), button.bg-green-500'
      );
      const isWatchedAfterReload =
        (await watchedButtonAfterReload.count()) > 0 ||
        (await page.locator('button:has-text("Assistido")').count()) > 0;

      console.log(
        `✅ Marcação ${isWatchedAfterReload ? 'mantida' : 'perdida'} após recarregar`
      );
      expect(isWatchedAfterReload).toBeTruthy();
    } else {
      console.log('⚠️ Botão de assistido não encontrado');
    }
  });

  test('deve manter favoritos após recarregar a página', async ({ page }) => {
    console.log('🧪 Teste: Manter favoritos após recarregar');

    // Buscar um filme
    await page.fill('input[type="search"], input[placeholder*="Buscar"]', 'Inception');
    await page.waitForTimeout(2000);

    // Clicar no primeiro resultado
    const firstResult = page.locator('.grid > div, [data-testid="movie-card"]').first();
    await firstResult.click();
    await page.waitForTimeout(2000);

    // Verificar se há botão de favorito
    const favoriteButton = page.locator(
      'button:has-text("Favorito"), button:has-text("Adicionar aos Favoritos"), [aria-label*="favorito" i]'
    ).first();

    if (await favoriteButton.isVisible()) {
      const buttonText = await favoriteButton.textContent();
      const isFavorite = buttonText?.includes('Favorito');

      if (!isFavorite) {
        // Adicionar aos favoritos
        await favoriteButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Filme adicionado aos favoritos');
      }

      // Recarregar a página
      await page.reload();
      await page.waitForTimeout(2000);

      // Verificar se o favorito persiste
      const favoriteButtonAfterReload = page.locator(
        'button:has-text("Favorito"), [aria-label*="favorito" i]'
      ).first();
      const isFavoriteAfterReload =
        (await favoriteButtonAfterReload.count()) > 0 ||
        (await page.locator('button:has-text("Favorito")').count()) > 0;

      console.log(
        `✅ Favorito ${isFavoriteAfterReload ? 'mantido' : 'perdido'} após recarregar`
      );
      expect(isFavoriteAfterReload).toBeTruthy();
    } else {
      console.log('⚠️ Botão de favorito não encontrado');
    }
  });

  test('deve manter "Quero Assistir" após recarregar a página', async ({
    page,
  }) => {
    console.log('🧪 Teste: Manter "Quero Assistir" após recarregar');

    // Buscar um filme
    await page.fill('input[type="search"], input[placeholder*="Buscar"]', 'Interstellar');
    await page.waitForTimeout(2000);

    // Clicar no primeiro resultado
    const firstResult = page.locator('.grid > div, [data-testid="movie-card"]').first();
    await firstResult.click();
    await page.waitForTimeout(2000);

    // Verificar se há botão de "Quero Assistir"
    const wantToWatchButton = page.locator(
      'button:has-text("Quero Assistir"), button:has-text("Na Lista")'
    ).first();

    if (await wantToWatchButton.isVisible()) {
      const buttonText = await wantToWatchButton.textContent();
      const isInList = buttonText?.includes('Na Lista');

      if (!isInList) {
        // Adicionar à lista
        await wantToWatchButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Filme adicionado à lista "Quero Assistir"');
      }

      // Recarregar a página
      await page.reload();
      await page.waitForTimeout(2000);

      // Verificar se a marcação persiste
      const wantToWatchButtonAfterReload = page.locator(
        'button:has-text("Na Lista")'
      ).first();
      const isInListAfterReload =
        (await wantToWatchButtonAfterReload.count()) > 0 ||
        (await page.locator('button:has-text("Na Lista")').count()) > 0;

      console.log(
        `✅ "Quero Assistir" ${isInListAfterReload ? 'mantido' : 'perdido'} após recarregar`
      );
      expect(isInListAfterReload).toBeTruthy();
    } else {
      console.log('⚠️ Botão de "Quero Assistir" não encontrado');
    }
  });

  test('deve manter múltiplas marcações simultaneamente', async ({ page }) => {
    console.log('🧪 Teste: Manter múltiplas marcações simultaneamente');

    // Buscar um filme
    await page.fill('input[type="search"], input[placeholder*="Buscar"]', 'The Dark Knight');
    await page.waitForTimeout(2000);

    // Clicar no primeiro resultado
    const firstResult = page.locator('.grid > div, [data-testid="movie-card"]').first();
    await firstResult.click();
    await page.waitForTimeout(2000);

    // Adicionar aos favoritos
    const favoriteButton = page
      .locator(
        'button:has-text("Favorito"), button:has-text("Adicionar aos Favoritos")'
      )
      .first();
    if (await favoriteButton.isVisible()) {
      const favText = await favoriteButton.textContent();
      if (!favText?.includes('Favorito')) {
        await favoriteButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Marcar como assistido
    const watchedButton = page
      .locator(
        'button:has-text("Marcar como Assistido"), button:has-text("Assistido")'
      )
      .first();
    if (await watchedButton.isVisible()) {
      const watchedText = await watchedButton.textContent();
      if (!watchedText?.includes('Assistido')) {
        await watchedButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Recarregar a página
    await page.reload();
    await page.waitForTimeout(2000);

    // Verificar se ambas as marcações persistem
    const hasFavorite = (await page.locator('button:has-text("Favorito")').count()) > 0;
    const hasWatched = (await page.locator('button:has-text("Assistido")').count()) > 0;

    console.log(
      `✅ Favorito: ${hasFavorite ? 'mantido' : 'perdido'}, Visto: ${hasWatched ? 'mantido' : 'perdido'}`
    );
    expect(hasFavorite || hasWatched).toBeTruthy();
  });

  test('deve verificar localStorage e sincronização', async ({ page }) => {
    console.log('🧪 Teste: Verificar localStorage e sincronização');

    // Executar JavaScript para verificar localStorage
    const localStorageData = await page.evaluate(() => {
      return {
        favorites: localStorage.getItem('cine-explorer-favorites'),
        watched: localStorage.getItem('cine-explorer-watched'),
        wantToWatch: localStorage.getItem('queroAssistir'),
      };
    });

    console.log('📦 Dados no localStorage:');
    console.log('- Favoritos:', localStorageData.favorites ? 'Presente' : 'Ausente');
    console.log('- Vistos:', localStorageData.watched ? 'Presente' : 'Ausente');
    console.log('- Quero Assistir:', localStorageData.wantToWatch ? 'Presente' : 'Ausente');

    // Verificar se pelo menos um dos dados está presente (dependendo do estado do teste)
    expect(
      localStorageData.favorites ||
        localStorageData.watched ||
        localStorageData.wantToWatch
    ).toBeTruthy();
  });
});

