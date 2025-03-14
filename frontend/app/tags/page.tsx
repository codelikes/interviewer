'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTags, Tag } from '../../lib/api';
import { useLanguage } from '../../lib/LanguageContext';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await getTags();
        setTags(data);
      } catch (err) {
        setError(t('tags.loadError'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, [t]);

  if (isLoading) {
    return (
      <div className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white h-32 rounded-lg shadow"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">{t('common.error')} </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">{t('tags.title')}</h1>

        {tags.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">{t('tags.noTags')}</p>
            <Link
              href="/questions/create"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('nav.createQuestions')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tags.map(tag => (
              <Link
                key={tag.id}
                href={`/tags/${tag.id}`}
                className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <h2 className="text-lg font-semibold text-gray-900">{tag.name}</h2>
                {tag.description && (
                  <p className="mt-2 text-sm text-gray-500">{tag.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 