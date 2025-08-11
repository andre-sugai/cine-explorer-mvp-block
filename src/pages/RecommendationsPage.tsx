import React from 'react';
import { Layout } from '@/components/Layout';
import { RecommendedContent } from '@/components/RecommendedContent';

const RecommendationsPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header da página */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Sistema de Recomendações
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra filmes e séries perfeitos para você baseado no seu
            histórico e preferências. Use os filtros de humor e ocasião para
            encontrar exatamente o que você procura.
          </p>
        </div>

        {/* Componente de recomendações */}
        <RecommendedContent />
      </div>
    </Layout>
  );
};

export default RecommendationsPage;
