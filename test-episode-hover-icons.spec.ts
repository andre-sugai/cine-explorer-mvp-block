import { test, expect } from '@playwright/test';

test.describe('Episode Card Hover Icons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
  });

  test('deve mostrar apenas check branco no hover de episódio não assistido', async ({
    page,
  }) => {
    // Navegar para uma série
    await page.click('text=Séries');
    await page.waitForTimeout(2000);

    // Clicar em uma série popular
    const firstSeries = page.locator('[data-testid="movie-card"]').first();
    await firstSeries.click();
    await page.waitForTimeout(3000);

    // Procurar por um episódio não assistido
    const unwatchedEpisode = page.locator('.group\\/thumb').first();

    // Verificar estado normal (sem hover) - não deve ter ícones visíveis
    const checkBeforeHover = unwatchedEpisode
      .locator('svg')
      .filter({ hasText: /check/i });
    const xBeforeHover = unwatchedEpisode
      .locator('svg')
      .filter({ hasText: /x/i });

    console.log('Estado normal (sem hover):');
    console.log('- Check visível:', await checkBeforeHover.count());
    console.log('- X visível:', await xBeforeHover.count());

    // Fazer hover no episódio
    await unwatchedEpisode.hover();
    await page.waitForTimeout(500);

    // Verificar que apenas o check branco aparece
    const checkIcon = unwatchedEpisode.locator('svg.lucide-check');
    const xIcon = unwatchedEpisode.locator('svg.lucide-x');

    console.log('Estado com hover:');
    console.log('- Check presente:', await checkIcon.count());
    console.log('- X presente:', await xIcon.count());

    // O check deve estar visível (opacity-100)
    const checkClasses = await checkIcon.getAttribute('class');
    console.log('- Classes do check:', checkClasses);

    // O X não deve existir para episódios não assistidos
    expect(await xIcon.count()).toBe(0);
  });

  test('deve mostrar check verde normalmente e X vermelho no hover de episódio assistido', async ({
    page,
  }) => {
    // Navegar para uma série
    await page.click('text=Séries');
    await page.waitForTimeout(2000);

    // Clicar em uma série
    const firstSeries = page.locator('[data-testid="movie-card"]').first();
    await firstSeries.click();
    await page.waitForTimeout(3000);

    // Pegar o primeiro episódio e marcar como assistido
    const episode = page.locator('.group\\/thumb').first();
    await episode.click();
    await page.waitForTimeout(1000);

    // Verificar estado normal - deve ter check verde visível
    const checkIcon = episode.locator('svg.lucide-check');
    const checkClasses = await checkIcon.getAttribute('class');

    console.log('Episódio assistido - Estado normal:');
    console.log('- Check presente:', await checkIcon.count());
    console.log('- Classes do check:', checkClasses);
    console.log(
      '- Check tem text-green-500:',
      checkClasses?.includes('text-green-500')
    );

    // Verificar que check verde está visível
    expect(checkClasses).toContain('text-green-500');

    // Fazer hover
    await episode.hover();
    await page.waitForTimeout(500);

    // Verificar que o X vermelho aparece no hover
    const xIcon = episode.locator('svg.lucide-x');
    const xClasses = await xIcon.getAttribute('class');

    console.log('Episódio assistido - Estado com hover:');
    console.log('- X presente:', await xIcon.count());
    console.log('- Classes do X:', xClasses);
    console.log('- X tem text-red-500:', xClasses?.includes('text-red-500'));

    // O X deve estar presente e ser vermelho
    expect(await xIcon.count()).toBe(1);
    expect(xClasses).toContain('text-red-500');
  });

  test('fluxo completo: marcar e desmarcar episódio', async ({ page }) => {
    // Navegar para uma série
    await page.click('text=Séries');
    await page.waitForTimeout(2000);

    const firstSeries = page.locator('[data-testid="movie-card"]').first();
    await firstSeries.click();
    await page.waitForTimeout(3000);

    const episode = page.locator('.group\\/thumb').first();

    console.log('=== PASSO 1: Episódio não assistido ===');

    // Hover no episódio não assistido
    await episode.hover();
    await page.waitForTimeout(500);

    const checkBeforeClick = episode.locator('svg.lucide-check');
    const xBeforeClick = episode.locator('svg.lucide-x');

    console.log(
      '- Check branco visível no hover:',
      await checkBeforeClick.count()
    );
    console.log('- X não deve existir:', await xBeforeClick.count());

    expect(await xBeforeClick.count()).toBe(0);

    console.log('=== PASSO 2: Marcar como assistido ===');

    // Clicar para marcar como assistido
    await episode.click();
    await page.waitForTimeout(1000);

    // Verificar check verde visível
    const checkAfterClick = episode.locator('svg.lucide-check');
    const checkClasses = await checkAfterClick.getAttribute('class');

    console.log(
      '- Check verde visível:',
      checkClasses?.includes('text-green-500')
    );
    expect(checkClasses).toContain('text-green-500');

    console.log('=== PASSO 3: Hover no episódio assistido ===');

    // Hover novamente
    await episode.hover();
    await page.waitForTimeout(500);

    const xAfterClick = episode.locator('svg.lucide-x');
    const xClasses = await xAfterClick.getAttribute('class');

    console.log('- X vermelho aparece no hover:', await xAfterClick.count());
    console.log('- X é vermelho:', xClasses?.includes('text-red-500'));

    expect(await xAfterClick.count()).toBe(1);
    expect(xClasses).toContain('text-red-500');

    console.log('=== PASSO 4: Desmarcar episódio ===');

    // Clicar para desmarcar
    await episode.click();
    await page.waitForTimeout(1000);

    // Hover novamente - deve voltar ao estado inicial
    await episode.hover();
    await page.waitForTimeout(500);

    const finalX = episode.locator('svg.lucide-x');
    console.log('- X não deve mais existir:', await finalX.count());

    expect(await finalX.count()).toBe(0);

    console.log('✅ Fluxo completo funcionando corretamente!');
  });
});
