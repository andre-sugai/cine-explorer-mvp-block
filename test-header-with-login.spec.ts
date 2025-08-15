import { test, expect } from '@playwright/test';

/**
 * Teste completo com login para verificar a unificação dos ícones
 */
test.describe('Header - Unificação de Ícones com Login', () => {
  test('deve verificar a unificação dos ícones após login', async ({
    page,
  }) => {
    // Acessa a página
    await page.goto('http://localhost:8081');

    // Configura a API TMDB se necessário
    const apiModal = page.locator('[role="dialog"]').filter({ hasText: 'API' });
    if (await apiModal.isVisible()) {
      console.log('Configurando API TMDB...');
      const apiInput = page.locator('input[type="text"]').first();
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');

      const activateButton = page.locator('button:has-text("Ativar")').first();
      await activateButton.click();

      await expect(apiModal).not.toBeVisible();
      console.log('API configurada com sucesso');
    }

    // Faz login
    console.log('Iniciando processo de login...');
    const loginButton = page.locator('button:has-text("Entrar")').first();
    await loginButton.click();

    // Aguarda o modal de login
    const authModal = page
      .locator('[role="dialog"]')
      .filter({ hasText: 'Entrar' });
    await expect(authModal).toBeVisible();

    // Preenche credenciais
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('guitarfreaks@gmail.com');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Nirvana!1978');

    // Submete o formulário
    const submitButton = page
      .locator('[role="dialog"] button[type="submit"]')
      .first();
    await submitButton.click();

    // Aguarda o login ser concluído
    await expect(authModal).not.toBeVisible();
    console.log('Login realizado com sucesso');

    // Aguarda um pouco para o estado ser atualizado
    await page.waitForTimeout(3000);

    // Verifica se não há ícone separado de configurações
    const settingsButtons = page.locator(
      'button:has(svg[data-lucide="settings"])'
    );
    const settingsCount = await settingsButtons.count();
    console.log(
      `Encontrados ${settingsCount} ícones de configurações separados`
    );

    // Verifica se existe o avatar do usuário
    const avatarButton = page.locator(
      'button:has([data-radix-avatar-fallback])'
    );
    await expect(avatarButton).toBeVisible();
    console.log('Avatar do usuário encontrado');

    // Clica no avatar para abrir o dropdown
    await avatarButton.click();
    console.log('Dropdown do perfil aberto');

    // Aguarda o dropdown aparecer
    await page.waitForTimeout(1000);

    // Verifica se há opção de configurações no dropdown
    const settingsInDropdown = page.locator('a[href="/configuracoes"]');
    await expect(settingsInDropdown).toBeVisible();
    console.log('Opção de configurações encontrada no dropdown');

    // Verifica se não há configurações na navegação principal
    const navSettings = page.locator('nav a:has-text("Configurações")');
    const navSettingsCount = await navSettings.count();
    console.log(
      `Encontradas ${navSettingsCount} opções de configurações na navegação principal`
    );

    // Verifica se todos os outros itens de navegação estão presentes
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
    console.log('Todos os itens de navegação principais estão presentes');

    // Testa navegação para configurações
    await settingsInDropdown.click();
    await expect(page).toHaveURL(/.*\/configuracoes/);
    console.log('Navegação para configurações funcionando');

    // Volta para a home
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(1000);

    // Testa no mobile
    console.log('Testando versão mobile...');
    await page.setViewportSize({ width: 375, height: 667 });

    // Abre o menu mobile
    const menuButton = page.locator('button:has(svg[data-lucide="menu"])');
    await menuButton.click();

    // Verifica se configurações está no menu mobile
    const settingsInMobile = page.locator(
      'a[href="/configuracoes"]:has-text("Configurações")'
    );
    await expect(settingsInMobile).toBeVisible();
    console.log('Configurações encontrada no menu mobile');

    // Resultados finais
    expect(settingsCount).toBe(0); // Não deve haver ícone separado
    expect(navSettingsCount).toBe(0); // Não deve haver na navegação principal

    console.log(
      '🎉 TODOS OS TESTES PASSARAM! A unificação dos ícones está funcionando corretamente!'
    );
  });
});
