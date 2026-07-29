import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { MovieCard } from '@/components/search/cards/MovieCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, ArrowLeft, Heart, Eye } from 'lucide-react';
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Globe,
} from 'lucide-react';

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watched, setWatched] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Fetch public profile
        const { data: profileData, error: profileError } = await supabase
          .from('public_profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError || !profileData) {
          console.error("Profile not found:", profileError);
          setProfile(null);
          return;
        }

        setProfile(profileData);

        // 2. Fetch Favorites (using RPC function we'll create)
        const { data: favData, error: favError } = await supabase
          .rpc('get_public_favorites', { p_user_id: profileData.id });
          
        if (!favError && favData) {
          setFavorites(favData);
        }

        // 3. Fetch Watched (using RPC function we'll create)
        const { data: watchedData, error: watchedError } = await supabase
          .rpc('get_public_watched', { p_user_id: profileData.id });
          
        if (!watchedError && watchedData) {
          setWatched(watchedData);
        }

      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username]);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <h1 className="text-2xl font-bold text-white">Perfil não encontrado</h1>
          <p className="text-muted-foreground">O usuário @{username} não existe ou não tornou seu perfil público.</p>
          <Button asChild variant="outline">
            <Link to="/">Voltar para o Início</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/" className="flex items-center gap-2 hover:bg-secondary/50">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>

        {/* Capa */}
        <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden bg-secondary/30 mb-20 border border-primary/20">
          {profile.cover_image ? (
            <img 
              src={profile.cover_image} 
              alt="Capa" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/50"></div>
          )}
          
          {/* Avatar sobreposto */}
          <div className="absolute -bottom-0 translate-y-1/2 left-6 md:left-10 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-secondary overflow-hidden shadow-xl z-10 flex-shrink-0">
            {profile.profile_image ? (
              <img 
                src={profile.profile_image} 
                alt={profile.nickname} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20 text-4xl font-bold text-primary">
                {profile.nickname ? profile.nickname.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
        </div>

        {/* Info do Perfil */}
        <div className="px-6 md:px-10 mt-12 md:mt-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.nickname}</h1>
              <p className="text-primary font-medium">@{profile.username}</p>
            </div>
            
            {/* Redes Sociais */}
            {profile.social_media && Object.keys(profile.social_media).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.social_media.instagram && (
                  <a href={`https://instagram.com/${profile.social_media.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary rounded-full hover:bg-primary/20 hover:text-primary transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {profile.social_media.twitter && (
                  <a href={`https://twitter.com/${profile.social_media.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary rounded-full hover:bg-primary/20 hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {profile.social_media.facebook && (
                  <a href={profile.social_media.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary rounded-full hover:bg-primary/20 hover:text-primary transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {profile.social_media.youtube && (
                  <a href={profile.social_media.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary rounded-full hover:bg-primary/20 hover:text-primary transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {profile.social_media.website && (
                  <a href={profile.social_media.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary rounded-full hover:bg-primary/20 hover:text-primary transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {profile.bio && (
            <div className="mt-6 max-w-3xl">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Abas de Listas */}
        <div className="px-4 md:px-8 mt-12">
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-gradient-cinema border-primary/20">
              <TabsTrigger
                value="favorites"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-cinema-dark"
              >
                <Heart className="w-4 h-4" />
                Favoritos ({favorites.length})
              </TabsTrigger>
              <TabsTrigger
                value="watched"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-cinema-dark"
              >
                <Eye className="w-4 h-4" />
                Assistidos ({watched.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="mt-6">
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {favorites.map((item) => (
                    <MovieCard
                      key={item.id}
                      id={item.item_id}
                      title={item.title}
                      posterPath={item.poster_path}
                      voteAverage={item.vote_average}
                      type={item.item_type || 'movie'}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border rounded-lg bg-secondary/10 border-primary/10">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum favorito</h3>
                  <p className="text-muted-foreground">Este usuário ainda não adicionou favoritos.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="watched" className="mt-6">
              {watched.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {watched.map((item) => (
                    <MovieCard
                      key={item.id}
                      id={item.item_id}
                      title={item.title}
                      posterPath={item.poster_path}
                      voteAverage={item.vote_average}
                      type={item.item_type || 'movie'}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border rounded-lg bg-secondary/10 border-primary/10">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum título assistido</h3>
                  <p className="text-muted-foreground">Este usuário ainda não marcou títulos como assistidos.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
