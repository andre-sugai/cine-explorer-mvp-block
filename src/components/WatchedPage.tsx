import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trash2 } from 'lucide-react';
import { useWatchedContext } from '@/context/WatchedContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PersonalListCard } from '@/components/personal/PersonalListCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const WatchedPage: React.FC = () => {
  const { watched, removeFromWatched, clearAllWatched, cleanInvalidWatched } =
    useWatchedContext();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [orderBy, setOrderBy] = React.useState<'date' | 'rating'>('date');
  const [orderDirection, setOrderDirection] = React.useState<'asc' | 'desc'>(
    'desc'
  );

  // Limpeza automática ao carregar a página
  useEffect(() => {
    cleanInvalidWatched();
  }, []);

  const handleRemoveWatched = (id: number, type: string, title: string) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover "${title}" da sua lista de assistidos?`
      )
    ) {
      removeFromWatched(id, type);
      toast({
        title: 'Removido da lista',
        description: `${title} foi removido da sua lista de assistidos.`,
      });
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Tem certeza que deseja limpar toda a lista de assistidos? Esta ação não pode ser desfeita.'
      )
    ) {
      clearAllWatched();
      toast({
        title: 'Lista limpa',
        description: 'Todos os itens foram removidos da lista de assistidos.',
      });
    }
  };

  const navigateToDetails = (item: any) => {
    if (item.type === 'movie') {
      navigate(`/filme/${item.id}`);
    } else if (item.type === 'tv') {
      navigate(`/serie/${item.id}`);
    }
  };

  const stats = {
    total: watched.length,
    avgRating:
      watched.length > 0
        ? (
            watched.reduce((acc, cur) => acc + (cur.vote_average || 0), 0) /
            watched.length
          ).toFixed(1)
        : '0.0',
  };

  const filterList = (items: any[]) => {
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  const sortList = (items: any[]) => {
    if (orderBy === 'date') {
      return [...items].sort((a, b) => {
        const dateA = new Date(a.watchedAt).getTime();
        const dateB = new Date(b.watchedAt).getTime();
        return orderDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (orderBy === 'rating') {
      return [...items].sort((a, b) => {
        const ratingA = a.vote_average || 0;
        const ratingB = b.vote_average || 0;
        return orderDirection === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    }
    return items;
  };
  const filteredSortedList = sortList(filterList(watched));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">
          Meus Filmes Assistidos
        </h2>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e mantenha um registro de tudo que você
          assistiu
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.avgRating}
            </div>
            <div className="text-sm text-muted-foreground">Nota Média</div>
          </CardContent>
        </Card>
      </div>
      {/* Controles: busca e filtros de ordenação */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-2 items-center max-w-xl w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar na lista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-primary/20"
            />
          </div>
          {/* Filtros de ordenação ao lado do campo de busca */}
          <div className="flex gap-2 items-center">
            <label className="text-sm text-muted-foreground">
              Ordenar por:
            </label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value as 'date' | 'rating')}
              className="border rounded px-2 py-1 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="date">Data</option>
              <option value="rating">Nota</option>
            </select>
            <select
              value={orderDirection}
              onChange={(e) =>
                setOrderDirection(e.target.value as 'asc' | 'desc')
              }
              className="border rounded px-2 py-1 text-sm bg-secondary/50 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de assistidos */}
      {filteredSortedList.length === 0 ? (
        <Card className="bg-gradient-cinema border-primary/20 text-center">
          <CardContent className="p-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              Nenhum filme assistido ainda
            </h3>
            <p className="text-muted-foreground mb-6">
              Comece a marcar filmes como assistidos para acompanhar seu
              progresso
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSortedList.map((item) => (
            <PersonalListCard
              key={`${item.type}-${item.id}`}
              item={item}
              onDetailsClick={() => navigateToDetails(item)}
              showDate={true}
              dateLabel="Assistido em"
              actions={[
                {
                  label: 'Remover',
                  onClick: () =>
                    handleRemoveWatched(item.id, item.type, item.title),
                  variant: 'destructive',
                },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
};
