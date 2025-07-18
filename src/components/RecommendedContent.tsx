
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildImageUrl } from '@/utils/tmdb';
import { MovieCardActions } from '@/components/MovieCardActions';

interface RecommendedContentProps {
  recommendations?: {
    results: Array<{
      id: number;
      title?: string;
      name?: string;
      poster_path: string;
      vote_average: number;
      release_date?: string;
      first_air_date?: string;
      genre_ids?: number[];
    }>;
  };
  type: 'movie' | 'tv';
  title: string;
}

const RecommendedContent: React.FC<RecommendedContentProps> = ({ recommendations, type, title }) => {
  const navigate = useNavigate();

  if (!recommendations?.results?.length) return null;

  const handleItemClick = (item: any) => {
    navigate(`/${type === 'movie' ? 'filme' : 'serie'}/${item.id}`);
  };

  return (
    <Card className="bg-gradient-cinema border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendations.results.slice(0, 8).map((item) => (
            <div key={item.id} className="group">
              <div
                className="cursor-pointer transform hover:scale-105 transition-transform"
                onClick={() => handleItemClick(item)}
              >
                <img
                  src={buildImageUrl(item.poster_path, 'w342')}
                  alt={item.title || item.name}
                  className="w-full rounded-lg shadow-md"
                />
                <div className="mt-2">
                  <p className="text-sm text-foreground line-clamp-2 font-medium">
                    {item.title || item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ⭐ {item.vote_average.toFixed(1)}
                  </p>
                </div>
              </div>
              
              {/* Action Icons */}
              <MovieCardActions
                id={item.id}
                title={item.title || item.name || ''}
                poster_path={item.poster_path}
                release_date={item.release_date || item.first_air_date}
                vote_average={item.vote_average}
                genre_ids={item.genre_ids}
                type={type}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedContent;
