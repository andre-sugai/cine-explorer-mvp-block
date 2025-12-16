import React, { useEffect, useState } from 'react';
import { MessageSquareOff } from 'lucide-react';
import { TMDBReview, getMovieReviews, getTVShowReviews } from '../../utils/tmdb';
import ReviewCard from './ReviewCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ReviewsListProps {
  id: number;
  type: 'movie' | 'tv';
}

const ReviewsList: React.FC<ReviewsListProps> = ({ id, type }) => {
  const [reviews, setReviews] = useState<TMDBReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
      try {
        const data =
          type === 'movie'
            ? await getMovieReviews(id)
            : await getTVShowReviews(id);
        
        // Filter out reviews with empty content just in case
        const validReviews = data.results.filter(r => r.content && r.content.trim().length > 0);
        setReviews(validReviews);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Falha ao carregar avaliações.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id, type]);

  if (loading) {
    return (
      <div className="py-8 animate-pulse space-y-4">
         <div className="h-6 w-32 bg-white/5 rounded mb-6"></div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-white/5 rounded-xl"></div>
            <div className="h-40 bg-white/5 rounded-xl"></div>
         </div>
      </div>
    );
  }

  if (error) {
      // Silently fail or show minimal error? Let's just return nothing or a minimal message
      return null; 
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-xl border border-white/5">
        <MessageSquareOff className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm">Nenhuma avaliação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        Opiniões da Comunidade
        <span className="text-sm font-normal text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
            {reviews.length}
        </span>
      </h3>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {reviews.map((review) => (
            <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/2">
              <div className="h-full">
                <ReviewCard review={review} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
            <CarouselPrevious className="left-[-15px] bg-black/50 border-white/10 hover:bg-black/80 text-white" />
            <CarouselNext className="right-[-15px] bg-black/50 border-white/10 hover:bg-black/80 text-white" />
        </div>
      </Carousel>
    </div>
  );
};

export default ReviewsList;
