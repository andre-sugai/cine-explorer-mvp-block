import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import SearchResults from './pages/SearchResults';
import MovieDetails from './pages/MovieDetails';
import TVShowDetails from './pages/TVShowDetails';
import PersonDetails from './pages/PersonDetails';
import FavoritesPage from './pages/FavoritesPage';
import WantToWatchPage from './pages/WantToWatchPage';
import WatchedPage from './pages/WatchedPage';
import SettingsPage from './pages/SettingsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import StatisticsPage from './pages/StatisticsPage';
import NotFound from './pages/NotFound';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { WantToWatchProvider } from '@/context/WantToWatchContext';
import { WatchedProvider } from '@/context/WatchedContext';
import { DetailNameProvider } from '@/context/DetailNameContext';
import { AuthProvider } from '@/context/AuthContext';
import { CustomListsProvider } from '@/context/CustomListsContext';
import CustomListsPage from '@/pages/CustomListsPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DetailNameProvider>
          <FavoritesProvider>
            <WantToWatchProvider>
              <WatchedProvider>
                <CustomListsProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/busca/:term" element={<SearchResults />} />
                      <Route path="/filme/:id" element={<MovieDetails />} />
                      <Route path="/serie/:id" element={<TVShowDetails />} />
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
                      <Route path="/configuracoes" element={<SettingsPage />} />
                      <Route path="/estatisticas" element={<StatisticsPage />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </CustomListsProvider>
              </WatchedProvider>
            </WantToWatchProvider>
          </FavoritesProvider>
        </DetailNameProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
