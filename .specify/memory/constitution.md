<!-- SYNC IMPACT REPORT
Version change: 1.1.0 → 1.2.0
Modified principles: None
Added sections: Performance & Load Considerations, Accessibility & Responsiveness Standards
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
  - .specify/templates/commands/*.md ⚠ pending
Follow-up TODOs: None
-->

# Hackathon II – Todo Full-Stack Web Application Constitution

## Core Principles

### Spec-Driven Development First
All implementation must strictly follow specifications defined in /specs. No manual coding outside Claude Code.

### Reusability
Any functionality (task handling, auth, API helpers) should be reusable in later phases (Phase III chatbot, Phase IV Kubernetes deployment).

### User Isolation & Security
Every feature must enforce proper authentication & authorization (JWT-based Better Auth integration).

### Clarity & Consistency
Code, API responses, UI components, and database models must be consistent with specs and naming conventions.

### Iterative & Testable
Features should be built incrementally, tested at each step, and spec updated if changes occur.

### Human as Tool Strategy
Treat the user as a specialized tool for clarification and decision-making when encountering situations that require human judgment.

## Key Standards

### Frontend
Next.js 16+, TypeScript, Tailwind CSS. Follow component-based architecture.

### Backend
FastAPI, SQLModel ORM, Neon PostgreSQL.

### Authentication
Better Auth + JWT. All endpoints secured.

### API
RESTful endpoints must adhere to @specs/api/rest-endpoints.md.

### Database
Follow @specs/database/schema.md. Ensure referential integrity and indexes.

### Error Handling
Return clear, JSON-formatted errors. Use HTTP status codes correctly.

### Documentation
Every implemented feature must reference its spec in /specs.

### Reusability for Agents/Skills
Define any helper functionality (task validation, auth helpers) in a way that can be converted into Claude Code agents/skills in future phases.

### Performance & Load Considerations
Backend endpoints must handle 100 concurrent users with <200ms average response time. Judge can verify with basic load testing.

### Accessibility & Responsiveness Standards
Frontend must follow WCAG accessibility standards. Fully responsive on desktop and mobile devices.

## Constraints

- All CRUD operations must work only for the **authenticated user**.
- All JWT tokens must be validated by backend middleware.
- Task fields: title (1-200 chars), description (optional, max 1000 chars), completed (boolean), timestamps.
- Use monorepo structure as per /spec-kit/config.yaml.
- Frontend must be responsive for desktop & mobile.

## Success Criteria

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

## Development Guidelines

### Authoritative Source Mandate
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### Execution Flow
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps.

### Default Policies
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

## Governance

This constitution supersedes all other practices. All implementations must strictly adhere to the specified principles and standards. Amendments require formal documentation and approval process. All code reviews must verify compliance with these principles.

**Version**: 1.2.0 | **Ratified**: 2026-01-13 | **Last Amended**: 2026-01-13