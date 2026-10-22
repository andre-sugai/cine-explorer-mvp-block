import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Loader } from 'lucide-react';
import Index from './pages/Index';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { WantToWatchProvider } from '@/context/WantToWatchContext';
import { WatchedProvider } from '@/context/WatchedContext';
import { DetailNameProvider } from '@/context/DetailNameContext';
import { AuthProvider } from '@/context/AuthContext';
import { CustomListsProvider } from '@/context/CustomListsContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { SyncProvider } from '@/context/SyncContext';
import { syncBlacklistWithSupabase } from '@/utils/adultContentFilter';

const SearchResults = lazy(() => import('./pages/SearchResults'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const TVShowDetails = lazy(() => import('./pages/TVShowDetails'));
const CollectionDetails = lazy(() => import('./pages/CollectionDetails'));
const PersonDetails = lazy(() => import('./pages/PersonDetails'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const WantToWatchPage = lazy(() => import('./pages/WantToWatchPage'));
const WatchedPage = lazy(() => import('./pages/WatchedPage'));
const CustomListsPage = lazy(() => import('@/pages/CustomListsPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const PublicProfilePage = lazy(() => import('@/pages/PublicProfilePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Loader className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const AppContent = () => {
  useEffect(() => {
    // Sincroniza a blacklist global na inicialização do app
    syncBlacklistWithSupabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <SyncProvider>
            <DetailNameProvider>
              <SettingsProvider>
                <FavoritesProvider>
                  <WantToWatchProvider>
                    <WatchedProvider>
                      <CustomListsProvider>
                        <BrowserRouter>
                          <Suspense fallback={<PageLoader />}>
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/busca/:term" element={<SearchResults />} />
                              <Route path="/filme/:id" element={<MovieDetails />} />
                              <Route path="/serie/:id" element={<TVShowDetails />} />
                              <Route path="/colecao/:id" element={<CollectionDetails />} />
                              <Route path="/pessoa/:id" element={<PersonDetails />} />
                              <Route path="/favoritos" element={<FavoritesPage />} />
                              <Route
                                path="/quero-assistir"
                                element={<WantToWatchPage />}
                              />
                              <Route path="/vistos" element={<WatchedPage />} />
                              <Route path="/listas" element={<CustomListsPage />} />
                              <Route
                                path="/recomendacoes"
                                element={<RecommendationsPage />}
                              />
                              <Route path="/calendario" element={<CalendarPage />} />
                              <Route path="/configuracoes" element={<SettingsPage />} />
                              <Route path="/estatisticas" element={<StatisticsPage />} />
                              <Route path="/u/:username" element={<PublicProfilePage />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </BrowserRouter>
                      </CustomListsProvider>
                    </WatchedProvider>
                  </WantToWatchProvider>
                </FavoritesProvider>
              </SettingsProvider>
            </DetailNameProvider>
          </SyncProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => <AppContent />;

export default App;
