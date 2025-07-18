import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Settings,
  Download,
  Upload,
  Key,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileJson,
  Loader,
} from 'lucide-react';
import { useDataManager } from '@/hooks/useDataManager';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { toast } from '@/hooks/use-toast';

export const SettingsPage: React.FC = () => {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearType, setClearType] = useState<'favorites' | 'watched' | 'all'>(
    'all'
  );
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [newApiKey, setNewApiKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    exportData,
    importData,
    validateBackupFile,
    isImporting,
    isExporting,
  } = useDataManager();
  const {
    favorites,
    clearAllFavorites,
    getStats: getFavoritesStats,
  } = useFavoritesContext();
  const {
    watched,
    clearAllWatched,
    getStats: getWatchedStats,
  } = useWatchedContext();

  const favoritesStats = getFavoritesStats();
  const watchedStats = getWatchedStats();
  const currentApiKey = localStorage.getItem('tmdb_api_key');

  const handleExport = async () => {
    try {
      await exportData();
      toast({
        title: 'Dados exportados com sucesso!',
        description: 'Seu arquivo de backup foi baixado.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao exportar dados',
        description: 'Não foi possível criar o arquivo de backup.',
        variant: 'destructive',
      });
    }
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const isValid = await validateBackupFile(file);
      if (!isValid) {
        toast({
          title: 'Arquivo inválido',
          description:
            'O arquivo selecionado não é um backup válido do Cine Explorer.',
          variant: 'destructive',
        });
        return;
      }

      await importData(file, importMode === 'merge');
      toast({
        title: 'Dados importados com sucesso!',
        description: 'Seus dados foram restaurados.',
      });
      setShowImportDialog(false);
    } catch (error) {
      toast({
        title: 'Erro ao importar dados',
        description: 'Não foi possível processar o arquivo de backup.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateApiKey = () => {
    if (!newApiKey.trim()) {
      toast({
        title: 'Chave inválida',
        description: 'Por favor, insira uma chave de API válida.',
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem('tmdb_api_key', newApiKey.trim());
    setNewApiKey('');
    setShowApiKeyDialog(false);
    toast({
      title: 'Chave API atualizada',
      description: 'Sua chave da API foi atualizada com sucesso.',
    });
  };

  const handleClearData = () => {
    switch (clearType) {
      case 'favorites':
        clearAllFavorites();
        toast({
          title: 'Favoritos limpos',
          description: 'Todos os favoritos foram removidos.',
        });
        break;
      case 'watched':
        clearAllWatched();
        toast({
          title: 'Lista de assistidos limpa',
          description: 'Todos os itens assistidos foram removidos.',
        });
        break;
      case 'all':
        clearAllFavorites();
        clearAllWatched();
        localStorage.removeItem('tmdb_api_key');
        toast({
          title: 'Todos os dados limpos',
          description: 'Todos os seus dados foram removidos.',
        });
        break;
    }
    setShowClearDialog(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie seus dados, configurações e preferências do Cine Explorer
        </p>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {favoritesStats.total}
            </div>
            <div className="text-muted-foreground">Total de Favoritos</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {watchedStats.total}
            </div>
            <div className="text-muted-foreground">Itens Assistidos</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {watchedStats.totalHours}h
            </div>
            <div className="text-muted-foreground">Tempo Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Configuração da API */}
      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Key className="w-5 h-5" />
            Chave da API TMDB
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {currentApiKey
                  ? 'Chave configurada'
                  : 'Nenhuma chave configurada'}
              </p>
              {currentApiKey && (
                <p className="text-xs text-muted-foreground mt-1">
                  {currentApiKey.substring(0, 8)}...
                  {currentApiKey.substring(currentApiKey.length - 4)}
                </p>
              )}
            </div>
            <Button onClick={() => setShowApiKeyDialog(true)} variant="outline">
              {currentApiKey ? 'Atualizar' : 'Configurar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup e Restore */}
      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <FileJson className="w-5 h-5" />
            Backup e Restauração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleExport}
              disabled={
                isExporting || (favorites.length === 0 && watched.length === 0)
              }
              className="bg-gradient-hero border border-primary/20"
            >
              {isExporting ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exportar Dados
            </Button>

            <Button onClick={() => setShowImportDialog(true)} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar Dados
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Faça backup dos seus favoritos, lista de assistidos e configurações
            em um arquivo JSON.
          </p>
        </CardContent>
      </Card>

      {/* Limpeza de dados */}
      <Card className="bg-gradient-cinema border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <Trash2 className="w-5 h-5" />
            Limpeza de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setShowClearDialog(true)}
            variant="outline"
            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Dados
          </Button>

          <p className="text-sm text-muted-foreground">
            Remove favoritos, lista de assistidos ou todos os dados do
            aplicativo.
          </p>
        </CardContent>
      </Card>

      {/* Dialog para atualizar API Key */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="bg-gradient-cinema border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Configurar Chave da API
            </DialogTitle>
            <DialogDescription>
              Insira sua chave da API do TMDB para acessar os dados dos filmes e
              séries.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Sua chave da API TMDB"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="bg-secondary/50 border-primary/20"
            />

            <div className="flex gap-2">
              <Button onClick={handleUpdateApiKey} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button
                onClick={() => setShowApiKeyDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para importar dados */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="bg-gradient-cinema border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary">Importar Dados</DialogTitle>
            <DialogDescription>
              Selecione um arquivo de backup para restaurar seus dados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup
              value={importMode}
              onValueChange={(value) =>
                setImportMode(value as 'merge' | 'replace')
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="merge" id="merge" />
                <Label htmlFor="merge">Mesclar com dados existentes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace">Substituir dados existentes</Label>
              </div>
            </RadioGroup>

            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              ref={fileInputRef}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex-1"
              >
                {isImporting ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Selecionar Arquivo
              </Button>
              <Button
                onClick={() => setShowImportDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para limpar dados */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="bg-gradient-cinema border-red-500/20">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Limpar Dados
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Escolha o que deseja limpar:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup
              value={clearType}
              onValueChange={(value) => setClearType(value as typeof clearType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="favorites" id="favorites" />
                <Label htmlFor="favorites">
                  Apenas favoritos ({favoritesStats.total} itens)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="watched" id="watched" />
                <Label htmlFor="watched">
                  Apenas lista de assistidos ({watchedStats.total} itens)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">
                  Todos os dados (favoritos, assistidos e configurações)
                </Label>
              </div>
            </RadioGroup>

            <div className="flex gap-2">
              <Button
                onClick={handleClearData}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Confirmar Limpeza
              </Button>
              <Button
                onClick={() => setShowClearDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
