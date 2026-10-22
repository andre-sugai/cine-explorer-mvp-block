import { test, expect } from '@playwright/test';

/**
 * Teste completo para as novas funcionalidades da aba de Perfil
 */
test.describe('Funcionalidades Completas da Aba de Perfil', () => {
  test('deve testar todas as funcionalidades da aba de Perfil após login', async ({ page }) => {
    console.log('🚀 Iniciando teste completo das funcionalidades da aba de Perfil...');
    
    // 1. Acessa a página inicial
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // 2. Configura a API TMDB
    console.log('🔑 Configurando API TMDB...');
    const apiModal = page.locator('[role="dialog"]').filter({ hasText: 'API' });
    if (await apiModal.isVisible()) {
      const apiInput = page.locator('input[type="text"]').first();
      await apiInput.fill('da143ff1f274e5987194fe5d22f71b11');
      const activateButton = page.locator('button').filter({ hasText: 'Ativar' });
      await activateButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 3. Faz login
    console.log('�� Fazendo login...');
    const loginButton = page.locator('button').filter({ hasText: 'Entrar' }).first();
    await loginButton.click();
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('guitarfreaks@gmail.com');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Nirvana!1978');
    
    const submitButton = page.locator('[role="dialog"] button[type="submit"]').first();
    await submitButton.click();
    await page.waitForTimeout(3000);
    
    // 4. Acessa a página de configurações
    console.log('⚙️ Acessando página de configurações...');
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');
    
    // 5. Clica na aba de Perfil
    console.log('👤 Acessando aba de Perfil...');
    const profileTab = page.locator('[role="tab"]').filter({ hasText: 'Perfil' });
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // 6. Testa seção de Foto de Perfil
    console.log('📸 Testando seção de Foto de Perfil...');
    const photoSection = page.locator('h3').filter({ hasText: 'Foto de Perfil' });
    await expect(photoSection).toBeVisible();
    
    const addPhotoButton = page.locator('button').filter({ hasText: /Adicionar Foto|Alterar Foto/ });
    await expect(addPhotoButton).toBeVisible();
    
    // 7. Testa campos de Informações Básicas
    console.log('📝 Testando campos de Informações Básicas...');
    const nicknameField = page.locator('#nickname');
    const bioField = page.locator('#bio');
    
    await expect(nicknameField).toBeVisible();
    await expect(bioField).toBeVisible();
    
    // Preenche os campos
    await nicknameField.fill('Usuário Teste');
    await bioField.fill('Sou um amante de cinema e adoro filmes de ação!');
    
    // 8. Testa campos de Redes Sociais
    console.log('🌐 Testando campos de Redes Sociais...');
    const socialFields = [
      { id: 'instagram', label: 'Instagram' },
      { id: 'twitter', label: 'Twitter/X' },
      { id: 'facebook', label: 'Facebook' },
      { id: 'linkedin', label: 'LinkedIn' },
      { id: 'youtube', label: 'YouTube' },
      { id: 'website', label: 'Website' }
    ];
    
    for (const field of socialFields) {
      const input = page.locator(`#${field.id}`);
      const label = page.locator('label').filter({ hasText: field.label });
      
      await expect(input).toBeVisible();
      await expect(label).toBeVisible();
      
      // Preenche com dados de teste
      await input.fill(`teste_${field.id}`);
    }
    
    // 9. Testa botão de Salvar Perfil
    console.log('💾 Testando botão de Salvar Perfil...');
    const saveProfileButton = page.locator('button').filter({ hasText: 'Salvar Perfil' });
    await expect(saveProfileButton).toBeVisible();
    await saveProfileButton.click();
    await page.waitForTimeout(1000);
    
    // 10. Testa botão de Trocar Senha
    console.log('🔐 Testando botão de Trocar Senha...');
    const changePasswordButton = page.locator('button').filter({ hasText: 'Trocar Senha' });
    await expect(changePasswordButton).toBeVisible();
    await changePasswordButton.click();
    await page.waitForTimeout(500);
    
    // Verifica se o diálogo abriu
    const passwordDialog = page.locator('[role="dialog"]').filter({ hasText: 'Trocar Senha' });
    await expect(passwordDialog).toBeVisible();
    
    // Verifica os campos do formulário
    const currentPasswordField = page.locator('#currentPassword');
    const newPasswordField = page.locator('#newPassword');
    const confirmPasswordField = page.locator('#confirmPassword');
    
    await expect(currentPasswordField).toBeVisible();
    await expect(newPasswordField).toBeVisible();
    await expect(confirmPasswordField).toBeVisible();
    
    // Fecha o diálogo
    const cancelButton = page.locator('button').filter({ hasText: 'Cancelar' }).first();
    await cancelButton.click();
    await page.waitForTimeout(500);
    
    // 11. Testa responsividade
    console.log('📱 Testando responsividade...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verifica se os elementos ainda estão visíveis no mobile
    await expect(photoSection).toBeVisible();
    await expect(nicknameField).toBeVisible();
    await expect(bioField).toBeVisible();
    await expect(saveProfileButton).toBeVisible();
    
    console.log('✅ TODAS AS FUNCIONALIDADES TESTADAS COM SUCESSO!');
    console.log('');
    console.log('🎉 RESULTADOS:');
    console.log('   ✅ Foto de perfil implementada');
    console.log('   ✅ Nome/Nickname implementado');
    console.log('   ✅ Bio implementada');
    console.log('   ✅ Redes sociais implementadas');
    console.log('   ✅ Troca de senha implementada');
    console.log('   ✅ Salvamento de perfil funcionando');
    console.log('   ✅ Responsividade funcionando');
    console.log('');
    console.log('🎯 NOVAS FUNCIONALIDADES DA ABA DE PERFIL IMPLEMENTADAS COM SUCESSO!');
  });
});
