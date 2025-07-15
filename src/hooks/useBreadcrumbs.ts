
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { BreadcrumbItem } from '@/components/Breadcrumbs';

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();
  const params = useParams();

  return useMemo(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    // Home page - no breadcrumbs
    if (path === '/') {
      return [];
    }

    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    // Search results
    if (path.startsWith('/busca/')) {
      const term = params.term;
      breadcrumbs.push(
        { label: 'Busca', href: '/busca' },
        { label: term ? decodeURIComponent(term) : 'Resultados', current: true }
      );
      return breadcrumbs;
    }

    // Movie details
    if (path.startsWith('/filme/')) {
      const movieTitle = searchParams.get('title') || `Filme ${params.id}`;
      breadcrumbs.push(
        { label: 'Filmes', href: '/busca/popular-movies' },
        { label: movieTitle, current: true }
      );
      return breadcrumbs;
    }

    // TV Show details
    if (path.startsWith('/serie/')) {
      const showTitle = searchParams.get('title') || `Série ${params.id}`;
      breadcrumbs.push(
        { label: 'Séries', href: '/busca/popular-tv' },
        { label: showTitle, current: true }
      );
      return breadcrumbs;
    }

    // Person details
    if (path.startsWith('/pessoa/')) {
      const personName = searchParams.get('name') || `Pessoa ${params.id}`;
      breadcrumbs.push(
        { label: 'Pessoas', href: '/busca/popular-people' },
        { label: personName, current: true }
      );
      return breadcrumbs;
    }

    // Static pages
    const staticPages: Record<string, string> = {
      '/favoritos': 'Favoritos',
      '/vistos': 'Vistos',
      '/configuracoes': 'Configurações',
      '/sobre': 'Sobre'
    };

    if (staticPages[path]) {
      breadcrumbs.push({ label: staticPages[path], current: true });
      return breadcrumbs;
    }

    // Default fallback
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      breadcrumbs.push({ 
        label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1), 
        current: true 
      });
    }

    return breadcrumbs;
  }, [location.pathname, location.search, params]);
};
