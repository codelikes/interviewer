# Contributing to Interviewer Platform

Thank you for considering contributing to the Interviewer Platform! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate in all interactions.

## How Can I Contribute?

### Reporting Bugs

- **Check if the bug has already been reported** in the issues section.
- **Use the bug report template** when creating a new issue.
- **Include detailed information** about the bug, including steps to reproduce, expected behavior, actual behavior, and environment details.

### Suggesting Enhancements

- **Check if the enhancement has already been suggested** in the issues section.
- **Use the feature request template** when creating a new issue.
- **Provide a clear use case** for the enhancement and how it would benefit the project.

### Pull Requests

1. **Fork the repository** and create your branch from `main`.
2. **Install Docker and Docker Compose** for your development environment.
3. **Make your changes** and ensure they follow the project's coding standards.
4. **Write or update tests** to cover your changes.
5. **Ensure all tests pass** using the Docker Compose test environment.
6. **Update documentation** if necessary.
7. **Submit a pull request** to the `main` branch.

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Git

### Setting Up Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/interviewer.git
   cd interviewer
   ```

2. **Create a .env file** based on the .env.example template.

3. **Run the application with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **Access services**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Workflow

When making changes to the application:

1. Make your code changes in the appropriate directory (frontend or backend).
2. The changes will be automatically applied due to the volume mounts in Docker Compose.
3. For frontend changes, the Next.js development server will automatically reload.
4. For backend changes, the FastAPI server will reload automatically if needed.
5. Run tests within the Docker containers to ensure everything works.

### Running Tests

Run backend tests:
```bash
docker-compose exec backend pytest
```

Run frontend tests:
```bash
docker-compose exec frontend npm test
```

## Coding Standards

### Python

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guide.
- Use docstrings for functions, classes, and modules.
- Use type hints for function parameters and return values.
- Use descriptive variable names.

### TypeScript/JavaScript

- Follow the project's ESLint and Prettier configurations.
- Use TypeScript interfaces/types for better type safety.
- Use descriptive variable names.
- Document complex component props with JSDoc comments.

## Testing

- Write unit tests for all new code.
- Ensure existing tests pass before submitting a pull request.
- Target a minimum of 80% code coverage for new features.

## Documentation

- Update the README.md if you change functionality.
- Document new API endpoints in the API documentation.
- Use inline comments for complex code sections.

## Commit Guidelines

- Use clear and descriptive commit messages.
- Reference issue numbers in commit messages when applicable.
- Follow conventional commits format (e.g., feat:, fix:, docs:, etc.).

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT license.

Thank you for contributing to the Interviewer Platform! 