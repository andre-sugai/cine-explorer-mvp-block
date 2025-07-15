
import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SearchSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {[...Array(15)].map((_, i) => (
        <Card key={i} className="overflow-hidden bg-gradient-cinema border-primary/20">
          <div className="aspect-[2/3]">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
};
