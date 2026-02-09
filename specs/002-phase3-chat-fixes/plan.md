# Implementation Plan: Phase III Chat & MCP Tools Fixes

**Branch**: `002-phase3-chat-fixes` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-phase3-chat-fixes/spec.md`

## Summary

This plan addresses critical bugs in the Phase III Todo AI Chatbot that prevent authentication, chat functionality, and MCP tools from working correctly. The primary issues are:

1. **Backend chat endpoint has syntax error and missing authentication dependency**
2. **Frontend useChat hook has type mismatch - expects userId but not provided**
3. **Frontend uses wrong token key for authentication**
4. **Chat page is in "public mode" without authentication checks**

The fixes will restore proper authentication flow, fix type errors, and ensure all chat features work as documented in Phase III specifications.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x with strict mode (frontend)
**Primary Dependencies**: FastAPI (backend), Next.js 16+ App Router, React 19+ (frontend)
**Storage**: PostgreSQL (Neon) with existing tables: users, conversations, messages, tasks
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web application (Linux server backend, browser frontend)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: <200ms response time for chat endpoint, support 100 concurrent users
**Constraints**: Must maintain backward compatibility with existing data, no breaking changes to API contracts
**Scale/Scope**: Single-tenant per user, ~10-50 concurrent users expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature must comply with the Phase 3 System Constitution (v2.0.0):

- [x] **Agent Boundaries**: All decision-making logic is in agents, not skills (no changes to agent/skill architecture)
- [x] **Skill Atomicity**: Each skill performs exactly one atomic operation (MCP tools already compliant)
- [x] **Stateless Design**: No hidden state in agents or skills; database is source of truth (fixes maintain stateless design)
- [x] **Intent Validation**: User intent is explicitly validated before execution (no changes to validation logic)
- [x] **Confirmation Required**: Destructive operations require user confirmation (no changes to confirmation flow)
- [x] **Bilingual Support**: System handles English and Urdu input seamlessly (no changes to language support)
- [x] **Error Clarity**: All errors provide clear messages with corrective suggestions (fixes improve error handling)
- [x] **Token Validation**: All authenticated operations validate JWT tokens (fixes enforce token validation)
- [x] **Rate Limiting**: Abuse prevention mechanisms are in place (existing rate limiting preserved)
- [x] **Performance**: System handles 100 concurrent users with <200ms response time (fixes don't impact performance)
- [x] **Constitutional Compliance**: All agents/skills include compliance statement (existing compliance preserved)

**Priority Order** (when trade-offs necessary):
1. Correctness → 2. Safety → 3. Clarity → 4. Completion → 5. Speed

**Assessment**: All constitutional requirements are met. This is a bug-fix feature that restores intended behavior without architectural changes.

## Project Structure

### Documentation (this feature)

```text
specs/002-phase3-chat-fixes/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (issues analysis)
├── data-model.md        # Phase 1 output (no schema changes)
├── quickstart.md        # Phase 1 output (testing guide)
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   └── chat.py                    # FIX: Syntax error, add auth dependency
│   ├── agents/
│   │   └── conversation_router.py     # VERIFY: Receives user_id correctly
│   ├── mcp/
│   │   ├── __init__.py                # VERIFY: Tool registration
│   │   ├── server.py                  # VERIFY: Tool invocation
│   │   └── tools.py                   # VERIFY: All tools accept user_id (already correct)
│   └── models/
│       └── user.py                    # VERIFY: User model
├── routes/
│   └── auth.py                        # VERIFY: JWT token generation
├── dependencies.py                    # VERIFY: get_current_user dependency
├── utils.py                           # VERIFY: verify_token function
└── main.py                            # VERIFY: Chat endpoint registration

frontend/
├── app/
│   └── chat/
│       └── page.tsx                   # FIX: Add authentication, pass userId
├── hooks/
│   └── useChat.ts                     # FIX: Make userId optional or from context
├── services/
│   ├── chatApi.ts                     # FIX: Token key mismatch
│   └── conversationApi.ts             # VERIFY: Uses correct token
├── lib/
│   ├── api.ts                         # VERIFY: Token storage key
│   └── auth.ts                        # VERIFY: Auth utilities
└── types/
    ├── chat.ts                        # VERIFY: Type definitions
    └── user.ts                        # VERIFY: User type
