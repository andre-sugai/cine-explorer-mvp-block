import React from 'react';
import { Layout } from '@/components/Layout';
import { RecommendedContent } from '@/components/RecommendedContent';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Sparkles } from 'lucide-react';

const RecommendationsPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <HeroHeader 
          title="Sistema de Recomendações"
          description="Descubra filmes e séries perfeitos para você baseado no seu histórico e preferências. Use os filtros de humor e ocasião para encontrar exatamente o que você procura."
          icon={Sparkles}
          colorScheme="purple"
        />

        {/* Componente de recomendações */}
        <RecommendedContent />
      </div>
    </Layout>
  );
};

export default RecommendationsPage;
