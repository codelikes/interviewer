from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from database import get_db
from models import Tag, TagCreate, TagModel, QuestionModel, Question
from sqlalchemy import func

router = APIRouter()

@router.get("/tags", response_model=List[Tag])
async def read_tags(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Gets a list of all tags.
    """
    tags = db.query(TagModel).offset(skip).limit(limit).all()
    return [Tag.from_orm(tag) for tag in tags]

@router.get("/tags/{tag_id}", response_model=Tag)
async def read_tag(
    tag_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Gets a specific tag by ID.
    """
    tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return Tag.from_orm(tag)

@router.get("/tags/{tag_id}/questions", response_model=List[Question])
async def read_tag_questions(
    tag_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Gets a list of questions for a specific tag.
    """
    tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Get list of questions for the tag
    questions = db.query(QuestionModel)\
        .join(QuestionModel.tags)\
        .filter(TagModel.id == tag_id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return [Question.from_orm(question) for question in questions]

@router.post("/tags", response_model=Tag, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a new tag.
    """
    # Check if tag already exists
    existing_tag = db.query(TagModel).filter(func.lower(TagModel.name) == func.lower(tag.name)).first()
    if existing_tag:
        raise HTTPException(status_code=400, detail="Tag already exists")
    
    # Create a new tag
    db_tag = TagModel(name=tag.name, description=tag.description)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    
    return Tag.from_orm(db_tag) 