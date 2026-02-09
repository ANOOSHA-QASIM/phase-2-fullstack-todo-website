# Research: Phase III Chat & MCP Tools Fixes

**Feature**: 002-phase3-chat-fixes
**Date**: 2026-02-09
**Status**: Complete

## Research Objective

Identify all bugs preventing Phase III Todo AI Chatbot from functioning correctly, focusing on authentication, type safety, and chat endpoint functionality.

## Critical Issues Discovered

### Issue 1: Backend Chat Endpoint Syntax Error

**Location**: `backend/src/api/chat.py:48-50`

**Current Code**:
```python
async def chat_endpoint(
    user_id: Optional[str] = "guest"  # SYNTAX ERROR: Missing comma
    request: ChatRequest              # Also: wrong parameter order
) -> ChatResponse:
```

**Analysis**:
- Python syntax error: Missing comma between function parameters
- Wrong parameter order: FastAPI requires body parameters before dependency parameters
- Missing authentication: Should use `Depends(get_current_user)` instead of default value
- Type issue: `user_id` is `Optional[str]` but should be required `str`
- Security issue: Default value "guest" bypasses authentication entirely

**Impact**: Chat endpoint cannot execute at all due to syntax error. Even if fixed, authentication is not enforced.

**Decision**: Fix function signature to:
```python
async def chat_endpoint(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
) -> ChatResponse:
```

**Rationale**: This follows FastAPI conventions, enforces authentication, and ensures user_id is always a valid string.

### Issue 2: Frontend useChat Hook Type Mismatch

**Location**: `frontend/hooks/useChat.ts:21`

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

**Analysis**:
- Type mismatch: Hook expects `userId: string` as first parameter but receives options object
- Missing userId: Chat page doesn't extract userId from JWT token
- TypeScript strict mode will fail compilation
- Runtime error: userId will be undefined causing API calls to fail

**Impact**: TypeScript compilation errors prevent frontend from building. Runtime errors if compiled with errors ignored.

**Decision**: Refactor useChat to get userId from auth context:
```typescript
export function useChat(options?: UseChatOptions) {
  const { userId } = useAuth(); // Get from context
  // ... rest of implementation
}
```

**Rationale**: Cleaner API, follows React patterns, centralizes auth logic in useAuth hook.

**Alternatives Considered**:
- Keep userId parameter and fix call sites: More changes required, less maintainable
- Make userId optional: Violates requirement that authentication is required

### Issue 3: Frontend Token Key Mismatch

**Location**: `frontend/services/chatApi.ts:32`

**Current Code**:
```typescript
const token = localStorage.getItem('authToken');
```

**Actual Token Key**: `frontend/lib/api.ts:20`
```typescript
this.token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
```

**Analysis**:
- Key mismatch: chatApi.ts uses 'authToken' but auth system stores 'access_token'
- Token will always be null, causing all requests to fail with 401
- Inconsistent storage keys across codebase

**Impact**: All chat API requests fail authentication even when user is logged in.

**Decision**: Change chatApi.ts to use 'access_token' consistently.

**Rationale**: Minimal change, aligns with existing auth system, follows OAuth2 conventions.

### Issue 4: Chat Page Missing Authentication

**Location**: `frontend/app/chat/page.tsx:3-4, 19-20, 87-101`

**Current State**:
- Comment says "PUBLIC MODE – No authentication, no login redirect"
- Authentication checks are commented out
- No userId extraction from JWT token

**Analysis**:
- Contradicts Phase III requirement that authentication is required
- Unauthenticated users can access page but all API calls fail
- No proper error handling or redirect to login

**Impact**: Poor user experience, security issue (page accessible without auth).

**Decision**: Add authentication check and redirect:
```typescript
const { userId, isAuthenticated } = useAuth();

if (!isAuthenticated || !userId) {
  redirect('/login');
}
```

**Rationale**: Enforces authentication requirement, provides clear user feedback, follows security best practices.

