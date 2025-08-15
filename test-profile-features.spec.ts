import { test, expect } from '@playwright/test';

/**
 * Teste para verificar as novas funcionalidades da aba de Perfil
 */
test.describe('Funcionalidades da Aba de Perfil', () => {
  test('deve verificar upload de foto de perfil', async ({ page }) => {
    console.log('📸 Testando upload de foto de perfil...');
    
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');
    
    // Clica na aba de Perfil
    const profileTab = page.locator('[role="tab"]').filter({ hasText: 'Perfil' });
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // Verifica se a seção de foto de perfil está presente
    const photoSection = page.locator('h3').filter({ hasText: 'Foto de Perfil' });
    await expect(photoSection).toBeVisible();
    
    // Verifica se o botão de adicionar foto está presente
    const addPhotoButton = page.locator('button').filter({ hasText: 'Adicionar Foto' });
    await expect(addPhotoButton).toBeVisible();
    
    console.log('✅ Seção de foto de perfil verificada');
  });
  
  test('deve verificar campos de informações básicas', async ({ page }) => {
    console.log('📝 Testando campos de informações básicas...');
    
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');
    
    const profileTab = page.locator('[role="tab"]').filter({ hasText: 'Perfil' });
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // Verifica se os campos estão presentes
    const nicknameField = page.locator('#nickname');
    const bioField = page.locator('#bio');
    
    await expect(nicknameField).toBeVisible();
    await expect(bioField).toBeVisible();
    
    // Testa a funcionalidade dos campos
    await nicknameField.fill('Teste Usuário');
    await bioField.fill('Sou um amante de cinema e adoro filmes de ação!');
    
    console.log('✅ Campos de informações básicas verificados');
  });
  
  test('deve verificar campos de redes sociais', async ({ page }) => {
    console.log('🌐 Testando campos de redes sociais...');
    
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');
    
    const profileTab = page.locator('[role="tab"]').filter({ hasText: 'Perfil' });
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // Verifica se os campos de redes sociais estão presentes
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
      
      // Testa preenchimento
      await input.fill(`teste_${field.id}`);
    }
    
    console.log('✅ Campos de redes sociais verificados');
  });
  
  test('deve verificar botão de trocar senha', async ({ page }) => {
    console.log('🔐 Testando botão de trocar senha...');
    
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');
    
    const profileTab = page.locator('[role="tab"]').filter({ hasText: 'Perfil' });
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // Verifica se o botão está presente
    const changePasswordButton = page.locator('button').filter({ hasText: 'Trocar Senha' });
    await expect(changePasswordButton).toBeVisible();
    
    // Clica no botão e verifica se o diálogo abre
    await changePasswordButton.click();
    await page.waitForTimeout(500);
    
    const passwordDialog = page.locator('[role="dialog"]').filter({ hasText: 'Trocar Senha' });
    await expect(passwordDialog).toBeVisible();
    
    // Verifica se os campos do formulário estão presentes
    const currentPasswordField = page.locator('#currentPassword');
    const newPasswordField = page.locator('#newPassword');
    const confirmPasswordField = page.locator('#confirmPassword');
    
    await expect(currentPasswordField).toBeVisible();
    await expect(newPasswordField).toBeVisible();
    await expect(confirmPasswordField).toBeVisible();
    
    console.log('✅ Botão de trocar senha verificado');
  });
  
  test('deve verificar botão de salvar perfil', async ({ page }) => {
    console.log('💾 Testando botão de salvar perfil...');
    
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');
    
    const profileTab = page.locator('[role="tab"]').filter({ hasText: 'Perfil' });
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // Verifica se o botão está presente
    const saveProfileButton = page.locator('button').filter({ hasText: 'Salvar Perfil' });
    await expect(saveProfileButton).toBeVisible();
    
    // Preenche alguns campos e testa o salvamento
    const nicknameField = page.locator('#nickname');
    await nicknameField.fill('Usuário Teste');
    
    const bioField = page.locator('#bio');
    await bioField.fill('Bio de teste para verificar o salvamento');
    
    // Clica no botão salvar
    await saveProfileButton.click();
    
    console.log('✅ Botão de salvar perfil verificado');
  });
  
  test('deve verificar responsividade em dispositivos móveis', async ({ page }) => {
    console.log('📱 Testando responsividade...');
    
    // Define viewport móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:8081/configuracoes');
    await page.waitForLoadState('networkidle');
    
    const profileTab = page.locator('[role="tab"]').filter({ hasText: 'Perfil' });
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // Verifica se os elementos estão visíveis no mobile
    const photoSection = page.locator('h3').filter({ hasText: 'Foto de Perfil' });
    const nicknameField = page.locator('#nickname');
    const bioField = page.locator('#bio');
    const saveButton = page.locator('button').filter({ hasText: 'Salvar Perfil' });
    
    await expect(photoSection).toBeVisible();
    await expect(nicknameField).toBeVisible();
    await expect(bioField).toBeVisible();
    await expect(saveButton).toBeVisible();
    
    console.log('✅ Responsividade verificada');
  });
});
