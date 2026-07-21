import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useWatchedContext } from '@/context/WatchedContext';
import { useAuth } from '@/context/AuthContext';
import { isAdminUser } from '@/utils/adultContentFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Film, Tv, Clock, Star, Activity, CalendarDays, CalendarClock, StarHalf, PieChart as PieChartIcon } from 'lucide-react';
import { TMDBGenre, getAllGenres } from '@/utils/tmdb';
import { getDecadeFact, getWeekdayFact, getRatingFact, getMovieVsTvFact, getTotalWatchedFact, getTotalTimeFact, getGenreFact } from '@/utils/statsFacts';
import { Heatmap } from '@/components/Heatmap';
import { CreditsSyncModal } from '@/components/CreditsSyncModal';
import { Trophy, Frown, Users, UserRound, Timer } from 'lucide-react';

const StatisticsPage: React.FC = () => {
  const { getStats, watched } = useWatchedContext();
  const { user } = useAuth();
  const isAdmin = isAdminUser(user?.email);
  const stats = getStats();
  const [genres, setGenres] = React.useState<TMDBGenre[]>([]);
  const [apiQuota, setApiQuota] = React.useState<{
    limit: number;
    remaining: number;
    updated: string | null;
  }>({ limit: 0, remaining: 0, updated: null });

  React.useEffect(() => {
    getAllGenres().then(setGenres);

    // Initial load of quota
    const loadQuota = () => {
      const limit = parseInt(localStorage.getItem('tmdb_rate_limit') || '40');
      const remaining = parseInt(
        localStorage.getItem('tmdb_rate_remaining') || '40'
      );
      const updated = localStorage.getItem('tmdb_rate_updated');
      setApiQuota({ limit, remaining, updated });
    };

    loadQuota();

    // Listen for updates
    const handleQuotaUpdate = () => loadQuota();
    window.addEventListener('tmdb-quota-updated', handleQuotaUpdate);

    // Atualizar a cada segundo para mostrar mudanças em tempo real
    const intervalId = setInterval(loadQuota, 1000);

    return () => {
      window.removeEventListener('tmdb-quota-updated', handleQuotaUpdate);
      clearInterval(intervalId);
    };
  }, []);

  // Prepare data for Genre Pie Chart
  const genreData = React.useMemo(() => {
    const genreCount: { [key: string]: number } = {};
    watched.forEach((item) => {
      item.genre_ids?.forEach((id) => {
        let genreName = genres.find((g) => g.id === id)?.name || 'Outros';
        
        // Normalização de gêneros de TV vs Filmes para evitar divisão de votos
        if (genreName === 'Sci-Fi & Fantasy' || genreName.includes('Ficção científica e fantasia')) {
          genreName = 'Ficção Científica';
        }
        if (genreName === 'Action & Adventure' || genreName === 'Action' || genreName.includes('Ação e Aventura')) {
          genreName = 'Ação';
        }

        genreCount[genreName] = (genreCount[genreName] || 0) + 1;
      });
    });

    return Object.entries(genreCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 genres
  }, [watched, genres]);

  // Prepare data for Activity Bar Chart (Last 6 months)
  const activityData = React.useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear(),
        count: 0,
      });
    }

    watched.forEach((item) => {
      const date = new Date(item.watchedAt);
      const monthData = months.find(
        (m) => m.month === date.getMonth() && m.year === date.getFullYear()
      );
      if (monthData) {
        monthData.count++;
      }
    });

    return months;
  }, [watched]);

  const thisMonthElements = React.useMemo(() => {
    const thisMonthItems = watched.filter((w: any) => {
      const watchedDate = new Date(w.watchedAt);
      const now = new Date();
      return (
        watchedDate.getMonth() === now.getMonth() &&
        watchedDate.getFullYear() === now.getFullYear()
      );
    });
    
    if (thisMonthItems.length === 0) return <span>Nenhum título</span>;
    
    return (
      <div className="flex flex-wrap gap-1">
        {thisMonthItems.map((w: any, i: number) => {
          const isLast = i === thisMonthItems.length - 1;
          const url = w.type === 'movie' ? `/filme/${w.id}` : `/serie/${w.tvId || w.id}`;
          return (
            <React.Fragment key={`${w.id}-${w.type}-${i}`}>
              <Link to={url} className="hover:underline hover:text-primary transition-colors cursor-pointer">
                {w.title || w.name}
              </Link>
              {!isLast && <span>,</span>}
            </React.Fragment>
          );
        })}
      </div>
    );
  }, [watched]);

  // Advanced Stats Memos
  const heatmapData = React.useMemo(() => {
    const dates: Record<string, number> = {};
    watched.forEach(w => {
      if (w.watchedAt) {
        const d = new Date(w.watchedAt).toISOString().split('T')[0];
        dates[d] = (dates[d] || 0) + 1;
      }
    });
    return Object.entries(dates).map(([d, c]) => ({ date: new Date(d), count: c }));
  }, [watched]);

  const hallOfFame = React.useMemo(() => {
    return [...watched]
      .filter(w => w.vote_average && w.vote_average > 0)
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 3);
  }, [watched]);

  const hallOfShame = React.useMemo(() => {
    return [...watched]
      .filter(w => w.vote_average && w.vote_average > 0 && w.vote_average < 10)
      .sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0))
      .slice(0, 3);
  }, [watched]);

  const longestTitle = React.useMemo(() => {
    return [...watched]
      .filter(w => w.runtime && w.runtime > 0)
      .sort((a, b) => (b.runtime || 0) - (a.runtime || 0))[0];
  }, [watched]);

  const topActors = React.useMemo(() => {
    const counts: Record<string, { id: number, name: string, count: number }> = {};
    watched.forEach(w => {
      w.cast?.forEach(c => {
        if (!counts[c.id]) counts[c.id] = { id: c.id, name: c.name, count: 0 };
        counts[c.id].count++;
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [watched]);

  const topDirectors = React.useMemo(() => {
    const counts: Record<string, { id: number, name: string, count: number }> = {};
    watched.forEach(w => {
      w.directors?.forEach(c => {
        if (!counts[c.id]) counts[c.id] = { id: c.id, name: c.name, count: 0 };
        counts[c.id].count++;
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [watched]);

  const COLORS = ['#E50914', '#FF9900', '#0063E5', '#28B463', '#8E44AD'];

  // Calculate percentage used
  const quotaPercentage =
    apiQuota.limit > 0
      ? ((apiQuota.limit - apiQuota.remaining) / apiQuota.limit) * 100
      : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Estatísticas do Cinéfilo
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e hábitos de visualização
          </p>
        </div>

        <CreditsSyncModal />

        {/* Heatmap & Longest Title */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-card border-primary/20 lg:col-span-2">
            <CardHeader>
              <CardTitle>Calendário de Maratonas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Seu histórico de visualização ao longo do último ano
              </p>
            </CardHeader>
            <CardContent>
              <Heatmap data={heatmapData} />
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                Desafio da Bexiga de Aço
              </CardTitle>
            </CardHeader>
            <CardContent>
              {longestTitle ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold">{longestTitle.title}</h4>
                    <p className="text-sm text-muted-foreground">O título mais longo que você já assistiu</p>
                  </div>
                  <div className="text-3xl font-black text-primary">
                    {longestTitle.runtime} <span className="text-lg font-normal text-muted-foreground">minutos</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum título com duração registrada.</p>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Hall of Fame & Shame */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Obras Primas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hallOfFame.map((w, i) => (
                <div key={w.id} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                  <div className="flex gap-3 items-center">
                    <span className="font-black text-xl text-yellow-500/50">{i + 1}</span>
                    <span className="font-medium">{w.title}</span>
                  </div>
                  <span className="font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {w.vote_average?.toFixed(1)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Frown className="h-5 w-5 text-red-500" />
                Fiascos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hallOfShame.map((w, i) => (
                <div key={w.id} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                  <div className="flex gap-3 items-center">
                    <span className="font-black text-xl text-red-500/50">{i + 1}</span>
                    <span className="font-medium">{w.title}</span>
                  </div>
                  <span className="font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 text-red-500" />
                    {w.vote_average?.toFixed(1)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Cast & Crew */}
        {(topActors.length > 0 || topDirectors.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {topActors.length > 0 && (
              <Card className="bg-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Atores Favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topActors.map((actor, i) => (
                    <div key={actor.id} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                      <div className="flex gap-3 items-center">
                        <span className="font-black text-xl text-primary/50">{i + 1}</span>
                        <span className="font-medium">{actor.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{actor.count} títulos</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {topDirectors.length > 0 && (
              <Card className="bg-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-primary" />
                    Diretores Favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topDirectors.map((director, i) => (
                    <div key={director.id} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                      <div className="flex gap-3 items-center">
                        <span className="font-black text-xl text-primary/50">{i + 1}</span>
                        <span className="font-medium">{director.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{director.count} títulos</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Assistido
              </CardTitle>
              <Film className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-baseline gap-1">
                {stats.total}
                <span className="text-sm font-normal text-muted-foreground">títulos</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {stats.movies} filmes, {stats.series} séries/eps
              </p>
              <p className="text-xs text-primary/80 italic pt-2 border-t border-border/50">
                {getTotalWatchedFact(stats.total)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-baseline gap-1">
                {stats.totalHours}
                <span className="text-sm font-normal text-muted-foreground">horas</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Horas de entretenimento
              </p>
              <p className="text-xs text-primary/80 italic pt-2 border-t border-border/50">
                {getTotalTimeFact(stats.totalHours)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gênero Favorito
              </CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {genres.find((g) => g.id === stats.mostWatchedGenre)?.name ||
                  '-'}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Baseado no histórico
              </p>
              <p className="text-xs text-primary/80 italic pt-2 border-t border-border/50">
                {getGenreFact(genres.find((g) => g.id === stats.mostWatchedGenre)?.name || '-')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Tv className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground mb-4">
                Títulos assistidos
              </p>
              <div className="text-xs text-primary/80 italic pt-2 border-t border-border/50 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {thisMonthElements}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-primary/20 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Década Favorita</CardTitle>
              <CalendarDays className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoriteDecade}</div>
              <p className="text-xs text-muted-foreground mb-4">
                Lançamentos mais assistidos
              </p>
              <p className="text-xs text-primary/80 italic pt-2 border-t border-border/50">
                {getDecadeFact(stats.favoriteDecade)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dia da Pipoca</CardTitle>
              <CalendarClock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{stats.favoriteWeekday}</div>
              <p className="text-xs text-muted-foreground mb-4">
                Dia em que mais assiste
              </p>
              <p className="text-xs text-primary/80 italic pt-2 border-t border-border/50">
                {getWeekdayFact(stats.favoriteWeekday)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
              <StarHalf className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '-'}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Avaliação do TMDB
              </p>
              <p className="text-xs text-primary/80 italic pt-2 border-t border-border/50">
                {getRatingFact(stats.averageRating)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filmes vs Séries</CardTitle>
              <PieChartIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.moviePercent > 0 ? `${stats.moviePercent.toFixed(0)}% Filmes` : '-'}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Proporção do catálogo
              </p>
              <p className="text-xs text-primary/80 italic pt-2 border-t border-border/50">
                {getMovieVsTvFact(stats.moviePercent)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Quota Card */}
        {isAdmin && (
          <Card className="bg-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cota da API TMDB
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Usado (últimos 10s)
                  </span>
                  <span className="font-medium">
                    {apiQuota.limit - apiQuota.remaining} / {apiQuota.limit}
                  </span>
                </div>
                <Progress
                  value={quotaPercentage}
                  className={`h-2 ${
                    quotaPercentage > 80 ? 'bg-red-500/20' : ''
                  }`}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Restam {apiQuota.remaining} requisições
                  </p>
                  {quotaPercentage > 80 && (
                    <span className="text-xs text-yellow-500">
                      ⚠️ Limite próximo
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  <strong>Limite:</strong> 40 requisições a cada 10 segundos
                </p>
                {apiQuota.updated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Última atualização:</strong>{' '}
                    {new Date(apiQuota.updated).toLocaleTimeString('pt-BR')}
                  </p>
                )}
              </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Chart */}
          <Card className="bg-card border-primary/20">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico da quantidade de filmes e séries que você marcou como assistidos ao longo dos últimos 6 meses.
              </p>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                    }}
                  />
                  <Bar dataKey="count" fill="#E50914" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Genre Chart */}
          <Card className="bg-card border-primary/20">
            <CardHeader>
              <CardTitle>Top 5 Gêneros</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>


      </div>
    </Layout>
  );
};

export default StatisticsPage;
