import { test, expect } from '@playwright/test';

test('Persistência de filtros na página Quero Assistir', async ({ page }) => {
  // Navegar para a aplicação
  await page.goto('http://localhost:8081');

  // Aguardar modal de API aparecer e configurar
  await page.waitForSelector(
    '[data-testid="api-config-modal"], button:has-text("Ativar API")',
    { timeout: 10000 }
  );

  // Se o modal aparecer, configurar a API
  const modalVisible = await page.isVisible('[data-testid="api-config-modal"]');
  if (modalVisible) {
    await page.fill(
      'input[placeholder*="chave"]',
      'da143ff1f274e5987194fe5d22f71b11'
    );
    await page.click('button:has-text("Ativar"), button:has-text("Confirmar")');
    await page.waitForTimeout(2000);
  }

  // Navegar para a página "Quero Assistir"
  await page.click('a[href="/quero-assistir"], text="Quero Assistir"');
  await page.waitForURL('**/quero-assistir');

  console.log('✓ Navegou para página Quero Assistir');

  // Verificar se os componentes de filtro estão presentes
  await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible();
  await expect(page.locator('select').first()).toBeVisible(); // Ordenar por

  console.log('✓ Componentes de filtro estão visíveis');

  // Aplicar alguns filtros
  await page.fill('input[placeholder*="Buscar"]', 'Matrix');
  await page.selectOption('select >> nth=0', 'rating'); // Ordenar por nota
  await page.selectOption('select >> nth=1', 'asc'); // Ordem crescente

  console.log('✓ Filtros aplicados');

  // Navegar para uma página de filme (simular navegação)
  await page.goto('http://localhost:8081/filme/603'); // The Matrix
  await page.waitForTimeout(1000);

  console.log('✓ Navegou para página de filme');

  // Voltar para a página "Quero Assistir"
  await page.goBack();
  await page.waitForURL('**/quero-assistir');

  console.log('✓ Voltou para página Quero Assistir');

  // Verificar se os filtros persistiram
  const searchValue = await page.inputValue('input[placeholder*="Buscar"]');
  const orderByValue = await page.inputValue('select >> nth=0');
  const orderDirectionValue = await page.inputValue('select >> nth=1');

  expect(searchValue).toBe('Matrix');
  expect(orderByValue).toBe('rating');
  expect(orderDirectionValue).toBe('asc');

  console.log('✓ Filtros persistiram após navegação');
});
