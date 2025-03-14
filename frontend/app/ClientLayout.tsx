"use client";

import React, { ReactNode } from 'react';
import { LanguageProvider } from '../lib/LanguageContext';
import { ThemeProvider } from '../lib/ThemeContext';
import { ApiProvider } from '../lib/ApiService';
import Layout from '../components/Layout';

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ApiProvider>
          <Layout>
            {children}
          </Layout>
        </ApiProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default ClientLayout; 