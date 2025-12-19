/**
 * Utilitário de Cache usando a Cache Storage API (nativa do browser)
 * Permite armazenar respostas de API e assets com controle de expiração.
 */

const CACHE_NAME = 'cine-explorer-api-v1';
const IMAGE_CACHE_NAME = 'cine-explorer-images-v1';

interface CacheOptions {
  ttl?: number; // Tempo de vida em milissegundos
}

/**
 * Salva uma resposta no Cache Storage
 */
export async function setApiCache(url: string, data: any, options: CacheOptions = {}): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const ttl = options.ttl || 3600000; // Default 1h
    const expires = Date.now() + ttl;

    const responseData = {
      data,
      expires,
      timestamp: Date.now()
    };

    const response = new Response(JSON.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' }
    });

    await cache.put(url, response);
  } catch (error) {
    console.error('Erro ao salvar no API Cache:', error);
  }
}

/**
 * Tenta obter dados do Cache Storage
 */
export async function getApiCache<T>(url: string): Promise<T | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);

    if (!response) return null;

    const cachedData = await response.json();
    const now = Date.now();

    // Verificar expiração
    if (cachedData.expires && now > cachedData.expires) {
      await cache.delete(url);
      return null;
    }

    return cachedData.data as T;
  } catch (error) {
    console.error('Erro ao ler do API Cache:', error);
    return null;
  }
}

/**
 * Cache de Imagens - Salva via URL
 */
export async function cacheImage(url: string): Promise<void> {
  if (!url || url.includes('placeholder.svg')) return;
  
  // Evitar chamadas de rede indesejadas em testes
  if (process.env.NODE_ENV === 'test') return;
  
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const response = await cache.match(url);
    
    if (!response) {
      // Usar no-cors para evitar erros de bloqueio, permitindo o cache de respostas opacas
      const fetchResponse = await fetch(url, { mode: 'no-cors' });
      if (fetchResponse.type === 'opaque' || fetchResponse.ok) {
        await cache.put(url, fetchResponse);
      }
    }
  } catch (error) {
    // Silencioso por padrão para evitar poluição caso seja apenas um erro de rede temporário
  }
}

/**
 * Limpa todo o cache de API
 */
export async function clearApiCache(): Promise<void> {
  try {
    await caches.delete(CACHE_NAME);
  } catch (error) {
    console.error('Erro ao limpar API Cache:', error);
  }
}

/**
 * Limpa caches antigos (manutenção)
 */
export async function cleanupCaches(): Promise<void> {
  try {
    const cacheNames = await caches.keys();
    const validCaches = [CACHE_NAME, IMAGE_CACHE_NAME];
    
    await Promise.all(
      cacheNames.map(name => {
        if (!validCaches.includes(name)) {
          return caches.delete(name);
        }
        return Promise.resolve();
      })
    );
  } catch (error) {
    console.error('Erro na limpeza de caches:', error);
  }
}
