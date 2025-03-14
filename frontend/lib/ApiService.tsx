"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import * as api from './api';
import { useLanguage } from './LanguageContext';

// Create context for API services
const ApiContext = createContext<typeof api | undefined>(undefined);

// Provider component
interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const { language } = useLanguage();
  
  // Update language settings when language changes
  useEffect(() => {
    api.setLanguageHeader(language);
  }, [language]);
  
  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use API
export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}; 