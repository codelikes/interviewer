'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInterview, submitInterview, Interview, Answer } from '../../../lib/api';
import { useLanguage } from '../../../lib/LanguageContext';
import { useTranslation } from '../../../hooks/useTranslation';

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const { t } = useLanguage();
  const { t: tTranslation } = useTranslation();

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await getInterview(interviewId);
        setInterview(data);
        
        // Initialize empty answers for each question
        const initialAnswers: Record<string, string> = {};
        data.questions.forEach(question => {
          initialAnswers[question.id] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(t('interviews.loadError'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterview();
  }, [interviewId, t]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (interview?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!interview) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create an array of answers to send to the server
      const answersArray = Object.entries(answers).map(([questionId, userAnswer]) => ({
        question_id: questionId,
        user_answer: userAnswer
      }));
      
      // Submit answers and get the report
      const response = await submitInterview(interviewId, answersArray);
      // Log the response to understand its structure
      console.log('Interview submit response:', response);
      
      // Get the report ID, handling different possible response structures
      let reportId;
      if (response && response.report && response.report.id) {
        // Standard structure: { report: { id: '...' } }
        reportId = response.report.id;
      } else if (response && response.id) {
        // Direct structure: { id: '...' }
        reportId = response.id;
      } else {
        console.error('Could not find report ID in response:', response);
        // Don't redirect if we can't find a valid ID
        setSubmitError(tTranslation('interviews.submitError'));
        setIsSubmitting(false);
        return;
      }
      
      console.log('Report ID extracted:', reportId);
      setReportId(reportId);
      setIsCompleted(true);
      
      // Automatically redirect to the report page
      router.push(`/reports/${reportId}`);
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || tTranslation('interviews.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">{t('common.error')} </strong>
            <span className="block sm:inline">{error || tTranslation('interviews.notFound')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted && reportId) {
    return (
      <div className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-green-50">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium text-green-800">{tTranslation('interviews.completed')}</h3>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <p className="text-gray-700 mb-4">
                {tTranslation('interviews.answersSubmitted')}
              </p>
              
              <div className="mt-6">
                <a
                  href={`/reports/${reportId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {tTranslation('reports.viewReport')}
                </a>
                <button
                  onClick={() => router.push('/interviews')}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {tTranslation('interviews.backToList')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === interview.questions.length - 1;
  const canSubmit = Object.values(answers).every(answer => typeof answer === 'string' && answer.trim() !== '');

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{interview.title}</h1>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(interview.difficulty_level)}`}>
              {interview.difficulty_level === 'junior' ? 'Junior' : 
               interview.difficulty_level === 'middle' ? 'Middle' : 'Senior'}
            </span>
            <span className="text-sm text-gray-500">
              {tTranslation('interviews.duration')}: {interview.duration_minutes} {tTranslation('interviews.minutes')}
            </span>
          </div>
          {interview.description && (
            <p className="text-gray-600 mt-2">{interview.description}</p>
          )}
        </div>
        
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {tTranslation('interviews.questionNumber', { number: currentQuestionIndex + 1, total: interview.questions.length })}
              </h3>
              <div className="text-sm text-gray-500">
                {tTranslation('interviews.progress')}: {Math.round(((currentQuestionIndex + 1) / interview.questions.length) * 100)}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <p className="text-gray-900 font-medium mb-1">{tTranslation('interviews.question')}:</p>
              <p className="text-gray-800">{currentQuestion.text}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty_level)}`}>
                  {currentQuestion.difficulty_level === 'junior' ? 'Junior' : 
                   currentQuestion.difficulty_level === 'middle' ? 'Middle' : 'Senior'}
                </span>
                {currentQuestion.tags.map(tag => (
                  <span key={tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                {tTranslation('interviews.yourAnswer')}:
              </label>
              <textarea
                id="answer"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                rows={8}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder={tTranslation('interviews.answerPlaceholder')}
              />
            </div>
          </div>
          
          <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {tTranslation('interviews.prevQuestion')}
              </button>
              
              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canSubmit}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? tTranslation('interviews.submitting') : tTranslation('interviews.finishInterview')}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {tTranslation('interviews.nextQuestion')}
                </button>
              )}
            </div>
            
            {submitError && (
              <div className="mt-4 p-3 text-sm rounded-md bg-red-50 text-red-700">
                {submitError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 