'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getReport, getReportAnswers, 
  getInterview, 
  Report, Interview, Question, Answer 
} from '../../../lib/api';
import { useLanguage } from '../../../lib/LanguageContext';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const { t, language } = useLanguage();
  
  const [report, setReport] = useState<Report | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await getReport(reportId);
        setReport(reportData);
        
        // Get interview data
        try {
          const interviewData = await getInterview(reportData.interview_id);
          setInterview(interviewData);
          
          // Get user answers
          try {
            const answersData = await getReportAnswers(reportId);
            setAnswers(answersData);
          } catch (answersErr) {
            console.error('Error loading answers:', answersErr);
          }
        } catch (interviewErr) {
          console.error('Error loading interview data:', interviewErr);
        }
      } catch (err) {
        setError('Error loading report');
        console.error('Error loading report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reportId]);

  // Find user answer for a specific question
  const findUserAnswer = (questionId: string): string | null => {
    const answer = answers.find(a => a.question_id === questionId);
    return answer ? answer.user_answer : null;
  };

  // Find correct answer for a specific question
  const findCorrectAnswer = (questionId: string): string | null => {
    const answer = answers.find(a => a.question_id === questionId);
    return answer ? answer.correct_answer : null;
  };

  if (isLoading) {
    return (
      <div className="py-10">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">{t('common.error')} </strong>
            <span className="block sm:inline">{error || t('reports.notFound')}</span>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (level: string) => {
    switch(level) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'middle': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t('reports.title')}</h1>
            <button
              onClick={() => router.push('/interviews')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('interviews.backToList')}
            </button>
          </div>
          
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">{t('reports.generalInfo')}</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('interviews.title')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{interview?.title || t('common.loading')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('reports.completionDate')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(report.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('reports.score')}</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">
                    <span className={getScoreColor(report.score)}>
                      {report.score}/100
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('interviews.difficultyLevel')}</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(report.achieved_level)}`}>
                      {report.achieved_level === 'junior' ? 'Junior' : 
                      report.achieved_level === 'middle' ? 'Middle' : 'Senior'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        {interview && interview.questions && interview.questions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('reports.answerResults')}</h2>
            
            <div className="space-y-6">
              {interview.questions.map((question, index) => (
                <div key={question.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('interviews.question')} {index + 1}
                    </h3>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-gray-500">{t('reports.estimatedScore')}:</span>
                      <span className={`font-bold ${getScoreColor(report.score)}`}>
                        {report.score}/100
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">{t('interviews.question')}:</h4>
                      <p className="text-gray-900">{question.text}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty_level)}`}>
                          {question.difficulty_level === 'junior' ? 'Junior' : 
                          question.difficulty_level === 'middle' ? 'Middle' : 'Senior'}
                        </span>
                        {question.tags && question.tags.map(tag => (
                          <span key={tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">{t('reports.yourAnswer')}:</h4>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded">
                        {findUserAnswer(question.id) || t('reports.answerNotFound')}
                      </p>
                    </div>
                    
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-green-600 mb-1">{t('reports.correctAnswer')}:</h4>
                      <p className="text-gray-900 bg-green-50 p-3 rounded">
                        {findCorrectAnswer(question.id) || t('reports.correctAnswerNotAvailable')}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">{t('reports.evaluation')}:</h4>
                      <div className="bg-indigo-50 p-3 rounded text-gray-800">
                        {/* Distribute available report information between questions */}
                        {index === 0 ? report.feedback : 
                         index === 1 ? report.assessment : 
                         `${t('reports.level')}: ${report.achieved_level.toUpperCase()}. ${t('reports.score')}: ${report.score}/100`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('reports.print')}
          </button>
        </div>
      </div>
    </div>
  );
} 