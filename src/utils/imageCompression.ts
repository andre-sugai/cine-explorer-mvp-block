interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxSizeMB: number;
}

/**
 * Comprime uma imagem para reduzir o tamanho do arquivo
 * @param file - Arquivo de imagem original
 * @param options - Opções de compressão
 * @returns Promise<File> - Arquivo comprimido
 */
export const compressImage = (
  file: File, 
  options: CompressionOptions = {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.8,
    maxSizeMB: 1
  }
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcula as novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > options.maxWidth) {
        height = (height * options.maxWidth) / width;
        width = options.maxWidth;
      }
      
      if (height > options.maxHeight) {
        width = (width * options.maxHeight) / height;
        height = options.maxHeight;
      }

      // Configura o canvas
      canvas.width = width;
      canvas.height = height;

      // Desenha a imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converte para blob com qualidade ajustável
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha na compressão da imagem'));
            return;
          }

          // Se ainda estiver muito grande, reduz a qualidade
          if (blob.size > options.maxSizeMB * 1024 * 1024) {
            compressWithLowerQuality(canvas, options, resolve, reject);
          } else {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        },
        'image/jpeg',
        options.quality
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Comprime com qualidade mais baixa se necessário
 */
const compressWithLowerQuality = (
  canvas: HTMLCanvasElement,
  options: CompressionOptions,
  resolve: (file: File) => void,
  reject: (error: Error) => void
) => {
  let quality = options.quality;
  
  const tryCompress = () => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha na compressão da imagem'));
          return;
        }

        if (blob.size > options.maxSizeMB * 1024 * 1024 && quality > 0.1) {
          quality -= 0.1;
          tryCompress();
        } else {
          const compressedFile = new File([blob], 'profile.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }
      },
      'image/jpeg',
      quality
    );
  };

  tryCompress();
};

/**
 * Verifica o tamanho do arquivo e formata para exibição
 * @param bytes - Tamanho em bytes
 * @returns string - Tamanho formatado
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calcula a porcentagem de redução entre dois tamanhos
 * @param originalSize - Tamanho original em bytes
 * @param compressedSize - Tamanho comprimido em bytes
 * @returns string - Porcentagem de redução
 */
export const calculateReduction = (originalSize: number, compressedSize: number): string => {
  const reduction = ((originalSize - compressedSize) / originalSize) * 100;
  return `${Math.round(reduction)}%`;
};
