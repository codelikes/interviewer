import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from config import settings

# Configure logger
logger = logging.getLogger(__name__)

# Create an SQLAlchemy engine for database connection
try:
    engine = create_engine(settings.DATABASE_URL)
    logger.info("Database connection established")
except SQLAlchemyError as e:
    logger.error(f"Database connection error: {e}")
    raise

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class for models
Base = declarative_base()

def get_db():
    """
    Creates a database session for dependency injection.
    
    Yields:
        Session: SQLAlchemy session for database operations
        
    Notes:
        This function should be used with FastAPI's Depends function
        to provide database sessions to route handlers.
    """
    db = SessionLocal()
    try:
        logger.debug("Database session created")
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
        logger.debug("Database session closed") 