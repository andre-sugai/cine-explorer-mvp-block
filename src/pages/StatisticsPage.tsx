import React from 'react';
import { Layout } from '@/components/Layout';
import { useWatchedContext } from '@/context/WatchedContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Film, Tv, Clock, Star } from 'lucide-react';
import { TMDBGenre, getAllGenres } from '@/utils/tmdb';

const StatisticsPage: React.FC = () => {
  const { getStats, watched } = useWatchedContext();
  const stats = getStats();
  const [genres, setGenres] = React.useState<TMDBGenre[]>([]);

  React.useEffect(() => {
    getAllGenres().then(setGenres);
  }, []);

  // Prepare data for Genre Pie Chart
  const genreData = React.useMemo(() => {
    const genreCount: { [key: string]: number } = {};
    watched.forEach((item) => {
      item.genre_ids?.forEach((id) => {
        const genreName = genres.find((g) => g.id === id)?.name || 'Outros';
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

  const COLORS = ['#E50914', '#FF9900', '#0063E5', '#28B463', '#8E44AD'];

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
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.movies} filmes, {stats.series} séries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo Total
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHours}h</div>
              <p className="text-xs text-muted-foreground">
                Horas de entretenimento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20">
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
              <p className="text-xs text-muted-foreground">
                Baseado no histórico
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Tv className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Títulos assistidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Chart */}
          <Card className="bg-card border-primary/20">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
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
