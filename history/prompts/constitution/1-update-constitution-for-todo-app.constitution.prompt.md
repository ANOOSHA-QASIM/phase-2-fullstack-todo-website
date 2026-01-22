---
id: 1
title: Update Constitution For Todo App
stage: constitution
date: 2026-01-13
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: claude-code
command: /sp.constitution
labels: [constitution,spec-driven-development,reusability,security]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
---

## Prompt

```text
Project: Hackathon II – Todo Full-Stack Web Application (Phase II)

Core Principles:
- **Spec-Driven Development First**: All implementation must strictly follow specifications defined in /specs. No manual coding outside Claude Code.
- **Reusability**: Any functionality (task handling, auth, API helpers) should be reusable in later phases (Phase III chatbot, Phase IV Kubernetes deployment).
- **User Isolation & Security**: Every feature must enforce proper authentication & authorization (JWT-based Better Auth integration).
- **Clarity & Consistency**: Code, API responses, UI components, and database models must be consistent with specs and naming conventions.
- **Iterative & Testable**: Features should be built incrementally, tested at each step, and spec updated if changes occur.

Key Standards:
- **Frontend**: Next.js 16+, TypeScript, Tailwind CSS. Follow component-based architecture.
- **Backend**: FastAPI, SQLModel ORM, Neon PostgreSQL.
- **Authentication**: Better Auth + JWT. All endpoints secured.
- **API**: RESTful endpoints must adhere to @specs/api/rest-endpoints.md.
- **Database**: Follow @specs/database/schema.md. Ensure referential integrity and indexes.
- **Error Handling**: Return clear, JSON-formatted errors. Use HTTP status codes correctly.
- **Documentation**: Every implemented feature must reference its spec in /specs.
- **Reusability for Agents/Skills**: Define any helper functionality (task validation, auth helpers) in a way that can be converted into Claude Code agents/skills in future phases.

Constraints:
- All CRUD operations must work only for the **authenticated user**.
- All JWT tokens must be validated by backend middleware.
- Task fields: title (1-200 chars), description (optional, max 1000 chars), completed (boolean), timestamps.
- Use monorepo structure as per /spec-kit/config.yaml.
- Frontend must be responsive for desktop & mobile.

Success Criteria:
- All 5 Basic Level features implemented and fully working:
  1. Add Task
  2. Delete Task
  3. Update Task
  4. View Task List
  5. Mark as Complete
- JWT auth integrated; all endpoints require valid token.
- API responses filtered by authenticated user.
- Code is fully spec-driven, referenceable in /specs.
- Ready for Phase III expansion with reusable agents & skills.
- Judge-ready: clearly follows spec, fully functional, secure, and clean architecture.
```

## Response snapshot

Updated the constitution file with the specific principles, standards, constraints, and success criteria for the Hackathon II Todo application project.

## Outcome

- ✅ Impact: Updated constitution file with project-specific principles and guidelines
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: Implement features following the updated constitution
- 🧠 Reflection: Constitution now properly reflects the project requirements and constraints

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin implementing features per constitution