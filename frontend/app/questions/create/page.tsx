'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateQuestions, createQuestion, Question } from '../../../lib/api';
import { useLanguage } from '../../../lib/LanguageContext';

export default function CreateQuestionsPage() {
  const router = useRouter();
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');
  const { t } = useLanguage();

  // Handler for successful question generation
  const handleQuestionsGenerated = (questions: Question[]) => {
    setGeneratedQuestions(questions);
  };

  // Handler for saving questions
  const handleSaveQuestions = async () => {
    if (generatedQuestions.length === 0) return;
    
    setSaveLoading(true);
    setError(null);
    
    try {
      // Save each question
      for (const question of generatedQuestions) {
        await createQuestion({
          text: question.text,
          difficulty_level: question.difficulty_level,
          tags: question.tags.map(tag => tag.name)
        });
      }
      
      // After successful save, clear the list
      setGeneratedQuestions([]);
      router.push('/questions');
    } catch (err) {
      console.error('Error saving questions:', err);
      setError(t('questions.saveError'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promptText.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await generateQuestions(promptText);
      console.log('Generated questions:', response); // Добавляем лог для отладки
      
      // Проверяем, что response содержит questions
      if (response && response.questions) {
        handleQuestionsGenerated(response.questions);
      } else {
        console.error('Unexpected response format:', response);
        setError(t('questions.generateError'));
      }
    } catch (err: any) {
      console.error('Error generating questions:', err);
      setError(err.response?.data?.detail || t('questions.generateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedQuestions([]);
    setPromptText('');
  };

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
        <h1 className="text-2xl font-bold mb-6">{t('questions.createTitle')}</h1>
        
        {!generatedQuestions.length ? (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <p className="text-sm text-gray-500 mb-4">
                {t('questions.description')}
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('questions.prompt')}
                  </label>
                  <textarea
                    id="prompt"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={10}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder={t('questions.promptPlaceholder')}
                    required
                  />
                </div>
                
                {error && (
                  <div className="mb-4 p-3 text-sm rounded-md bg-red-50 text-red-700">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !promptText.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? t('common.generating') : t('questions.generateButton')}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t('questions.results')}</h3>
                <p className="text-sm text-gray-500">{t('questions.generated', { count: generatedQuestions.length })}</p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('questions.createNew')}
              </button>
            </div>
            
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {generatedQuestions.map((question, index) => (
                  <li key={question.id} className="px-4 py-4 sm:px-6">
                    <div className="mb-2">
                      <span className="font-medium text-gray-900">{t('questions.questionNumber', { number: index + 1 })}</span> {question.text}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
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
          </div>
        )}
      </div>
    </div>
  );
} 