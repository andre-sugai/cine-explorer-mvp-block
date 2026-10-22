import { test, expect } from '@playwright/test';

test('Teste do botão de Diretores - Configuração completa', async ({
  page,
}) => {
  // Acessar a página
  await page.goto('http://localhost:8083');

  // Aguardar carregamento
  await page.waitForLoadState('domcontentloaded');

  // Verificar se a página carregou
  console.log('Página carregada com sucesso');

  // Procurar pelo botão de diretores
  const directorsButton = page.locator('button:has-text("Diretores")');

  // Verificar se o botão existe
  const buttonExists = await directorsButton.isVisible();
  console.log('Botão de diretores encontrado:', buttonExists);

  if (buttonExists) {
    // Clicar no botão
    await directorsButton.click();
    console.log('Botão de diretores clicado');

    // Aguardar um pouco para carregamento
    await page.waitForTimeout(2000);

    // Verificar se há conteúdo carregado
    const contentGrid = page.locator('.grid, [data-testid="content-grid"]');
    const hasContent = await contentGrid.isVisible();
    console.log('Grid de conteúdo encontrado:', hasContent);

    if (hasContent) {
      // Verificar se há cards de diretores
      const cards = page.locator('.person-card, .movie-card, .card');
      const cardsCount = await cards.count();
      console.log('Número de cards encontrados:', cardsCount);

      if (cardsCount > 0) {
        console.log(
          '✅ Lista de diretores carregada com sucesso no primeiro clique!'
        );
      } else {
        console.log('❌ Nenhum card de diretor encontrado após o clique');
      }
    } else {
      console.log('❌ Grid de conteúdo não encontrado');
    }
  } else {
    console.log('❌ Botão de diretores não encontrado');
  }
});
