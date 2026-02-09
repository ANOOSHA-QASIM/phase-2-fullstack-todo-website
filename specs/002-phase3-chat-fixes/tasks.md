# Tasks: Phase III Chat & MCP Tools Fixes

**Feature**: 002-phase3-chat-fixes
**Branch**: `002-phase3-chat-fixes`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Overview

This document provides a detailed, executable task breakdown for fixing critical bugs in the Phase III Todo AI Chatbot. Tasks are organized by user story to enable independent implementation and testing.

**Total Tasks**: 28
**Estimated Completion**: Sequential implementation recommended for critical path (P0/P1 tasks)

## Task Summary by User Story

| User Story | Priority | Task Count | Can Start After |
|------------|----------|------------|-----------------|
| Setup | - | 3 | Immediately |
| US1: Authenticated Chat Access | P1 | 8 | Setup complete |
| US2: Unauthenticated Access Rejection | P1 | 3 | US1 complete |
| US3: MCP Tool Execution | P1 | 4 | US1 complete |
| US4: Type-Safe Operations | P2 | 5 | US1, US2, US3 complete |
| US5: Error Handling & Logging | P3 | 5 | All P1/P2 complete |

## Implementation Strategy

**MVP Scope**: User Story 1 (Authenticated Chat Access)
- Fixes backend syntax error and authentication
- Fixes frontend token key and authentication
- Enables basic chat functionality

**Incremental Delivery**:
1. **Phase 1**: US1 (Core chat functionality restored)
2. **Phase 2**: US2 + US3 (Security and MCP tools verified)
3. **Phase 3**: US4 (Type safety enforced)
4. **Phase 4**: US5 (Production-ready error handling)

**Parallel Opportunities**:
- Within US1: Frontend and backend fixes can be done in parallel after setup
- US2 and US3 can be done in parallel after US1
- US4 tasks are mostly independent and can be parallelized

---

## Phase 1: Setup & Prerequisites

**Goal**: Prepare development environment and verify current state

**Tasks**:

- [x] T001 Verify development environment setup (Python 3.11, Node.js 18+, PostgreSQL accessible)
- [x] T002 Create feature branch `002-phase3-chat-fixes` from main branch `001-backend-spec`
- [x] T003 Document current broken state (backend syntax error, frontend type errors, token key mismatch)

**Acceptance Criteria**:
- Development environment ready
- Feature branch created and checked out
- Current issues documented for comparison

---

## Phase 2: User Story 1 - Authenticated Chat Access (P1)

**Story Goal**: Restore core chat functionality with proper authentication

**Why P1**: This is the minimum viable product. Without this, the entire chatbot is non-functional.

**Independent Test**: Login as valid user → Send message "Add a task to buy groceries" → Verify AI response received and task created in database

**Tasks**:

### Backend Authentication Fix (Critical Path)

- [x] T004 [US1] Fix syntax error in backend/src/api/chat.py:48-50 (add missing comma between parameters)
- [x] T005 [US1] Reorder parameters in chat_endpoint function (request: ChatRequest first, then user_id dependency)
- [x] T006 [US1] Add authentication dependency: `user_id: str = Depends(get_current_user)` in backend/src/api/chat.py
- [x] T007 [US1] Remove Optional type from user_id parameter (change from `Optional[str]` to `str`)
- [x] T008 [US1] Remove default "guest" value from user_id parameter

### Frontend Token Key Fix (Critical Path)

- [x] T009 [P] [US1] Fix token key in frontend/services/chatApi.ts:32 (change 'authToken' to 'access_token')
- [x] T010 [P] [US1] Verify token key consistency in frontend/lib/api.ts (confirm uses 'access_token')

### Frontend Authentication Integration

- [x] T011 [US1] Create or update useAuth hook in frontend/lib/auth.ts to extract userId from JWT token
- [x] T012 [US1] Update useChat hook in frontend/hooks/useChat.ts to get userId from useAuth context (remove userId parameter)
- [x] T013 [US1] Add authentication check in frontend/app/chat/page.tsx (use useAuth hook, redirect if not authenticated)
- [x] T014 [US1] Update useChat call in frontend/app/chat/page.tsx to pass only options (remove userId argument)
- [x] T015 [US1] Remove userId parameter from sendChatMessage in frontend/services/chatApi.ts (backend extracts from token)

**Acceptance Criteria**:
- ✅ Backend chat endpoint compiles without syntax errors
- ✅ Endpoint requires authentication (returns 401 without token)
- ✅ Frontend compiles without TypeScript errors
- ✅ Authenticated users can send messages and receive responses
- ✅ Messages saved to database with correct user_id
- ✅ Conversations created and loaded correctly

**Independent Test Verification**:
```bash
# Backend test
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}'

# Expected: 200 OK with ChatResponse, task created in database

# Frontend test
# Login → Navigate to /chat → Send message → Verify response
```

---

## Phase 3: User Story 2 - Unauthenticated Access Rejection (P1)

