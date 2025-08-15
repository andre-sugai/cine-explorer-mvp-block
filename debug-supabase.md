# 🐛 Debug do Supabase Storage

## 🔍 Verificações Necessárias:

### 1. Console do Navegador
- Abra F12 (DevTools)
- Vá para aba "Console"
- Tente fazer upload
- Verifique erros em vermelho

### 2. Verificar Bucket
- Dashboard → Storage → profile-images
- Confirme que existe
- Confirme que é público

### 3. Verificar Políticas
- Dashboard → Storage → Policies
- Confirme 4 políticas criadas:
  - Users can upload profile images (INSERT)
  - Profile images are publicly accessible (SELECT)
  - Users can update own profile images (UPDATE)
  - Users can delete own profile images (DELETE)

### 4. Verificar Autenticação
- Confirme que está logado
- Verifique se o token está válido

### 5. Teste Simples
- Tente fazer upload de uma imagem pequena (<1MB)
- Verifique se aparece mensagem de erro específica

## 🚨 Erros Comuns:

### "Bucket not found"
- Bucket não foi criado
- Nome incorreto

### "Access denied"
- Políticas RLS não aplicadas
- Usuário não autenticado

### "File too large"
- Imagem muito grande
- Compressão não funcionando

### "Network error"
- Problema de conexão
- Supabase indisponível

## 🎯 Solução:

1. Verifique cada item acima
2. Teste com imagem pequena
3. Confirme políticas aplicadas
4. Verifique console para erros específicos
