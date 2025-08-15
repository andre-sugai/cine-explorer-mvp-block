import { test, expect } from '@playwright/test';

/**
 * Teste simples para verificar as funcionalidades da aba de Perfil
 */
test.describe('Funcionalidades da Aba de Perfil - Teste Simples', () => {
  test('deve verificar se as novas funcionalidades foram implementadas', async ({ page }) => {
    console.log('🔍 Verificando implementação das funcionalidades da aba de Perfil...');
    
    // Acessa diretamente a página de configurações
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');
    
    // Clica na aba de Perfil
    const profileTab = page.locator('[role="tab"]').filter({ hasText: 'Perfil' });
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // 1. Verifica seção de Foto de Perfil
    console.log('📸 Verificando seção de Foto de Perfil...');
    const photoSection = page.locator('h3').filter({ hasText: 'Foto de Perfil' });
    await expect(photoSection).toBeVisible();
    
    const addPhotoButton = page.locator('button').filter({ hasText: /Adicionar Foto|Alterar Foto/ });
    await expect(addPhotoButton).toBeVisible();
    
    // 2. Verifica campos de Informações Básicas
    console.log('📝 Verificando campos de Informações Básicas...');
    const nicknameField = page.locator('#nickname');
    const bioField = page.locator('#bio');
    
    await expect(nicknameField).toBeVisible();
    await expect(bioField).toBeVisible();
    
    // 3. Verifica campos de Redes Sociais
    console.log('🌐 Verificando campos de Redes Sociais...');
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
    }
    
    // 4. Verifica botão de Salvar Perfil
    console.log('💾 Verificando botão de Salvar Perfil...');
    const saveProfileButton = page.locator('button').filter({ hasText: 'Salvar Perfil' });
    await expect(saveProfileButton).toBeVisible();
    
    // 5. Verifica botão de Trocar Senha
    console.log('🔐 Verificando botão de Trocar Senha...');
    const changePasswordButton = page.locator('button').filter({ hasText: 'Trocar Senha' });
    await expect(changePasswordButton).toBeVisible();
    
    // 6. Testa funcionalidade dos campos
    console.log('🔄 Testando funcionalidade dos campos...');
    await nicknameField.fill('Usuário Teste');
    await bioField.fill('Bio de teste para verificar funcionalidade');
    
    // Preenche algumas redes sociais
    const instagramField = page.locator('#instagram');
    await instagramField.fill('@teste_usuario');
    
    const twitterField = page.locator('#twitter');
    await twitterField.fill('@teste_twitter');
    
    // 7. Testa botão de trocar senha
    console.log('🔐 Testando diálogo de trocar senha...');
    await changePasswordButton.click();
    await page.waitForTimeout(500);
    
    const passwordDialog = page.locator('[role="dialog"]').filter({ hasText: 'Trocar Senha' });
    await expect(passwordDialog).toBeVisible();
    
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
    
    // 8. Testa responsividade
    console.log('📱 Testando responsividade...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await expect(photoSection).toBeVisible();
    await expect(nicknameField).toBeVisible();
    await expect(bioField).toBeVisible();
    await expect(saveProfileButton).toBeVisible();
    
    console.log('');
    console.log('🎉 VERIFICAÇÃO COMPLETA FINALIZADA!');
    console.log('');
    console.log('✅ RESULTADOS:');
    console.log('   ✅ Seção de Foto de Perfil implementada');
    console.log('   ✅ Campo Nome/Nickname implementado');
    console.log('   ✅ Campo Bio implementado');
    console.log('   ✅ Campos de Redes Sociais implementados');
    console.log('   ✅ Botão Salvar Perfil implementado');
    console.log('   ✅ Botão Trocar Senha implementado');
    console.log('   ✅ Diálogo de troca de senha funcionando');
    console.log('   ✅ Responsividade funcionando');
    console.log('   ✅ Funcionalidade dos campos testada');
    console.log('');
    console.log('🎯 NOVAS FUNCIONALIDADES DA ABA DE PERFIL IMPLEMENTADAS COM SUCESSO!');
  });
});
