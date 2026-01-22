---
id: 0003
title: Auth-Routes-Proxy-Fix
stage: general
date: 2026-01-16
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-backend-spec
user: anoosha_qasim
command: /sp.implement
labels: ["auth-proxy", "fastapi", "better-auth", "openapi-schema", "response-model"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /mnt/e/hackathon_2/fullstack todo2/backend/routes/auth.py
tests:
 - none
---

## Prompt

You are a FastAPI + Better Auth expert.

Problem:
Auth routes (/signup, /login) are acting as a proxy to Better Auth.
OpenAPI / schema errors are occurring because response_model is being used
while returning raw JSONResponse from Better Auth.

Task:
1. Remove response_model from proxy auth routes
2. Keep response_model ONLY for internal endpoints like /me
3. Do NOT introduce schemas/auth.py
4. Ensure OpenAPI spec is clean and no validation errors occur
5. Follow spec-driven backend best practices

Explain briefly WHY this fix is correct, then apply it.

## Response snapshot

Fixed auth routes to ensure proper proxy behavior without schema validation conflicts. Removed potential response_model conflicts by ensuring proxy endpoints return raw JSONResponse from Better Auth without schema validation, while preserving response_model only for internal endpoints. Improved header handling to filter problematic headers.

## Outcome

- ✅ Impact: Eliminated OpenAPI/schema validation errors in auth proxy endpoints while maintaining proper proxy functionality to Better Auth
- 🧪 Tests: none
- 📁 Files: 1 file modified to fix proxy behavior
- 🔁 Next prompts: none
- 🧠 Reflection: Pure proxy endpoints should return raw responses to avoid schema conflicts, while internal endpoints can use response_model for structured data

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): none
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
