import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp, User, Globe, Languages } from 'lucide-react';
import { TMDBReview, buildImageUrl } from '../../utils/tmdb';
import { translateText } from '@/utils/translationService';

interface ReviewCardProps {
  review: TMDBReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Determinar se o conteúdo deve ser truncado (ex: mais de 300 caracteres)
  const MAX_LENGTH = 300;
  
  const contentToDisplay = showOriginal ? review.content : (translatedContent || review.content);
  const shouldTruncate = contentToDisplay.length > MAX_LENGTH;
  const displayContent = expanded || !shouldTruncate 
    ? contentToDisplay 
    : `${contentToDisplay.slice(0, MAX_LENGTH)}...`;

  const rating = review.author_details?.rating;
  const avatarPath = review.author_details?.avatar_path;
  const avatarUrl = avatarPath ? buildImageUrl(avatarPath, 'w200') : null;
  
  useEffect(() => {
    // Tentar traduzir automaticamente se não parecer português
    // Por simplificação, vamos tentar traduzir tudo que vier da API (o serviço lida com detecção 'auto')
    // Mas para não gastar chamadas desnecessárias se já sabemos que é PT, poderíamos checar algo simples
    // No entanto a API do TMDB não garante que 'pt-BR' results sejam realmente PT (usuários escrevem em qualquer língua)
    // Vamos traduzir tudo para garantir.
    
    const translate = async () => {
      if (!review.content) return;
      
      setIsTranslating(true);
      try {
        const translated = await translateText(review.content, 'pt');
        // Só define se for diferente do original (para evitar flash se já for PT)
        if (translated !== review.content) {
          setTranslatedContent(translated);
        }
      } catch (error) {
        console.error('Auto-translation failed:', error);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [review.content]);

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={review.author} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('fallback-avatar');
                }}
              />
            ) : (
               <User className="w-5 h-5 text-gray-400" />
            )}
            {/* Fallback icon handling would need more complex logic or a separate state, sticking to conditional rendering for now */}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{review.author}</h3>
            <span className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {rating && (
          <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-yellow-500">{rating}/10</span>
          </div>
        )}
      </div>

      <div className="flex-1 text-sm text-gray-300 leading-relaxed mb-3 relative">
        {isTranslating && !translatedContent ? (
           <span className="animate-pulse">Traduzindo...</span>
        ) : (
           <p className="whitespace-pre-line">{displayContent}</p>
        )}
      </div>

      {shouldTruncate && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mb-4 self-start"
        >
          {expanded ? (
            <>Ler menos <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Ler mais <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}
      
      <div className='mt-auto pt-4 border-t border-white/5 flex justify-between items-center'>
          <div className="flex gap-3">
             {translatedContent && (
                <button 
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Languages className="w-3 h-3" />
                  {showOriginal ? 'Ver tradução' : 'Ver original'}
                </button>
             )}
          </div>
          
          <a href={review.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white transition-colors">
              Ler no TMDB
          </a>
      </div>
    </div>
  );
};

export default ReviewCard;
