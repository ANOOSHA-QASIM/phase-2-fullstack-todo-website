# Quickstart Guide: Backend Implementation for Phase II: Todo Full-Stack Web Application

**Date**: 2026-01-14
**Feature**: 001-backend-spec
**Version**: 1.0

## Overview

This guide provides a quick start for developing the backend Todo application. It covers environment setup, project structure, and initial development steps.

## Prerequisites

- Python 3.11+
- pip package manager
- Virtual environment tool (venv, conda, etc.)
- Access to Neon PostgreSQL database
- BETTER_AUTH_SECRET key

## Setup Instructions

### 1. Clone and Navigate to Repository
```bash
cd /path/to/repository
```

### 2. Create Virtual Environment
```bash
python -m venv backend_env
source backend_env/bin/activate  # On Windows: backend_env\Scripts\activate
```

### 3. Install Dependencies
```bash
cd backend/
pip install fastapi sqlmodel uvicorn python-multipart psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-dotenv
```

### 4. Create Environment File
Create `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://neondb_owner:****************@ep-spring-cherry-a7r2kgi0-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
BETTER_AUTH_SECRET=sCMK9dQtQDUO5dErDVBAXchqSUA3Z1HA
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### 5. Project Structure
```
backend/
├── main.py           # FastAPI app entry point
├── models.py         # SQLModel models for Tasks
├── routes/
│   ├── tasks.py      # CRUD endpoints for tasks
│   └── auth.py       # Signup, login, logout, me endpoints
├── db.py             # Database connection with SQLModel
├── dependencies.py   # JWT verification middleware
├── utils.py          # Helper functions
└── requirements.txt  # Project dependencies
```

## Development Workflow

### 1. Start Development Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. API Documentation
Access Swagger UI at: http://localhost:8000/docs
Access ReDoc at: http://localhost:8000/redoc

### 3. Run Tests
```bash
pytest tests/
```

## Key Implementation Points

### Authentication Flow
1. User authentication handled via Better Auth on frontend
2. JWT tokens sent to backend via Authorization: Bearer <token> header
3. Backend validates JWT signature using BETTER_AUTH_SECRET
4. User ID extracted from JWT claims, not from URL parameters
5. All task operations verified against authenticated user ID

### Database Operations
1. Initialize database connection in main.py
2. Create tables using SQLModel's create_engine and create_tables
3. Use dependency injection for database sessions
4. Implement proper transaction handling for concurrent operations

### Error Handling
1. Use HTTPException for error responses
2. Return consistent error formats
3. Log errors appropriately
4. Handle database connection failures gracefully

## Testing Endpoints

### Authentication
```bash
# Register new user
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password", "name": "Test User"}'

# Login user
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

### Tasks (with JWT token)
```bash
# Get user's tasks
curl -X GET "http://localhost:8000/api/tasks" \
  -H "Authorization: Bearer <jwt-token>"

# Create new task
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"title": "Sample Task", "description": "Sample Description"}'
```

## Environment Variables

- `DATABASE_URL`: Connection string for Neon PostgreSQL
- `BETTER_AUTH_SECRET`: Secret key for JWT token validation
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 15)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time (default: 7)

## Security Best Practices

1. Never hardcode secrets in source code
2. Always validate JWT tokens before processing requests
3. Extract user_id from JWT claims, not URL parameters
4. Implement rate limiting on authentication endpoints
5. Use parameterized queries to prevent SQL injection
6. Validate all input data before processing

## Deployment Notes

1. Use environment-specific configurations
2. Enable SSL/TLS for production
3. Implement proper logging
4. Set up monitoring and alerting
5. Use a process manager (like gunicorn) for production deployments