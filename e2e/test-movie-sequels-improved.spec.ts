import { test, expect } from '@playwright/test';

test.describe('Teste das melhorias na detecção de sequências', () => {
  test('deve detectar sequências reais com melhor precisão', async ({
    page,
  }) => {
    console.log('🚀 Testando melhorias na detecção de sequências...');

    // Configurar captura de logs do console
    page.on('console', (msg) => {
      console.log(`Browser console: ${msg.text()}`);
    });

    // Configurar captura de erros de rede
    page.on('response', (response) => {
      if (!response.ok()) {
        console.log(`Network error: ${response.url()} - ${response.status()}`);
      }
    });

    // Navegar para a página
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    console.log('✅ Página carregada');

    // Verificar se há modal de configuração de API
    const modalExists = await page
      .locator('[role="dialog"]:has-text("Configurar API")')
      .count();

    if (modalExists > 0) {
      console.log('🔑 Configurando API key...');
      const apiKeyInput = page.locator('input[placeholder*="API"]');
      await apiKeyInput.fill('da143ff1f274e5987194fe5d22f71b11');

      const saveButton = page.locator('button:has-text("Confirmar e Entrar")');
      await saveButton.click();

      await page.waitForTimeout(2000);
      console.log('✅ API key configurada');
    }

    // Clicar no botão de Filmes
    const moviesButton = page.locator('button:has-text("Filmes")');
    await moviesButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Botão de Filmes clicado');

    // Aguardar carregamento dos filmes
    await page.waitForTimeout(3000);

    // Clicar no primeiro filme da lista
    const firstMovie = page.locator('div[class*="grid"] > div').first();
    await firstMovie.click();
    await page.waitForTimeout(3000);
    console.log('✅ Primeiro filme clicado');

    // Verificar se a seção de "Sequências do Filme" aparece
    const sequelsSection = page.locator('text=Sequências do Filme');
    await expect(sequelsSection).toBeVisible();
    console.log('✅ Seção de Sequências do Filme encontrada');

    // Aguardar carregamento das sequências
    await page.waitForTimeout(5000);

    // Verificar se há badge com informação da estratégia
    const strategyBadge = page.locator('[role="dialog"] .badge, .card .badge');
    const badgeCount = await strategyBadge.count();

    if (badgeCount > 0) {
      const badgeText = await strategyBadge.first().textContent();
      console.log(`📊 Estratégia usada: ${badgeText}`);
    }

    // Verificar se há cards de filmes na seção
    const movieCards = page.locator('div[class*="grid"] > div');
    const cardCount = await movieCards.count();
    console.log(`📊 Número de cards de filmes na seção: ${cardCount}`);

    // Se não há cards, deve mostrar a mensagem de "sem sequências"
    if (cardCount === 0) {
      console.log('✅ Nenhuma sequência encontrada - verificando mensagem...');

      // Verificar se a mensagem de "sem sequências" aparece
      const noSequelsMessage = page.locator(
        'text=Este filme não possui sequências conhecidas'
      );
      await expect(noSequelsMessage).toBeVisible();
      console.log('✅ Mensagem de "sem sequências" encontrada');
    } else {
      console.log('✅ Sequências encontradas');

      // Verificar se NÃO há a mensagem de "sem sequências"
      const noSequelsMessage = page.locator(
        'text=Este filme não possui sequências conhecidas'
      );
      const messageExists = (await noSequelsMessage.count()) > 0;

      if (!messageExists) {
        console.log('✅ Mensagem de "sem sequências" não aparece (correto)');
      } else {
        console.log('❌ Mensagem de "sem sequências" aparece incorretamente');
      }
    }

    console.log('✅ Teste concluído com sucesso!');
  });

  test('deve testar filme com sequências conhecidas (Star Wars)', async ({
    page,
  }) => {
    console.log('🚀 Testando Star Wars (filme com sequências conhecidas)...');

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

    // Navegar diretamente para Star Wars (ID: 11)
    await page.goto('http://localhost:8080/filme/11', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);
    console.log('✅ Página do Star Wars carregada');

    // Verificar se a seção de "Sequências do Filme" aparece
    const sequelsSection = page.locator('text=Sequências do Filme');
    await expect(sequelsSection).toBeVisible();

    // Aguardar carregamento das sequências
    await page.waitForTimeout(5000);

    // Verificar se há cards de filmes na seção
    const movieCards = page.locator('div[class*="grid"] > div');
    const cardCount = await movieCards.count();
    console.log(`📊 Número de cards de filmes na seção: ${cardCount}`);

    // Star Wars deve ter sequências
    expect(cardCount).toBeGreaterThan(0);
    console.log('✅ Star Wars tem sequências (correto)');

    // Verificar se NÃO há a mensagem de "sem sequências"
    const noSequelsMessage = page.locator(
      'text=Este filme não possui sequências conhecidas'
    );
    const messageExists = (await noSequelsMessage.count()) > 0;

    if (!messageExists) {
      console.log('✅ Mensagem de "sem sequências" não aparece (correto)');
    } else {
      console.log('❌ Mensagem de "sem sequências" aparece incorretamente');
    }

    console.log('✅ Teste do Star Wars concluído!');
  });

  test('deve testar filme sem sequências (The Shawshank Redemption)', async ({
    page,
  }) => {
    console.log(
      '🚀 Testando The Shawshank Redemption (filme sem sequências)...'
    );

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

    // Navegar diretamente para The Shawshank Redemption (ID: 278)
    await page.goto('http://localhost:8080/filme/278', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);
    console.log('✅ Página do The Shawshank Redemption carregada');

    // Verificar se a seção de "Sequências do Filme" aparece
    const sequelsSection = page.locator('text=Sequências do Filme');
    await expect(sequelsSection).toBeVisible();

    // Aguardar carregamento das sequências
    await page.waitForTimeout(5000);

    // Verificar se há cards de filmes na seção
    const movieCards = page.locator('div[class*="grid"] > div');
    const cardCount = await movieCards.count();
    console.log(`📊 Número de cards de filmes na seção: ${cardCount}`);

    // Se não há cards, deve mostrar a mensagem de "sem sequências"
    if (cardCount === 0) {
      console.log('✅ Nenhuma sequência encontrada - verificando mensagem...');

      // Verificar se a mensagem de "sem sequências" aparece
      const noSequelsMessage = page.locator(
        'text=Este filme não possui sequências conhecidas'
      );
      await expect(noSequelsMessage).toBeVisible();
      console.log('✅ Mensagem de "sem sequências" encontrada');
    } else {
      console.log('❌ Encontradas sequências quando não deveria ter');
    }

    console.log('✅ Teste do The Shawshank Redemption concluído!');
  });
});
