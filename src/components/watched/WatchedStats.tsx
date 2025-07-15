
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star, Clock, TrendingUp, Film } from 'lucide-react';

interface WatchedStatsProps {
  stats: {
    total: number;
    movies: number;
    series: number;
    totalHours: number;
    thisMonth: number;
    mostWatchedGenre: number;
  };
}

const genreMap: { [key: number]: string } = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção científica',
  10770: 'Cinema TV',
  53: 'Thriller',
  10752: 'Guerra',
  37: 'Faroeste'
};

export const WatchedStats: React.FC<WatchedStatsProps> = ({ stats }) => {
  const favoriteGenre = genreMap[stats.mostWatchedGenre] || 'Variado';

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <Card className="bg-gradient-cinema border-primary/20">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-primary">{stats.total}</h3>
          <p className="text-muted-foreground">Total Assistidos</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-cinema border-primary/20">
        <CardContent className="p-6 text-center">
          <Film className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-primary">{stats.movies}/{stats.series}</h3>
          <p className="text-muted-foreground">Filmes/Séries</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-cinema border-primary/20">
        <CardContent className="p-6 text-center">
          <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-primary">{stats.totalHours}h</h3>
          <p className="text-muted-foreground">Tempo Total</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-cinema border-primary/20">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-primary">{stats.thisMonth}</h3>
          <p className="text-muted-foreground">Este Mês</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-cinema border-primary/20">
        <CardContent className="p-6 text-center">
          <Star className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="text-lg font-bold text-primary line-clamp-1">{favoriteGenre}</h3>
          <p className="text-muted-foreground">Gênero Favorito</p>
        </CardContent>
      </Card>
    </div>
  );
};
