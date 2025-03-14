import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field
from pgvector.sqlalchemy import Vector

from database import Base
from config import settings

# SQLAlchemy models

class DifficultyLevel(str, Enum):
    junior = "junior"
    middle = "middle"
    senior = "senior"

class QuestionModel(Base):
    __tablename__ = "questions"
    
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    text = Column(Text, nullable=False)
    difficulty_level = Column(SQLAlchemyEnum(DifficultyLevel), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    vector_embedding = Column(Vector(settings.VECTOR_DIMENSION))
    
    # Relationships
    tags = relationship("TagModel", secondary="question_tags", back_populates="questions")
    
class TagModel(Base):
    __tablename__ = "tags"
    
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text)
    
    # Relationships
    questions = relationship("QuestionModel", secondary="question_tags", back_populates="tags")

class QuestionTagModel(Base):
    __tablename__ = "question_tags"
    
    question_id = Column(UUID, ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(UUID, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

class InterviewModel(Base):
    __tablename__ = "interviews"
    
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    duration_minutes = Column(Integer)
    difficulty_level = Column(SQLAlchemyEnum(DifficultyLevel), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    questions = relationship("QuestionModel", secondary="interview_questions")
    answers = relationship("AnswerModel", back_populates="interview")
    reports = relationship("ReportModel", back_populates="interview")

class InterviewQuestionModel(Base):
    __tablename__ = "interview_questions"
    
    interview_id = Column(UUID, ForeignKey("interviews.id", ondelete="CASCADE"), primary_key=True)
    question_id = Column(UUID, ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True)
    order_num = Column(Integer, nullable=False)

class AnswerModel(Base):
    __tablename__ = "answers"
    
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID, ForeignKey("interviews.id", ondelete="CASCADE"))
    question_id = Column(UUID, ForeignKey("questions.id", ondelete="CASCADE"))
    user_answer = Column(Text)
    correct_answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    interview = relationship("InterviewModel", back_populates="answers")
    question = relationship("QuestionModel")

class ReportModel(Base):
    __tablename__ = "reports"
    
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID, ForeignKey("interviews.id", ondelete="CASCADE"))
    feedback = Column(Text)
    assessment = Column(Text)
    achieved_level = Column(SQLAlchemyEnum(DifficultyLevel))
    score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    interview = relationship("InterviewModel", back_populates="reports")

# Pydantic models for API

class TagBase(BaseModel):
    name: str
    description: Optional[str] = None

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: uuid.UUID

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    text: str
    difficulty_level: DifficultyLevel

class QuestionCreate(QuestionBase):
    tags: List[str]

class Question(QuestionBase):
    id: uuid.UUID
    created_at: datetime
    tags: List[Tag] = []

    class Config:
        from_attributes = True

class InterviewBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    difficulty_level: DifficultyLevel

class InterviewCreate(InterviewBase):
    question_ids: List[uuid.UUID] = []

class Interview(InterviewBase):
    id: uuid.UUID
    created_at: datetime
    questions: List[Question] = []

    class Config:
        from_attributes = True

class AnswerBase(BaseModel):
    question_id: uuid.UUID
    user_answer: str
    correct_answer: Optional[str] = None

class AnswerCreate(AnswerBase):
    pass

class Answer(AnswerBase):
    id: uuid.UUID
    interview_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    interview_id: uuid.UUID
    feedback: str
    assessment: str
    achieved_level: DifficultyLevel
    score: float

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: uuid.UUID
    created_at: datetime
    answers: Optional[List[Answer]] = None

    class Config:
        from_attributes = True

# Request and response models

class QuestionGenerateRequest(BaseModel):
    prompt: str

class QuestionGenerateResponse(BaseModel):
    questions: List[Question]

class InterviewGenerateRequest(BaseModel):
    prompt: str
    tag_name: Optional[str] = None

class InterviewSubmitRequest(BaseModel):
    answers: List[AnswerCreate]

class InterviewSubmitResponse(BaseModel):
    report: Report 