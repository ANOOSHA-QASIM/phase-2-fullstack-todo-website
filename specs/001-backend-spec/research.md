# Research Document: Backend Implementation for Phase II: Todo Full-Stack Web Application

**Date**: 2026-01-14
**Feature**: 001-backend-spec
**Research Lead**: Claude

## Executive Summary

This research document outlines the technical decisions, architecture patterns, and implementation approach for the backend of the Todo Full-Stack Web Application. The backend will be built using Python FastAPI with SQLModel ORM, integrating with Neon PostgreSQL database and Better Auth for JWT-based authentication.

## Decision Log

### 1. Framework Selection: FastAPI
**Decision**: Use FastAPI as the primary web framework
**Rationale**: FastAPI provides excellent performance, automatic API documentation (Swagger/OpenAPI), built-in validation with Pydantic, and strong async support. It's ideal for building REST APIs with Python and has great community support.
**Alternatives considered**: Flask, Django REST Framework, Starlette
**Alternative rejected**: Flask lacks built-in async support and automatic documentation. Django REST Framework is heavier than needed for this use case.

### 2. ORM Selection: SQLModel
**Decision**: Use SQLModel as the ORM
**Rationale**: SQLModel is developed by the same creator as FastAPI and provides excellent integration. It combines SQLAlchemy and Pydantic, offering type hints and validation while maintaining SQL power. Perfect for FastAPI applications.
**Alternatives considered**: SQLAlchemy, Peewee, Tortoise ORM
**Alternative rejected**: SQLAlchemy is more complex without Pydantic integration. Peewee lacks async support. Tortoise ORM is asyncio-specific and may limit flexibility.

### 3. Authentication Strategy: JWT with Better Auth
**Decision**: Implement JWT-based authentication using Better Auth
**Rationale**: Better Auth provides a complete authentication solution with JWT handling, user management, and security best practices. It integrates well with FastAPI and provides frontend/backend consistency.
**Alternatives considered**: Custom JWT implementation, OAuth2 with password flow, Firebase Auth
**Alternative rejected**: Custom JWT implementation increases security risk. OAuth2 with password flow is less suitable for this application. Firebase Auth would add external dependency.

### 4. Database Connection: Neon PostgreSQL
**Decision**: Use Neon PostgreSQL with connection pooling
**Rationale**: Neon provides serverless PostgreSQL with auto-scaling, branching, and excellent performance. It's compatible with standard PostgreSQL drivers and offers pay-per-use pricing.
**Alternatives considered**: Standard PostgreSQL, SQLite, MongoDB
**Alternative rejected**: Standard PostgreSQL requires more infrastructure management. SQLite is not suitable for concurrent users. MongoDB would require changing the SQLModel approach.

### 5. Security Implementation: JWT Token Extraction from Headers
**Decision**: Extract user_id from JWT token claims, not URL parameters
**Rationale**: This prevents URL manipulation attacks where users could access other users' data by changing URL parameters. Security best practice requires server-side validation of user permissions.
**Alternatives considered**: User_id in URL parameters, session-based authentication
**Alternative rejected**: URL parameters are insecure for authorization. Session-based auth is stateful and doesn't scale well with microservices.

### 6. Error Handling: Standardized HTTP Status Codes
**Decision**: Implement consistent error response format with standardized HTTP status codes
**Rationale**: Standardized error responses make frontend integration easier and ensure predictable API behavior. Following REST conventions improves developer experience.
**Alternatives considered**: Custom error codes, generic error responses
**Alternative rejected**: Custom error codes require more documentation and increase integration complexity. Generic responses lack specificity.

## Technical Deep Dive

### Authentication Flow
1. User registers/logs in via frontend using Better Auth
2. Frontend receives JWT token from Better Auth
3. Frontend sends JWT token in Authorization header to backend
4. Backend validates JWT signature using BETTER_AUTH_SECRET
5. Backend extracts user_id from token claims
6. Backend verifies user_id exists and is active
7. Backend processes request based on user_id from token (not URL)

### Database Models
- **User**: Managed by Better Auth (external to our direct control)
- **Task**: Owned by user_id with fields (id, title, description, completed, created_at, updated_at)
- **Indexes**: On user_id and completed fields for query performance
- **Constraints**: Title length validation, completed boolean with default false

### API Endpoint Design
- **Authentication endpoints**: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Task endpoints**: `/api/tasks` (GET/POST), `/api/tasks/{id}` (GET/PUT/DELETE), `/api/tasks/{id}/complete` (PATCH)
- **Security**: All task endpoints require JWT validation and user ownership verification
- **Response format**: Consistent JSON structure with id, title, description, completed, timestamps

## Risk Assessment

### High Risk Items
- **JWT Secret Management**: BETTER_AUTH_SECRET must be stored securely in environment variables, never hardcoded
- **SQL Injection**: Use parameterized queries through SQLModel to prevent injection attacks
- **Rate Limiting**: Implement rate limiting to prevent abuse, especially on authentication endpoints

### Medium Risk Items
- **Concurrent Updates**: Implement proper transaction handling for simultaneous updates to same task
- **Database Connection Pooling**: Configure appropriate connection limits to handle 100 concurrent users
- **Token Expiration**: Handle token refresh mechanisms for better user experience

## Implementation Roadmap

### Phase 1: Foundation
1. Set up FastAPI application structure
2. Configure database connection with SQLModel
3. Implement basic models and database setup
4. Create authentication middleware

### Phase 2: Core Functionality
1. Implement authentication endpoints
2. Create task CRUD endpoints
3. Add JWT validation and user isolation
4. Implement proper error handling

### Phase 3: Optimization
1. Add rate limiting
2. Optimize database queries with proper indexing
3. Add comprehensive testing
4. Performance tuning for 100 concurrent users

## Dependencies & Versions

- Python 3.11+
- FastAPI >= 0.104.1
- SQLModel >= 0.0.16
- psycopg2-binary >= 2.9.9
- python-multipart >= 0.0.9
- Better Auth (frontend integration)
- uvicorn (ASGI server)

## Environment Configuration

Required environment variables:
- `DATABASE_URL`: Connection string for Neon PostgreSQL
- `BETTER_AUTH_SECRET`: Secret key for JWT token validation
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default 15 minutes)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time (default 7 days)