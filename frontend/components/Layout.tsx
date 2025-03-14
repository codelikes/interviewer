"use client";

import React from 'react';
import Link from 'next/link';
import LanguageSelector from './LanguageSelector';
import ThemeSwitcher from './ThemeSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../lib/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {t('common.appName')}
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('nav.home')}
                </Link>
                <Link href="/questions/create" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('nav.createQuestions')}
                </Link>
                <Link href="/tags" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('nav.tags')}
                </Link>
                <Link href="/interviews" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('nav.interviews')}
                </Link>
                <Link href="/reports" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('nav.reports')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSelector />
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            {t('common.footer')}
          </div>
        </div>
      </footer>
    </div>
  );
} 