import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { buildImageUrl } from '@/utils/tmdb';
import { Calendar, Eye, Trash2, ExternalLink, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { PersonalListCard } from '@/components/personal/PersonalListCard';
import { PersonalListFiltersTabs } from '@/components/FavoritesPage';

const WantToWatchPage: React.FC = () => {
  const { wantToWatchList, removeFromWantToWatch } = useWantToWatchContext();
  const { addToWatched } = useWatchedContext();
  const navigate = useNavigate();

  // Funções auxiliares para separar por tipo
  const getItemsByType = (type: 'movie' | 'tv') =>
    wantToWatchList.filter((item) => item.type === type);
  const stats = {
    total: wantToWatchList.length,
    movies: wantToWatchList.filter((item) => item.type === 'movie').length,
    series: wantToWatchList.filter((item) => item.type === 'tv').length,
  };

  const handleRemove = (id: number, type: string, title: string) => {
    if (
      window.confirm(`Tem certeza que deseja remover "${title}" da sua lista?`)
    ) {
      removeFromWantToWatch(id);
      toast.success('Removido da lista');
    }
  };

  const handleMarkAsWatched = (item: any) => {
    addToWatched({
      id: item.id,
      type: item.type,
      title: item.title,
      poster_path: item.poster_path,
      release_date: item.release_date,
      vote_average: item.rating,
      genre_ids: [],
      runtime: undefined,
    });
    removeFromWantToWatch(item.id);
    toast.success('Marcado como assistido e removido da lista');
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Filmes e Séries que Quero Assistir
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua lista de filmes e séries para assistir
          </p>
        </div>
        <PersonalListFiltersTabs
          items={wantToWatchList}
          getItemsByType={getItemsByType}
          stats={stats}
          onRemove={handleRemove}
          renderCard={(item) => (
            <PersonalListCard
              key={item.id}
              item={item}
              onDetailsClick={() =>
                navigate(
                  `/filme/${item.id}?title=${encodeURIComponent(item.title)}`
                )
              }
              showDate={true}
              dateLabel="Adicionado em"
              actions={[
                item.type === 'movie' || item.type === 'tv'
                  ? {
                      label: 'Marcar como Assistido',
                      onClick: () => handleMarkAsWatched(item),
                      variant: 'default' as const,
                      className: 'bg-green-600 text-white hover:bg-green-700',
                    }
                  : undefined,
                {
                  label: 'Remover da Lista',
                  onClick: () => handleRemove(item.id, item.type, item.title),
                  variant: 'destructive' as const,
                },
              ].filter(Boolean)}
            />
          )}
          contextLabel="Quero Assistir"
        />
      </div>
    </Layout>
  );
};

export default WantToWatchPage;
