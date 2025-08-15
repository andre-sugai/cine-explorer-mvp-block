-- =====================================================
-- POLÍTICAS PARA O BUCKET profile-images
-- =====================================================

-- 1. POLÍTICA PARA UPLOAD (INSERT)
-- Permite que usuários autenticados façam upload de suas imagens
CREATE POLICY "Users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- 2. POLÍTICA PARA VISUALIZAÇÃO (SELECT)
-- Permite visualização pública das imagens de perfil
CREATE POLICY "Profile images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- 3. POLÍTICA PARA ATUALIZAÇÃO (UPDATE)
-- Permite que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- 4. POLÍTICA PARA DELEÇÃO (DELETE)
-- Permite que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- =====================================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- =====================================================

-- Lista todas as políticas do bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND qual LIKE '%profile-images%';
