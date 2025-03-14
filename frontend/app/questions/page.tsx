'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getQuestions, Question, Tag } from '../../lib/api';
import { useLanguage } from '../../lib/LanguageContext';
import Link from 'next/link';

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  const difficultyParam = searchParams.get('difficulty');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Используем параметр tag если он есть
        const queryParams: any = { skip: 0, limit: 100 };
        if (tagParam) queryParams.tag = tagParam;
        if (difficultyParam) queryParams.difficulty = difficultyParam;
        
        const response = await getQuestions(queryParams);
        setQuestions(response);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(t('questions.loadError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [tagParam, difficultyParam, t]);

  const getDifficultyColor = (level: string) => {
    switch(level) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'middle': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-10"></div>
            
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white shadow rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t('questions.list')}</h1>
          <Link
            href="/questions/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('questions.createNew')}
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 p-3 text-sm rounded-md bg-red-50 text-red-700">
            {error}
          </div>
        )}
        
        {tagParam && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-700">
              {t('questions.filteredByTag')}: <span className="font-medium">{tagParam}</span>
              <button 
                onClick={() => window.location.href = '/questions'}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                {t('common.clearFilter')}
              </button>
            </p>
          </div>
        )}
        
        {difficultyParam && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-700">
              {t('questions.filteredByDifficulty')}: <span className="font-medium">{difficultyParam}</span>
              <button 
                onClick={() => window.location.href = '/questions'}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                {t('common.clearFilter')}
              </button>
            </p>
          </div>
        )}
        
        {questions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">{t('questions.noQuestionsFound')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-4 sm:px-6">
                  <p className="text-gray-900 mb-2">{question.text}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty_level)}`}>
                      {question.difficulty_level === 'junior' ? 'Junior' : 
                       question.difficulty_level === 'middle' ? 'Middle' : 'Senior'}
                    </span>
                    {question.tags.map(tag => (
                      <Link 
                        key={tag.id} 
                        href={`/tags/${tag.id}`}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 