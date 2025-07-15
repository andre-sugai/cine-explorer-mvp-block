
import React from 'react';
import { Layout } from '@/components/Layout';
import { SettingsPage as SettingsPageComponent } from '@/components/SettingsPage';

const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <SettingsPageComponent />
    </Layout>
  );
};

export default SettingsPage;
