"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { generateInterview, getTags, getTag, Tag } from '../lib/api';
import { useLanguage } from '../lib/LanguageContext';

interface InterviewFormProps {
  tagId?: string;
  onSuccess: (data: any) => void;
}

const InterviewForm: React.FC<InterviewFormProps> = ({ tagId, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [error, setError] = useState<string | null>(null);
  const [tag, setTag] = useState<Tag | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // If tag ID is specified, get information about it
    if (tagId) {
      const fetchTag = async () => {
        try {
          const currentTag = await getTag(tagId);
          setTag(currentTag);
        } catch (err) {
          console.error('Error fetching tag:', err);
        }
      };
      
      fetchTag();
    }
  }, [tagId]);

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      const interview = await generateInterview(data.prompt, tag?.name);
      reset();
      onSuccess(interview);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('interviews.generateError'));
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {t('interviews.createTitle')}
          {tag && ` ${t('interviews.byTag')}: ${tag.name}`}
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            {t('interviews.promptHelp')}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="w-full">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                {t('interviews.prompt')}
              </label>
              <textarea
                id="prompt"
                rows={4}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder={t('interviews.promptPlaceholder')}
                {...register('prompt', { required: t('interviews.promptRequired') })}
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
              {isSubmitting ? t('common.generating') : t('interviews.generateButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewForm; 