## Technology Stack Verification

### Backend
- **Python 3.11**: ✅ Confirmed in use
- **FastAPI**: ✅ Confirmed, using Pydantic models
- **SQLModel**: ✅ Confirmed for database operations
- **JWT Authentication**: ✅ Confirmed, using python-jose
- **PostgreSQL (Neon)**: ✅ Confirmed, connection string in environment

### Frontend
- **TypeScript 5.x**: ✅ Confirmed with strict mode enabled
- **Next.js 16+**: ✅ Confirmed, using App Router
- **React 19+**: ✅ Confirmed
- **localStorage**: ✅ Confirmed for token storage

### Database Schema
- **users**: ✅ Exists with id, email, password_hash, name, created_at
- **conversations**: ✅ Exists with id, user_id, title, created_at, updated_at
- **messages**: ✅ Exists with id, conversation_id, user_id, role, content, tool_calls, language, created_at
- **tasks**: ✅ Exists with id, user_id, title, description, completed, due_date, created_at

**No schema changes required.**

## MCP Tools Verification

All five MCP tools in `backend/src/mcp/tools.py` are correctly implemented:

- ✅ `add_task(user_id: str, ...)`: Correctly typed, validates user_id
- ✅ `list_tasks(user_id: str, ...)`: Correctly typed, filters by user_id
- ✅ `complete_task(user_id: str, task_id: int)`: Correctly typed, validates ownership
- ✅ `delete_task(user_id: str, task_id: int)`: Correctly typed, validates ownership
- ✅ `update_task(user_id: str, task_id: int, ...)`: Correctly typed, validates ownership

**No changes needed to MCP tools.**

## Authentication Flow Analysis

### Current Flow (Broken)
1. User logs in → JWT token stored as 'access_token'
2. User navigates to /chat → No authentication check
3. Chat page calls useChat() without userId → Type error
4. useChat calls chatApi.sendChatMessage() → Uses wrong token key 'authToken' (null)
5. Backend receives request → chat_endpoint has syntax error, can't execute
6. **Result**: Complete failure at multiple points

### Required Flow (Fixed)
1. User logs in → JWT token stored as 'access_token'
2. User navigates to /chat → Check authentication, extract userId from token
3. Chat page calls useChat(options) → useChat gets userId from useAuth context
4. useChat calls chatApi.sendChatMessage() → Uses correct token key 'access_token'
5. Backend receives request → chat_endpoint validates token via Depends(get_current_user)
6. Backend extracts user_id from token → Passes to conversation_router_agent and MCP tools
7. **Result**: Authenticated request processed successfully

## Best Practices Applied

1. **Minimal Changes**: Fix only what's broken, preserve working code
2. **Type Safety First**: Ensure TypeScript strict mode passes, no Optional types for required fields
3. **Authentication Required**: Use FastAPI Depends() for all protected endpoints
4. **Consistent Token Keys**: Use 'access_token' everywhere
5. **Error Handling**: Maintain existing error handling patterns
6. **Testing**: Verify each fix independently before integration

## Decisions Summary

| Decision | Rationale | Alternatives Rejected |
|----------|-----------|----------------------|
| Fix backend syntax error with Depends(get_current_user) | Follows FastAPI conventions, enforces auth | Default value approach (insecure) |
| Get userId from useAuth context in useChat | Cleaner API, centralized auth logic | Pass userId as parameter (more changes) |
| Use 'access_token' consistently | Aligns with existing auth system | Rename to 'authToken' (more changes) |
| Add authentication check to chat page | Enforces security requirement | Keep public mode (violates requirements) |
| No schema changes | All tables already exist correctly | Add new tables (unnecessary) |
| No MCP tool changes | Already correctly implemented | Refactor tools (unnecessary) |

## Research Complete

All issues identified, root causes analyzed, and fix strategies determined. Ready to proceed to implementation planning.
