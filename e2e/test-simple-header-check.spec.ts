import { test, expect } from '@playwright/test';

/**
 * Teste simples para verificar a unificação dos ícones no header
 */
test.describe('Verificação Simples - Unificação de Ícones', () => {
  test('deve verificar se a unificação dos ícones foi implementada corretamente', async ({
    page,
  }) => {
    // Acessa a página
    await page.goto('http://localhost:8081');

    // Aguarda a página carregar
    await page.waitForLoadState('networkidle');

    // Verifica se não há ícone separado de configurações no header
    const settingsButtons = page.locator(
      'button:has(svg[data-lucide="settings"])'
    );
    const settingsCount = await settingsButtons.count();

    console.log(
      `Encontrados ${settingsCount} ícones de configurações no header`
    );

    // Verifica se existe o avatar do usuário
    const avatarElements = page.locator(
      '[data-radix-avatar-fallback], .avatar, button:has([data-radix-avatar-fallback])'
    );
    const avatarCount = await avatarElements.count();

    console.log(`Encontrados ${avatarCount} elementos de avatar`);

    // Verifica se há botão de login
    const loginButtons = page.locator('button:has-text("Entrar")');
    const loginCount = await loginButtons.count();

    console.log(`Encontrados ${loginCount} botões de "Entrar"`);

    // Se estiver logado, verifica o menu do perfil
    if (avatarCount > 0) {
      console.log('Usuário parece estar logado - verificando menu do perfil');

      // Tenta clicar no avatar
      const avatarButton = avatarElements.first();
      await avatarButton.click();

      // Aguarda um pouco para o dropdown aparecer
      await page.waitForTimeout(1000);

      // Verifica se há opção de configurações no dropdown
      const settingsInDropdown = page.locator(
        'a[href="/configuracoes"], [role="menuitem"]:has-text("Configurações")'
      );
      const dropdownSettingsCount = await settingsInDropdown.count();

      console.log(
        `Encontradas ${dropdownSettingsCount} opções de configurações no dropdown`
      );

      // Verifica se não há configurações na navegação principal
      const navSettings = page.locator('nav a:has-text("Configurações")');
      const navSettingsCount = await navSettings.count();

      console.log(
        `Encontradas ${navSettingsCount} opções de configurações na navegação principal`
      );

      // Resultados esperados
      expect(settingsCount).toBe(0); // Não deve haver ícone separado
      expect(dropdownSettingsCount).toBeGreaterThan(0); // Deve haver no dropdown
      expect(navSettingsCount).toBe(0); // Não deve haver na navegação principal

      console.log('✅ Teste de unificação dos ícones PASSOU!');
    } else {
      console.log(
        'Usuário não está logado - verificando apenas elementos básicos'
      );

      // Verifica se não há ícone separado de configurações
      expect(settingsCount).toBe(0);

      console.log('✅ Teste básico PASSOU! (usuário não logado)');
    }
  });
});
