import en from './en';
import ru from './ru';

export const languages = {
  en,
  ru
};

export type Language = 'en' | 'ru';
export type TranslationKey = keyof typeof en;

export const DEFAULT_LANGUAGE: Language = 'en'; 