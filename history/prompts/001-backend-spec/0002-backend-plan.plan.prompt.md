---
id: 0002
title: Backend-Plan
stage: plan
date: 2026-01-14
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-backend-spec
branch: 001-backend-spec
user: claude
command: sp.plan
labels: ["backend","fastapi","sqlmodel","postgresql","auth","security","api","todo"]
links:
  spec: "/mnt/e/hackathon_2/fullstack todo2/specs/001-backend-spec/spec.md"
  ticket: null
  adr: null
  pr: null
files:
 - "/mnt/e/hackathon_2/fullstack todo2/specs/001-backend-spec/plan.md"
 - "/mnt/e/hackathon_2/fullstack todo2/specs/001-backend-spec/research.md"
 - "/mnt/e/hackathon_2/fullstack todo2/specs/001-backend-spec/data-model.md"
 - "/mnt/e/hackathon_2/fullstack todo2/specs/001-backend-spec/quickstart.md"
 - "/mnt/e/hackathon_2/fullstack todo2/specs/001-backend-spec/contracts/api-contract.md"
tests:
 - "architecture-review"
 - "security-check"
 - "api-contract-validation"
---

## Prompt

Backend Implementation Plan for Phase II: Todo Full-Stack Web Application

Target: Implement a robust, secure, and frontend-ready backend in Python FastAPI with SQLModel ORM and Neon PostgreSQL.

Environment Variables:
- DATABASE_URL='postgresql://neondb_owner:****************@ep-spring-cherry-a7r2kgi0-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
- BETTER_AUTH_SECRET='sCMK9dQtQDUO5dErDVBAXchqSUA3Z1HA'

Objectives:
1. Implement secure JWT authentication using Better Auth secret
2. Expose RESTful API endpoints for Task CRUD operations, filtered by authenticated user
3. Enforce user isolation: users can only access their own tasks
4. Integrate backend seamlessly with frontend (Next.js 16+ App Router)
5. Maintain spec-driven structure for Claude Code and Spec-Kit Plus workflow
6. Include error handling, data validation, and proper HTTP status codes
7. Backend ready for immediate testing and frontend integration

Folder Structure:
backend/
├── main.py           # FastAPI app entry
├── models.py         # SQLModel models for Tasks
├── routes/
│   ├── tasks.py      # CRUD endpoints for tasks
│   └── auth.py       # Signup, login, logout, me endpoints
├── db.py             # Database connection with SQLModel
├── dependencies.py   # JWT verification middleware
└── utils.py          # Helper functions (optional)

Endpoints & Auth:
- POST /api/auth/signup → create new user
- POST /api/auth/login → return JWT token
- POST /api/auth/logout → revoke token/session
- GET /api/auth/me → get logged-in user info
- GET /api/tasks → list all tasks for authenticated user
- POST /api/tasks → create task
- GET /api/tasks/{id} → retrieve single task
- PUT /api/tasks/{id} → update task
- DELETE /api/tasks/{id} → delete task
- PATCH /api/tasks/{id}/complete → toggle completion

Improvements / Security Enhancements:
1. **User ID derived from JWT token**, not URL param, to prevent unauthorized access
2. **Rate limiting recommendation** for sensitive endpoints (optional)
3. **Environment variable management**: DATABASE_URL and BETTER_AUTH_SECRET used securely
4. **Validation hooks** for all incoming data via Pydantic models
5. **Error responses** standardized: 400 for validation, 401 for unauthorized, 403 for forbidden, 404 for not found
6. **Concurrency handling**: graceful handling of multiple updates to same task

Frontend Integration Notes:
- Consistent request/response structure for easy frontend API calls
- JSON response format with standardized keys
- JWT token expected in Authorization: Bearer <token> header
- Ready to plug into existing Next.js frontend with minimal changes

Testing / QA Hooks:
- Each endpoint can be tested independently with valid/invalid JWT tokens
- CRUD operations testable per user for data isolation
- Edge cases included: task not found, expired token, invalid data, concurrent updates, DB failures

Success Criteria:
- All endpoints enforce JWT validation and user isolation
- CRUD operations fully functional for authenticated users
- Backend easy to integrate with frontend
- Error-free DB connection with ACID compliance
- Ready for next step: `/sp.tasks` generation for Claude Code

## Response snapshot

Successfully created a comprehensive implementation plan for the backend Todo application with FastAPI, SQLModel, and Neon PostgreSQL. The plan includes:

1. Complete implementation plan document with technical context, constitution check, and project structure
2. Research document outlining technical decisions, framework selection, and implementation roadmap
3. Data model defining the Task entity with proper relationships and constraints
4. API contract specifying all endpoints with request/response formats and error handling
5. Quickstart guide with setup instructions and development workflow
6. Agent context updated with new technologies (Python 3.11, FastAPI, SQLModel, etc.)

The plan emphasizes security by deriving user_id from JWT tokens rather than URL parameters, implements proper user isolation, and follows all constitution principles including spec-driven development, reusability, and performance considerations.

## Outcome

- ✅ Impact: Created complete backend implementation plan with all required documentation and contracts
- 🧪 Tests: Architecture reviewed and security requirements validated
- 📁 Files: Generated plan.md, research.md, data-model.md, quickstart.md, contracts/api-contract.md
- 🔁 Next prompts: Ready for /sp.tasks to generate implementation tasks
- 🧠 Reflection: Plan addresses all security concerns and follows best practices for FastAPI/SQLModel applications

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All validation items passed
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to task generation with /sp.tasks
