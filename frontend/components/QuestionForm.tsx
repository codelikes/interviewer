"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { generateQuestions, createQuestion } from '../lib/api';

interface QuestionFormProps {
  onSuccess: (data: any) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      const response = await generateQuestions(data.prompt);
      
      // Проверяем, что response содержит questions
      if (response && response.questions) {
        reset();
        onSuccess(response.questions);
      } else {
        console.error('Unexpected response format:', response);
        setError('Произошла ошибка при генерации вопросов');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Произошла ошибка при генерации вопросов');
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Создание вопросов для интервью
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Введите промт (термины программирования, примеры кода и т.д.) для генерации вопросов для интервью.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="w-full">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Промт
              </label>
              <textarea
                id="prompt"
                rows={6}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="Введите термины, концепции или примеры кода..."
                {...register('prompt', { required: 'Пожалуйста, введите промт' })}
              />
              {errors.prompt && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.prompt.message as string}
                </p>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-4 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="mt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Генерация...' : 'Сгенерировать вопросы'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm; 