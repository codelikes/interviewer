import axios from 'axios';
import { 
  Tag, 
  Question, 
  Interview, 
  Report, 
  Answer, 
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  CreateInterviewRequest 
} from './types';

// Using string instead of process.env to avoid TypeScript errors
const API_URL = typeof window !== 'undefined' 
  ? (window as any).__ENV?.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  : 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API for questions
export const QuestionsAPI = {
  getQuestions: async (): Promise<Question[]> => {
    const response = await apiClient.get('/questions/');
    return response.data;
  },

  getQuestion: async (id: string): Promise<Question> => {
    const response = await apiClient.get(`/questions/${id}`);
    return response.data;
  },

  generateQuestions: async (prompt: string | GenerateQuestionsRequest, difficultyLevel?: string): Promise<Question[]> => {
    let data: GenerateQuestionsRequest;
    
    if (typeof prompt === 'string') {
      data = {
        prompt,
        difficulty_level: difficultyLevel as 'junior' | 'middle' | 'senior' | undefined
      };
    } else {
      data = prompt;
    }
    
    const response = await apiClient.post<GenerateQuestionsResponse>('/questions/generate/', data);
    return response.data.questions;
  },

  getQuestionsByTag: async (tagId: string): Promise<Question[]> => {
    const response = await apiClient.get(`/tags/${tagId}/questions/`);
    return response.data;
  }
};

// API for tags
export const TagsAPI = {
  getTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get('/tags/');
    return response.data;
  },

  getTag: async (id: string): Promise<Tag> => {
    const response = await apiClient.get(`/tags/${id}`);
    return response.data;
  },
  
  getTagQuestions: async (tagId: string): Promise<Question[]> => {
    const response = await apiClient.get(`/tags/${tagId}/questions/`);
    return response.data;
  }
};

// API for interviews
export const InterviewsAPI = {
  getInterviews: async (): Promise<Interview[]> => {
    const response = await apiClient.get('/interviews/');
    return response.data;
  },

  getInterview: async (id: string): Promise<Interview> => {
    const response = await apiClient.get(`/interviews/${id}`);
    return response.data;
  },

  createInterview: async (data: CreateInterviewRequest): Promise<Interview> => {
    const response = await apiClient.post('/interviews/', data);
    return response.data;
  },
  
  generateInterview: async (prompt: string, tag?: string): Promise<Interview> => {
    const response = await apiClient.post('/interviews/generate/', { prompt, tag });
    return response.data;
  },

  submitAnswers: async (interviewId: string, answers: Answer[]): Promise<Report> => {
    const response = await apiClient.post(`/interviews/${interviewId}/submit/`, { answers });
    return response.data;
  }
};

// API for reports
export const ReportsAPI = {
  getReports: async (): Promise<Report[]> => {
    const response = await apiClient.get('/reports/');
    return response.data;
  },

  getReport: async (id: string): Promise<Report> => {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
  }
}; 