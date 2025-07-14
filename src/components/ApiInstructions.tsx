import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Key, Info, CheckCircle } from 'lucide-react';

export const ApiInstructions: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Info className="w-5 h-5" />
            Como obter sua chave API do TMDB
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="text-foreground">
                  Acesse o site oficial do TMDB em{' '}
                  <Button
                    variant="link"
                    asChild
                    className="p-0 h-auto text-primary hover:text-primary/80"
                  >
                    <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
                      https://www.themoviedb.org/
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="text-foreground">
                  Crie uma conta gratuita clicando em "Cadastre-se" no canto superior direito
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="text-foreground">
                  Após fazer login, clique no seu avatar no canto superior direito e selecione "Configurações"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="text-foreground">
                  No menu lateral, clique em "API"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</div>
              <div>
                <p className="text-foreground">
                  Clique em "Solicitar uma chave de API" e siga as instruções
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</div>
              <div>
                <p className="text-foreground">
                  Copie a chave API (API Key) gerada e cole no modal de configuração
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Key className="w-5 h-5" />
            Informações sobre a API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground">Gratuita</h4>
                <p className="text-sm text-muted-foreground">
                  A API do TMDB é completamente gratuita para uso pessoal e comercial
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground">Dados Completos</h4>
                <p className="text-sm text-muted-foreground">
                  Acesso a informações detalhadas sobre milhões de filmes, séries e pessoas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground">Sempre Atualizada</h4>
                <p className="text-sm text-muted-foreground">
                  Base de dados mantida pela comunidade e constantemente atualizada
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground">Múltiplos Idiomas</h4>
                <p className="text-sm text-muted-foreground">
                  Suporte a traduções em português e diversos outros idiomas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};