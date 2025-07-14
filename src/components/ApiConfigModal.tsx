import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Key, Shield, Zap } from 'lucide-react';

interface ApiConfigModalProps {
  open: boolean;
  onComplete: (apiKey: string) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ open, onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateApiKey = (key: string): boolean => {
    // Validação básica do formato da chave API do TMDB
    const tmdbApiKeyRegex = /^[a-f0-9]{32}$/i;
    return tmdbApiKeyRegex.test(key);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      alert('Por favor, insira uma chave API válida');
      return;
    }

    if (!validateApiKey(apiKey)) {
      alert('Formato da chave API inválido. A chave deve ter 32 caracteres hexadecimais.');
      return;
    }

    setIsValidating(true);
    
    // Simular validação (em um app real, faria uma chamada de teste à API)
    setTimeout(() => {
      onComplete(apiKey);
      setIsValidating(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-cinema border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Key className="w-6 h-6" />
            Configurar API do TMDB
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Para usar o Cine Explorer, você precisa configurar sua chave API do The Movie Database (TMDB).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits Section */}
          <Card className="bg-secondary/50 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">Benefícios da API</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                A API permite buscar informações detalhadas sobre filmes, séries, atores e diretores, 
                incluindo sinopses, avaliações, trailers e muito mais.
              </p>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="bg-secondary/50 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">Segurança</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Sua chave API será armazenada apenas no seu navegador e não será compartilhada 
                com terceiros.
              </p>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-primary">Como obter sua chave API:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Acesse <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                https://www.themoviedb.org/ <ExternalLink className="w-3 h-3" />
              </a></li>
              <li>Crie uma conta gratuita se ainda não tiver</li>
              <li>Faça login e vá em <strong>Configurações → API</strong></li>
              <li>Solicite uma chave de API (API Key)</li>
              <li>Copie a chave gerada e cole no campo abaixo</li>
            </ol>
          </div>

          {/* API Key Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium text-primary">
                Chave API do TMDB
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Cole sua chave API aqui..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-secondary border-primary/20 focus:border-primary"
                disabled={isValidating}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-gold hover:opacity-90 text-cinema-dark font-semibold"
              disabled={isValidating}
            >
              {isValidating ? 'Validando...' : 'Confirmar e Entrar'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};