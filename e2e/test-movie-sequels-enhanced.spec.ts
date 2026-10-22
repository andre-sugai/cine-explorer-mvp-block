import { test, expect } from '@playwright/test';

test.describe('Teste da seção de sequências melhorada', () => {
  test.beforeEach(async ({ page }) => {
    // Sempre começar pela home e configurar a API
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Verificar se há modal de configuração da API
    const apiModal = page
      .locator('text=Configurar API, text=API Key, text=TMDB API')
      .first();

    if (await apiModal.isVisible()) {
      console.log('Modal de API encontrado, configurando...');

      // Preencher a API key
      const apiInput = page
        .locator(
          'input[placeholder*="API"], input[placeholder*="key"], input[type="text"]'
        )
        .first();
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');

      // Clicar no botão de salvar/entrar
      const saveButton = page
        .locator(
          'button:has-text("Salvar"), button:has-text("Entrar"), button:has-text("Save")'
        )
        .first();
      await saveButton.click();

      // Aguardar o modal fechar
      await page.waitForTimeout(2000);
    } else {
      console.log(
        'Modal de API não encontrado, configurando via localStorage...'
      );

      // Configurar via localStorage
      await page.evaluate(() => {
        localStorage.setItem(
          'tmdb_api_key',
          'da143ff1f274e5987194fe5d22f71b11'
        );
      });

      // Recarregar a página
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  });

  test('Deve carregar sequências usando diferentes estratégias', async ({
    page,
  }) => {
    // Testar com um filme que tem coleção (Star Wars)
    await page.goto('http://localhost:8081/filme/11?title=Star%20Wars');

    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle');

    // Aguardar mais um pouco para garantir que tudo carregou
    await page.waitForTimeout(3000);

    // Verificar se a seção de sequências aparece
    const sequelsSection = page.locator('text=Filmes da Mesma Franquia');
    await expect(sequelsSection).toBeVisible();

    // Verificar se há filmes na seção
    const movieCards = page.locator(
      '[data-testid="movie-card"], .group.cursor-pointer'
    );
    await expect(movieCards.first()).toBeVisible();

    // Verificar se há pelo menos 1 filme
    const movieCount = await movieCards.count();
    expect(movieCount).toBeGreaterThan(0);
  });

  test('Deve funcionar com filmes sem coleção', async ({ page }) => {
    // Testar com um filme que não tem coleção (Fight Club)
    await page.goto('http://localhost:8081/filme/550?title=Fight%20Club');

    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle');

    // Aguardar mais um pouco para garantir que tudo carregou
    await page.waitForTimeout(3000);

    // Verificar se a seção de sequências aparece
    const sequelsSection = page.locator('text=Filmes da Mesma Franquia');
    await expect(sequelsSection).toBeVisible();

    // Verificar se há filmes na seção
    const movieCards = page.locator(
      '[data-testid="movie-card"], .group.cursor-pointer'
    );
    await expect(movieCards.first()).toBeVisible();

    // Verificar se há pelo menos 1 filme
    const movieCount = await movieCards.count();
    expect(movieCount).toBeGreaterThan(0);
  });

  test('Deve mostrar estratégia correta no console', async ({ page }) => {
    // Interceptar logs do console
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await page.goto('http://localhost:8081/filme/11?title=Star%20Wars');
    await page.waitForLoadState('networkidle');

    // Aguardar um pouco para os logs aparecerem
    await page.waitForTimeout(3000);

    // Verificar se há logs sobre a estratégia usada
    const strategyLogs = consoleLogs.filter(
      (log) =>
        log.includes('Encontrados') &&
        (log.includes('coleção') ||
          log.includes('keyword') ||
          log.includes('título') ||
          log.includes('similares'))
    );

    expect(strategyLogs.length).toBeGreaterThan(0);
  });

  test('Deve navegar para detalhes do filme ao clicar', async ({ page }) => {
    await page.goto('http://localhost:8081/filme/11?title=Star%20Wars');
    await page.waitForLoadState('networkidle');

    // Aguardar mais um pouco para garantir que tudo carregou
    await page.waitForTimeout(3000);

    // Clicar no primeiro filme da seção de sequências
    const firstMovieCard = page
      .locator('[data-testid="movie-card"], .group.cursor-pointer')
      .first();
    await firstMovieCard.click();

    // Verificar se navegou para a página de detalhes do filme
    await expect(page).toHaveURL(/\/filme\/\d+/);

    // Verificar se a página carregou
    await page.waitForLoadState('networkidle');
    const movieTitle = page.locator('h1').nth(1);
    await expect(movieTitle).toBeVisible();
  });
});
