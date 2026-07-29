import { compressImage, formatFileSize, calculateReduction } from '@/utils/imageCompression';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook para gerenciar upload de imagens de perfil com compressão
 */
export const useProfileImage = () => {
  const { user } = useAuth();

  /**
   * Faz upload de uma imagem de perfil ou capa com compressão automática
   * @param file - Arquivo de imagem original
   * @param type - Tipo da imagem ('profile' ou 'cover')
   * @returns Promise<string> - URL pública da imagem
   */
  const uploadProfileImage = async (file: File, type: 'profile' | 'cover' = 'profile'): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    // Validações iniciais
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato de imagem inválido. Use JPG, PNG ou WebP.');
    }

    // Limite de 10MB antes da compressão
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Imagem muito grande. Máximo 10MB antes da compressão.');
    }

    console.log(`📸 Imagem original: ${formatFileSize(file.size)}`);

    // Comprime a imagem com dimensões diferentes baseadas no tipo
    const maxWidth = type === 'cover' ? 1920 : 400;
    const maxHeight = type === 'cover' ? 1080 : 400;

    const compressedFile = await compressImage(file, {
      maxWidth,
      maxHeight,
      quality: 0.8,
      maxSizeMB: type === 'cover' ? 2 : 1
    });

    console.log(`🔄 Imagem comprimida: ${formatFileSize(compressedFile.size)}`);
    console.log(`📊 Redução: ${calculateReduction(file.size, compressedFile.size)}`);

    // Nome único para o arquivo
    const fileName = `${user.id}_${type}_${Date.now()}.jpg`;

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw new Error(`Erro no upload: ${error.message}`);
    }

    // Retorna URL pública
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  /**
   * Remove uma imagem de perfil do storage
   * @param fileName - Nome do arquivo a ser removido
   */
  const deleteProfileImage = async (fileName: string) => {
    const { error } = await supabase.storage
      .from('profile-images')
      .remove([fileName]);

    if (error) {
      console.error('Erro ao deletar imagem:', error);
      throw new Error(`Erro ao deletar imagem: ${error.message}`);
    }
  };

  /**
   * Extrai o nome do arquivo de uma URL do Supabase
   * @param url - URL da imagem
   * @returns string - Nome do arquivo
   */
  const extractFileNameFromUrl = (url: string): string => {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch (error) {
      console.error('Erro ao extrair nome do arquivo:', error);
      return '';
    }
  };

  return { 
    uploadProfileImage, 
    deleteProfileImage, 
    extractFileNameFromUrl 
  };
};
