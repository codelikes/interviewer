from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database import get_db
from models import Report, ReportModel, Answer, AnswerModel

router = APIRouter()

@router.get("/reports", response_model=List[Report])
async def read_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Gets a list of all interview reports.
    """
    reports = db.query(ReportModel).offset(skip).limit(limit).all()
    return [Report.from_orm(report) for report in reports]

@router.get("/reports/{report_id}", response_model=Report)
async def read_report(
    report_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Gets a specific report by ID.
    """
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Создаем базовый отчет
    pydantic_report = Report.from_orm(report)
    
    # Вручную загружаем ответы
    answers = db.query(AnswerModel).filter(AnswerModel.interview_id == report.interview_id).all()
    pydantic_report.answers = [Answer.from_orm(answer) for answer in answers]
    
    return pydantic_report

@router.get("/reports/{report_id}/answers", response_model=List[Answer])
async def read_report_answers(
    report_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Gets a list of user answers for a specific report.
    """
    # First find the report to get the interview_id
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Get answers by interview_id
    answers = db.query(AnswerModel).filter(AnswerModel.interview_id == report.interview_id).all()
    return [Answer.from_orm(answer) for answer in answers]

@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Deletes a report by ID.
    """
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(report)
    db.commit()
    
    return {"status": "successfully deleted"} 