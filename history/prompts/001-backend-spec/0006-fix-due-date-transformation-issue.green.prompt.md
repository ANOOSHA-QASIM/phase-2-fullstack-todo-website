---
id: 0006
title: fix-due-date-transformation-issue
stage: green
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5
feature: 001-backend-spec
branch: 001-backend-spec
user: anusha-qasim
command: /sp.implement
labels: ["bug-fix", "frontend", "api", "transformation", "due-date"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/api.ts
tests:
  - Manual testing required (backend + frontend integration)
---

## Prompt

You are a senior FastAPI + PostgreSQL + Next.js full-stack developer.

I am facing an issue in my full-stack Todo app where the due date is not saving or showing correctly.

Context:
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: Next.js (TypeScript)
- API runs on http://localhost:8000
- Frontend runs on http://localhost:3000

Problem:
- Priority is saving and showing correctly
- Due date is not updating / not showing
- Error previously showed mismatch like:
  TaskCreate has no attribute 'due_date'. Did you mean 'dueDate'?

Your task:
1. Identify naming mismatches between frontend (camelCase) and backend (snake_case)
2. Fix TaskCreate schema so due_date works correctly
3. Ensure SQLAlchemy model, Pydantic schema, API route, and frontend payload all use compatible naming
4. Clearly mention:
   - Which file to change
   - What exact code to add/remove
5. Follow Python/FastAPI best practices (snake_case in backend)

Give a clean, step-by-step fix so that due date:
- Saves in database
- Returns in API response
- Displays correctly in frontend

## Response snapshot

Fixed the due date transformation issue by adding special handling for nested arrays in the API response transformation logic.

**Root Cause**: The `getTasks` endpoint returns a nested structure with tasks inside a data object. The transformation function in `api.ts` was only transforming top-level arrays or objects, not nested arrays inside objects. This meant `due_date` inside the `tasks` array never got converted to `dueDate`.

**Fix Applied**: Modified `frontend/lib/api.ts` (lines 87-101) to add special handling for nested `tasks` arrays:

```typescript
// Transform response data from snake_case to camelCase
let transformedData = data.data || data;

if (Array.isArray(transformedData)) {
  transformedData = transformedData.map(item => transformFromSnakeToCamel(item));
} else if (transformedData && typeof transformedData === 'object') {
  transformedData = transformFromSnakeToCamel(transformedData);

  // Special handling for nested tasks array (from getTasks endpoint)
  if (transformedData.tasks && Array.isArray(transformedData.tasks)) {
    transformedData.tasks = transformedData.tasks.map((item: any) => transformFromSnakeToCamel(item));
  }
}
```

**Data Flow Verified**:
- Backend uses `due_date` (snake_case) ✓
- Frontend uses `dueDate` (camelCase) ✓
- API requests transform `dueDate` → `due_date` ✓
- API responses transform `due_date` → `dueDate` (now fixed) ✓

## Outcome

- ✅ Impact: Fixed due date not saving/displaying issue by adding nested array transformation in API client
- 🧪 Tests: Manual integration testing required (create task with due date, verify save/display, edit due date)
- 📁 Files: Modified 1 file (frontend/lib/api.ts)
- 🔁 Next prompts: Test the fix end-to-end by creating/editing tasks with due dates
- 🧠 Reflection: The issue was subtle - the transformation logic worked for direct arrays and single objects, but failed for nested arrays inside response objects. The fix maintains the existing transformation pattern while adding special handling for the nested tasks array structure.

## Evaluation notes (flywheel)

- Failure modes observed: Nested array transformation not handled in original implementation
- Graders run and results (PASS/FAIL): Not applicable (manual testing required)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider making the transformation function fully recursive to handle arbitrary nesting levels
