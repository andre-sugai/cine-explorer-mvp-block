import { test, expect } from '@playwright/test';

/**
 * Teste para verificar a unificação dos ícones no header
 * - Configurações deve estar dentro do menu do perfil
 * - Não deve haver ícone separado de configurações
 * - Navegação deve funcionar corretamente
 */
test.describe('Header - Unificação de Ícones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Configura a API TMDB se o modal aparecer
    const apiModal = page.locator(
      '[data-testid="api-config-modal"], .api-config-modal, [role="dialog"]'
    );
    if (await apiModal.isVisible()) {
      const apiInput = page
        .locator(
          'input[placeholder*="API"], input[placeholder*="chave"], input[type="text"]'
        )
        .first();
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');

      const activateButton = page
        .locator(
          'button:has-text("Ativar"), button:has-text("Confirmar"), button:has-text("Entrar")'
        )
        .first();
      await activateButton.click();

      // Aguarda o modal fechar
      await expect(apiModal).not.toBeVisible();
    }

    // Faz login se não estiver logado
    const loginButton = page.locator('button:has-text("Entrar")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();

      // Aguarda o modal de login aparecer
      const authModal = page.locator(
        '[role="dialog"], .auth-modal, [data-testid="auth-modal"]'
      );
      await expect(authModal).toBeVisible();

      // Preenche as credenciais
      const emailInput = page.locator(
        'input[type="email"], input[placeholder*="email"], input[name="email"]'
      );
      await emailInput.fill('guitarfreaks@gmail.com');

      const passwordInput = page.locator(
        'input[type="password"], input[placeholder*="senha"], input[name="password"]'
      );
      await passwordInput.fill('Nirvana!1978');

      // Clica no botão de login específico do modal de autenticação
      const submitButton = page
        .locator('[role="dialog"] button[type="submit"]')
        .first();
      await submitButton.click();

      // Aguarda o login ser concluído
      await expect(authModal).not.toBeVisible();

      // Aguarda um pouco para garantir que o estado foi atualizado
      await page.waitForTimeout(2000);
    }
  });

  test('deve ter apenas o ícone do perfil do usuário (sem ícone separado de configurações)', async ({
    page,
  }) => {
    // Verifica se não há ícone separado de configurações
    const settingsIcon = page.locator(
      'button:has(svg[data-lucide="settings"])'
    );
    await expect(settingsIcon).toHaveCount(0);
  });

  test('deve ter o menu do perfil com opção de configurações', async ({
    page,
  }) => {
    // Verifica se existe o avatar do usuário
    const avatarButton = page.locator(
      'button:has([data-radix-avatar-fallback])'
    );
    await expect(avatarButton).toBeVisible();

    // Clica no avatar para abrir o dropdown
    await avatarButton.click();

    // Verifica se o dropdown contém a opção de configurações
    const settingsOption = page.locator('a[href="/configuracoes"]');
    await expect(settingsOption).toBeVisible();
    await expect(settingsOption).toContainText('Configurações');
  });

  test('deve navegar para configurações através do menu do perfil', async ({
    page,
  }) => {
    // Abre o menu do perfil
    const avatarButton = page.locator(
      'button:has([data-radix-avatar-fallback])'
    );
    await avatarButton.click();

    // Clica na opção de configurações
    const settingsOption = page.locator('a[href="/configuracoes"]');
    await settingsOption.click();

    // Verifica se navegou para a página de configurações
    await expect(page).toHaveURL(/.*\/configuracoes/);
  });

  test('deve ter navegação principal sem configurações', async ({ page }) => {
    // Verifica se os itens de navegação não incluem configurações
    const navItems = page.locator('nav a');
    const navTexts = await navItems.allTextContents();

    // Verifica se não há "Configurações" na navegação principal
    expect(navTexts.some((text) => text.includes('Configurações'))).toBeFalsy();
  });

  test('deve ter todos os outros itens de navegação', async ({ page }) => {
    // Verifica se os itens principais estão presentes
    const expectedItems = [
      'Home',
      'Favoritos',
      'Quero Assistir',
      'Vistos',
      'Recomendações',
    ];

    for (const item of expectedItems) {
      const navItem = page.locator(`nav a:has-text("${item}")`);
      await expect(navItem).toBeVisible();
    }
  });

  test('deve funcionar no menu mobile', async ({ page }) => {
    // Redimensiona para mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Abre o menu mobile
    const menuButton = page.locator('button:has(svg[data-lucide="menu"])');
    await menuButton.click();

    // Verifica se o menu mobile contém configurações na seção do usuário
    const settingsInMobile = page.locator(
      'a[href="/configuracoes"]:has-text("Configurações")'
    );
    await expect(settingsInMobile).toBeVisible();
  });

  test('deve navegar para configurações pelo menu mobile', async ({ page }) => {
    // Redimensiona para mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Abre o menu mobile
    const menuButton = page.locator('button:has(svg[data-lucide="menu"])');
    await menuButton.click();

    // Clica em configurações no menu mobile
    const settingsOption = page.locator(
      'a[href="/configuracoes"]:has-text("Configurações")'
    );
    await settingsOption.click();

    // Verifica se navegou para configurações
    await expect(page).toHaveURL(/.*\/configuracoes/);
  });

  test('deve ter interface limpa sem elementos duplicados', async ({
    page,
  }) => {
    // Verifica se não há múltiplos ícones de configurações
    const allSettingsIcons = page.locator('svg[data-lucide="settings"]');
    const settingsCount = await allSettingsIcons.count();

    // Deve ter apenas os ícones dentro dos menus (não ícones separados)
    expect(settingsCount).toBeLessThanOrEqual(2); // 1 no desktop dropdown + 1 no mobile menu
  });
});
