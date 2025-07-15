
import React from 'react';
import { Layout } from '@/components/Layout';
import { WatchedPage as WatchedPageComponent } from '@/components/WatchedPage';

const WatchedPage: React.FC = () => {
  return (
    <Layout>
      <WatchedPageComponent />
    </Layout>
  );
};

export default WatchedPage;
