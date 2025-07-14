
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, TrendingUp, Calendar, Award, Film, Tv, Users, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const categoryButtons = [
    { 
      name: 'Filmes', 
      icon: Film, 
      color: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30',
      action: () => navigate('/busca/popular-movies')
    },
    { 
      name: 'Séries', 
      icon: Tv, 
      color: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30',
      action: () => navigate('/busca/popular-tv')
    },
    { 
      name: 'Atores', 
      icon: Users, 
      color: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30',
      action: () => navigate('/busca/popular-people')
    },
    { 
      name: 'Diretores', 
      icon: Camera, 
      color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30',
      action: () => navigate('/busca/popular-directors')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section com Busca Principal */}
      <section className="relative bg-gradient-hero rounded-lg p-8 text-center shadow-cinema">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Explore o Mundo do Cinema
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubra filmes, séries, atores e diretores. Sua jornada cinematográfica começa aqui.
          </p>
          
          {/* Barra de Busca Principal */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busque por filmes, séries, atores ou diretores..."
              className="pl-12 pr-32 h-14 text-lg bg-secondary/50 border-primary/20 focus:border-primary text-foreground"
            />
            <Button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 bg-gradient-gold text-cinema-dark hover:opacity-90"
            >
              Pesquisar
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Use palavras-chave em português ou inglês para encontrar o que procura
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">0</h3>
            <p className="text-muted-foreground">Favoritos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">0</h3>
            <p className="text-muted-foreground">Assistidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">0</h3>
            <p className="text-muted-foreground">Este Mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">0</h3>
            <p className="text-muted-foreground">Avaliados</p>
          </CardContent>
        </Card>
      </section>

      {/* Categorias de Conteúdo */}
      <section>
        <h3 className="text-2xl font-bold text-primary mb-6">Explore por Categoria</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryButtons.map((category) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.name} 
                className={`${category.color} cursor-pointer transition-all duration-300 hover:shadow-glow transform hover:scale-105`}
                onClick={category.action}
              >
                <CardContent className="p-6 text-center">
                  <Icon className="w-8 h-8 text-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground">{category.name}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Como Usar */}
      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Como usar o Cine Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">🔍 Busca Inteligente</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Digite o nome de qualquer filme, série, ator ou diretor. Nossa busca funciona 
                tanto em português quanto em inglês.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">📊 Organize sua Coleção</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Marque como favorito, adicione à lista de assistidos e avalie 
                tudo que você descobrir.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">🎯 Descoberta por Categoria</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Explore conteúdo específico clicando nas categorias acima ou 
                navegue pelas tendências do momento.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">📱 Informações Completas</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Acesse sinopses, elenco, avaliações e muito mais para cada 
                filme ou série que encontrar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
