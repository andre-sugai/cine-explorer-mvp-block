import { useState, useCallback } from 'react';

/**
 * Hook personalizado para funcionalidade de busca por voz
 *
 * Este hook gerencia o reconhecimento de fala usando a Web Speech API,
 * incluindo detecção de suporte do navegador, solicitação de permissão
 * e processamento dos resultados de reconhecimento.
 *
 * @returns {Object} Objeto contendo:
 *   - isSupported: boolean - Se o navegador suporta reconhecimento de fala
 *   - isListening: boolean - Se está atualmente escutando
 *   - isPermissionGranted: boolean - Se a permissão foi concedida
 *   - startListening: function - Função para iniciar o reconhecimento
 *   - stopListening: function - Função para parar o reconhecimento
 *   - error: string | null - Mensagem de erro, se houver
 */
export const useVoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se o navegador suporta reconhecimento de fala
  const isSupported =
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Obter a classe de reconhecimento de fala apropriada
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!isSupported) {
        setError('Seu navegador não suporta reconhecimento de fala');
        return;
      }

      try {
        setError(null);
        setIsListening(true);

        const recognition = new SpeechRecognition();

        // Configurar o reconhecimento
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'pt-BR'; // Português do Brasil
        recognition.maxAlternatives = 1;

        // Evento quando o reconhecimento começa
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        // Evento quando o reconhecimento termina
        recognition.onend = () => {
          setIsListening(false);
        };

        // Evento quando há resultados
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onResult(transcript.trim());
          }
        };

        // Evento de erro
        recognition.onerror = (event) => {
          setIsListening(false);

          switch (event.error) {
            case 'not-allowed':
              setError(
                'Permissão de microfone negada. Por favor, permita o acesso ao microfone.'
              );
              setIsPermissionGranted(false);
              break;
            case 'no-speech':
              setError('Nenhuma fala detectada. Tente falar mais claramente.');
              break;
            case 'audio-capture':
              setError(
                'Erro na captura de áudio. Verifique se o microfone está funcionando.'
              );
              break;
            case 'network':
              setError('Erro de rede. Verifique sua conexão com a internet.');
              break;
            default:
              setError(`Erro no reconhecimento de fala: ${event.error}`);
          }
        };

        // Iniciar o reconhecimento
        recognition.start();

        // Marcar permissão como concedida se chegou até aqui
        setIsPermissionGranted(true);
      } catch (err) {
        setIsListening(false);
        setError('Erro ao iniciar o reconhecimento de fala');
        console.error('Erro no reconhecimento de fala:', err);
      }
    },
    [isSupported]
  );

  const stopListening = useCallback(() => {
    setIsListening(false);
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    isPermissionGranted,
    startListening,
    stopListening,
    error,
  };
};
