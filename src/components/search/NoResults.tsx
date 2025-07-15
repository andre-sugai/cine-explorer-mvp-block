
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NoResults: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-cinema border-primary/20 mx-auto max-w-md">
      <CardContent className="p-8 text-center">
        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-muted-foreground mb-6">
          Tente usar palavras-chave diferentes ou verifique a ortografia.
        </p>
        <Button 
          variant="outline"
          onClick={() => navigate('/')}
          className="w-full"
        >
          Nova Busca
        </Button>
      </CardContent>
    </Card>
  );
};
