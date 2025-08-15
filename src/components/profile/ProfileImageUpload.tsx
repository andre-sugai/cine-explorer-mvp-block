import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useProfileImage } from '@/hooks/useProfileImage';
import { formatFileSize, calculateReduction } from '@/utils/imageCompression';
import { toast } from '@/hooks/use-toast';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
  onImageRemove: () => void;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  onImageUpdate,
  onImageRemove
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: string;
    compressedSize: string;
    reduction: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProfileImage } = useProfileImage();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Use apenas imagens JPG, PNG ou WebP.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB máximo antes da compressão
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 10MB antes da compressão.',
        variant: 'destructive',
      });
      return;
    }

    // Mostra preview e informações de compressão
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      
      // Simula compressão para mostrar informações
      const originalSize = formatFileSize(file.size);
      const estimatedCompressedSize = formatFileSize(Math.min(file.size * 0.3, 1024 * 1024));
      const reduction = calculateReduction(file.size, Math.min(file.size * 0.3, 1024 * 1024));
      
      setCompressionInfo({
        originalSize,
        compressedSize: estimatedCompressedSize,
        reduction
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadProfileImage(file);
      onImageUpdate(imageUrl);
      
      toast({
        title: 'Imagem carregada!',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      });
      
      // Limpa o preview
      setPreview('');
      setCompressionInfo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: 'Erro ao processar imagem',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview('');
    setCompressionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview da imagem atual ou nova */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-secondary/30 border-2 border-primary/20">
            {(preview || currentImage) ? (
              <img
                src={preview || currentImage}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Botão de remover se há imagem atual */}
          {currentImage && !preview && (
            <Button
              onClick={onImageRemove}
              size="sm"
              variant="outline"
              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!preview ? (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {currentImage ? 'Alterar Foto' : 'Adicionar Foto'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isUploading ? 'Processando...' : 'Confirmar Upload'}
              </Button>
              
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex items-center gap-2"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Informações de compressão */}
      {compressionInfo && (
        <div className="text-center space-y-1 p-3 bg-secondary/30 rounded-lg">
          <div className="text-sm text-muted-foreground">
            <span className="line-through">{compressionInfo.originalSize}</span>
            {' → '}
            <span className="text-green-500 font-medium">
              {compressionInfo.compressedSize}
            </span>
          </div>
          <div className="text-xs text-green-600">
            Redução estimada: {compressionInfo.reduction}
          </div>
        </div>
      )}

      {/* Informações */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Formatos: JPG, PNG, WebP</p>
        <p>Tamanho máximo: 10MB (será comprimido para &lt;1MB)</p>
        <p>Dimensões recomendadas: 400x400px</p>
      </div>
    </div>
  );
};
