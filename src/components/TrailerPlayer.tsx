
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play } from 'lucide-react';

interface TrailerPlayerProps {
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      type: string;
      site: string;
    }>;
  };
}

const TrailerPlayer: React.FC<TrailerPlayerProps> = ({ videos }) => {
  const trailer = videos?.results?.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  ) || videos?.results?.[0];

  if (!trailer) return null;

  return (
    <Card className="bg-gradient-cinema border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Play className="w-5 h-5" />
          Trailer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}`}
            title={trailer.name}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TrailerPlayer;
