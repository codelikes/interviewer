# Interviewer Platform - Technical Specification

## General Concept
An AI-powered interview preparation platform where users can:
1. Create technical interview questions based on prompts, technology terms, or code snippets
2. Generate complete interview scenarios customized by tags, topics, and difficulty levels
3. Practice answering questions and receive AI-powered evaluation of their answers
4. Store and analyze interview performance reports with detailed feedback

## Technical Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Query for server state, React Context for UI state
- **Form Handling**: React Hook Form
- **Internationalization**: Next.js i18n

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Data Validation**: Pydantic v2
- **ORM**: SQLAlchemy 2.0 with async support
- **Migrations**: Alembic

### Database
- **PostgreSQL 16** with pgvector extension for vector embeddings
- **Vector Indices** for semantic search capabilities

### AI Integration
- **LlamaIndex** framework for working with language models
- **OpenAI** GPT-4o for question generation and answer evaluation
- **Vector Embeddings** for semantic search and similarity matching

### DevOps
- **Docker & Docker Compose** for containerization
- **Health checks** for service monitoring
- **Environment-based configuration** through .env files

## System Architecture

### Component Diagram
```
┌────────────┐     ┌────────────┐     ┌───────────┐     ┌───────────┐
│  Next.js   │────▶│  FastAPI   │────▶│PostgreSQL │     │  OpenAI   │
│  Frontend  │◀────│  Backend   │◀────│  Database │     │   API     │
└────────────┘     └─────┬──────┘     └───────────┘     └─────┬─────┘
                         │                                    │
                         └────────────────────────────────────┘
```

### Request Flow
1. User interacts with the Next.js frontend interface
2. Frontend makes API calls to the FastAPI backend
3. Backend processes requests, interacts with the database, and calls OpenAI API when needed
4. Results are returned to the frontend for display

## Database Schema

### Entity Relationship Diagram
```
┌───────────┐       ┌───────────────┐       ┌───────────┐
│ Questions │       │ Question_Tags │       │   Tags    │
├───────────┤       ├───────────────┤       ├───────────┤
│ id        │─┐  ┌──│ question_id   │──┐  ┌─│ id        │
│ text      │ │  │  │ tag_id        │  │  │ │ name      │
│ difficulty│ │  │  └───────────────┘  │  │ │ description│
│ vector    │ │  │                     │  │ └───────────┘
└───────────┘ │  │                     │  │
              │  │                     │  │
┌───────────┐ │  │  ┌───────────────┐ │  │
│ Interviews │ │  │  │Interview_Quest│ │  │
├───────────┤ │  │  ├───────────────┤ │  │
│ id        │ │  └──│ interview_id  │ │  │
│ title     │─┘     │ question_id   │─┘  │
│ description│       │ order        │     │
│ difficulty │       └───────────────┘     │
└───────────┘                             │
      │                                   │
      │       ┌───────────┐               │
      │       │  Answers  │               │
      │       ├───────────┤               │
      └───────│ id        │               │
              │ interview │               │
              │ question  │───────────────┘
              │ user_ans  │
              └─────┬─────┘
                    │
              ┌─────▼─────┐
              │  Reports  │
              ├───────────┤
              │ id        │
              │ interview │
              │ feedback  │
              │ assessment│
              │ score     │
              └───────────┘
```

## API Structure

### API Endpoints

#### Questions API
- `POST /api/questions/generate` - Generate questions from prompt or text
- `GET /api/questions` - List questions with filtering options
- `GET /api/questions/{id}` - Get specific question by ID
- `DELETE /api/questions/{id}` - Delete a question

#### Tags API
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create a new tag
- `GET /api/tags/{id}/questions` - Get questions by tag
- `DELETE /api/tags/{id}` - Delete a tag

#### Interviews API
- `POST /api/interviews/generate` - Generate an interview from criteria
- `GET /api/interviews` - List all interviews
- `GET /api/interviews/{id}` - Get interview details
- `POST /api/interviews/{id}/submit` - Submit answers for evaluation
- `DELETE /api/interviews/{id}` - Delete an interview

#### Reports API
- `GET /api/reports` - List all reports
- `GET /api/reports/{id}` - Get detailed report
- `DELETE /api/reports/{id}` - Delete a report

## Frontend Structure

### Pages
- `/` - Home page with platform overview
- `/questions` - Question management and generation
- `/tags` - Tag management and organization
- `/interviews` - Interview creation and selection
- `/interviews/{id}` - Interview session interface
- `/reports` - List of past interview reports
- `/reports/{id}` - Detailed interview report

### Components
- `Layout` - Main application layout with navigation
- `QuestionForm` - Form for generating questions
- `InterviewForm` - Form for creating interviews
- `QuestionList` - Paginated list of questions
- `TagSelector` - Component for selecting and filtering tags
- `LanguageSelector` - Interface language selection

## Testing Strategy

### Backend Testing
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and database interactions
- **Mock Tests**: Use mocks for external services like OpenAI

### Frontend Testing
- **Component Tests**: Test React components
- **End-to-End Tests**: Test complete user flows

## Development Roadmap

### Phase 1: MVP Setup (Completed)
- ✅ Project structure
- ✅ Docker configuration
- ✅ Database schema
- ✅ Basic API endpoints
- ✅ Frontend pages

### Phase 2: Core Functionality (Current)
- ✅ Question generation with AI
- ✅ Tag management
- ✅ Interview creation
- ✅ Answer evaluation
- ✅ Report generation
- 🔄 UI/UX improvements
- 🔄 Internationalization

### Phase 3: Advanced Features
- 🔲 User authentication and profiles
- 🔲 Interview templates
- 🔲 Custom evaluation criteria
- 🔲 Progress tracking
- 🔲 Performance analytics

### Phase 4: Scaling and Optimization
- 🔲 API caching
- 🔲 Frontend performance optimizations
- 🔲 Vector search improvements
- 🔲 Mobile responsive design
- 🔲 Progressive Web App (PWA)

## Deployment Strategy

### Development Environment
- Docker Compose setup with volume mounts for hot reloading
- Environment-specific configuration through .env files
- Automatic service restarts for code changes

### Production Environment
- Docker Compose for production deployment
- Nginx reverse proxy for handling multiple services
- Automated backups for database
- Secrets management for API keys and sensitive information
- Health checks and monitoring
- Logging integration

## Contributing Guidelines

1. Follow code style guides for both Python (PEP 8) and TypeScript
2. Write comprehensive tests for new features
3. Document all API endpoints and frontend components
4. Use feature branches and pull requests
5. Perform code reviews before merging

---

*This document will be updated as the project evolves.* 