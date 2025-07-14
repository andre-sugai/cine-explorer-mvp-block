import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Calendar, Clock, TrendingUp } from 'lucide-react';

export const WatchedPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Filmes Assistidos</h2>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e mantenha um registro de tudo que você assistiu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">0</h3>
            <p className="text-muted-foreground">Total Assistidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">0h</h3>
            <p className="text-muted-foreground">Tempo Total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary">0</h3>
            <p className="text-muted-foreground">Este Mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card className="bg-gradient-cinema border-primary/20 text-center">
        <CardContent className="p-12">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            Nenhum filme assistido ainda
          </h3>
          <p className="text-muted-foreground mb-6">
            Comece a marcar filmes como assistidos para acompanhar seu progresso
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for future watched movies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gradient-cinema border-primary/20 opacity-30">
            <CardHeader className="pb-3">
              <div className="w-full h-48 bg-secondary/50 rounded-md mb-3 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg text-primary">Filme Assistido {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span>Assistido em: 15/01/2024</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span>120 min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                <span>Sua avaliação: 8.5/10</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};