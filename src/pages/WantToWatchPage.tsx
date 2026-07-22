import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { buildImageUrl } from '@/utils/tmdb';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { ContentCard } from '@/components/home/ContentCard';
import { WantToWatchFiltersTabs } from '@/components/WantToWatchFiltersTabs';
import { HeroHeader } from '@/components/ui/HeroHeader';

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
      removeFromWantToWatch(id, type as 'movie' | 'tv');
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
    removeFromWantToWatch(item.id, item.type);
    toast.success('Marcado como assistido e removido da lista');
  };

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        <HeroHeader 
          title="Quero Assistir"
          description="Gerencie sua lista de filmes e séries para assistir e saiba onde eles estão disponíveis."
          icon={Eye}
          colorScheme="blue"
        />
        <WantToWatchFiltersTabs
          items={wantToWatchList}
          getItemsByType={getItemsByType}
          stats={stats}
          onRemove={handleRemove}
          enableStreamingFilter={true}
          renderCard={(item) => (
            <ContentCard
              key={`${item.type}-${item.id}`}
              item={item as any}
              category={item.type === 'movie' ? 'movies' : 'tv'}
            />
          )}
          contextLabel="Quero Assistir"
        />
      </div>
    </Layout>
  );
};

export default WantToWatchPage;
