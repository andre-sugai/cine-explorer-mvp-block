import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useCustomListsContext, CustomList, CustomListItem } from '@/context/CustomListsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Film, Tv, MoreVertical, Search, Loader, X } from 'lucide-react';
import { buildImageUrl, searchMulti } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MovieCard } from '@/components/search/cards/MovieCard';

const CustomListsPage: React.FC = () => {
  const { lists, createList, deleteList, addItemToList, removeItemFromList } = useCustomListsContext();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const navigate = useNavigate();

  // Search & Add Item State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      createList(newName, newDesc);
      setNewName('');
      setNewDesc('');
      setIsCreateOpen(false);
    }
  };

  const openSearchDialog = (listId: string) => {
    setActiveListId(listId);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchLoading(true);
    try {
      const data = await searchMulti(searchQuery);
      // Filter only movies and tv shows
      const filtered = data.results?.filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
      ) || [];
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Erro ao buscar filmes/séries');
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleAddItem = (item: any) => {
    if (!activeListId) return;

    const newItem: CustomListItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      type: item.media_type === 'movie' ? 'movie' : 'tv',
      release_date: item.release_date || item.first_air_date,
      vote_average: item.vote_average,
      genre_ids: item.genre_ids,
      overview: item.overview,
    };

    addItemToList(activeListId, newItem);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Minhas Listas</h1>
            <p className="text-muted-foreground">Crie e organize suas coleções personalizadas</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Lista
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-cinema border-primary/20">
              <DialogHeader>
                <DialogTitle>Criar Nova Lista</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Lista</label>
                  <Input 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Maratona Halloween"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição (Opcional)</label>
                  <Textarea 
                    value={newDesc} 
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Uma breve descrição sobre esta lista..."
                  />
                </div>
                <Button type="submit" className="w-full">Criar Lista</Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Search Dialog */}
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogContent className="bg-gradient-cinema border-primary/20 max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Adicionar à Lista</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar filme ou série..."
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit" disabled={isSearchLoading}>
                  {isSearchLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                      <div className="w-12 h-18 bg-black/40 rounded overflow-hidden flex-shrink-0">
                        {item.poster_path ? (
                          <img 
                            src={buildImageUrl(item.poster_path, 'w92')} 
                            alt={item.title || item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            {item.media_type === 'movie' ? <Film size={16} /> : <Tv size={16} />}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title || item.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase">{item.media_type === 'movie' ? 'Filme' : 'Série'}</span>
                          {item.release_date || item.first_air_date ? (
                            <span>• {(item.release_date || item.first_air_date).substring(0, 4)}</span>
                          ) : null}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleAddItem(item)}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  ))
                ) : searchQuery && !isSearchLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum resultado encontrado.
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-20 bg-secondary/20 rounded-lg border border-dashed border-primary/20">
            <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma lista criada</h3>
            <p className="text-muted-foreground mb-6">Comece criando sua primeira lista personalizada!</p>
            <Button onClick={() => setIsCreateOpen(true)} variant="outline">
              Criar Lista
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {lists.map((list) => (
              <Card key={list.id} className="bg-gradient-cinema border-primary/20 overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl text-primary">{list.name}</CardTitle>
                    {list.description && (
                      <CardDescription className="mt-1">{list.description}</CardDescription>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {list.items.length} {list.items.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => openSearchDialog(list.id)}
                      title="Adicionar item"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta lista?')) {
                          deleteList(list.id);
                        }
                      }}
                      title="Excluir lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {list.items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {list.items.map((item) => (
                        <div key={item.id} className="relative group">
                          <MovieCard 
                            movie={{
                              ...item, 
                              poster_path: item.poster_path || '', 
                              title: item.title,
                              id: item.id
                            }} 
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 hover:scale-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItemFromList(list.id, item.id);
                            }}
                            title="Remover da lista"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm italic bg-black/20 rounded-lg">
                      Lista vazia. Adicione filmes ou séries navegando pelo site ou clicando no botão + acima!
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomListsPage;
