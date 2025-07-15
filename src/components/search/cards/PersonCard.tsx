
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { buildImageUrl, TMDBPerson } from '@/utils/tmdb';

interface PersonCardProps {
  person: TMDBPerson;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="group cursor-pointer overflow-hidden bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 transform hover:scale-105"
      onClick={() => navigate(`/pessoa/${person.id}`)}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={buildImageUrl(person.profile_path, 'w342')}
          alt={person.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=342&h=513&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
          {person.known_for_department}
        </Badge>
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-bold text-foreground line-clamp-1 mb-2">
          {person.name}
        </h3>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Conhecido por:</p>
          {person.known_for.slice(0, 2).map((item) => (
            <p key={item.id} className="text-xs text-foreground line-clamp-1">
              {'title' in item ? item.title : item.name}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
