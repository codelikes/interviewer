import axios from 'axios';
import { Language } from '../i18n';

// Base URL for API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Client with increased timeout
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

// Add language parameter to API requests
export const setLanguageHeader = (language: Language) => {
  // Language is only set on the client
  if (typeof window !== 'undefined') {
    // Store current language in localStorage
    localStorage.setItem('current_language', language);
    console.log(`Language set to: ${language}`);
  }
};

// Data types
export interface Tag {
  id: string;
  name: string;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty_level: 'junior' | 'middle' | 'senior';
  created_at: string;
  tags: Tag[];
}

export interface Interview {
  id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  difficulty_level: 'junior' | 'middle' | 'senior';
  created_at: string;
  questions: Question[];
}

export interface Answer {
  question_id: string;
  user_answer: string;
  correct_answer?: string;
}

export interface Report {
  id: string;
  interview_id: string;
  feedback: string;
  assessment: string;
  achieved_level: 'junior' | 'middle' | 'senior';
  score: number;
  created_at: string;
}

// Questions API
export const getQuestions = async (params = {}) => {
  const response = await apiClient.get('/api/questions', { params });
  return response.data;
};

export const getQuestion = async (id: string) => {
  const response = await apiClient.get(`/api/questions/${id}`);
  return response.data;
};

export const createQuestion = async (data: any) => {
  const response = await apiClient.post('/api/questions', data);
  return response.data;
};

export const generateQuestions = async (prompt: string) => {
  const response = await apiClient.post('/api/questions/generate', { prompt });
  return response.data;
};

// Tags API
export const getTags = async () => {
  const response = await apiClient.get('/api/tags');
  return response.data;
};

export const getTag = async (id: string) => {
  const response = await apiClient.get(`/api/tags/${id}`);
  return response.data;
};

export const getTagQuestions = async (id: string) => {
  const response = await apiClient.get(`/api/tags/${id}/questions`);
  return response.data;
};

export const createTag = async (data: any) => {
  const response = await apiClient.post('/api/tags', data);
  return response.data;
};

// Interviews API
export const getInterviews = async (page = 1, limit = 10) => {
  const params = { page, limit };
  const response = await apiClient.get('/api/interviews', { params });
  return response.data;
};

export const getInterview = async (id: string) => {
  const response = await apiClient.get(`/api/interviews/${id}`);
  return response.data;
};

export const createInterview = async (data: any) => {
  const response = await apiClient.post('/api/interviews', data);
  return response.data;
};

export const generateInterview = async (prompt: string, tagName?: string) => {
  const data = tagName ? { prompt, tag_name: tagName } : { prompt };
  const response = await apiClient.post('/api/interviews/generate', data);
  return response.data;
};

export const submitInterview = async (id: string, answers: any[]) => {
  const response = await apiClient.post(`/api/interviews/${id}/submit`, { answers });
  return response.data;
};

// Reports API
export const getReports = async (page = 1, limit = 10) => {
  const params = { page, limit };
  const response = await apiClient.get('/api/reports', { params });
  return response.data;
};

export const getReport = async (id: string) => {
  const response = await apiClient.get(`/api/reports/${id}`);
  return response.data;
};

export const getReportAnswers = async (id: string): Promise<Answer[]> => {
  try {
    const response = await apiClient.get(`/api/reports/${id}/answers`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching answers for report ${id}:`, error);
    throw error;
  }
};

export const deleteReport = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/reports/${id}`);
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error);
    throw error;
  }
}; 