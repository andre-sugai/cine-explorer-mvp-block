
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  // Sempre incluir Home como primeiro item se não estiver presente
  const breadcrumbItems = items[0]?.label === 'Home' ? items : [
    { label: 'Home', href: '/' },
    ...items
  ];

  return (
    <div className={`bg-secondary/30 border-b border-primary/10 ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.current || !item.href ? (
                    <BreadcrumbPage className="text-foreground font-medium">
                      {item.label === 'Home' && <Home className="w-4 h-4 mr-1 inline" />}
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        to={item.href} 
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                      >
                        {item.label === 'Home' && <Home className="w-4 h-4 mr-1" />}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                
                {index < breadcrumbItems.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="w-4 h-4" />
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
