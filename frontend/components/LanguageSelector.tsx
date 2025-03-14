"use client";

import React from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Language } from '../i18n';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as Language;
    setLanguage(newLanguage);
  };

  return (
    <div className="flex items-center ml-4">
      <label htmlFor="language-select" className="sr-only">
        {t('language.select')}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleChange}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="en">{t('language.en')}</option>
        <option value="ru">{t('language.ru')}</option>
      </select>
    </div>
  );
};

export default LanguageSelector; 