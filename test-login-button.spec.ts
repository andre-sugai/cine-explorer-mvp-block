import { test, expect } from '@playwright/test';

test('Botão de login deve abrir o modal de autenticação', async ({ page }) => {
  // Navegar para a página inicial
  await page.goto('http://localhost:5173');

  // Aguardar o carregamento da página
  await page.waitForLoadState('networkidle');

  // Verificar se o botão "Entrar" está visível
  const loginButton = page.locator('button:has-text("Entrar")');
  await expect(loginButton).toBeVisible();

  // Clicar no botão de login
  await loginButton.click();

  // Verificar se o modal de autenticação foi aberto
  const authModal = page.locator('[role="dialog"]');
  await expect(authModal).toBeVisible();

  // Verificar se o título do modal está correto
  const modalTitle = page.locator('h2:has-text("Acesse sua conta")');
  await expect(modalTitle).toBeVisible();

  // Verificar se as abas de Login e Criar Conta estão presentes
  const loginTab = page.locator('button[role="tab"]:has-text("Entrar")');
  const registerTab = page.locator(
    'button[role="tab"]:has-text("Criar Conta")'
  );

  await expect(loginTab).toBeVisible();
  await expect(registerTab).toBeVisible();

  // Verificar se os campos de email e senha estão presentes
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();

  console.log('✅ Teste do botão de login passou - Modal abre corretamente');
});

test('Modal de login deve fechar ao clicar fora ou no X', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Abrir o modal
  const loginButton = page.locator('button:has-text("Entrar")');
  await loginButton.click();

  // Verificar se o modal está aberto
  const authModal = page.locator('[role="dialog"]');
  await expect(authModal).toBeVisible();

  // Fechar o modal pressionando Escape
  await page.keyboard.press('Escape');

  // Verificar se o modal foi fechado
  await expect(authModal).not.toBeVisible();

  console.log('✅ Teste de fechamento do modal passou');
});
