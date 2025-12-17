/**
 * Serviço de tradução utilizando o proxy local para o Google Translate.
 * 
 * NOTA: Esta é uma solução de desenvolvimento/MVP que usa um endpoint público não documentado
 * via proxy local para evitar CORS. Para produção, substitua por uma API paga oficial.
 */

export const translateText = async (text: string, targetLang: string = 'pt'): Promise<string> => {
  try {
    // Check if text is already Portuguese-ish (naive check)
    // Or just let Google handle it (source=auto)
    
    // O endpoint 'single' do Google Translate retorna um array de arrays
    // Parâmetros:
    // client: gtx (Google Translate Extension?)
    // sl: source language (auto)
    // tl: target language
    // dt: t (return translation)
    // q: text query
    
    // Nota: O endpoint real via proxy será: http://localhost:8080/api/translate?...
    
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'auto',
      tl: targetLang,
      dt: 't',
      q: text
    });

    // Determine endpoint based on environment
    // Local: use Vite proxy at /api/translate
    // Production: use Netlify Function directly to avoid rewrite issues
    const baseUrl = import.meta.env.DEV ? '/api/translate' : '/.netlify/functions/translate';
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      console.error(`Translation request failed: ${response.status} ${response.statusText}`);
      throw new Error(`Translation request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // O formato de resposta é complexo array de arrays.
    // data[0] contém os segmentos traduzidos.
    // Cada segmento é [translatedText, originalText, ...]
    
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map((segment: any) => segment[0]).join('');
    }
    
    return text; // Fallback se o formato não for o esperado
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Retorna o original em caso de erro
  }
};
