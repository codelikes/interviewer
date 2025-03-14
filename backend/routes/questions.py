import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional
from uuid import UUID

from database import get_db
from models import Question, QuestionCreate, QuestionGenerateRequest, QuestionGenerateResponse, QuestionModel, TagModel, QuestionTagModel
from ai.llm import generate_questions, get_embedding
from sqlalchemy import text

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/questions/generate", response_model=QuestionGenerateResponse)
async def create_questions_from_prompt(
    request: QuestionGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generates questions based on a prompt and saves them to the database.
    """
    logger.info(f"Generating questions from prompt: {request.prompt[:50]}...")
    
    # Generate questions using LLM
    questions_data = await generate_questions(request.prompt)
    
    if not questions_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not generate questions from the provided prompt"
        )
    
    # Create a list of Question objects
    questions = []
    
    try:
        for q_data in questions_data:
            # Create a question
            question = QuestionCreate(
                text=q_data["text"],
                difficulty_level=q_data["difficulty_level"],
                tags=q_data["tags"]
            )
            
            # Add the question to the database and retrieve it
            db_question = await create_question(question, db)
            questions.append(db_question)
            
        return QuestionGenerateResponse(questions=questions)
    except Exception as e:
        logger.error(f"Error creating questions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating questions: {str(e)}"
        )

@router.get("/questions", response_model=List[Question])
async def read_questions(
    skip: int = 0,
    limit: int = 100,
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Gets a list of questions with filtering options.
    """
    # Base query
    query = """
    SELECT DISTINCT q.id, q.text, q.difficulty_level, q.created_at 
    FROM questions q
    """
    
    # Add JOIN with the tags table if a tag is specified
    if tag:
        query += """
        JOIN question_tags qt ON q.id = qt.question_id
        JOIN tags t ON qt.tag_id = t.id
        WHERE t.name = :tag
        """
        if difficulty:
            query += " AND q.difficulty_level = :difficulty"
    elif difficulty:
        query += " WHERE q.difficulty_level = :difficulty"
    
    # Add LIMIT and OFFSET
    query += " ORDER BY q.created_at DESC LIMIT :limit OFFSET :skip"
    
    # Execute the query
    result = db.execute(
        text(query),
        {"tag": tag, "difficulty": difficulty, "limit": limit, "skip": skip}
    )
    
    # Get question IDs
    question_ids = [row[0] for row in result]
    
    # If there are no questions, return an empty list
    if not question_ids:
        return []
    
    # Get complete question data with tags
    questions = []
    for question_id in question_ids:
        # Get the question
        question = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()
        if question:
            # Convert SQLAlchemy model to Pydantic model
            questions.append(Question.from_orm(question))
    
    return questions

@router.get("/questions/{question_id}", response_model=Question)
async def read_question(
    question_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Gets a specific question by ID.
    """
    question = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return Question.from_orm(question)

# Helper functions

async def create_question(question: QuestionCreate, db: Session):
    """
    Creates a question in the database.
    """
    try:
        # Create an embedding for the question
        embedding = await get_embedding(question.text)
        
        # Create a question object
        db_question = QuestionModel(
            text=question.text,
            difficulty_level=question.difficulty_level,
            vector_embedding=embedding
        )
        
        # Add the question to the database
        db.add(db_question)
        db.flush()
        
        # Add tags
        for tag_name in question.tags:
            # Стандартизируем имя тега (нижний регистр, без пробелов)
            tag_name = tag_name.lower().strip()
            
            if not tag_name:
                continue
                
            # Проверяем существует ли тег
            tag = db.query(TagModel).filter(TagModel.name == tag_name).first()
            if not tag:
                # Создаем новый тег
                tag = TagModel(name=tag_name)
                db.add(tag)
                db.flush()
            
            # Связываем вопрос с тегом
            db.add(QuestionTagModel(question_id=db_question.id, tag_id=tag.id))
        
        # Фиксируем изменения
        db.commit()
        db.refresh(db_question)
        
        return Question.from_orm(db_question)
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating question: {str(e)}")
        raise e 