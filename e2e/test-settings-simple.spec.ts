import { test, expect } from '@playwright/test';

/**
 * Teste simples para verificar as 3 abas na página de configurações
 */
test.describe('Painel de Configurações - Verificação Simples', () => {
  test('deve verificar se as 3 abas foram implementadas corretamente', async ({
    page,
  }) => {
    console.log('🔍 Verificando implementação das 3 abas...');

    // Acessa diretamente a página de configurações
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');

    // Verifica se a página carregou
    const pageTitle = page.locator('h2:has-text("Configurações")');
    await expect(pageTitle).toBeVisible();
    console.log('✅ Página de configurações carregada');

    // Verifica se as 3 abas estão presentes
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    const tabs = page.locator('[role="tab"]');
    const tabsCount = await tabs.count();

    console.log(`📊 Número de abas encontradas: ${tabsCount}`);
    expect(tabsCount).toBe(3);

    // Verifica se os nomes das abas estão corretos
    const expectedTabNames = ['Estatísticas', 'Configurações', 'Perfil'];
    for (let i = 0; i < expectedTabNames.length; i++) {
      const tab = tabs.nth(i);
      const tabText = await tab.textContent();
      console.log(`📋 Aba ${i + 1}: ${tabText}`);
      expect(tabText).toContain(expectedTabNames[i]);
    }

    // Verifica se há ícones nas abas
    const tabIcons = page.locator('[role="tab"] svg');
    const iconsCount = await tabIcons.count();
    console.log(`🎨 Ícones nas abas: ${iconsCount}`);
    expect(iconsCount).toBe(3);

    // Testa navegação entre abas
    console.log('🔄 Testando navegação entre abas...');
    for (let i = 0; i < 3; i++) {
      const tab = tabs.nth(i);
      await tab.click();
      await page.waitForTimeout(500);

      // Verifica se a aba está ativa
      await expect(tab).toHaveAttribute('data-state', 'active');
      console.log(`✅ Aba ${i + 1} ativada`);
    }

    // Verifica se o conteúdo das abas está presente
    console.log('📋 Verificando conteúdo das abas...');

    // Aba de Estatísticas
    const statsTab = page.locator('[role="tab"]:has-text("Estatísticas")');
    await statsTab.click();
    await page.waitForTimeout(500);

    const statsContent = page.locator('text=Estatísticas do Usuário');
    await expect(statsContent).toBeVisible();
    console.log('✅ Conteúdo da aba Estatísticas presente');

    // Aba de Configurações
    const settingsTab = page.locator('[role="tab"]:has-text("Configurações")');
    await settingsTab.click();
    await page.waitForTimeout(500);

    const settingsContent = page.locator('text=Configurações de Funcionamento');
    await expect(settingsContent).toBeVisible();
    console.log('✅ Conteúdo da aba Configurações presente');

    // Aba de Perfil
    const profileTab = page.locator('[role="tab"]:has-text("Perfil")');
    await profileTab.click();
    await page.waitForTimeout(500);

    const profileContent = page.locator('text=Configuração de Perfil');
    await expect(profileContent).toBeVisible();
    console.log('✅ Conteúdo da aba Perfil presente');

    // Verifica design cinematográfico
    console.log('🎨 Verificando design cinematográfico...');
    const cards = page.locator('.bg-gradient-cinema');
    const cardsCount = await cards.count();
    console.log(`🎨 Cards com tema cinematográfico: ${cardsCount}`);
    expect(cardsCount).toBeGreaterThan(0);

    // Testa responsividade
    console.log('📱 Testando responsividade...');
    await page.setViewportSize({ width: 375, height: 667 });

    // Verifica se as abas ainda estão visíveis em mobile
    await expect(tabsList).toBeVisible();

    // Testa navegação em mobile
    await statsTab.click();
    await page.waitForTimeout(500);
    await expect(statsContent).toBeVisible();

    console.log('✅ Responsividade funcionando');

    // Resultado final
    console.log('');
    console.log('🎉 VERIFICAÇÃO COMPLETA FINALIZADA!');
    console.log('');
    console.log('✅ RESULTADOS:');
    console.log('   ✅ 3 abas implementadas corretamente');
    console.log('   ✅ Nomes das abas corretos');
    console.log('   ✅ Ícones presentes');
    console.log('   ✅ Navegação entre abas funcionando');
    console.log('   ✅ Conteúdo específico de cada aba presente');
    console.log('   ✅ Design cinematográfico aplicado');
    console.log('   ✅ Responsividade funcionando');
    console.log('');
    console.log('🎯 NOVO PAINEL DE CONFIGURAÇÕES IMPLEMENTADO COM SUCESSO!');
  });
});
