import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Heart,
  Play,
  RefreshCw,
  Smile,
  Users,
  Clock,
  Star,
  Info,
} from 'lucide-react';
import {
  useRecommendations,
  RecommendationItem,
} from '@/hooks/useRecommendations';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';
import { RecommendationExplanationModal } from './RecommendationExplanationModal';

interface RecommendedContentProps {
  className?: string;
}

export const RecommendedContent: React.FC<RecommendedContentProps> = ({
  className = '',
}) => {
  const {
    recommendations,
    userPreferences,
    isLoading,
    getRecommendationsByMood,
    getRecommendationsByOccasion,
    refreshRecommendations,
  } = useRecommendations();

  const { addToFavorites, isFavorite } = useFavoritesContext();
  const { addToWatched, isWatched } = useWatchedContext();
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [moodRecommendations, setMoodRecommendations] = useState<
    RecommendationItem[]
  >([]);
  const [occasionRecommendations, setOccasionRecommendations] = useState<
    RecommendationItem[]
  >([]);

  const moods = [
    { id: 'feliz', label: 'Feliz', icon: Smile },
    { id: 'triste', label: 'Triste', icon: Smile },
    { id: 'estressado', label: 'Estressado', icon: Smile },
    { id: 'inspirado', label: 'Inspirado', icon: Sparkles },
    { id: 'relaxado', label: 'Relaxado', icon: Smile },
    { id: 'motivado', label: 'Motivado', icon: Star },
    { id: 'romantico', label: 'Romântico', icon: Heart },
    { id: 'assustado', label: 'Assustado', icon: Smile },
  ];

  const occasions = [
    { id: 'familia', label: 'Com Família', icon: Users },
    { id: 'encontro', label: 'Encontro', icon: Heart },
    { id: 'amigos', label: 'Com Amigos', icon: Users },
    { id: 'sozinho', label: 'Sozinho', icon: Smile },
    { id: 'fim-de-semana', label: 'Fim de Semana', icon: Clock },
    { id: 'noite', label: 'À Noite', icon: Clock },
    { id: 'tarde', label: 'À Tarde', icon: Clock },
    { id: 'manha', label: 'De Manhã', icon: Clock },
  ];

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setSelectedOccasion('');
    const recommendations = await getRecommendationsByMood(mood);
    setMoodRecommendations(recommendations);
    setOccasionRecommendations([]);
  };

  const handleOccasionSelect = async (occasion: string) => {
    setSelectedOccasion(occasion);
    setSelectedMood('');
    const recommendations = await getRecommendationsByOccasion(occasion);
    setOccasionRecommendations(recommendations);
    setMoodRecommendations([]);
  };

  const handleItemClick = (item: RecommendationItem) => {
    const path =
      item.type === 'movie' ? `/filme/${item.id}` : `/serie/${item.id}`;
    navigate(path);
  };

  const handleAddToFavorites = (
    e: React.MouseEvent,
    item: RecommendationItem
  ) => {
    e.stopPropagation();
    addToFavorites({
      id: item.id,
      type: item.type,
      title: item.title,
      poster_path: item.poster_path,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      genre_ids: item.genre_ids,
    });
  };

  const handleAddToWatched = (
    e: React.MouseEvent,
    item: RecommendationItem
  ) => {
    e.stopPropagation();
    addToWatched({
      id: item.id,
      type: item.type,
      title: item.title,
      poster_path: item.poster_path,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      genre_ids: item.genre_ids,
    });
  };

  const renderRecommendationCard = (item: RecommendationItem) => (
    <Card
      key={`${item.id}-${item.type}`}
      className="group cursor-pointer hover:scale-105 transition-all duration-200 bg-card/50 hover:bg-card border-primary/20 hover:border-primary/40"
      onClick={() => handleItemClick(item)}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={buildImageUrl(item.poster_path || '', 'w500')}
            alt={item.title}
            className="w-full h-64 object-cover rounded-t-lg"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />

          {/* Overlay com ações */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-lg flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => handleAddToFavorites(e, item)}
              className="bg-primary/80 hover:bg-primary text-primary-foreground"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => handleAddToWatched(e, item)}
              className="bg-primary/80 hover:bg-primary text-primary-foreground"
            >
              <Play className="w-4 h-4" />
            </Button>
          </div>

          {/* Badge de confiança */}
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-primary/80 text-primary-foreground"
            >
              {Math.round(item.confidence * 100)}%
            </Badge>
          </div>

          {/* Indicadores de status */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isFavorite(item.id, item.type) && (
              <Badge variant="destructive" className="bg-red-500">
                <Heart className="w-3 h-3" />
              </Badge>
            )}
            {isWatched(item.id, item.type) && (
              <Badge variant="default" className="bg-green-500">
                <Play className="w-3 h-3" />
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
            {item.title}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            {item.vote_average && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-3 h-3 fill-primary text-primary" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {item.type === 'movie' ? 'Filme' : 'Série'}
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {item.reason}
          </p>

          {item.overview && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.overview}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <Card key={index} className="bg-card/50">
          <CardContent className="p-0">
            <Skeleton className="w-full h-64 rounded-t-lg" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading && recommendations.length === 0) {
    return <div className={`space-y-6 ${className}`}>{renderSkeleton()}</div>;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Ações */}
      <div className="flex items-center justify-end gap-2">
        <RecommendationExplanationModal userPreferences={userPreferences}>
          <Button variant="outline" size="sm">
            <Info className="w-4 h-4 mr-2" />
            Como funciona?
          </Button>
        </RecommendationExplanationModal>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshRecommendations}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Atualizar
        </Button>
      </div>

      {/* Informações do usuário */}
      {userPreferences && userPreferences.totalWatched > 0 && (
        <div className="bg-card/50 rounded-lg p-4 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">
            Seu Perfil Cinematográfico
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total assistido:</span>
              <p className="font-medium">
                {userPreferences.totalWatched} itens
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Avaliação média:</span>
              <p className="font-medium">
                {userPreferences.averageRating.toFixed(1)}/10
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Preferência:</span>
              <p className="font-medium">
                {userPreferences.preferredType === 'movie'
                  ? 'Filmes'
                  : userPreferences.preferredType === 'tv'
                  ? 'Séries'
                  : 'Ambos'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Gênero favorito:</span>
              <p className="font-medium">
                {userPreferences.favoriteGenres.length > 0
                  ? getGenreName(userPreferences.favoriteGenres[0])
                  : 'Variado'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros de humor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Como você está se sentindo?
        </h3>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => {
            const Icon = mood.icon;
            return (
              <Button
                key={mood.id}
                variant={selectedMood === mood.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleMoodSelect(mood.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {mood.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Filtros de ocasião */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Para que ocasião?
        </h3>
        <div className="flex flex-wrap gap-2">
          {occasions.map((occasion) => {
            const Icon = occasion.icon;
            return (
              <Button
                key={occasion.id}
                variant={
                  selectedOccasion === occasion.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => handleOccasionSelect(occasion.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {occasion.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Grid de recomendações */}
      <div className="space-y-4">
        {selectedMood && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Para quando você está{' '}
              {moods.find((m) => m.id === selectedMood)?.label.toLowerCase()}
            </h3>
            {moodRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {moodRecommendations.map(renderRecommendationCard)}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Carregando recomendações...
              </p>
            )}
          </div>
        )}

        {selectedOccasion && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {occasions.find((o) => o.id === selectedOccasion)?.label}
            </h3>
            {occasionRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {occasionRecommendations.map(renderRecommendationCard)}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Carregando recomendações...
              </p>
            )}
          </div>
        )}

        {!selectedMood && !selectedOccasion && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Baseado no seu histórico
            </h3>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {recommendations.slice(0, 10).map(renderRecommendationCard)}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Adicione alguns filmes aos favoritos ou marque como assistidos
                para receber recomendações personalizadas!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Função auxiliar para obter nome do gênero
 */
const getGenreName = (genreId: number): string => {
  const genres: { [key: number]: string } = {
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
    878: 'Ficção Científica',
    10770: 'Cinema TV',
    53: 'Thriller',
    10752: 'Guerra',
    37: 'Faroeste',
  };

  return genres[genreId] || 'Filme';
};
