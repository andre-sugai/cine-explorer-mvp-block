import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { toast as sonnerToast } from '@/components/ui/sonner';

export const TestToast: React.FC = () => {
  const testCustomToast = () => {
    toast({
      title: 'Toast Customizado',
      description:
        'Este é um toast usando nosso sistema customizado (canto inferior direito)',
    });
  };

  const testSonnerToast = () => {
    sonnerToast.success(
      'Toast do Sonner - Este é usado nos botões de favoritos/assistidos'
    );
  };

  const testErrorToast = () => {
    toast({
      title: 'Erro de Teste',
      description: 'Este é um toast de erro para testar o posicionamento',
      variant: 'destructive',
    });
  };

  const testSonnerError = () => {
    sonnerToast.error('Erro do Sonner - Usado nos botões de ação');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Teste de Posicionamento dos Toasts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Sistema Customizado</h3>
            <p className="text-sm text-muted-foreground">
              Usado em: Login, configurações, upload de imagens
            </p>
            <div className="space-y-2">
              <Button onClick={testCustomToast} className="w-full">
                Testar Toast Sucesso
              </Button>
              <Button
                onClick={testErrorToast}
                variant="destructive"
                className="w-full"
              >
                Testar Toast Erro
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Sistema Sonner</h3>
            <p className="text-sm text-muted-foreground">
              Usado em: Favoritos, assistidos, quero assistir
            </p>
            <div className="space-y-2">
              <Button onClick={testSonnerToast} className="w-full">
                Testar Sonner Sucesso
              </Button>
              <Button
                onClick={testSonnerError}
                variant="destructive"
                className="w-full"
              >
                Testar Sonner Erro
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">📋 Resultado Esperado:</h4>
          <p>
            Todos os toasts devem aparecer no{' '}
            <strong>canto inferior direito</strong> da tela.
          </p>
          <p className="mt-2">
            ✅ Se estiverem aparecendo no canto inferior direito, a correção
            funcionou!
            <br />❌ Se ainda estiverem no canto superior direito, há algo mais
            para ajustar.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