```

**Structure Decision**: Web application structure with separate backend (FastAPI) and frontend (Next.js) directories. All fixes are localized to specific files without requiring structural changes.

## Complexity Tracking

> **No constitutional violations** - This is a bug-fix feature that restores intended behavior.

## Phase 0: Research & Issue Analysis

### Critical Issues Identified

#### Issue 1: Backend Chat Endpoint Syntax Error and Missing Authentication

**File**: `backend/src/api/chat.py:48-50`

**Current Code**:
```python
async def chat_endpoint(
    user_id: Optional[str] = "guest"  # SYNTAX ERROR: Missing comma
    request: ChatRequest              # Also: wrong parameter order
) -> ChatResponse:
```

**Problems**:
1. **Syntax Error**: Missing comma between parameters causes Python parse error
2. **Wrong Parameter Order**: FastAPI requires body parameters (ChatRequest) before query/dependency parameters
3. **Missing Authentication**: Not using `Depends(get_current_user)` to enforce authentication
4. **Optional Type**: `user_id` is `Optional[str]` but should be required `str`
5. **Default Value**: Defaults to "guest" string, bypassing authentication entirely

**Impact**: Chat endpoint cannot be called at all due to syntax error. Even if fixed, authentication is not enforced.

**Root Cause**: Incomplete implementation or merge conflict that left code in broken state.

#### Issue 2: Frontend useChat Hook Type Mismatch

**File**: `frontend/hooks/useChat.ts:21`

**Current Signature**:
```typescript
export function useChat(userId: string, options?: UseChatOptions)
```

**Called From**: `frontend/app/chat/page.tsx:38-50`
```typescript
const { messages, conversationId, ... } = useChat({
  onConversationCreated: refreshConversations
});
```

**Problems**:
1. **Type Error**: Hook expects `userId: string` as first parameter but receives `options` object
2. **Missing userId**: Chat page doesn't extract userId from authentication
3. **TypeScript Strict Mode**: Will fail compilation with strict type checking

**Impact**: TypeScript compilation errors prevent frontend from building. Even if compiled with errors ignored, userId will be undefined causing runtime errors.

**Root Cause**: Refactoring from authenticated mode to "public mode" left inconsistent function signatures.

#### Issue 3: Frontend Token Key Mismatch

**File**: `frontend/services/chatApi.ts:32`

**Current Code**:
```typescript
const token = localStorage.getItem('authToken');
```

**Actual Token Key**: `frontend/lib/api.ts:20`
```typescript
this.token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
```

**Problems**:
1. **Key Mismatch**: chatApi.ts uses 'authToken' but auth system uses 'access_token'
2. **Always Null**: Token will always be null, causing all requests to fail with 401
3. **Inconsistent Storage**: Different parts of app use different keys

**Impact**: All chat API requests fail authentication even when user is logged in.

**Root Cause**: Copy-paste error or incomplete refactoring between different API clients.

#### Issue 4: Chat Page Missing Authentication

**File**: `frontend/app/chat/page.tsx:3-4, 19-20, 87-101`

**Current State**:
- Line 3: Comment says "PUBLIC MODE – No authentication, no login redirect"
- Lines 19-20: Comment about getting authenticated user but no implementation
- Lines 87-101: Authentication checks are commented out

**Problems**:
1. **No Auth Check**: Page doesn't verify user is authenticated
2. **No userId Extraction**: Doesn't get userId from JWT token
3. **Public Mode**: Contradicts requirement that authentication is required

**Impact**: Unauthenticated users can access chat page but all API calls fail. No proper error handling or redirect.

**Root Cause**: Intentional "public mode" implementation that contradicts Phase III requirements.

### Research Findings

#### Authentication Flow (Current vs Required)

**Current Flow** (Broken):
1. User logs in → JWT token stored in localStorage as 'access_token'
2. User navigates to /chat → No authentication check
3. Chat page calls useChat() without userId → Type error
4. useChat calls chatApi.sendChatMessage() → Uses wrong token key 'authToken'
5. Backend receives request → chat_endpoint has syntax error, can't execute
6. Result: Complete failure at multiple points

**Required Flow** (Fixed):
1. User logs in → JWT token stored in localStorage as 'access_token'
2. User navigates to /chat → Check authentication, extract userId from token
3. Chat page calls useChat(userId) → Correct type signature
4. useChat calls chatApi.sendChatMessage(userId) → Uses correct token key 'access_token'
5. Backend receives request → chat_endpoint validates token via Depends(get_current_user)
6. Backend extracts user_id from token → Passes to conversation_router_agent and MCP tools
7. Result: Authenticated request processed successfully

#### Type Safety Analysis

**Backend Type Issues**:
- ✅ MCP tools: All correctly typed with `user_id: str` (required)
- ✅ dependencies.py: `get_current_user` returns `str` (not Optional)
- ❌ chat.py: `user_id: Optional[str]` should be `user_id: str`

**Frontend Type Issues**:
- ❌ useChat.ts: Expects `userId: string` but called with options object
- ❌ page.tsx: No userId variable defined
- ✅ chatApi.ts: sendChatMessage expects `userId: string` (correct signature)

#### MCP Tools Verification

**Status**: ✅ All MCP tools are correctly implemented

All five MCP tools in `backend/src/mcp/tools.py` correctly:
- Accept `user_id: str` as required parameter (not Optional)
- Validate user ownership before operations
- Return structured success/error responses
- Follow constitutional requirements (stateless, atomic)

**No changes needed to MCP tools themselves.**

### Technology Stack Verification

**Backend**:
- Python 3.11 ✓
- FastAPI with Pydantic models ✓
- SQLModel for database operations ✓
- JWT authentication with python-jose ✓
- Existing auth middleware and dependencies ✓

**Frontend**:
- TypeScript 5.x with strict mode ✓
- Next.js 16+ App Router ✓
- React 19+ ✓
- localStorage for token storage ✓

**Database**:
- PostgreSQL (Neon) ✓
- Existing tables: users, conversations, messages, tasks ✓
- No schema changes required ✓

### Best Practices for Fixes

1. **Minimal Changes**: Fix only what's broken, don't refactor working code
2. **Type Safety First**: Ensure TypeScript strict mode passes
3. **Authentication Required**: Use FastAPI Depends() for all protected endpoints
4. **Consistent Token Keys**: Use 'access_token' everywhere
5. **Error Handling**: Maintain existing error handling patterns
6. **Testing**: Verify each fix independently before integration

## Phase 1: Design & Contracts

### Data Model

**No schema changes required.** All database tables already exist and are correct:

- **users**: id (UUID), email, password_hash, name, created_at
- **conversations**: id (UUID), user_id (UUID FK), title, created_at, updated_at
- **messages**: id (UUID), conversation_id (UUID FK), user_id (UUID FK), role (enum), content, tool_calls (JSON), language, created_at
- **tasks**: id (int), user_id (str), title, description, completed (bool), due_date, created_at

### API Contracts

#### Chat Endpoint (Fixed)

**Endpoint**: `POST /api/v1/chat`

**Authentication**: Required (JWT Bearer token in Authorization header)

**Request Body**:
```json
{
  "conversation_id": "uuid-string or null",
  "message": "string (1-2000 characters)"
}
```

**Response** (200 OK):
```json
{
  "conversation_id": "uuid-string",
  "response": "string",
  "tool_calls": [
    {
      "tool": "string",
      "parameters": {},
      "result": {}
    }
  ],
  "language_detected": "en|ur|mixed",
  "requires_confirmation": false,
  "pending_intent": null,
  "timestamp": "ISO-8601 string"
}
```

**Error Responses**:
- 400: Invalid message (empty or >2000 chars)
- 401: Missing or invalid authentication token
- 429: Rate limit exceeded
- 500: Internal server error

**Changes from Current**:
- Add `user_id: str = Depends(get_current_user)` parameter
- Remove default "guest" value
- Fix syntax error (add comma between parameters)
- Reorder parameters (request body first, then dependencies)

### Implementation Strategy

#### Backend Fixes

**File**: `backend/src/api/chat.py`

**Changes**:
1. Fix function signature:
   ```python
   async def chat_endpoint(
       request: ChatRequest,
       user_id: str = Depends(get_current_user)
   ) -> ChatResponse:
   ```

2. Remove Optional type from user_id
3. Ensure user_id is passed to all MCP tool calls (already done)
4. Verify error handling returns correct HTTP status codes

**Testing**:
- Unit test: Call endpoint without token → 401
- Unit test: Call endpoint with invalid token → 401
- Unit test: Call endpoint with valid token → 200
- Integration test: Full chat flow with authentication

#### Frontend Fixes

**File 1**: `frontend/hooks/useChat.ts`

**Option A** (Recommended): Get userId from auth context
```typescript
export function useChat(options?: UseChatOptions) {
  const { userId } = useAuth(); // Get from auth context
  // ... rest of implementation
}
```

**Option B**: Keep userId parameter but make it work
```typescript
export function useChat(userId: string, options?: UseChatOptions) {
  // Keep current implementation
}
```

**Decision**: Use Option A - Get userId from auth context for cleaner API

**File 2**: `frontend/app/chat/page.tsx`

**Changes**:
1. Add authentication check:
   ```typescript
   const { userId, isAuthenticated } = useAuth();

   if (!isAuthenticated || !userId) {
     redirect('/login');
   }
   ```

2. Update useChat call:
   ```typescript
   const { messages, ... } = useChat({
     onConversationCreated: refreshConversations
   });
   ```

**File 3**: `frontend/services/chatApi.ts`

**Changes**:
1. Fix token key:
   ```typescript
   const token = localStorage.getItem('access_token'); // Changed from 'authToken'
   ```

2. Remove userId parameter from sendChatMessage (backend extracts from token):
   ```typescript
   export async function sendChatMessage(
     message: string,
     conversationId?: string
   ): Promise<ChatMessage>
   ```

**File 4**: `frontend/lib/auth.ts` (if doesn't exist, create)

**Create auth context/hook**:
```typescript
export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Decode JWT to get userId
      const decoded = decodeJWT(token);
      setUserId(decoded.sub);
      setIsAuthenticated(true);
    }
  }, []);

  return { userId, isAuthenticated };
}
```

### Type Safety Fixes

**Backend**:
- Change `user_id: Optional[str]` to `user_id: str` in chat.py
- Verify all MCP tool signatures use `user_id: str` (already correct)

**Frontend**:
- Update useChat signature to get userId from context
- Ensure all userId variables are typed as `string` (not `string | undefined`)
- Update chatApi.sendChatMessage to remove userId parameter

### Testing Strategy

**Backend Tests**:
1. Test chat endpoint authentication:
   - No token → 401
   - Invalid token → 401
   - Valid token → Extract user_id correctly
2. Test MCP tool invocation with user_id
3. Test conversation creation and message saving
4. Test error handling for all HTTP status codes

**Frontend Tests**:
1. Test useAuth hook extracts userId from token
2. Test chat page redirects when not authenticated
3. Test useChat hook with auth context
4. Test chatApi uses correct token key
5. Test full chat flow end-to-end

**Integration Tests**:
1. Login → Navigate to chat → Send message → Verify in database
2. Logout → Try to access chat → Verify redirect
3. Expired token → Try to send message → Verify 401 handling

## Phase 2: Implementation Sequence

### Sequence 1: Backend Authentication Fix (Critical Path)

**Priority**: P0 (Blocking - nothing works without this)

**Tasks**:
1. Fix syntax error in chat.py function signature
2. Add Depends(get_current_user) for authentication
3. Remove Optional type from user_id
4. Verify user_id is passed to conversation_router_agent
5. Test endpoint with/without authentication

**Acceptance Criteria**:
- Chat endpoint compiles without syntax errors
- Endpoint returns 401 when no token provided
- Endpoint returns 401 when invalid token provided
- Endpoint extracts user_id from valid token
- user_id is passed to all downstream functions

### Sequence 2: Frontend Token Key Fix (Critical Path)

**Priority**: P0 (Blocking - authentication fails without this)

**Tasks**:
1. Change 'authToken' to 'access_token' in chatApi.ts
2. Verify all other files use 'access_token' consistently
3. Test token retrieval from localStorage

**Acceptance Criteria**:
- chatApi.ts retrieves token correctly
- Token is included in Authorization header
- Backend receives and validates token

### Sequence 3: Frontend Authentication Integration

**Priority**: P1 (Required for proper UX)

**Tasks**:
1. Create or update useAuth hook to extract userId from token
2. Update chat page to use useAuth and check authentication
3. Update useChat hook to get userId from auth context
4. Remove userId parameter from chatApi.sendChatMessage
5. Test authentication flow end-to-end

**Acceptance Criteria**:
- Chat page redirects to login when not authenticated
- useAuth hook extracts userId correctly
- useChat hook receives userId from context
- Chat messages are sent with proper authentication

### Sequence 4: Type Safety Verification

**Priority**: P2 (Quality assurance)

**Tasks**:
1. Run TypeScript compiler in strict mode
2. Fix any remaining type errors
3. Verify all user_id parameters are typed as required strings
4. Run Python type checker (mypy)

**Acceptance Criteria**:
- TypeScript compiles without errors in strict mode
- Python type checking passes
- No Optional[str] for user_id in backend
- No string | undefined for userId in frontend

### Sequence 5: Error Handling Verification

**Priority**: P2 (Quality assurance)

**Tasks**:
1. Verify 400 errors for invalid messages
2. Verify 401 errors for authentication failures
3. Verify 429 errors for rate limiting
4. Verify 500 errors for server errors
5. Verify structured logging for all errors

**Acceptance Criteria**:
- All error responses include clear messages
- HTTP status codes match specification
- Errors are logged with structured data
- Frontend displays appropriate error messages

### Sequence 6: Integration Testing

**Priority**: P3 (Final validation)

**Tasks**:
1. Test full authentication flow (login → chat → logout)
2. Test conversation creation and message saving
3. Test MCP tool invocation through chat
4. Test error scenarios (invalid token, rate limit, etc.)
5. Verify stateless architecture (no server-side state)

**Acceptance Criteria**:
- Users can log in and access chat
- Messages are saved to database correctly
- MCP tools execute with correct user_id
- Conversation history loads correctly
- All Phase III requirements are met

## Dependencies & Risks

### Dependencies

**External**:
- PostgreSQL database must be accessible
- JWT secret key must be configured in environment
- Frontend and backend must be on compatible versions

**Internal**:
- Sequence 1 (backend auth fix) must complete before Sequence 3
- Sequence 2 (token key fix) must complete before Sequence 3
- All P0 and P1 tasks must complete before integration testing

### Risks

**Risk 1**: Fixing authentication may break existing sessions
- **Likelihood**: Medium
- **Impact**: High (users need to re-login)
- **Mitigation**: Document that users may need to re-login after deployment

**Risk 2**: Type changes may reveal additional type errors
- **Likelihood**: Low
- **Impact**: Medium (additional fixes needed)
- **Mitigation**: Run full type checking early in implementation

**Risk 3**: Frontend auth changes may affect other pages
- **Likelihood**: Low
- **Impact**: Medium (need to update other pages)
- **Mitigation**: Verify all pages that use authentication

## Rollout Strategy

### Phase 1: Backend Deployment
1. Deploy backend fixes to staging
2. Run integration tests
3. Verify authentication works correctly
4. Deploy to production

### Phase 2: Frontend Deployment
1. Deploy frontend fixes to staging
2. Test against production backend
3. Verify full flow works
4. Deploy to production

### Phase 3: Verification
1. Monitor error logs for authentication failures
2. Verify chat messages are being saved
3. Check MCP tool execution logs
4. Confirm no increase in 401 errors

## Success Metrics

- ✅ Chat endpoint compiles and runs without syntax errors
- ✅ Authentication is enforced on all chat requests
- ✅ TypeScript compiles in strict mode without errors
- ✅ All MCP tools receive correct user_id
- ✅ Frontend uses correct token key consistently
- ✅ Users can send chat messages and receive responses
- ✅ Conversation history is saved and loaded correctly
- ✅ All error codes (400, 401, 429, 500) work as specified
- ✅ No existing functionality is broken

## Next Steps

After this plan is approved:
1. Run `/sp.tasks` to generate detailed task breakdown
2. Implement fixes in sequence order (P0 → P1 → P2 → P3)
3. Test each sequence before moving to next
4. Create PR with all fixes and test results
5. Deploy to staging for final validation
6. Deploy to production with monitoring