**Story Goal**: Ensure security by rejecting unauthenticated requests

**Why P1**: Security is critical. Must prevent unauthorized access before production deployment.

**Independent Test**: Make chat API request without token → Verify HTTP 401 returned (not redirect)

**Dependencies**: Requires US1 (backend authentication fix) to be complete

**Tasks**:

- [x] T016 [P] [US2] Test chat endpoint without authentication token (verify returns 401)
- [x] T017 [P] [US2] Test chat endpoint with invalid token (verify returns 401 with clear error message)
- [x] T018 [P] [US2] Test chat endpoint with expired token (verify returns 401)

**Acceptance Criteria**:
- ✅ Requests without token return HTTP 401
- ✅ Requests with invalid token return HTTP 401
- ✅ Requests with expired token return HTTP 401
- ✅ Error messages are clear and don't expose sensitive information
- ✅ No redirects to login page (backend returns error response)

**Independent Test Verification**:
```bash
# Test without token
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Expected: 401 {"detail": "Not authenticated"}

# Test with invalid token
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Expected: 401 {"detail": "Could not validate credentials"}
```

---

## Phase 4: User Story 3 - MCP Tool Execution with User Context (P1)

**Story Goal**: Verify MCP tools execute correctly with authenticated user_id

**Why P1**: MCP tools are the execution layer for task operations. Must work for chatbot to be functional.

**Independent Test**: Send messages invoking each MCP tool → Verify correct tool called with user_id → Verify operations affect only user's tasks

**Dependencies**: Requires US1 (backend authentication fix) to be complete

**Tasks**:

- [x] T019 [P] [US3] Verify conversation_router_agent receives user_id correctly in backend/src/agents/conversation_router.py
- [x] T020 [P] [US3] Test add_task MCP tool invocation with authenticated user_id (send "Add a task to call mom")
- [x] T021 [P] [US3] Test list_tasks MCP tool invocation with authenticated user_id (send "Show my tasks")
- [x] T022 [P] [US3] Test complete_task, update_task, delete_task MCP tools with authenticated user_id

**Acceptance Criteria**:
- ✅ All 5 MCP tools (add, list, complete, update, delete) receive correct user_id
- ✅ Tools validate user ownership before operations
- ✅ Tools return structured success/error responses
- ✅ Tool results included in ChatResponse
- ✅ Operations affect only authenticated user's tasks

**Independent Test Verification**:
```bash
# Test add_task
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to call mom"}'

# Verify: tool_calls includes add_task with user_id, task created in DB

# Test list_tasks
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me my tasks"}'

# Verify: tool_calls includes list_tasks, returns only user's tasks
```

---

## Phase 5: User Story 4 - Type-Safe Operations (P2)

**Story Goal**: Ensure all code passes strict type checking without errors

**Why P2**: Type safety prevents runtime errors. Required before production but not blocking for basic functionality.

**Independent Test**: Run TypeScript compiler in strict mode and Python type checker → Verify zero errors

**Dependencies**: Requires US1, US2, US3 complete (all code changes done)

**Tasks**:

- [x] T023 [P] [US4] Run TypeScript compiler in strict mode on frontend code (npx tsc --noEmit)
- [x] T024 [P] [US4] Fix any remaining TypeScript type errors related to userId being undefined or optional
- [x] T025 [P] [US4] Run Python type checker on backend code (mypy backend/)
- [x] T026 [P] [US4] Verify all user_id parameters in backend are typed as `str` (not `Optional[str]`)
- [x] T027 [P] [US4] Verify all userId variables in frontend are typed as `string` (not `string | undefined`)

**Acceptance Criteria**:
- ✅ TypeScript compiles without errors in strict mode
- ✅ Python type checking passes without errors
- ✅ No Optional[str] for user_id in backend
- ✅ No string | undefined for userId in frontend
- ✅ All function signatures correctly typed

**Independent Test Verification**:
```bash
# Frontend type check
cd frontend
npx tsc --noEmit
# Expected: No errors

# Backend type check
cd backend
mypy src/
# Expected: Success: no issues found
```

---

## Phase 6: User Story 5 - Error Handling & Logging (P3)

**Story Goal**: Ensure all error conditions handled gracefully with proper logging

**Why P3**: Improves user experience and maintainability. Essential for production but not blocking for basic functionality.

**Independent Test**: Trigger each error condition → Verify correct HTTP status code and error message → Verify structured logging

**Dependencies**: Requires all P1 and P2 stories complete

**Tasks**:

- [x] T028 [P] [US5] Test 400 error for invalid message (empty or >2000 chars) in backend/src/api/chat.py
- [x] T029 [P] [US5] Test 401 error for authentication failures (already tested in US2, verify logging)
- [x] T030 [P] [US5] Test 429 error for rate limit violations in backend/src/api/middleware/rate_limit.py
- [x] T031 [P] [US5] Test 500 error for server errors (verify generic message, detailed logging)
- [x] T032 [P] [US5] Verify all errors logged with structured data (timestamp, user_id, error_type, stack_trace)

