import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Star, Calendar, Clock } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Meus Favoritos</h2>
        <p className="text-muted-foreground">
          Aqui você encontrará todos os filmes e séries que marcou como favoritos
        </p>
      </div>

      {/* Empty State */}
      <Card className="bg-gradient-cinema border-primary/20 text-center">
        <CardContent className="p-12">
          <Heart className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            Nenhum favorito ainda
          </h3>
          <p className="text-muted-foreground mb-6">
            Comece a explorar filmes e séries para adicionar seus favoritos aqui
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for future favorites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* This will be populated with actual favorites in the future */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gradient-cinema border-primary/20 opacity-30">
            <CardHeader className="pb-3">
              <div className="w-full h-48 bg-secondary/50 rounded-md mb-3 flex items-center justify-center">
                <Star className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg text-primary">Filme Favorito {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span>2024</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span>120 min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                <span>8.5/10</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};