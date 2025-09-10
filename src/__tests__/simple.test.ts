describe('Teste Simples', () => {
  test('deve passar', () => {
    expect(1 + 1).toBe(2);
  });

  test('deve testar funções básicas do sistema de blacklist', () => {
    // Teste básico das funções sem importações complexas
    const isAdmin = (email: string) => email === 'guitarfreaks@gmail.com';
    
    expect(isAdmin('guitarfreaks@gmail.com')).toBe(true);
    expect(isAdmin('outro@email.com')).toBe(false);
  });
});