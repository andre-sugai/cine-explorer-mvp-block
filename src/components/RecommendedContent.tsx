import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Heart,
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
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useNavigate } from 'react-router-dom';
import { RecommendationExplanationModal } from './RecommendationExplanationModal';
import { PersonalListCard } from '@/components/personal/PersonalListCard';
import { toast } from 'sonner';

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

  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoritesContext();
  const { addToWatched, removeFromWatched, isWatched } = useWatchedContext();
  const { addToWantToWatch, removeFromWantToWatch, isInWantToWatch } =
    useWantToWatchContext();
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

  const handleToggleFavorites = (item: RecommendationItem) => {
    try {
      if (isFavorite(item.id, item.type)) {
        removeFromFavorites(item.id, item.type);
        toast.success(`${item.title} foi removido dos favoritos!`);
      } else {
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
        toast.success(`${item.title} foi adicionado aos favoritos!`);
      }
    } catch (error) {
      toast.error('Erro ao atualizar favoritos');
    }
  };

  const handleToggleWatched = (item: RecommendationItem) => {
    try {
      if (isWatched(item.id, item.type)) {
        removeFromWatched(item.id, item.type);
        toast.success(`${item.title} foi removido dos assistidos!`);
      } else {
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
        toast.success(`${item.title} foi marcado como assistido!`);
      }
    } catch (error) {
      toast.error('Erro ao atualizar assistidos');
    }
  };

  const handleToggleWantToWatch = (item: RecommendationItem) => {
    try {
      if (isInWantToWatch(item.id, item.type)) {
        removeFromWantToWatch(item.id, item.type);
        toast.success(`${item.title} foi removido da lista "Quero Ver"!`);
      } else {
        addToWantToWatch({
          id: item.id,
          type: item.type,
          title: item.title,
          poster_path: item.poster_path,
          release_date: item.release_date || item.first_air_date || '',
          rating: item.vote_average || 0,
          genres: [], // Será preenchido pelo contexto se necessário
        });
        toast.success(`${item.title} foi adicionado à lista "Quero Ver"!`);
      }
    } catch (error) {
      toast.error('Erro ao atualizar a lista');
    }
  };

  const renderRecommendationCard = (item: RecommendationItem) => {
    // Preparar ações baseadas no status do item
    const actions = [];

    // Sempre mostrar botão de favoritar
    // Se já for favorito, mostrar em vermelho/rosa
    const isFav = isFavorite(item.id, item.type);
    actions.push({
      label: isFav ? '✓ Favorito' : 'Adicionar aos Favoritos',
      onClick: () => handleToggleFavorites(item),
      variant: isFav ? ('default' as const) : ('outline' as const),
      className: isFav ? 'bg-red-600 hover:bg-red-700 text-white' : '',
    });

    // Sempre mostrar botão "Quero Ver" se não foi assistido
    // Se já estiver na lista, mostrar em azul
    if (!isWatched(item.id, item.type)) {
      const isInList = isInWantToWatch(item.id, item.type);
      actions.push({
        label: isInList ? '✓ Quero Ver' : 'Quero Ver',
        onClick: () => handleToggleWantToWatch(item),
        variant: isInList ? ('default' as const) : ('outline' as const),
        className: isInList ? 'bg-blue-600 hover:bg-blue-700 text-white' : '',
      });
    }

    // Sempre mostrar botão "Marcar como Assistido"
    // Se já foi assistido, mostrar em verde
    const watched = isWatched(item.id, item.type);
    actions.push({
      label: watched ? '✓ Assistido' : 'Marcar como Assistido',
      onClick: () => handleToggleWatched(item),
      variant: watched ? ('default' as const) : ('outline' as const),
      className: watched ? 'bg-green-600 hover:bg-green-700 text-white' : '',
    });

    return (
      <PersonalListCard
        key={`${item.id}-${item.type}`}
        item={{
          ...item,
          // Adicionar badge de confiança como parte do título ou descrição
          title: item.title,
          vote_average: item.vote_average,
        }}
        onDetailsClick={() => handleItemClick(item)}
        showDate={false}
        actions={actions}
      />
    );
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
