---
id: 0005
title: fix-priority-and-due-date-fields
stage: green
date: 2026-02-07
surface: agent
model: claude-sonnet-4-5
feature: 001-backend-spec
branch: 001-backend-spec
user: user
command: /sp.implement
labels: ["bug-fix", "frontend", "forms", "api-integration"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/app/tasks/add/page.tsx
  - frontend/app/tasks/page.tsx
  - frontend/app/dashboard/page.tsx
  - frontend/app/tasks/pending/page.tsx
  - frontend/app/tasks/completed/page.tsx
tests:
  - Frontend build successful with no TypeScript errors
---

## Prompt

I have a Next.js + TypeScript frontend for a Todo app. In my AddTask and EditTask forms, I have "priority" (low/medium/high) and "due date" fields. The issue is that when I fill the form and click "Create Task" or "Save", the priority and due date are **not being saved or updated correctly** in the backend. The backend expects:

- `priority` as 'low' | 'medium' | 'high'
- `due_date` as a string (snake_case)

Currently, my frontend uses camelCase (`dueDate`) and sometimes the payload sent is incorrect.

I want you to:

1. Update the form state so that it correctly tracks `priority` and `due_date`.
2. Update the form inputs (select for priority, date input for due date) to properly change the state.
3. Fix the submit handlers (`handleSubmit` for AddTask and `handleEditTask` for EditTask) so that the payload sent to the API uses **snake_case** for due_date.
4. Ensure that after fetching tasks from the API, `due_date` is mapped to camelCase `dueDate` so that it correctly displays in the UI.
5. Make sure both add and edit functionality work correctly.

## Response snapshot

Fixed priority and due_date field handling across all task pages:

**Root Cause:**
- Edit modals were missing priority and due_date input fields in pending/completed pages
- Some pages sent camelCase `dueDate` instead of snake_case `due_date` to API
- Edit modal state wasn't properly tracking priority and dueDate values

**Changes Made:**

1. **All Tasks Page** (`frontend/app/tasks/page.tsx`):
   - Added `editPriority` and `editDueDate` state variables
   - Updated `openEditModal` to initialize from task data
   - Added priority select and due date input to edit modal
   - Fixed `handleEditTask` to send `due_date` (snake_case)

2. **Dashboard Page** (`frontend/app/dashboard/page.tsx`):
   - Added `editPriority` and `editDueDate` state variables
   - Updated modal inputs to use state variables instead of direct editingTask modification
   - Fixed `handleEditTask` to send `due_date` with proper priority value

3. **Pending Tasks Page** (`frontend/app/tasks/pending/page.tsx`):
   - Added `editPriority` and `editDueDate` state variables
   - Added missing priority and due date fields to edit modal
   - Fixed `handleEditTask` to send `due_date` (snake_case)

4. **Completed Tasks Page** (`frontend/app/tasks/completed/page.tsx`):
   - Added `editPriority` and `editDueDate` state variables
   - Added missing priority and due date fields to edit modal
   - Fixed `handleEditTask` to send `due_date` (snake_case)

5. **Add Task Page** (`frontend/app/tasks/add/page.tsx`):
   - Already correct - verified it sends `due_date` properly

**API Integration:**
- Existing `transformToSnakeCase()` in `lib/api.ts` handles camelCase → snake_case conversion
- Existing `transformFromSnakeToCamel()` handles snake_case → camelCase for responses
- All payloads now correctly use `due_date` field name

**Build Status:** ✅ Successful with no TypeScript errors

## Outcome

- ✅ Impact: Fixed critical bug preventing priority and due_date from being saved/updated across all task management pages
- 🧪 Tests: Frontend build passed with no TypeScript errors
- 📁 Files: Modified 5 files (all task-related pages)
- 🔁 Next prompts: Test the changes in browser, verify backend receives correct payload format
- 🧠 Reflection: Issue was caused by inconsistent state management in edit modals and missing form fields. The API transformation layer was already correct, but the UI wasn't properly utilizing it.

## Evaluation notes (flywheel)

- Failure modes observed: Missing form fields in edit modals, inconsistent use of camelCase vs snake_case in API payloads
- Graders run and results (PASS/FAIL): TypeScript compilation PASS, Build process PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add visual feedback when priority/due_date are successfully saved
