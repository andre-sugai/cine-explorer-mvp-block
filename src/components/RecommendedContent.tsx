import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Smile,
  Users,
  Clock,
  Star,
  RefreshCw,
  Info,
  Heart,
  Frown,
  Angry,
  Coffee,
  Zap,
  Ghost,
  Film,
  TrendingUp
} from 'lucide-react';
import {
  useRecommendations,
  RecommendationItem,
} from '@/hooks/useRecommendations';
import { useNavigate } from 'react-router-dom';
import { RecommendationExplanationModal } from './RecommendationExplanationModal';
import { ContentCard } from '@/components/home/ContentCard';
import { getGenreNameById } from '@/utils/tmdb';

interface RecommendedContentProps {
  className?: string;
}

export const RecommendedContent: React.FC<RecommendedContentProps> = ({
  className = '',
}) => {
  const {
    recommendations,
    filteredRecommendations,
    userPreferences,
    isLoading,
    isFiltering,
    applyFilters,
    refreshRecommendations,
  } = useRecommendations();

  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');

  const moods = [
    { id: 'feliz', label: 'Feliz', icon: Smile, color: 'text-yellow-500', activeBg: 'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]', inactiveBg: 'hover:bg-yellow-500/10 hover:border-yellow-500/30' },
    { id: 'triste', label: 'Triste', icon: Frown, color: 'text-blue-400', activeBg: 'bg-blue-400/20 border-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.3)]', inactiveBg: 'hover:bg-blue-400/10 hover:border-blue-400/30' },
    { id: 'estressado', label: 'Estressado', icon: Angry, color: 'text-red-500', activeBg: 'bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]', inactiveBg: 'hover:bg-red-500/10 hover:border-red-500/30' },
    { id: 'inspirado', label: 'Inspirado', icon: Sparkles, color: 'text-purple-400', activeBg: 'bg-purple-400/20 border-purple-400/50 shadow-[0_0_15px_rgba(192,132,252,0.3)]', inactiveBg: 'hover:bg-purple-400/10 hover:border-purple-400/30' },
    { id: 'relaxado', label: 'Relaxado', icon: Coffee, color: 'text-teal-400', activeBg: 'bg-teal-400/20 border-teal-400/50 shadow-[0_0_15px_rgba(45,212,191,0.3)]', inactiveBg: 'hover:bg-teal-400/10 hover:border-teal-400/30' },
    { id: 'motivado', label: 'Motivado', icon: Zap, color: 'text-orange-500', activeBg: 'bg-orange-500/20 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]', inactiveBg: 'hover:bg-orange-500/10 hover:border-orange-500/30' },
    { id: 'romantico', label: 'Romântico', icon: Heart, color: 'text-pink-400', activeBg: 'bg-pink-400/20 border-pink-400/50 shadow-[0_0_15px_rgba(244,114,182,0.3)]', inactiveBg: 'hover:bg-pink-400/10 hover:border-pink-400/30' },
    { id: 'assustado', label: 'Assustado', icon: Ghost, color: 'text-slate-300', activeBg: 'bg-slate-300/20 border-slate-300/50 shadow-[0_0_15px_rgba(203,213,225,0.3)]', inactiveBg: 'hover:bg-slate-300/10 hover:border-slate-300/30' },
  ];

  const occasions = [
    { id: 'familia', label: 'Com Família', icon: Users, color: 'text-green-400', activeBg: 'bg-green-400/20 border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.3)]', inactiveBg: 'hover:bg-green-400/10 hover:border-green-400/30' },
    { id: 'encontro', label: 'Encontro', icon: Heart, color: 'text-rose-400', activeBg: 'bg-rose-400/20 border-rose-400/50 shadow-[0_0_15px_rgba(251,113,133,0.3)]', inactiveBg: 'hover:bg-rose-400/10 hover:border-rose-400/30' },
    { id: 'amigos', label: 'Com Amigos', icon: Users, color: 'text-cyan-400', activeBg: 'bg-cyan-400/20 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]', inactiveBg: 'hover:bg-cyan-400/10 hover:border-cyan-400/30' },
    { id: 'sozinho', label: 'Sozinho', icon: Smile, color: 'text-indigo-400', activeBg: 'bg-indigo-400/20 border-indigo-400/50 shadow-[0_0_15px_rgba(129,140,248,0.3)]', inactiveBg: 'hover:bg-indigo-400/10 hover:border-indigo-400/30' },
    { id: 'fim-de-semana', label: 'Fim de Semana', icon: Clock, color: 'text-fuchsia-400', activeBg: 'bg-fuchsia-400/20 border-fuchsia-400/50 shadow-[0_0_15px_rgba(232,121,249,0.3)]', inactiveBg: 'hover:bg-fuchsia-400/10 hover:border-fuchsia-400/30' },
    { id: 'noite', label: 'À Noite', icon: Clock, color: 'text-indigo-600', activeBg: 'bg-indigo-600/20 border-indigo-600/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]', inactiveBg: 'hover:bg-indigo-600/10 hover:border-indigo-600/30' },
    { id: 'tarde', label: 'À Tarde', icon: Clock, color: 'text-amber-500', activeBg: 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]', inactiveBg: 'hover:bg-amber-500/10 hover:border-amber-500/30' },
    { id: 'manha', label: 'De Manhã', icon: Clock, color: 'text-sky-400', activeBg: 'bg-sky-400/20 border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]', inactiveBg: 'hover:bg-sky-400/10 hover:border-sky-400/30' },
  ];

  const handleMoodSelect = (moodId: string) => {
    const newMood = selectedMood === moodId ? '' : moodId;
    setSelectedMood(newMood);
    applyFilters(newMood, selectedOccasion);
  };

  const handleOccasionSelect = (occasionId: string) => {
    const newOccasion = selectedOccasion === occasionId ? '' : occasionId;
    setSelectedOccasion(newOccasion);
    applyFilters(selectedMood, newOccasion);
  };

  const renderRecommendationCard = (item: RecommendationItem, index: number) => {
    return (
      <div 
        key={`${item.id}-${item.type}`}
        className="animate-in fade-in zoom-in-95 duration-500 fill-mode-backwards"
        style={{ animationDelay: `${index * 75}ms` }}
      >
        <ContentCard
          item={item as any}
          category={item.type === 'movie' ? 'movies' : 'tv'}
        />
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
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
    <div className={`space-y-8 ${className}`}>
      {/* Informações do usuário (Cartões VIP) e Ações */}
      {userPreferences && userPreferences.totalWatched > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Seu Perfil Cinematográfico
            </h3>
            <div className="flex items-center gap-2">
              <RecommendationExplanationModal userPreferences={userPreferences}>
                <Button variant="outline" size="sm" className="bg-card/50 backdrop-blur-sm">
                  <Info className="w-4 h-4 mr-2" />
                  Como funciona?
                </Button>
              </RecommendationExplanationModal>

              <Button
                variant="outline"
                size="sm"
                className="bg-card/50 backdrop-blur-sm"
                onClick={refreshRecommendations}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                />
                Atualizar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-card to-card/50 rounded-xl p-5 border border-primary/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Film className="w-16 h-16 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Total assistido</span>
              <p className="text-3xl font-extrabold text-foreground mt-1">
                {userPreferences.totalWatched}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-card to-card/50 rounded-xl p-5 border border-primary/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Star className="w-16 h-16 text-yellow-500" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Avaliação média</span>
              <p className="text-3xl font-extrabold text-foreground mt-1 flex items-baseline gap-1">
                {userPreferences.averageRating.toFixed(1)} <span className="text-base font-normal text-muted-foreground">/10</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-card to-card/50 rounded-xl p-5 border border-primary/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-16 h-16 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Preferência</span>
              <p className="text-2xl font-bold text-foreground mt-2">
                {userPreferences.preferredType === 'movie'
                  ? 'Filmes'
                  : userPreferences.preferredType === 'tv'
                  ? 'Séries'
                  : 'Ambos'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-card to-card/50 rounded-xl p-5 border border-primary/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Heart className="w-16 h-16 text-pink-500" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Gênero favorito</span>
              <p className="text-2xl font-bold text-foreground mt-2 truncate">
                {userPreferences.favoriteGenres.length > 0
                  ? getGenreNameById(userPreferences.favoriteGenres[0])
                  : 'Variado'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card/20 rounded-2xl p-6 border border-primary/10 space-y-6">
        {/* Filtros de humor */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Smile className="w-5 h-5 text-primary" />
            Como você está se sentindo?
          </h3>
          <div className="flex flex-wrap gap-3">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const isActive = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
                    hover:scale-105 active:scale-95
                    ${isActive 
                      ? `${mood.activeBg} text-foreground font-semibold` 
                      : `bg-card border-border/50 text-muted-foreground ${mood.inactiveBg} hover:text-foreground`
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? mood.color : ''}`} />
                  {mood.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros de ocasião */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Para que ocasião?
          </h3>
          <div className="flex flex-wrap gap-3">
            {occasions.map((occasion) => {
              const Icon = occasion.icon;
              const isActive = selectedOccasion === occasion.id;
              return (
                <button
                  key={occasion.id}
                  onClick={() => handleOccasionSelect(occasion.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
                    hover:scale-105 active:scale-95
                    ${isActive 
                      ? `${occasion.activeBg} text-foreground font-semibold` 
                      : `bg-card border-border/50 text-muted-foreground ${occasion.inactiveBg} hover:text-foreground`
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? occasion.color : ''}`} />
                  {occasion.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid de recomendações */}
      <div className="space-y-6 pt-4">
        {(selectedMood || selectedOccasion) ? (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Recomendações Personalizadas
            </h3>
            {isFiltering ? (
              renderSkeleton()
            ) : filteredRecommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {filteredRecommendations.map((item, index) => renderRecommendationCard(item, index))}
              </div>
            ) : (
              <div className="bg-card/30 border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <Ghost className="w-16 h-16 text-muted-foreground/30 mb-4 animate-bounce" />
                <p className="text-lg font-medium text-foreground">Nada encontrado por aqui!</p>
                <p className="text-muted-foreground max-w-md mt-2">
                  Não encontramos recomendações perfeitas que você ainda não tenha visto para essa combinação. Tente outros filtros!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Baseado no seu histórico
            </h3>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {recommendations.slice(0, 10).map((item, index) => renderRecommendationCard(item, index))}
              </div>
            ) : (
              <div className="bg-card/30 border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <Film className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-foreground">Seu catálogo está vazio</p>
                <p className="text-muted-foreground max-w-md mt-2">
                  Adicione alguns filmes aos favoritos ou marque como assistidos
                  para receber recomendações personalizadas!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