**Acceptance Criteria**:
- ✅ 400 errors for invalid messages with clear messages
- ✅ 401 errors for authentication failures
- ✅ 429 errors for rate limit violations
- ✅ 500 errors for server errors (generic message to user)
- ✅ All errors logged with structured data
- ✅ No sensitive information in error messages
- ✅ Frontend displays appropriate error messages

**Independent Test Verification**:
```bash
# Test 400 error
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'

# Expected: 400 {"detail": "Message must be 1-2000 characters"}

# Test 429 error (send many requests rapidly)
for i in {1..100}; do
  curl -X POST http://localhost:8000/api/v1/chat \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"message": "test"}' &
done

# Expected: Some requests return 429

# Verify logs contain structured data
tail -f backend/logs/app.log | grep "error_type"
```

---

## Dependencies & Execution Order

### Story Dependency Graph

```
Setup (Phase 1)
    ↓
US1: Authenticated Chat Access (P1) ← MVP
    ↓
    ├─→ US2: Unauthenticated Access Rejection (P1)
    └─→ US3: MCP Tool Execution (P1)
         ↓
    US4: Type-Safe Operations (P2)
         ↓
    US5: Error Handling & Logging (P3)
```

### Critical Path

**Must complete in order**:
1. Setup (T001-T003)
2. US1 Backend Fix (T004-T008) - BLOCKING
3. US1 Frontend Fix (T009-T015) - Can start after T008
4. US2 (T016-T018) - Can start after US1
5. US3 (T019-T022) - Can start after US1
6. US4 (T023-T027) - Can start after US1, US2, US3
7. US5 (T028-T032) - Can start after US4

### Parallel Execution Opportunities

**Within US1**:
- T009-T010 (Frontend token fix) can run parallel to T004-T008 (Backend fix)
- T011-T015 (Frontend auth integration) must wait for T004-T008

**After US1**:
- US2 (T016-T018) and US3 (T019-T022) can run in parallel
- All tasks within US2 can run in parallel (marked with [P])
- All tasks within US3 can run in parallel (marked with [P])

**US4 Tasks**:
- All US4 tasks (T023-T027) can run in parallel (marked with [P])

**US5 Tasks**:
- All US5 tasks (T028-T032) can run in parallel (marked with [P])

---

## Testing Strategy

### Unit Testing (Optional - Not Required for Bug Fix)

No new unit tests required. This is a bug-fix feature that restores existing functionality.

### Integration Testing (Required)

**After US1 Complete**:
- Test full authentication flow (login → chat → logout)
- Test message sending and receiving
- Test conversation creation and loading

**After US2 Complete**:
- Test authentication rejection scenarios
- Verify error messages

**After US3 Complete**:
- Test all MCP tool invocations
- Verify user isolation

**After US4 Complete**:
- Run type checkers
- Verify no type errors

**After US5 Complete**:
- Test all error scenarios
- Verify logging

### End-to-End Testing (Required)

**Full User Journey** (After all stories complete):
1. Signup new user
2. Login and receive JWT token
3. Navigate to chat page
4. Send message: "Add a task to buy groceries tomorrow"
5. Verify task created in database
6. Send message: "Show me my tasks"
7. Verify task list returned
8. Send message: "Mark the grocery task as done"
9. Verify task marked complete
10. Logout

**Expected**: All operations succeed, data persisted correctly, user isolation maintained

---

## Rollback Plan

If issues discovered after deployment:

1. **Backend Issues**: Revert backend/src/api/chat.py to previous version
2. **Frontend Issues**: Revert frontend changes (useChat, chatApi, chat page)
3. **Database Issues**: No schema changes, no rollback needed
4. **Full Rollback**: Revert entire feature branch

**Monitoring**:
- Watch error logs for 401 errors (should not increase)
- Monitor chat endpoint response times
- Check database for message/conversation creation
- Verify MCP tool execution logs

---

## Success Criteria

**MVP (US1) Success**:
- [ ] Backend compiles without syntax errors
- [ ] Chat endpoint requires authentication
- [ ] Frontend compiles without TypeScript errors
- [ ] Authenticated users can send/receive messages
- [ ] Messages saved to database

**Full Feature Success**:
- [ ] All 5 user stories complete
- [ ] All 32 tasks checked off
- [ ] All acceptance criteria met
- [ ] End-to-end test passes
- [ ] No increase in error rates
- [ ] Type checking passes
- [ ] Error handling verified

---

## Notes

**Minimal Changes Approach**: This is a bug-fix feature. Only fix what's broken, don't refactor working code.

**No Schema Changes**: All database tables already exist. No migrations needed.

**No New Features**: Only restore existing Phase III functionality as documented.

**Testing Focus**: Integration testing is critical. Unit tests are optional for bug fixes.

**Deployment Strategy**: Deploy backend first, then frontend. Monitor logs after each deployment.
