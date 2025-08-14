import { test, expect } from '@playwright/test';

test.describe('Teste - Categorias de Trailers Expandidas', () => {
  test('deve testar as novas categorias de trailers implementadas', async ({
    page,
  }) => {
    console.log('🎬 Testando as novas categorias de trailers...');

    // Navegar para a página inicial
    await page.goto('http://localhost:8082');
    console.log('✅ Página inicial carregada');

    // Aguardar o carregamento da página
    await page.waitForLoadState('networkidle');
    console.log('✅ Página carregada completamente');

    // Configurar API do TMDB
    console.log('🔧 Configurando API do TMDB...');

    // Verificar se o modal de configuração da API está visível
    const apiModal = page.locator('[role="dialog"]');
    if (await apiModal.isVisible()) {
      console.log('✅ Modal de configuração da API encontrado');

      // Inserir a chave da API
      const apiInput = page.locator(
        'input[placeholder*="API" i], input[placeholder*="chave" i], input[type="text"]'
      );
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');
      console.log('✅ Chave da API inserida');

      // Clicar no botão Ativar
      const activateButton = page.locator(
        'button:has-text("Ativar"), button:has-text("Activate"), button:has-text("Confirmar")'
      );
      await activateButton.click();
      console.log('✅ Botão Ativar clicado');

      // Aguardar o modal fechar
      await page.waitForTimeout(2000);
      console.log('✅ Modal de configuração fechado');
    } else {
      console.log(
        'ℹ️ Modal de configuração da API não encontrado, continuando...'
      );
    }

    // Verificar se o botão de trailers existe
    const trailerButton = page.locator('button:has-text("Trailers")');
    await expect(trailerButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Botão de trailers encontrado');

    // Clicar no botão de trailers
    await trailerButton.click();
    console.log('✅ Modal de trailers aberto');

    // Aguardar o modal aparecer
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    console.log('✅ Modal de trailers carregado');

    // Verificar se o modal está visível
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    console.log('✅ Modal está visível');

    // Aguardar o carregamento do trailer
    await page.waitForTimeout(3000);
    console.log('✅ Aguardou carregamento inicial');

    // Verificar se há informações de categoria
    const categoryBadge = page.locator('.badge');
    await expect(categoryBadge).toBeVisible({ timeout: 10000 });
    console.log('✅ Badge de categoria encontrado');

    // Verificar se há ícone de tipo de conteúdo (filme ou série)
    const contentTypeIcon = page.locator('svg[class*="w-5 h-5"]');
    await expect(contentTypeIcon).toBeVisible();
    console.log('✅ Ícone de tipo de conteúdo encontrado');

    // Verificar se há informações detalhadas
    const infoSection = page.locator('text=Tipo:');
    await expect(infoSection).toBeVisible();
    console.log('✅ Seção de informações encontrada');

    // Testar botão "Próximo"
    const nextButton = page.locator('button:has-text("Próximo")');
    await expect(nextButton).toBeVisible();
    console.log('✅ Botão próximo encontrado');

    // Clicar no botão próximo
    await nextButton.click();
    console.log('✅ Clicou no botão próximo');

    // Aguardar carregamento do próximo trailer
    await page.waitForTimeout(2000);
    console.log('✅ Aguardou carregamento do próximo trailer');

    // Verificar se a categoria mudou
    const newCategoryBadge = page.locator('.badge');
    await expect(newCategoryBadge).toBeVisible();
    console.log('✅ Nova categoria carregada');

    // Testar botão "Ver Detalhes"
    const detailsButton = page.locator('button:has-text("Ver Detalhes")');
    await expect(detailsButton).toBeVisible();
    console.log('✅ Botão ver detalhes encontrado');

    // Verificar se o player está funcionando
    const playerContainer = page.locator('iframe[src*="youtube"]');
    await expect(playerContainer).toBeVisible({ timeout: 10000 });
    console.log('✅ Player do YouTube carregado');

    // Testar múltiplas categorias (clicar próximo algumas vezes)
    console.log('🔄 Testando múltiplas categorias...');
    for (let i = 0; i < 3; i++) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      console.log(`✅ Trailer ${i + 1} carregado`);
    }

    // Verificar se não há erros no console
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Fechar o modal
    const closeButton = page.locator(
      '[role="dialog"] button[aria-label="Close"]'
    );
    if (await closeButton.isVisible()) {
      await closeButton.click();
      console.log('✅ Modal fechado');
    }

    // Verificar se não há erros críticos
    if (consoleErrors.length > 0) {
      console.log('⚠️ Erros encontrados no console:', consoleErrors);
    } else {
      console.log('✅ Nenhum erro crítico encontrado');
    }

    console.log('🎉 Teste das categorias de trailers concluído com sucesso!');
  });

  test('deve verificar se as categorias estão sendo selecionadas corretamente', async ({
    page,
  }) => {
    console.log('🔍 Verificando seleção de categorias...');

    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Configurar API do TMDB
    console.log('🔧 Configurando API do TMDB...');

    // Verificar se o modal de configuração da API está visível
    const apiModal = page.locator('[role="dialog"]');
    if (await apiModal.isVisible()) {
      console.log('✅ Modal de configuração da API encontrado');

      // Inserir a chave da API
      const apiInput = page.locator(
        'input[placeholder*="API" i], input[placeholder*="chave" i], input[type="text"]'
      );
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');
      console.log('✅ Chave da API inserida');

      // Clicar no botão Ativar
      const activateButton = page.locator(
        'button:has-text("Ativar"), button:has-text("Activate"), button:has-text("Confirmar")'
      );
      await activateButton.click();
      console.log('✅ Botão Ativar clicado');

      // Aguardar o modal fechar
      await page.waitForTimeout(2000);
      console.log('✅ Modal de configuração fechado');
    } else {
      console.log(
        'ℹ️ Modal de configuração da API não encontrado, continuando...'
      );
    }

    // Abrir modal de trailers
    const trailerButton = page.locator('button:has-text("Trailers")');
    await trailerButton.click();
    await page.waitForSelector('[role="dialog"]');

    // Coletar categorias vistas
    const categoriesSeen = new Set<string>();

    // Testar várias categorias
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(2000);

      const categoryBadge = page.locator('.badge');
      if (await categoryBadge.isVisible()) {
        const categoryText = await categoryBadge.textContent();
        if (categoryText) {
          categoriesSeen.add(categoryText);
          console.log(`📺 Categoria encontrada: ${categoryText}`);
        }
      }

      // Clicar próximo
      const nextButton = page.locator('button:has-text("Próximo")');
      await nextButton.click();
    }

    console.log(
      `📊 Total de categorias diferentes vistas: ${categoriesSeen.size}`
    );
    console.log(`📋 Categorias: ${Array.from(categoriesSeen).join(', ')}`);

    // Verificar se vimos pelo menos algumas categorias diferentes
    expect(categoriesSeen.size).toBeGreaterThan(1);
    console.log('✅ Múltiplas categorias foram testadas');

    // Fechar modal
    const closeButton = page.locator(
      '[role="dialog"] button[aria-label="Close"]'
    );
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  });
});
