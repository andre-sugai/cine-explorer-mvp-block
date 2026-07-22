import React from 'react';
import { Layout } from '@/components/Layout';
import { RecommendedContent } from '@/components/RecommendedContent';
import { Sparkles } from 'lucide-react';

const RecommendationsPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header da página - Hero Section */}
        <div className="relative rounded-2xl overflow-hidden bg-card/30 border border-primary/20 p-8 md:p-12 text-center shadow-lg backdrop-blur-sm">
          {/* Efeitos de fundo */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-20%] left-[-10%] w-1/2 h-1/2 bg-purple-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-1/2 h-1/2 bg-pink-500/10 blur-[100px] rounded-full"></div>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 pb-2">
              Sistema de Recomendações
            </h1>
            <p className="text-lg text-muted-foreground">
              Descubra filmes e séries perfeitos para você baseado no seu
              histórico e preferências. Use os filtros de humor e ocasião para
              encontrar exatamente o que você procura.
            </p>
          </div>
        </div>

        {/* Componente de recomendações */}
        <RecommendedContent />
      </div>
    </Layout>
  );
};

export default RecommendationsPage;
