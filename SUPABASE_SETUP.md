# 🚀 Configuração do Supabase Storage

## 📋 Pré-requisitos

1. **Conta no Supabase**: https://supabase.com
2. **Projeto criado** (já existe: `wusrmvnuwrodvrujtpne`)
3. **Acesso ao Dashboard** do projeto

## 🔧 Configuração do Storage

### 1. Acesse o Dashboard do Supabase

1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto: `wusrmvnuwrodvrujtpne`
3. No menu lateral, clique em **"Storage"**

### 2. Crie o Bucket

1. Clique em **"New bucket"**
2. Configure:
   - **Name**: `profile-images`
   - **Public bucket**: ✅ Marque esta opção
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

3. Clique em **"Create bucket"**

### 3. Configure as Políticas de Acesso (RLS)

#### Política para Upload:
```sql
-- Permite que usuários autenticados façam upload
CREATE POLICY "Users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Política para Visualização:
```sql
-- Permite visualização pública das imagens
CREATE POLICY "Profile images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');
```

#### Política para Deleção:
```sql
-- Permite que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. Aplicar as Políticas

1. No Dashboard, vá para **"Storage"** → **"Policies"**
2. Clique em **"New Policy"**
3. Cole cada política acima
4. Clique em **"Review"** e depois **"Save policy"**

## 🧪 Testando a Implementação

### 1. Teste Manual

1. Acesse: `http://localhost:8081/configuracoes`
2. Vá para a aba **"Perfil"**
3. Clique em **"Adicionar Foto"**
4. Selecione uma imagem (qualquer tamanho até 10MB)
5. Confirme o upload
6. Verifique se a imagem aparece

### 2. Verificar no Supabase

1. No Dashboard, vá para **"Storage"** → **"profile-images"**
2. Você deve ver o arquivo carregado
3. Clique no arquivo para ver a URL pública

### 3. Verificar Compressão

1. Compare o tamanho original vs. final
2. Verifique se está abaixo de 1MB
3. Confirme que as dimensões são 400x400px

## 📊 Limites do Plano Gratuito

- **Storage**: 500MB
- **Transferência**: 2GB/mês
- **Arquivo individual**: 50MB
- **Nossa configuração**: Máx. 1MB por imagem

## 🔍 Troubleshooting

### Erro: "Bucket not found"
- Verifique se o bucket `profile-images` foi criado
- Confirme se o nome está exato

### Erro: "Access denied"
- Verifique se as políticas RLS foram aplicadas
- Confirme se o usuário está autenticado

### Erro: "File too large"
- A compressão deve resolver isso automaticamente
- Verifique se o arquivo original não excede 10MB

### Imagem não aparece
- Verifique se o bucket é público
- Confirme se a política de SELECT foi aplicada

## 🎯 Resultado Esperado

Após a configuração:

✅ **Upload funcionando** com compressão automática
✅ **Imagens públicas** acessíveis via URL
✅ **Tamanho otimizado** (menos de 1MB)
✅ **Dimensões padronizadas** (400x400px)
✅ **Persistência** no Supabase Storage
✅ **Sincronização** entre dispositivos

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no console do navegador
2. Confirme as políticas no Supabase Dashboard
3. Teste com uma imagem pequena primeiro
4. Verifique se o usuário está logado

---

**🎉 Implementação completa do Supabase Storage com compressão!**
