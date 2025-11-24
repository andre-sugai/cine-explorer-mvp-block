import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useCustomListsContext, CustomList } from '@/context/CustomListsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Film, Tv, MoreVertical } from 'lucide-react';
import { buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';

const CustomListsPage: React.FC = () => {
  const { lists, createList, deleteList, removeItemFromList } = useCustomListsContext();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      createList(newName, newDesc);
      setNewName('');
      setNewDesc('');
      setIsCreateOpen(false);
    }
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir esta lista?')) {
                        deleteList(list.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {list.items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {list.items.map((item) => (
                        <div key={item.id} className="relative group aspect-[2/3] rounded-md overflow-hidden bg-black/40">
                          <img
                            src={buildImageUrl(item.poster_path, 'w342')}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                            onClick={() => navigate(item.type === 'movie' ? `/filme/${item.id}` : `/serie/${item.id}`)}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 text-center">
                            <span className="text-xs font-medium text-white mb-2 line-clamp-2">{item.title}</span>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItemFromList(list.id, item.id);
                              }}
                              title="Remover da lista"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="absolute top-1 right-1 bg-black/60 rounded px-1 text-[10px] font-bold text-white uppercase">
                            {item.type === 'movie' ? 'Filme' : 'Série'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm italic bg-black/20 rounded-lg">
                      Lista vazia. Adicione filmes ou séries navegando pelo site!
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
