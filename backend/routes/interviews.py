from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from database import get_db
from models import (
    Interview, InterviewCreate, InterviewModel, 
    QuestionModel, InterviewQuestionModel, AnswerModel,
    InterviewGenerateRequest, InterviewSubmitRequest, 
    InterviewSubmitResponse, ReportModel, Report, Answer
)
from ai.llm import generate_interview, evaluate_answers

router = APIRouter()

@router.post("/interviews/generate", response_model=Interview)
async def create_interview_from_prompt(
    request: InterviewGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generates an interview based on a prompt and available questions.
    """
    # Get questions from the database
    questions_query = db.query(QuestionModel)
    
    # Filter by tag if specified
    if request.tag_name:
        from models import TagModel
        questions_query = (
            questions_query
            .join(QuestionModel.tags)
            .filter(TagModel.name == request.tag_name)
        )
    
    questions = questions_query.all()
    
    # If no questions are found, return an error
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions found matching the request"
        )
    
    # Convert questions to the format for interview generation
    questions_data = []
    for question in questions:
        tags = [tag.name for tag in question.tags]
        questions_data.append({
            "id": str(question.id),
            "text": question.text,
            "difficulty_level": question.difficulty_level.value,
            "tags": tags
        })
    
    # Generate interview using LLM
    interview_data = await generate_interview(
        request.prompt, request.tag_name, questions_data
    )
    
    # Create interview object
    interview = InterviewCreate(
        title=interview_data["title"],
        description=interview_data["description"],
        duration_minutes=interview_data["duration_minutes"],
        difficulty_level=interview_data["difficulty_level"],
        question_ids=[UUID(q_id) for q_id in interview_data["question_ids"]]
    )
    
    # Save interview to the database
    db_interview = await create_interview(interview, db)
    
    return db_interview

@router.get("/interviews", response_model=List[Interview])
async def read_interviews(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Gets a list of all interviews.
    """
    interviews = db.query(InterviewModel).offset(skip).limit(limit).all()
    return [Interview.from_orm(interview) for interview in interviews]

@router.get("/interviews/{interview_id}", response_model=Interview)
async def read_interview(
    interview_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Gets a specific interview by ID.
    """
    interview = db.query(InterviewModel).filter(InterviewModel.id == interview_id).first()
    if interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    return Interview.from_orm(interview)

@router.post("/interviews/{interview_id}/submit", response_model=InterviewSubmitResponse)
async def submit_interview_answers(
    interview_id: UUID,
    request: InterviewSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Submit answers to an interview's questions and get an evaluation.
    """
    # Check if the interview exists
    interview = db.query(InterviewModel).filter(InterviewModel.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Get interview questions with tags
    questions = []
    for question in db.query(InterviewModel).filter(InterviewModel.id == interview_id).first().questions:
        tags = [tag.name for tag in question.tags]
        questions.append({
            "question": question,
            "tags": tags
        })
    
    # Prepare questions data for evaluation
    questions_data = []
    for q in questions:
        question = q["question"]
        tags = q["tags"]
        questions_data.append({
            "id": str(question.id),
            "text": question.text,
            "difficulty_level": question.difficulty_level.value,
            "tags": tags
        })
    
    # Get answers
    answers_data = []
    for answer_data in request.answers:
        answers_data.append({
            "question_id": str(answer_data.question_id),
            "user_answer": answer_data.user_answer
        })
    
    # Evaluate answers using LLM
    evaluation = await evaluate_answers(questions_data, answers_data)
    
    # Save answers with correct answers from evaluation
    for answer_data in request.answers:
        question_id = str(answer_data.question_id)
        correct_answer = None
        
        # Get correct answer if available
        if question_id in evaluation.get("question_evaluations", {}):
            correct_answer = evaluation["question_evaluations"][question_id].get("correct_answer")
        
        # Create or update answer in database
        answer = db.query(AnswerModel).filter(
            AnswerModel.interview_id == interview_id,
            AnswerModel.question_id == answer_data.question_id
        ).first()
        
        if answer:
            # Update existing answer
            answer.user_answer = answer_data.user_answer
            answer.correct_answer = correct_answer
        else:
            # Create new answer
            answer = AnswerModel(
                interview_id=interview_id,
                question_id=answer_data.question_id,
                user_answer=answer_data.user_answer,
                correct_answer=correct_answer
            )
            db.add(answer)
    
    # Create report
    report = ReportModel(
        interview_id=interview_id,
        feedback=evaluation["feedback"],
        assessment=evaluation["assessment"],
        achieved_level=evaluation["achieved_level"],
        score=evaluation["score"]
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # Создаем Pydantic модель отчета
    pydantic_report = Report.from_orm(report)
    
    # Вручную загружаем ответы для отчета
    answers = db.query(AnswerModel).filter(AnswerModel.interview_id == interview_id).all()
    pydantic_report.answers = [Answer.from_orm(answer) for answer in answers]
    
    return InterviewSubmitResponse(report=pydantic_report)

# Helper functions

async def create_interview(interview: InterviewCreate, db: Session):
    """
    Creates an interview in the database.
    """
    # Create interview object
    db_interview = InterviewModel(
        title=interview.title,
        description=interview.description,
        duration_minutes=interview.duration_minutes,
        difficulty_level=interview.difficulty_level
    )
    
    # Add interview to the database
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    # Add interview questions
    for i, question_id in enumerate(interview.question_ids):
        # Check if the question exists
        question = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()
        if question:
            # Link the interview with the question
            db.add(InterviewQuestionModel(
                interview_id=db_interview.id,
                question_id=question_id,
                order_num=i + 1
            ))
    
    db.commit()
    db.refresh(db_interview)
    
    return Interview.from_orm(db_interview) 