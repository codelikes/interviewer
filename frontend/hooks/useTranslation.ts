import { useContext } from 'react';
import { useLanguage } from '../lib/LanguageContext';

export const useTranslation = () => {
  return useLanguage();
}; 