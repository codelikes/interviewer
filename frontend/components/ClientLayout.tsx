'use client';

import React from 'react';
import { LanguageProvider } from '../lib/LanguageContext';
import { ThemeProvider } from '../lib/ThemeContext';
import Layout from './Layout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Layout>{children}</Layout>
      </ThemeProvider>
    </LanguageProvider>
  );
} 