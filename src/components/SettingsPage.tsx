import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  User,
  BarChart3,
  Cog,
  Lock,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Globe,
  Save,
  Tv,
} from 'lucide-react';
import { getWatchProviders, buildImageUrl } from '@/utils/tmdb';
import { useDataManager } from '@/hooks/useDataManager';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { useAuth } from '@/context/AuthContext';
import { useProfileImage } from '@/hooks/useProfileImage';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';

import { toast } from '@/hooks/use-toast';

/**
 * Interface para os dados do perfil do usuário
 */
interface UserProfile {
  nickname: string;
  bio: string;
  profileImage: string;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  };
}

/**
 * Interface para o formulário de troca de senha
 */
interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const SettingsPage: React.FC = () => {
  // Estados existentes
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearType, setClearType] = useState<'favorites' | 'watched' | 'all'>(
    'all'
  );
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [newApiKey, setNewApiKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Novos estados para funcionalidades do perfil
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Estados do perfil
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '',
    bio: '',
    profileImage: '',
    socialMedia: {},
  });

  // Estados do formulário de senha
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estado para Meus Streamings
  const [myStreamings, setMyStreamings] = useState<string[]>([]);
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  // Hooks existentes
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
  const { user, logout } = useAuth();
  const { deleteProfileImage, extractFileNameFromUrl } = useProfileImage();

  const favoritesStats = getFavoritesStats();
  const watchedStats = getWatchedStats();
  const currentApiKey = localStorage.getItem('tmdb_api_key');

  /**
   * Carrega os dados do perfil do localStorage
   */
  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    }
  }, []);

  /**
   * Carrega os provedores de streaming e as preferências do usuário
   */
  useEffect(() => {
    const loadProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const providers = await getWatchProviders('BR');

        // Filtrar e consolidar provedores duplicados/redundantes
        const deduplicatedProviders = providers.filter((p: any) => {
          const name = p.provider_name.toLowerCase();

          // Remover versões "with ads" (mesmo catálogo)
          if (name.includes('with ads') || name.includes('basic with ads')) {
            return false;
          }

          // Remover TODOS os "Channels" (revendas através de outras plataformas)
          // Ex: "Amazon Channel", "Apple TV Channel", "Plex Channel", "Roku Channel"
          if (name.includes(' channel')) {
            return false;
          }

          // Remover "Amazon Video" (manter apenas "Amazon Prime Video")
          if (p.provider_id === 10 && name.includes('amazon video')) {
            return false;
          }

          // Remover "Apple TV" (ID: 2) - manter apenas "Apple TV Plus" (ID: 350)
          if (p.provider_id === 2 && name === 'apple tv') {
            return false;
          }

          // Remover duplicatas de Apple iTunes vs Apple TV
          if (
            name === 'apple itunes' &&
            providers.some(
              (pr: any) => pr.provider_name.toLowerCase() === 'apple tv'
            )
          ) {
            return false;
          }

          // Remover "Plex" se existir "Plex Channel" ou vice-versa
          // Manter apenas um deles (o que não for channel)
          if (
            name === 'plex' &&
            providers.some(
              (pr: any) =>
                pr.provider_name.toLowerCase().includes('plex') &&
                !pr.provider_name.toLowerCase().includes('channel')
            )
          ) {
            // Se já existe outro Plex sem "channel", manter apenas um
            const plexProviders = providers.filter((pr: any) =>
              pr.provider_name.toLowerCase().includes('plex')
            );
            if (
              plexProviders.length > 1 &&
              plexProviders.findIndex(
                (pr: any) => pr.provider_id === p.provider_id
              ) > 0
            ) {
              return false;
            }
          }

          return true;
        });

        // Ordenar por prioridade (popularidade)
        // Mostrar TODOS os streamings disponíveis após deduplicação
        const sortedProviders = deduplicatedProviders.sort(
          (a: any, b: any) => a.display_priority - b.display_priority
        );

        setAvailableProviders(sortedProviders);
      } catch (error) {
        console.error('Erro ao carregar provedores:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    loadProviders();

    // Carregar streamings salvos
    const savedStreamings = localStorage.getItem('my_streamings');
    if (savedStreamings) {
      try {
        setMyStreamings(JSON.parse(savedStreamings));
      } catch (e) {
        console.error('Erro ao ler streamings salvos:', e);
      }
    }
  }, []);

  /**
   * Salva os streamings favoritos
   */
  const toggleStreaming = (providerId: string) => {
    setMyStreamings((prev) => {
      const newStreamings = prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId];

      localStorage.setItem('my_streamings', JSON.stringify(newStreamings));
      return newStreamings;
    });
  };

  /**
   * Salva os dados do perfil no localStorage
   */
  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      localStorage.setItem('user_profile', JSON.stringify(profile));
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar perfil',
        description: 'Não foi possível salvar suas informações.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  /**
   * Remove a imagem de perfil
   */
  const removeProfileImage = async () => {
    try {
      // Se há uma imagem atual, remove do Supabase Storage
      if (profile.profileImage && profile.profileImage.includes('supabase')) {
        const fileName = extractFileNameFromUrl(profile.profileImage);
        if (fileName) {
          await deleteProfileImage(fileName);
        }
      }

      // Atualiza o estado local
      setProfile((prev) => ({
        ...prev,
        profileImage: '',
      }));

      toast({
        title: 'Imagem removida',
        description: 'Sua foto de perfil foi removida.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao remover imagem',
        description: 'Não foi possível remover a imagem do servidor.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Atualiza a imagem de perfil
   */
  const updateProfileImage = (imageUrl: string) => {
    setProfile((prev) => ({
      ...prev,
      profileImage: imageUrl,
    }));
  };

  /**
   * Altera a senha do usuário
   */
  const handlePasswordChange = async () => {
    // Validações
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Senhas diferentes',
        description: 'A nova senha e confirmação não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Aqui você implementaria a lógica real de troca de senha
      // Por enquanto, apenas simula o processo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi atualizada com sucesso.',
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordDialog(false);
    } catch (error) {
      toast({
        title: 'Erro ao alterar senha',
        description: 'Não foi possível alterar sua senha.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  /**
   * Atualiza um campo específico do perfil
   */
  const updateProfileField = (field: keyof UserProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Atualiza um campo específico das redes sociais
   */
  const updateSocialMedia = (platform: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  // Funções existentes
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
        localStorage.removeItem('user_profile');
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

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-cinema border-primary/20">
          <TabsTrigger
            value="stats"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-cinema-dark"
          >
            <BarChart3 className="w-4 h-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-cinema-dark"
          >
            <Cog className="w-4 h-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-cinema-dark"
          >
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>

          <TabsTrigger
            value="streamings"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-cinema-dark"
          >
            <Tv className="w-4 h-4" />
            Meus Streamings
          </TabsTrigger>
        </TabsList>

        {/* Aba de Estatísticas do Usuário */}
        <TabsContent value="stats" className="space-y-6">
          <Card className="bg-gradient-cinema border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <BarChart3 className="w-5 h-5" />
                Estatísticas do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Estatísticas gerais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-secondary/30 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {favoritesStats.total}
                    </div>
                    <div className="text-muted-foreground">
                      Total de Favoritos
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/30 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {watchedStats.total}
                    </div>
                    <div className="text-muted-foreground">
                      Itens Assistidos
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/30 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {watchedStats.totalHours}h
                    </div>
                    <div className="text-muted-foreground">Tempo Total</div>
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-secondary/30 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">
                      Favoritos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Filmes:</span>
                      <span className="font-medium">
                        {favoritesStats.movies}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Séries:</span>
                      <span className="font-medium">
                        {favoritesStats.series}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pessoas:</span>
                      <span className="font-medium">
                        {favoritesStats.people}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/30 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">
                      Assistidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Filmes:</span>
                      <span className="font-medium">{watchedStats.movies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Séries:</span>
                      <span className="font-medium">{watchedStats.series}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tempo médio por item:
                      </span>
                      <span className="font-medium">
                        {watchedStats.total > 0
                          ? (
                              watchedStats.totalHours / watchedStats.total
                            ).toFixed(1)
                          : 0}
                        h
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Configurações de Funcionamento */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gradient-cinema border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Cog className="w-5 h-5" />
                Configurações de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuração da API */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      Chave da API TMDB
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure sua chave de API para acessar dados do The Movie
                      Database
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowApiKeyDialog(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    {currentApiKey ? 'Atualizar' : 'Configurar'}
                  </Button>
                </div>
                {currentApiKey && (
                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      Chave API configurada
                    </span>
                  </div>
                )}
              </div>

              {/* Backup e Restauração */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Backup e Restauração
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    {isExporting ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isExporting ? 'Exportando...' : 'Exportar Dados'}
                  </Button>

                  <Button
                    onClick={() => setShowImportDialog(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Importar Dados
                  </Button>
                </div>
              </div>

              {/* Controle Parental */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Controle Parental
                </h3>
                <div className="p-4 bg-secondary/30 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary">
                          Filtrar Conteúdo Adulto (+18)
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Oculta filmes e séries com conteúdo adulto, erótico ou
                        impróprio para menores
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="adult-content-filter"
                        className="rounded border-primary/20"
                        defaultChecked={
                          localStorage.getItem('adult_content_filter') ===
                          'true'
                        }
                        onChange={(e) => {
                          localStorage.setItem(
                            'adult_content_filter',
                            e.target.checked.toString()
                          );
                          toast({
                            title: e.target.checked
                              ? 'Filtro ativado'
                              : 'Filtro desativado',
                            description: e.target.checked
                              ? 'Conteúdo adulto será ocultado da navegação'
                              : 'Todo o conteúdo será exibido',
                          });
                        }}
                      />
                      <Label htmlFor="adult-content-filter" className="text-sm">
                        Ativar filtro
                      </Label>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <strong>Critérios de filtragem:</strong> Filmes com
                    classificação NC-17, gêneros adultos, palavras-chave
                    relacionadas a conteúdo erótico, e títulos com indicadores
                    de conteúdo adulto.
                  </div>
                </div>
              </div>

              {/* Sincronização com a Nuvem */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Sincronização
                </h3>
                <div className="p-4 bg-secondary/30 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary">
                          Sincronizar com a nuvem
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mantém suas listas salvas na nuvem para acessar em outros dispositivos.
                        Desative para manter os dados apenas neste dispositivo.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cloud-sync-toggle"
                        className="rounded border-primary/20"
                        defaultChecked={
                          localStorage.getItem('cine-explorer-sync-enabled') !== 'false'
                        }
                        onChange={(e) => {
                          localStorage.setItem(
                            'cine-explorer-sync-enabled',
                            e.target.checked.toString()
                          );
                          toast({
                            title: e.target.checked
                              ? 'Sincronização ativada'
                              : 'Sincronização desativada',
                            description: e.target.checked
                              ? 'Suas listas serão sincronizadas com a nuvem.'
                              : 'Suas listas serão mantidas apenas localmente.',
                          });
                          // Recarregar para aplicar mudanças nos contextos
                          setTimeout(() => window.location.reload(), 1000);
                        }}
                      />
                      <Label htmlFor="cloud-sync-toggle" className="text-sm">
                        Ativar
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Limpeza de Dados */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Limpeza de Dados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => {
                      setClearType('favorites');
                      setShowClearDialog(true);
                    }}
                    variant="outline"
                    className="flex items-center gap-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar Favoritos
                  </Button>

                  <Button
                    onClick={() => {
                      setClearType('watched');
                      setShowClearDialog(true);
                    }}
                    variant="outline"
                    className="flex items-center gap-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar Assistidos
                  </Button>

                  <Button
                    onClick={() => {
                      setClearType('all');
                      setShowClearDialog(true);
                    }}
                    variant="outline"
                    className="flex items-center gap-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar Tudo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Meus Streamings */}
        <TabsContent value="streamings" className="space-y-6">
          <Card className="bg-gradient-cinema border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Tv className="w-5 h-5" />
                Meus Streamings Favoritos
              </CardTitle>
              <CardDescription>
                Selecione seus serviços de streaming favoritos para filtrar o
                conteúdo na página inicial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProviders ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {availableProviders.map((provider) => {
                    const isSelected = myStreamings.includes(
                      provider.provider_id.toString()
                    );
                    return (
                      <div
                        key={provider.provider_id}
                        onClick={() =>
                          toggleStreaming(provider.provider_id.toString())
                        }
                        className={`
                          cursor-pointer rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-200
                          border-2 
                          ${
                            isSelected
                              ? 'border-primary bg-primary/10 scale-105 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                              : 'border-transparent bg-secondary/30 hover:bg-secondary/50 hover:scale-105'
                          }
                        `}
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-lg">
                          <img
                            src={buildImageUrl(provider.logo_path, 'w200')}
                            alt={provider.provider_name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <CheckCircle className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium text-center ${
                            isSelected
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {provider.provider_name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 p-4 bg-secondary/20 rounded-lg border border-primary/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">
                      Como funciona?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ao selecionar seus streamings aqui, uma nova opção{' '}
                      <strong>"Meus Streamings"</strong> aparecerá no filtro da
                      página inicial. Ela será selecionada automaticamente para
                      mostrar apenas filmes e séries disponíveis nos seus
                      serviços assinados.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Configuração de Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-gradient-cinema border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <User className="w-5 h-5" />
                Configuração de Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto de Perfil */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Foto de Perfil
                </h3>
                <ProfileImageUpload
                  currentImage={profile.profileImage}
                  onImageUpdate={updateProfileImage}
                  onImageRemove={removeProfileImage}
                />
              </div>

              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || 'Não logado'}
                      disabled
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nome/Nickname</Label>
                    <Input
                      id="nickname"
                      placeholder="Seu nome ou nickname"
                      value={profile.nickname}
                      onChange={(e) =>
                        updateProfileField('nickname', e.target.value)
                      }
                      maxLength={30}
                      className="bg-secondary/30 border-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre você e seus gostos cinematográficos..."
                    value={profile.bio}
                    onChange={(e) => updateProfileField('bio', e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="bg-secondary/30 border-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    {profile.bio.length}/500 caracteres
                  </p>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Redes Sociais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="instagram"
                      className="flex items-center gap-2"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      placeholder="@seu_usuario"
                      value={profile.socialMedia.instagram || ''}
                      onChange={(e) =>
                        updateSocialMedia('instagram', e.target.value)
                      }
                      className="bg-secondary/30 border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="twitter"
                      className="flex items-center gap-2"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter/X
                    </Label>
                    <Input
                      id="twitter"
                      placeholder="@seu_usuario"
                      value={profile.socialMedia.twitter || ''}
                      onChange={(e) =>
                        updateSocialMedia('twitter', e.target.value)
                      }
                      className="bg-secondary/30 border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="facebook"
                      className="flex items-center gap-2"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      placeholder="facebook.com/seu_perfil"
                      value={profile.socialMedia.facebook || ''}
                      onChange={(e) =>
                        updateSocialMedia('facebook', e.target.value)
                      }
                      className="bg-secondary/30 border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="linkedin"
                      className="flex items-center gap-2"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      placeholder="linkedin.com/in/seu_perfil"
                      value={profile.socialMedia.linkedin || ''}
                      onChange={(e) =>
                        updateSocialMedia('linkedin', e.target.value)
                      }
                      className="bg-secondary/30 border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="youtube"
                      className="flex items-center gap-2"
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </Label>
                    <Input
                      id="youtube"
                      placeholder="youtube.com/@seu_canal"
                      value={profile.socialMedia.youtube || ''}
                      onChange={(e) =>
                        updateSocialMedia('youtube', e.target.value)
                      }
                      className="bg-secondary/30 border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="website"
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://seu-site.com"
                      value={profile.socialMedia.website || ''}
                      onChange={(e) =>
                        updateSocialMedia('website', e.target.value)
                      }
                      className="bg-secondary/30 border-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Preferências do Usuário */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Preferências
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notifications"
                      className="rounded border-primary/20"
                    />
                    <Label htmlFor="notifications">
                      Receber notificações de novos filmes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="recommendations"
                      className="rounded border-primary/20"
                      defaultChecked
                    />
                    <Label htmlFor="recommendations">
                      Ativar recomendações personalizadas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="analytics"
                      className="rounded border-primary/20"
                      defaultChecked
                    />
                    <Label htmlFor="analytics">
                      Compartilhar dados para melhorar o serviço
                    </Label>
                  </div>
                </div>
              </div>

              {/* Ações da Conta */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Ações da Conta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={saveProfile}
                    disabled={isSavingProfile}
                    className="flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSavingProfile ? 'Salvando...' : 'Salvar Perfil'}
                  </Button>
                  <Button
                    onClick={() => setShowPasswordDialog(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Trocar Senha
                  </Button>
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Sair da Conta
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Conta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos existentes */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="bg-gradient-cinema border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Configurar Chave da API
            </DialogTitle>
            <DialogDescription>
              Insira sua chave de API do The Movie Database (TMDB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Sua chave da API TMDB"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="bg-secondary/30 border-primary/20"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowApiKeyDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateApiKey}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="bg-gradient-cinema border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary">Importar Dados</DialogTitle>
            <DialogDescription>
              Escolha como deseja importar seus dados de backup
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup
              value={importMode}
              onValueChange={(value: 'merge' | 'replace') =>
                setImportMode(value)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="merge" id="merge" />
                <Label htmlFor="merge">Mesclar com dados existentes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace">Substituir todos os dados</Label>
              </div>
            </RadioGroup>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Importando...
                  </>
                ) : (
                  <>
                    <FileJson className="w-4 h-4 mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="bg-gradient-cinema border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirmar Limpeza
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleClearData}
              className="bg-red-500 hover:bg-red-600"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de troca de senha */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gradient-cinema border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Trocar Senha
            </DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Sua senha atual"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="bg-secondary/30 border-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nova senha (mín. 6 caracteres)"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="bg-secondary/30 border-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme a nova senha"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="bg-secondary/30 border-primary/20"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Alterando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
