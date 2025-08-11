import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Heart,
  Play,
  Star,
  Users,
  Clock,
  Info,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { UserPreferences } from '@/hooks/useRecommendations';

interface RecommendationExplanationModalProps {
  userPreferences: UserPreferences | null;
  children: React.ReactNode;
}

export const RecommendationExplanationModal: React.FC<
  RecommendationExplanationModalProps
> = ({ userPreferences, children }) => {
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

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Como funcionam as recomendações?
          </DialogTitle>
          <DialogDescription>
            Entenda como nosso sistema inteligente analisa seus gostos para
            sugerir conteúdo personalizado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seu perfil atual */}
          {userPreferences && userPreferences.totalWatched > 0 && (
            <div className="bg-card/50 rounded-lg p-4 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Seu Perfil Atual
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Total assistido:
                  </span>
                  <p className="font-medium">
                    {userPreferences.totalWatched} itens
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Avaliação média:
                  </span>
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
                  <span className="text-muted-foreground">
                    Gênero favorito:
                  </span>
                  <p className="font-medium">
                    {userPreferences.favoriteGenres.length > 0
                      ? getGenreName(userPreferences.favoriteGenres[0])
                      : 'Variado'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Como funciona */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4" />
              Como Funciona
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Análise de Dados
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Analisamos seus favoritos e histórico de visualização para
                    entender seus gostos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Identificação de Padrões
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Identificamos gêneros, décadas, diretores e atores que você
                    mais aprecia.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Geração de Recomendações
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Combinamos seus padrões com conteúdo similar disponível na
                    base de dados.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Filtros Inteligentes
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Aplicamos filtros por humor e ocasião para recomendações
                    ainda mais precisas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fatores considerados */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Fatores Considerados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm">Favoritos</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                <Play className="w-4 h-4 text-primary" />
                <span className="text-sm">Histórico</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm">Avaliações</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm">Décadas</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm">Diretores</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm">Popularidade</span>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Dicas para Melhores Recomendações
            </h3>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Adicione filmes e séries aos favoritos</p>
              <p>• Marque como assistido o que você já viu</p>
              <p>• Use os filtros de humor e ocasião</p>
              <p>• Explore diferentes gêneros</p>
              <p>• As recomendações melhoram com o tempo</p>
            </div>
          </div>

          {/* Níveis de confiança */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Níveis de Confiança
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">90%+</Badge>
                <span className="text-sm text-muted-foreground">
                  Alta confiança - Baseado em múltiplos fatores
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500">70-89%</Badge>
                <span className="text-sm text-muted-foreground">
                  Média confiança - Baseado em alguns fatores
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500">50-69%</Badge>
                <span className="text-sm text-muted-foreground">
                  Baixa confiança - Recomendação geral
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
