import { test, expect } from '@playwright/test';

test.describe('Teste Final - Categorias de Trailers Expandidas', () => {
  test('deve verificar se as categorias estão funcionando corretamente', async ({
    page,
  }) => {
    console.log('🎬 Teste final das categorias de trailers...');

    // Coletar logs do console
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    // Navegar para a página inicial
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Configurar API do TMDB
    const apiModal = page.locator('[role="dialog"]');
    if (await apiModal.isVisible()) {
      const apiInput = page.locator(
        'input[placeholder*="API" i], input[placeholder*="chave" i], input[type="text"]'
      );
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');

      const activateButton = page.locator(
        'button:has-text("Ativar"), button:has-text("Activate"), button:has-text("Confirmar")'
      );
      await activateButton.click();
      await page.waitForTimeout(2000);
    }

    // Abrir modal de trailers
    const trailerButton = page.locator('button:has-text("Trailers")');
    await trailerButton.click();
    await page.waitForSelector('[role="dialog"]');

    // Aguardar carregamento inicial
    await page.waitForTimeout(3000);

    // Coletar categorias vistas
    const categoriesSeen = new Set<string>();
    const trailersSeen = new Set<string>();

    // Testar múltiplas categorias
    for (let i = 0; i < 8; i++) {
      console.log(`\n🔄 Testando trailer ${i + 1}...`);

      // Aguardar carregamento
      await page.waitForTimeout(2000);

      // Verificar título do trailer
      const trailerTitle = page.locator(
        '[role="dialog"] h2, [role="dialog"] h3, [role="dialog"] .text-2xl'
      );
      if ((await trailerTitle.count()) > 0) {
        const titleText = await trailerTitle.first().textContent();
        if (titleText) {
          trailersSeen.add(titleText);
          console.log(`📺 Trailer: ${titleText}`);
        }
      }

      // Verificar categoria
      const categoryInfo = page
        .locator('[role="dialog"]')
        .filter({ hasText: 'Categoria:' });
      if ((await categoryInfo.count()) > 0) {
        const modalText = await page.locator('[role="dialog"]').textContent();
        const categoryMatch = modalText?.match(/Categoria:\s*([^\n\r]+)/);
        if (categoryMatch) {
          const category = categoryMatch[1].trim();
          categoriesSeen.add(category);
          console.log(`🏷️ Categoria: ${category}`);
        }
      }

      // Verificar tipo de conteúdo
      const contentTypeInfo = page
        .locator('[role="dialog"]')
        .filter({ hasText: 'Tipo:' });
      if ((await contentTypeInfo.count()) > 0) {
        const modalText = await page.locator('[role="dialog"]').textContent();
        const typeMatch = modalText?.match(/Tipo:\s*([^\n\r]+)/);
        if (typeMatch) {
          const contentType = typeMatch[1].trim();
          console.log(`🎭 Tipo: ${contentType}`);
        }
      }

      // Clicar próximo se não for o último
      if (i < 7) {
        const nextButton = page.locator('button:has-text("Próximo")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
        }
      }
    }

    // Verificar logs de categoria no console
    const categoryLogs = consoleLogs.filter((log) =>
      log.includes('🎬 Selecionando trailer da categoria:')
    );
    console.log('\n📋 Logs de categorias no console:');
    categoryLogs.forEach((log) => {
      const categoryMatch = log.match(/categoria:\s*([^\n\r]+)/);
      if (categoryMatch) {
        const category = categoryMatch[1].trim();
        categoriesSeen.add(category);
        console.log(`  🎬 ${category}`);
      }
    });

    // Resultados finais
    console.log('\n📊 RESULTADOS FINAIS:');
    console.log(`🎬 Total de trailers únicos: ${trailersSeen.size}`);
    console.log(`🏷️ Total de categorias únicas: ${categoriesSeen.size}`);
    console.log(`📺 Trailers vistos: ${Array.from(trailersSeen).join(', ')}`);
    console.log(
      `🏷️ Categorias vistas: ${Array.from(categoriesSeen).join(', ')}`
    );

    // Verificações
    expect(trailersSeen.size).toBeGreaterThan(3);
    expect(categoriesSeen.size).toBeGreaterThan(2);

    console.log('\n✅ VERIFICAÇÕES:');
    console.log(
      `✅ Múltiplos trailers carregados: ${
        trailersSeen.size > 3 ? 'Sim' : 'Não'
      }`
    );
    console.log(
      `✅ Múltiplas categorias funcionando: ${
        categoriesSeen.size > 2 ? 'Sim' : 'Não'
      }`
    );

    // Verificar se temos uma boa variedade de categorias
    const expectedCategories = [
      'Filmes Populares',
      'Filmes Bem Avaliados',
      'Séries Populares',
      'Em Tendência',
      'Ação e Aventura',
      'Comédia',
      'Drama',
      'Terror',
      'Ficção Científica',
      'Animação',
      'Anos 2020',
      'Anos 2010',
      'Anos 2000',
      'Anos 1990',
      'Anos 1980',
    ];

    const foundExpectedCategories = expectedCategories.filter((cat) =>
      Array.from(categoriesSeen).some((seen) => seen.includes(cat))
    );

    console.log(
      `✅ Categorias esperadas encontradas: ${foundExpectedCategories.length}/${expectedCategories.length}`
    );
    console.log(
      `📋 Categorias encontradas: ${foundExpectedCategories.join(', ')}`
    );

    // Fechar modal
    const closeButton = page.locator(
      '[role="dialog"] button[aria-label="Close"], [role="dialog"] button:has-text("×")'
    );
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }

    console.log('\n🎉 Teste final concluído com sucesso!');
  });
});
