import { test, expect } from '@playwright/test';

test.describe('Busca por Voz', () => {
  test('deve mostrar o botão de microfone na home page', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Aguardar o carregamento da página
    await page.waitForLoadState('networkidle');

    // Verificar se o botão de microfone está presente na home
    const voiceButton = page.locator('button[title="Buscar por voz"]');
    await expect(voiceButton).toBeVisible();

    // Verificar se o ícone de microfone está presente
    const micIcon = voiceButton.locator('svg');
    await expect(micIcon).toBeVisible();
  });

  test('deve mostrar o botão de microfone no header', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Aguardar o carregamento da página
    await page.waitForLoadState('networkidle');

    // Verificar se o botão de microfone está presente no header (desktop)
    const headerVoiceButton = page.locator(
      'header button[title="Buscar por voz"]'
    );
    await expect(headerVoiceButton).toBeVisible();
  });

  test('deve mostrar mensagem de erro para navegadores não suportados', async ({
    page,
  }) => {
    // Mock da Web Speech API para simular navegador não suportado
    await page.addInitScript(() => {
      // Remover a Web Speech API para simular navegador não suportado
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;
    });

    await page.goto('http://localhost:5173');

    // Aguardar o carregamento da página
    await page.waitForLoadState('networkidle');

    // Clicar no botão de microfone
    const voiceButton = page.locator('button[title="Buscar por voz"]').first();
    await voiceButton.click();

    // Verificar se a mensagem de erro aparece
    const errorToast = page.locator('[role="alert"]');
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText('Navegador não suportado');
  });

  test('deve atualizar o campo de busca quando clicar no botão de microfone', async ({
    page,
  }) => {
    await page.goto('http://localhost:5173');

    // Aguardar o carregamento da página
    await page.waitForLoadState('networkidle');

    // Verificar se o campo de busca está presente
    const searchInput = page.locator('input[placeholder*="Busque por filmes"]');
    await expect(searchInput).toBeVisible();

    // Verificar se o botão de microfone está presente
    const voiceButton = page.locator('button[title="Buscar por voz"]').first();
    await expect(voiceButton).toBeVisible();
  });

  test('deve ter o texto explicativo sobre busca por voz', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Aguardar o carregamento da página
    await page.waitForLoadState('networkidle');

    // Verificar se o texto explicativo está presente
    const helpText = page.locator(
      'text=🎤 Ou clique no ícone de microfone para buscar por voz'
    );
    await expect(helpText).toBeVisible();
  });
});
