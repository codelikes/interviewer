from typing import List, Optional
from pydantic import BaseModel, Field

class Question(BaseModel):
    """Pydantic model for interview questions"""
    text: str = Field(description="Text of the interview question")
    tags: List[str] = Field(description="List of tags/technologies related to this question")
    difficulty_level: str = Field(description="Difficulty level: junior, middle, or senior")
    id: Optional[str] = None

class QuestionList(BaseModel):
    """Wrapper for a list of questions"""
    questions: List[Question] = Field(description="List of interview questions")

class Interview(BaseModel):
    """Pydantic model for interview data"""
    title: str = Field(description="Title of the interview")
    description: str = Field(description="Description of the interview")
    duration_minutes: int = Field(description="Expected duration in minutes")
    difficulty_level: str = Field(description="Overall difficulty level: junior, middle, or senior")
    question_ids: List[str] = Field(description="List of question IDs to include in the interview")

class AnswerEvaluation(BaseModel):
    """Pydantic model for evaluating answer to a question"""
    correctness: str = Field(description="Correctness: correct, partially correct, or incorrect")
    comment: str = Field(description="Detailed feedback on the answer")
    correct_answer: str = Field(description="The correct answer to the question")

class InterviewEvaluation(BaseModel):
    """Pydantic model for overall interview evaluation"""
    feedback: str = Field(description="General feedback on all answers")
    assessment: str = Field(description="Detailed assessment of the interview")
    achieved_level: str = Field(description="Achieved level: junior, middle, or senior")
    score: int = Field(description="Score from 0 to 100")
    answer_evaluations: List[AnswerEvaluation] = Field(description="Evaluations for each answer") 