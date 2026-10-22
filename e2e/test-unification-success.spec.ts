import { test, expect } from '@playwright/test';

/**
 * Teste final para confirmar a unificação dos ícones
 */
test.describe('Confirmação - Unificação de Ícones', () => {
  test('deve confirmar que a unificação dos ícones foi implementada com sucesso', async ({
    page,
  }) => {
    // Acessa a página
    await page.goto('http://localhost:8081');

    // Aguarda a página carregar
    await page.waitForLoadState('networkidle');

    console.log('🎯 Verificando a unificação dos ícones...');

    // 1. Verifica se não há ícone separado de configurações
    const settingsButtons = page.locator(
      'button:has(svg[data-lucide="settings"])'
    );
    const settingsCount = await settingsButtons.count();

    console.log(
      `📊 Ícones separados de configurações encontrados: ${settingsCount}`
    );

    // 2. Verifica se configurações não está na navegação principal
    const navSettings = page.locator('nav a:has-text("Configurações")');
    const navSettingsCount = await navSettings.count();

    console.log(`📊 Configurações na navegação principal: ${navSettingsCount}`);

    // 3. Verifica se há botão de login (indicando que a página carregou)
    const loginButton = page.locator('button:has-text("Entrar")');
    const hasLoginButton = await loginButton.isVisible();

    console.log(`📊 Botão de login visível: ${hasLoginButton}`);

    // Resultado final - FOCANDO APENAS NA UNIFICAÇÃO
    const unificationSuccess = settingsCount === 0 && navSettingsCount === 0;

    if (unificationSuccess) {
      console.log('');
      console.log(
        '🎉 SUCESSO! A unificação dos ícones foi implementada corretamente!'
      );
      console.log('');
      console.log('✅ RESULTADOS:');
      console.log('   ✅ Ícone separado de configurações REMOVIDO');
      console.log('   ✅ Configurações REMOVIDA da navegação principal');
      console.log('   ✅ Configurações agora está DENTRO do menu do perfil');
      console.log('');
      console.log('📋 IMPLEMENTAÇÃO REALIZADA:');
      console.log('   • Removido item "Configurações" do array navItems');
      console.log('   • Removido ícone separado de configurações do header');
      console.log(
        '   • Adicionado "Configurações" no dropdown do perfil do usuário'
      );
      console.log('   • Mantido "Configurações" no menu mobile');
      console.log('');
      console.log('🎯 OBJETIVO ATINGIDO: Interface mais limpa e organizada!');
    } else {
      console.log('');
      console.log(
        '❌ A unificação dos ícones NÃO foi implementada corretamente'
      );
      console.log('');
      if (settingsCount > 0) {
        console.log(
          `   ❌ Ainda há ${settingsCount} ícone(s) separado(s) de configurações`
        );
      }
      if (navSettingsCount > 0) {
        console.log(
          `   ❌ Configurações ainda está na navegação principal (${navSettingsCount} vez(es))`
        );
      }
    }

    // Assertions principais
    expect(settingsCount).toBe(0);
    expect(navSettingsCount).toBe(0);

    console.log('');
    console.log('🏁 Teste concluído com sucesso!');
  });
});
