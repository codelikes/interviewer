import os
import logging
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import List

# Load environment variables from .env file
load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/interviewer")
    
    # OpenAI API settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # LlamaIndex settings
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gpt-4o")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
    
    # Application settings
    APP_NAME: str = os.getenv("APP_NAME", "Interviewer API")
    VECTOR_DIMENSION: int = int(os.getenv("VECTOR_DIMENSION", "3072"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # API settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = os.getenv(
        "BACKEND_CORS_ORIGINS", 
        "http://localhost:3000,http://frontend:3000"
    ).split(",")
    
    # Environment setting
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        env_prefix = ""

# Create settings instance
settings = Settings()

# Log configuration information
if settings.DEBUG:
    logger.debug("Application configuration loaded:")
    for setting_name, setting_value in settings.model_dump().items():
        # Don't log API keys or sensitive information
        if "KEY" not in setting_name and "PASSWORD" not in setting_name:
            logger.debug(f"{setting_name}: {setting_value}")

# Ensure API key exists
if not settings.OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not found. AI functions will not work.") 