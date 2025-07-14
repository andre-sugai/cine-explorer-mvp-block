import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, TrendingUp, Calendar, Award } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero rounded-lg p-8 text-center shadow-cinema">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Explore o Mundo do Cinema
          </h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Descubra filmes e séries, acompanhe seus favoritos e mantenha um registro 
            de tudo que você assistiu
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar filmes, séries, atores..."
              className="pl-10 bg-secondary/50 border-primary/20 focus:border-primary text-foreground"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-gold text-cinema-dark hover:opacity-90">
              Buscar
            </Button>
          </div>
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

      {/* Categories */}
      <section>
        <h3 className="text-2xl font-bold text-primary mb-6">Categorias Populares</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Ação', color: 'bg-red-500/20 hover:bg-red-500/30' },
            { name: 'Comédia', color: 'bg-yellow-500/20 hover:bg-yellow-500/30' },
            { name: 'Drama', color: 'bg-blue-500/20 hover:bg-blue-500/30' },
            { name: 'Terror', color: 'bg-purple-500/20 hover:bg-purple-500/30' },
            { name: 'Romance', color: 'bg-pink-500/20 hover:bg-pink-500/30' },
            { name: 'Ficção Científica', color: 'bg-green-500/20 hover:bg-green-500/30' },
            { name: 'Animação', color: 'bg-orange-500/20 hover:bg-orange-500/30' },
            { name: 'Documentário', color: 'bg-teal-500/20 hover:bg-teal-500/30' }
          ].map((category) => (
            <Card key={category.name} className={`${category.color} border-primary/20 cursor-pointer transition-all duration-300 hover:shadow-glow`}>
              <CardContent className="p-4 text-center">
                <p className="font-semibold text-foreground">{category.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Welcome Message */}
      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Bem-vindo ao Cine Explorer!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Sua chave API foi configurada com sucesso! Agora você pode explorar o vasto mundo 
            do cinema e televisão. Use a barra de pesquisa para encontrar seus filmes e séries 
            favoritos, ou navegue pelas categorias para descobrir novos conteúdos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Explorar Filmes
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Explorar Séries
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Tendências
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};