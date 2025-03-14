'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTags, getTag, getTagQuestions, generateInterview, Tag, Question, Interview } from '../../../lib/api';
import { useLanguage } from '../../../lib/LanguageContext';

export default function TagPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.id as string;
  
  const [tag, setTag] = useState<Tag | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [showInterview, setShowInterview] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    const fetchTagDetails = async () => {
      try {
        // Get the tag details
        const currentTag = await getTag(tagId);
        
        if (currentTag) {
          setTag(currentTag);
          
          // Get related questions using the dedicated endpoint
          const tagQuestions = await getTagQuestions(tagId);
          setQuestions(tagQuestions);
        } else {
          setError(t('tags.notFound'));
        }
      } catch (err) {
        setError(t('tags.loadError'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTagDetails();
  }, [tagId, t]);

  const handleGenerateInterview = async (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы
    
    if (!tag) return;
    
    setIsGenerating(true);
    setGenerationError(null);
    
    const interviewPrompt = prompt || `Generate interview about ${tag.name}`;
    
    try {
      console.log('Generating interview with prompt:', interviewPrompt);
      const generatedInterview = await generateInterview(interviewPrompt, tag.name);
      setInterview(generatedInterview);
      setShowInterview(true);
    } catch (err: any) {
      console.error('Failed to generate interview:', err);
      // Специфичное сообщение для тайм-аута
      if (err.code === 'ECONNABORTED') {
        setGenerationError(t('interviews.timeoutError') || 'Запрос занял слишком много времени. Пожалуйста, попробуйте еще раз с более простым запросом.');
      } else {
        setGenerationError(err.response?.data?.detail || t('interviews.generateError') || 'Ошибка при создании интервью');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
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

  if (error || !tag) {
    return (
      <div className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">{t('common.error')} </strong>
            <span className="block sm:inline">{error || t('tags.notFound')}</span>
          </div>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (level: string) => {
    switch(level) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'middle': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('tags.name')}: {tag.name}</h1>
          {tag.description && (
            <p className="text-gray-600">{tag.description}</p>
          )}
        </div>
        
        {showInterview ? (
          <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{interview?.title}</h3>
                  <p className="text-sm text-gray-500">
                    {interview?.description}
                  </p>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(interview?.difficulty_level || 'junior')}`}>
                    {interview?.difficulty_level === 'junior' ? 'Junior' : 
                     interview?.difficulty_level === 'middle' ? 'Middle' : 'Senior'}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {interview?.duration_minutes} {t('interviews.minutes')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">{t('interviews.questions')}:</h4>
              <ul className="space-y-4">
                {interview?.questions.map((question, index) => (
                  <li key={question.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{t('interviews.question')} {index + 1}:</p>
                    <p>{question.text}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty_level)}`}>
                        {question.difficulty_level === 'junior' ? 'Junior' : 
                         question.difficulty_level === 'middle' ? 'Middle' : 'Senior'}
                      </span>
                      {question.tags.map(tag => (
                        <span key={tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={() => setShowInterview(false)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('interviews.createNew')}
                </button>
                <a
                  href={`/interviews/${interview?.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('interviews.startButton')}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('interviews.createTitle')} {t('interviews.byTag')}: {tag.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('interviews.promptHelp')}
              </p>
              
              <form onSubmit={handleGenerateInterview}>
                <div className="mb-4">
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('interviews.prompt')}
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder={t('interviews.promptPlaceholder')}
                    required
                  />
                </div>
                
                {generationError && (
                  <div className="mb-4 p-3 text-sm rounded-md bg-red-50 text-red-700">
                    {generationError}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isGenerating ? t('common.generating') : t('interviews.generateButton')}
                </button>
              </form>
            </div>
          </div>
        )}
        
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('questions.questionText')} {t('interviews.byTag')} "{tag.name}"</h2>
          
          {questions.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">{t('tags.questionsNotFound')}</p>
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
                        <span key={tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 