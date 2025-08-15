import { test, expect } from '@playwright/test';

/**
 * Teste para verificar as 3 abas na página de configurações
 */
test.describe('Página de Configurações - 3 Abas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Configura a API TMDB se necessário
    const apiModal = page.locator('[role="dialog"]').filter({ hasText: 'API' });
    if (await apiModal.isVisible()) {
      const apiInput = page.locator('input[type="text"]').first();
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');

      const activateButton = page.locator('button:has-text("Ativar")').first();
      await activateButton.click();

      await expect(apiModal).not.toBeVisible();
    }

    // Navega para a página de configurações
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');
  });

  test('deve ter 3 abas na página de configurações', async ({ page }) => {
    console.log('🔍 Verificando as 3 abas na página de configurações...');

    // Verifica se as 3 abas estão presentes
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    const tabs = page.locator('[role="tab"]');
    const tabsCount = await tabs.count();

    console.log(`📊 Número de abas encontradas: ${tabsCount}`);
    expect(tabsCount).toBe(3);
  });

  test('deve ter aba de Estatísticas funcionando', async ({ page }) => {
    console.log('📊 Testando aba de Estatísticas...');

    // Verifica se a aba de Estatísticas está presente
    const statsTab = page.locator('[role="tab"]:has-text("Estatísticas")');
    await expect(statsTab).toBeVisible();

    // Clica na aba de Estatísticas
    await statsTab.click();

    // Verifica se o conteúdo da aba está visível
    const statsContent = page.locator(
      '[data-state="active"]:has-text("Estatísticas do Usuário")'
    );
    await expect(statsContent).toBeVisible();

    // Verifica se há cards de estatísticas
    const statsCards = page.locator('.bg-secondary\\/30');
    const cardsCount = await statsCards.count();

    console.log(`📊 Cards de estatísticas encontrados: ${cardsCount}`);
    expect(cardsCount).toBeGreaterThan(0);

    // Verifica se há estatísticas detalhadas
    const detailedStats = page.locator('text=Filmes:');
    await expect(detailedStats).toBeVisible();

    console.log('✅ Aba de Estatísticas funcionando corretamente');
  });

  test('deve ter aba de Configurações funcionando', async ({ page }) => {
    console.log('⚙️ Testando aba de Configurações...');

    // Verifica se a aba de Configurações está presente
    const settingsTab = page.locator('[role="tab"]:has-text("Configurações")');
    await expect(settingsTab).toBeVisible();

    // Clica na aba de Configurações
    await settingsTab.click();

    // Verifica se o conteúdo da aba está visível
    const settingsContent = page.locator(
      '[data-state="active"]:has-text("Configurações de Funcionamento")'
    );
    await expect(settingsContent).toBeVisible();

    // Verifica se há seções de configuração
    const apiSection = page.locator('text=Chave da API TMDB');
    await expect(apiSection).toBeVisible();

    const backupSection = page.locator('text=Backup e Restauração');
    await expect(backupSection).toBeVisible();

    const cleanupSection = page.locator('text=Limpeza de Dados');
    await expect(cleanupSection).toBeVisible();

    // Verifica se há botões de ação
    const exportButton = page.locator('button:has-text("Exportar Dados")');
    await expect(exportButton).toBeVisible();

    const importButton = page.locator('button:has-text("Importar Dados")');
    await expect(importButton).toBeVisible();

    console.log('✅ Aba de Configurações funcionando corretamente');
  });

  test('deve ter aba de Perfil funcionando', async ({ page }) => {
    console.log('👤 Testando aba de Perfil...');

    // Verifica se a aba de Perfil está presente
    const profileTab = page.locator('[role="tab"]:has-text("Perfil")');
    await expect(profileTab).toBeVisible();

    // Clica na aba de Perfil
    await profileTab.click();

    // Verifica se o conteúdo da aba está visível
    const profileContent = page.locator(
      '[data-state="active"]:has-text("Configuração de Perfil")'
    );
    await expect(profileContent).toBeVisible();

    // Verifica se há seções do perfil
    const accountInfo = page.locator('text=Informações da Conta');
    await expect(accountInfo).toBeVisible();

    const preferences = page.locator('text=Preferências');
    await expect(preferences).toBeVisible();

    const accountActions = page.locator('text=Ações da Conta');
    await expect(accountActions).toBeVisible();

    // Verifica se há campos de informação
    const emailField = page.locator('input[id="email"]');
    await expect(emailField).toBeVisible();

    const statusField = page.locator('input[id="status"]');
    await expect(statusField).toBeVisible();

    // Verifica se há checkboxes de preferências
    const notificationCheckbox = page.locator('input[id="notifications"]');
    await expect(notificationCheckbox).toBeVisible();

    const recommendationsCheckbox = page.locator('input[id="recommendations"]');
    await expect(recommendationsCheckbox).toBeVisible();

    console.log('✅ Aba de Perfil funcionando corretamente');
  });

  test('deve navegar entre as abas corretamente', async ({ page }) => {
    console.log('🔄 Testando navegação entre abas...');

    // Testa navegação para cada aba
    const tabs = ['Estatísticas', 'Configurações', 'Perfil'];

    for (const tabName of tabs) {
      console.log(`🔄 Navegando para aba: ${tabName}`);

      const tab = page.locator(`[role="tab"]:has-text("${tabName}")`);
      await tab.click();

      // Aguarda a transição
      await page.waitForTimeout(500);

      // Verifica se a aba está ativa
      await expect(tab).toHaveAttribute('data-state', 'active');

      // Verifica se o conteúdo correspondente está visível
      const content = page.locator(
        `[data-state="active"]:has-text("${tabName}")`
      );
      await expect(content).toBeVisible();
    }

    console.log('✅ Navegação entre abas funcionando corretamente');
  });

  test('deve ter design consistente com o tema cinematográfico', async ({
    page,
  }) => {
    console.log('🎨 Verificando design cinematográfico...');

    // Verifica se as abas têm o estilo correto
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toHaveClass(/bg-gradient-cinema/);

    // Verifica se os cards têm o estilo correto
    const cards = page.locator('.bg-gradient-cinema');
    const cardsCount = await cards.count();

    console.log(`🎨 Cards com tema cinematográfico: ${cardsCount}`);
    expect(cardsCount).toBeGreaterThan(0);

    // Verifica se há ícones nas abas
    const tabIcons = page.locator('[role="tab"] svg');
    const iconsCount = await tabIcons.count();

    console.log(`🎨 Ícones nas abas: ${iconsCount}`);
    expect(iconsCount).toBe(3);

    console.log('✅ Design cinematográfico aplicado corretamente');
  });

  test('deve ter responsividade em dispositivos móveis', async ({ page }) => {
    console.log('📱 Testando responsividade...');

    // Redimensiona para mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Verifica se as abas ainda estão visíveis
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    // Verifica se o conteúdo se adapta
    const statsTab = page.locator('[role="tab"]:has-text("Estatísticas")');
    await statsTab.click();

    const statsContent = page.locator(
      '[data-state="active"]:has-text("Estatísticas do Usuário")'
    );
    await expect(statsContent).toBeVisible();

    // Verifica se os cards se reorganizam
    const cards = page.locator('.bg-secondary\\/30');
    await expect(cards.first()).toBeVisible();

    console.log('✅ Responsividade funcionando corretamente');
  });

  test('deve manter funcionalidades existentes', async ({ page }) => {
    console.log('🔧 Verificando funcionalidades existentes...');

    // Navega para a aba de Configurações
    const settingsTab = page.locator('[role="tab"]:has-text("Configurações")');
    await settingsTab.click();

    // Verifica se o botão de exportar funciona
    const exportButton = page.locator('button:has-text("Exportar Dados")');
    await expect(exportButton).toBeEnabled();

    // Verifica se o botão de importar funciona
    const importButton = page.locator('button:has-text("Importar Dados")');
    await expect(importButton).toBeEnabled();

    // Verifica se os botões de limpeza estão presentes
    const clearButtons = page.locator('button:has-text("Limpar")');
    const clearButtonsCount = await clearButtons.count();

    console.log(`🔧 Botões de limpeza encontrados: ${clearButtonsCount}`);
    expect(clearButtonsCount).toBeGreaterThan(0);

    console.log('✅ Funcionalidades existentes mantidas');
  });
});
