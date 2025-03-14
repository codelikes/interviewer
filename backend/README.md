# Interviewer API Backend

This is the backend API for the Interviewer platform, built with FastAPI, SQLAlchemy, and PostgreSQL with pgvector.

## Structure

- `main.py` - Application entry point and router configuration
- `models.py` - Database models and Pydantic schemas
- `config.py` - Configuration settings
- `database.py` - Database connection setup
- `ai/` - AI components using LlamaIndex and OpenAI
- `routes/` - API route handlers
- `migrations/` - Alembic database migrations
- `tests/` - Unit and integration tests

## Features

- **RESTful API** - Structured API endpoints with FastAPI
- **Error Handling** - Custom exception handlers with proper logging
- **Database Migrations** - Using Alembic for schema versioning
- **AI Integration** - LlamaIndex and OpenAI for question generation and evaluation
- **Logging** - Comprehensive logging system
- **Testing** - Pytest infrastructure

## API Endpoints

### Questions

- `POST /api/questions/generate` - Generate questions from prompt
- `GET /api/questions` - List questions with filtering
- `GET /api/questions/{id}` - Get specific question

### Tags

- `GET /api/tags` - List tags
- `GET /api/tags/{id}` - Get specific tag
- `GET /api/tags/{id}/questions` - Get questions for a tag
- `POST /api/tags` - Create a new tag

### Interviews

- `POST /api/interviews/generate` - Generate interview from criteria
- `GET /api/interviews` - List interviews
- `GET /api/interviews/{id}` - Get interview details
- `POST /api/interviews/{id}/submit` - Submit answers for evaluation

### Reports

- `GET /api/reports` - List reports
- `GET /api/reports/{id}` - Get detailed report

## Database Models

- `QuestionModel` - Interview questions
- `TagModel` - Tags for categorizing questions
- `InterviewModel` - Interview sessions
- `AnswerModel` - User answers to questions
- `ReportModel` - Evaluation reports

## Database Migrations

To create a new migration:

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

To apply migrations:

```bash
alembic upgrade head
```

## Development

See the main repository README.md for Docker Compose setup instructions.

### Environment Variables

The application can be configured using environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for language models
- `MODEL_NAME` - LLM model name (default: gpt-4o)
- `EMBEDDING_MODEL` - Embedding model (default: text-embedding-3-large)
- `DEBUG` - Enable debug mode (true/false)
- `ENVIRONMENT` - Application environment (development/production)
- `BACKEND_CORS_ORIGINS` - Comma-separated list of allowed CORS origins

## API Documentation

When running, the API documentation is available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 