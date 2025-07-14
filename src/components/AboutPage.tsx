import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Heart, CheckCircle, Star, Database, Shield, Zap } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Sobre o Cine Explorer</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          O Cine Explorer é sua plataforma completa para explorar, descobrir e organizar 
          sua experiência cinematográfica
        </p>
      </div>

      {/* App Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-cinema border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Film className="w-5 h-5" />
              Exploração Completa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Busque por filmes, séries, atores e diretores com informações detalhadas 
              diretamente do The Movie Database (TMDB).
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="w-5 h-5" />
              Lista de Favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Mantenha uma lista personalizada dos seus filmes e séries favoritos 
              para acesso rápido e fácil.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              Controle de Assistidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Acompanhe seu progresso cinematográfico marcando filmes como assistidos 
              e monitore estatísticas pessoais.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Star className="w-5 h-5" />
              Avaliações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Avalie filmes e séries com suas próprias notas e crie um histórico 
              pessoal de suas opiniões.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Features */}
      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Características Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-primary">API do TMDB</h4>
              <p className="text-sm text-muted-foreground">
                Integração com The Movie Database para informações atualizadas e precisas
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-primary">Privacidade</h4>
              <p className="text-sm text-muted-foreground">
                Todos os dados são armazenados localmente no seu navegador
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-primary">Performance</h4>
              <p className="text-sm text-muted-foreground">
                Interface rápida e responsiva, otimizada para todos os dispositivos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card className="bg-gradient-cinema border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-primary mb-2">Cine Explorer v1.0</h3>
          <p className="text-muted-foreground">
            Desenvolvido com React, TypeScript e Tailwind CSS
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Dados fornecidos por The Movie Database (TMDB)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};