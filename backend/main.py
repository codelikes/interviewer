from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from typing import List
import logging
import os

from database import get_db
from models import QuestionCreate, Question, Tag, Interview, Report
from routes import questions, tags, interviews, reports
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Interviewer API",
    description="API for interview preparation platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Get CORS origins from environment or use defaults
cors_origins = os.getenv(
    "BACKEND_CORS_ORIGINS", 
    "http://localhost:3000,http://frontend:3000"
).split(",")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors and return a clean response"""
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation Error", "errors": exc.errors()},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with custom logging"""
    logger.error(f"HTTP error {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# Enable routers
app.include_router(questions.router, prefix="/api", tags=["questions"])
app.include_router(tags.router, prefix="/api", tags=["tags"])
app.include_router(interviews.router, prefix="/api", tags=["interviews"])
app.include_router(reports.router, prefix="/api", tags=["reports"])

@app.get("/", summary="Root endpoint", description="Returns a welcome message")
def read_root():
    """
    Root endpoint that returns a welcome message.
    
    Returns:
        dict: A welcome message
    """
    logger.info("Root endpoint accessed")
    return {"message": "Interviewer API"}

@app.get("/health", summary="Health check", description="Returns the API health status")
def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    
    Returns:
        dict: The health status
    """
    logger.debug("Health check performed")
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Interviewer API")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG) 