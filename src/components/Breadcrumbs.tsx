import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, ChevronLeft } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
}) => {
  const navigate = useNavigate();
  // Sempre incluir Home como primeiro item se não estiver presente
  const breadcrumbItems =
    items[0]?.label === 'Home'
      ? items
      : [{ label: 'Home', href: '/' }, ...items];

  return (
    <div className={`bg-secondary/30 border-b border-primary/10 ${className}`}>
      <div className="container mx-auto px-4 py-2 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 text-muted-foreground hover:text-primary px-3 -ml-2 h-8 bg-secondary/50 hover:bg-secondary/80 border border-primary/10 hover:border-primary/30 rounded-full transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
        <div className="h-4 w-px bg-border/50 hidden sm:block"></div>
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.current || !item.href ? (
                    <BreadcrumbPage className="text-foreground font-medium">
                      {item.label === 'Home' && (
                        <Home className="w-4 h-4 mr-1 inline" />
                      )}
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={item.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.label === 'Home' && (
                          <Home className="w-4 h-4 mr-1 inline" />
                        )}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {index < breadcrumbItems.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};
