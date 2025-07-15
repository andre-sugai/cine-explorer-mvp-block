
import React from 'react';
import { Layout } from '@/components/Layout';
import { FavoritesPage as FavoritesPageComponent } from '@/components/FavoritesPage';

const FavoritesPage: React.FC = () => {
  return (
    <Layout>
      <FavoritesPageComponent />
    </Layout>
  );
};

export default FavoritesPage;
