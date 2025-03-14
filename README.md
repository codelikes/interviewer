# Interviewer - AI-Powered Interview Preparation Platform

An interactive platform for creating, preparing, and conducting technical interviews using artificial intelligence. Leverages OpenAI's GPT models to generate, evaluate, and provide feedback on technical interview questions and answers.

## Features

- 🧠 **Question Generation** - Create interview questions based on prompts, terms, and code snippets
- 🏷️ **Tag Organization** - Categorize questions by tags and difficulty levels (junior, middle, senior)
- 📝 **Personalized Interviews** - Create customized interview scenarios for specific requirements and skill levels
- 🤖 **AI Evaluation** - Analyze answers to questions using GPT-4o for objective assessments
- 📊 **Reports** - Save and analyze interview results with detailed feedback
- 🌐 **Multilingual** - Support for multiple languages in the interface and content

## Technologies

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and React Query
- **Backend**: Python 3.11 with FastAPI and Pydantic
- **Database**: PostgreSQL 16 with pgvector for vector embeddings
- **AI**: LlamaIndex with OpenAI's GPT-4o
- **Deployment**: Docker Compose for easy setup and scaling

## Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key (for GPT-4o)

### Installation and Launch

1. Clone the repository:
```bash
git clone <repo-url>
cd interviewer
```

2. Create an `.env` file in the project root directory (see `.env.example` for required variables):
```
# OpenAI API
OPENAI_API_KEY=your_api_key

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=interviewer
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Application Settings
ENVIRONMENT=production  # or development
DEBUG=false
```

3. Launch the project using Docker Compose:
```bash
docker-compose up -d
```

4. Open your browser and go to http://localhost:3000

## Project Structure

```
interviewer/
├── docker-compose.yml        # Docker Compose configuration
├── .env                      # Environment variables
├── .env.example              # Example environment variables
├── frontend/                 # Next.js application
│   ├── app/                  # Next.js pages and routing
│   ├── components/           # Reusable React components
│   ├── lib/                  # Helper functions and utilities
│   ├── i18n/                 # Internationalization files
│   └── styles/               # CSS and styling
├── backend/                  # FastAPI application
│   ├── routes/               # API route handlers
│   ├── ai/                   # AI integration with LlamaIndex and GPT
│   ├── models.py             # Data models and schemas
│   ├── database.py           # Database connection
│   └── main.py               # Application entry point
├── database/                 # Database initialization
│   └── init.sql              # SQL schema initialization
└── docs/                     # Documentation
    ├── PROJECT_PLAN.md       # Technical specification
    └── CONTRIBUTING.md       # Contribution guidelines
```

## Documentation

- **Technical Specification**: See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for detailed architecture and development roadmap
- **API Documentation**: Once the backend is running, visit http://localhost:8000/docs for the interactive Swagger UI
- **Contributing Guidelines**: See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for information on how to contribute

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for the interactive Swagger UI documentation of all available API endpoints.

## Contributing

Please see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed contribution guidelines.

## License

MIT 