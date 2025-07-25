import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPersonDetails, buildImageUrl, getPersonImages } from '@/utils/tmdb';
import { translateJob } from '@/utils/translations';
import ActionButtons from '@/components/ActionButtons';
import PersonCredits from '@/components/PersonCredits';
import { Layout } from '@/components/Layout';
import { ChevronLeft, Calendar, MapPin, Star, Users } from 'lucide-react';
import { useDetailNameContext } from '@/context/DetailNameContext';
import { ImageGallery } from '@/components/ImageGallery';

const PersonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setDetailName } = useDetailNameContext();

  const {
    data: person,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['person-details', id],
    queryFn: () => getPersonDetails(Number(id)),
    enabled: !!id,
  });

  // Busca imagens extras da pessoa
  const { data: images, isLoading: isLoadingImages } = useQuery({
    queryKey: ['person-images', id],
    queryFn: () => getPersonImages(Number(id)),
    enabled: !!id,
  });

  // Update URL with person name for breadcrumbs and document title
  useEffect(() => {
    if (person && person.name) {
      setDetailName(person.name);
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('name', person.name);
      window.history.replaceState({}, '', currentUrl.toString());
      document.title = `${person.name} - Cine Explorer`;
    }
  }, [person, setDetailName]);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-24" />
          <div className="grid md:grid-cols-3 gap-8">
            <Skeleton className="h-96 rounded-lg" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !person) {
    return (
      <Layout>
        <Card className="bg-gradient-cinema border-destructive/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Erro ao carregar pessoa
            </h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os detalhes da pessoa.
            </p>
            <Button onClick={() => navigate('/')}>Voltar ao início</Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const movieCredits = person.movie_credits?.cast || [];
  const tvCredits = person.tv_credits?.cast || [];
  const directorCredits =
    person.movie_credits?.crew?.filter((c: any) => c.job === 'Director') || [];

  return (
    <Layout>
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Foto e Informações Básicas */}
          <div className="space-y-6">
            <Card className="bg-gradient-cinema border-primary/20">
              <CardContent className="p-6">
                <img
                  src={buildImageUrl(person.profile_path, 'w500')}
                  alt={person.name}
                  className="w-full rounded-lg shadow-cinema mb-4"
                />
                <h1 className="text-2xl font-bold text-primary mb-4">
                  {person.name}
                </h1>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="secondary">
                      {translateJob(person.known_for_department)}
                    </Badge>
                  </div>

                  {person.birthday && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(person.birthday).toLocaleDateString('pt-BR')}
                      {person.deathday &&
                        ` - ${new Date(person.deathday).toLocaleDateString(
                          'pt-BR'
                        )}`}
                    </div>
                  )}

                  {person.place_of_birth && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {person.place_of_birth}
                    </div>
                  )}

                  {person.popularity && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4" />
                      Popularidade: {person.popularity.toFixed(1)}
                    </div>
                  )}
                </div>

                <ActionButtons
                  id={person.id}
                  type="person"
                  title={person.name}
                  profile_path={person.profile_path}
                />
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="bg-gradient-cinema border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Filmes</span>
                  <span className="font-semibold text-foreground">
                    {movieCredits.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Séries</span>
                  <span className="font-semibold text-foreground">
                    {tvCredits.length}
                  </span>
                </div>
                {directorCredits.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Como Diretor</span>
                    <span className="font-semibold text-foreground">
                      {directorCredits.length}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Biografia e Filmografia */}
          <div className="md:col-span-2 space-y-6">
            {person.biography && (
              <Card className="bg-gradient-cinema border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Biografia</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {person.biography}
                  </p>
                </CardContent>
              </Card>
            )}

            <PersonCredits
              movieCredits={person.movie_credits}
              tvCredits={person.tv_credits}
            />
          </div>
        </div>

        {/* Galeria de Imagens Extras */}
        {images && images.profiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">
              Galeria de Fotos
            </h2>
            <ImageGallery images={images.profiles} maxThumbs={15} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PersonDetails;
