export interface Tag {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty_level: 'junior' | 'middle' | 'senior';
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  title: string;
  description?: string;
  difficulty_level: 'junior' | 'middle' | 'senior';
  duration_minutes: number;
  questions: Question[];
  created_at: string;
  updated_at: string;
}

export interface Answer {
  question_id: string;
  user_answer: string;
}

export interface AnswerEvaluation {
  id: string;
  question_id: string;
  question_text: string;
  question_difficulty: 'junior' | 'middle' | 'senior';
  question_tags: Tag[];
  user_answer: string;
  score: number;
  feedback: string;
  created_at: string;
}

export interface Report {
  id: string;
  interview_id: string;
  interview_title: string;
  difficulty_level: 'junior' | 'middle' | 'senior';
  overall_score: number;
  answer_evaluations: AnswerEvaluation[];
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateQuestionsRequest {
  prompt: string;
  difficulty_level?: 'junior' | 'middle' | 'senior';
}

export interface GenerateQuestionsResponse {
  questions: Question[];
}

export interface CreateInterviewRequest {
  title: string;
  description?: string;
  difficulty_level: 'junior' | 'middle' | 'senior';
  duration_minutes: number;
  question_ids: string[];
} 