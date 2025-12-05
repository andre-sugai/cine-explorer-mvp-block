
import React from 'react';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { ScrollToTopButton } from './ScrollToTopButton';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const breadcrumbs = useBreadcrumbs();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-[73px]" />
      
      {/* Breadcrumbs - only show if not home page and has breadcrumbs */}
      {!isHomePage && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      
      {/* Main content */}
      <main className={isHomePage ? "" : "container mx-auto px-4 py-8"}>
        {children}
      </main>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};
