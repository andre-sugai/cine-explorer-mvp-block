import { test, expect } from '@playwright/test';

/**
 * Teste completo para o novo painel de configurações com 3 abas
 */
test.describe('Painel de Configurações - Teste Completo', () => {
  test('deve testar o novo painel de configurações com 3 abas após login', async ({
    page,
  }) => {
    console.log('🚀 Iniciando teste completo do painel de configurações...');

    // 1. Acessa a página inicial
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // 2. Configura a API TMDB
    console.log('🔑 Configurando API TMDB...');
    const apiModal = page.locator('[role="dialog"]').filter({ hasText: 'API' });
    if (await apiModal.isVisible()) {
      const apiInput = page.locator('input[type="text"]').first();
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');

      const activateButton = page.locator('button:has-text("Ativar")').first();
      await activateButton.click();

      await expect(apiModal).not.toBeVisible();
      console.log('✅ API configurada com sucesso');
    }

    // 3. Faz login
    console.log('👤 Fazendo login...');
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
    console.log('✅ Login realizado com sucesso');

    // Aguarda um pouco para o estado ser atualizado
    await page.waitForTimeout(3000);

    // 4. Navega para a página de configurações
    console.log('⚙️ Navegando para configurações...');
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');

    // 5. Verifica se as 3 abas estão presentes
    console.log('🔍 Verificando as 3 abas...');
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    const tabs = page.locator('[role="tab"]');
    const tabsCount = await tabs.count();

    console.log(`📊 Número de abas encontradas: ${tabsCount}`);
    expect(tabsCount).toBe(3);

    // 6. Testa cada aba individualmente
    const tabTests = [
      {
        name: 'Estatísticas',
        expectedContent: 'Estatísticas do Usuário',
        expectedElements: [
          'Total de Favoritos',
          'Itens Assistidos',
          'Tempo Total',
        ],
      },
      {
        name: 'Configurações',
        expectedContent: 'Configurações de Funcionamento',
        expectedElements: [
          'Chave da API TMDB',
          'Backup e Restauração',
          'Limpeza de Dados',
        ],
      },
      {
        name: 'Perfil',
        expectedContent: 'Configuração de Perfil',
        expectedElements: [
          'Informações da Conta',
          'Preferências',
          'Ações da Conta',
        ],
      },
    ];

    for (const tabTest of tabTests) {
      console.log(`📋 Testando aba: ${tabTest.name}`);

      // Clica na aba
      const tab = page.locator(`[role="tab"]:has-text("${tabTest.name}")`);
      await tab.click();

      // Aguarda a transição
      await page.waitForTimeout(500);

      // Verifica se a aba está ativa
      await expect(tab).toHaveAttribute('data-state', 'active');

      // Verifica se o conteúdo principal está visível
      const content = page.locator(
        `[data-state="active"]:has-text("${tabTest.expectedContent}")`
      );
      await expect(content).toBeVisible();

      // Verifica se os elementos esperados estão presentes
      for (const element of tabTest.expectedElements) {
        const elementLocator = page.locator(`text=${element}`);
        await expect(elementLocator).toBeVisible();
        console.log(`  ✅ ${element} encontrado`);
      }

      console.log(`✅ Aba ${tabTest.name} funcionando corretamente`);
    }

    // 7. Testa navegação entre abas
    console.log('🔄 Testando navegação entre abas...');
    for (let i = 0; i < 3; i++) {
      const tab = page.locator('[role="tab"]').nth(i);
      await tab.click();
      await page.waitForTimeout(300);

      await expect(tab).toHaveAttribute('data-state', 'active');
    }
    console.log('✅ Navegação entre abas funcionando');

    // 8. Testa funcionalidades específicas
    console.log('🔧 Testando funcionalidades específicas...');

    // Testa aba de Configurações
    const settingsTab = page.locator('[role="tab"]:has-text("Configurações")');
    await settingsTab.click();

    // Verifica botões de ação
    const exportButton = page.locator('button:has-text("Exportar Dados")');
    await expect(exportButton).toBeEnabled();

    const importButton = page.locator('button:has-text("Importar Dados")');
    await expect(importButton).toBeEnabled();

    // Testa aba de Perfil
    const profileTab = page.locator('[role="tab"]:has-text("Perfil")');
    await profileTab.click();

    // Verifica campos de informação
    const emailField = page.locator('input[id="email"]');
    await expect(emailField).toBeVisible();

    const statusField = page.locator('input[id="status"]');
    await expect(statusField).toBeVisible();

    // Verifica checkboxes de preferências
    const notificationCheckbox = page.locator('input[id="notifications"]');
    await expect(notificationCheckbox).toBeVisible();

    const recommendationsCheckbox = page.locator('input[id="recommendations"]');
    await expect(recommendationsCheckbox).toBeVisible();

    console.log('✅ Funcionalidades específicas testadas');

    // 9. Testa responsividade
    console.log('📱 Testando responsividade...');
    await page.setViewportSize({ width: 375, height: 667 });

    // Verifica se as abas ainda estão visíveis
    await expect(tabsList).toBeVisible();

    // Testa navegação em mobile
    const statsTab = page.locator('[role="tab"]:has-text("Estatísticas")');
    await statsTab.click();

    const statsContent = page.locator(
      '[data-state="active"]:has-text("Estatísticas do Usuário")'
    );
    await expect(statsContent).toBeVisible();

    console.log('✅ Responsividade funcionando');

    // 10. Resultado final
    console.log('');
    console.log('🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');
    console.log('');
    console.log('✅ RESULTADOS:');
    console.log('   ✅ API TMDB configurada');
    console.log('   ✅ Login realizado com sucesso');
    console.log('   ✅ 3 abas implementadas corretamente');
    console.log('   ✅ Navegação entre abas funcionando');
    console.log('   ✅ Conteúdo específico de cada aba presente');
    console.log('   ✅ Funcionalidades existentes mantidas');
    console.log('   ✅ Responsividade funcionando');
    console.log('');
    console.log('🎯 NOVO PAINEL DE CONFIGURAÇÕES IMPLEMENTADO COM SUCESSO!');
  });
});
