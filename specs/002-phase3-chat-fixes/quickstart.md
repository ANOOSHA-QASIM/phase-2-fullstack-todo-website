# Quickstart: Testing Phase III Chat & MCP Tools Fixes

**Feature**: 002-phase3-chat-fixes
**Date**: 2026-02-09
**Purpose**: Guide for testing and verifying all bug fixes work correctly

## Prerequisites

### Environment Setup

1. **Backend Requirements**:
   - Python 3.11 installed
   - PostgreSQL database accessible (Neon)
   - Environment variables configured:
     ```bash
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret-key
     JWT_ALGORITHM=HS256
     ```

2. **Frontend Requirements**:
   - Node.js 18+ installed
   - npm or yarn package manager
   - Backend running on http://localhost:8000

3. **Test User Account**:
   - Create a test user via signup endpoint
   - Save the JWT token for testing

## Quick Verification (5 minutes)

### Step 1: Verify Backend Syntax Fix

```bash
# Navigate to backend directory
cd backend

# Try to import the chat module (should not error)
python -c "from src.api.chat import chat_endpoint; print('✅ Syntax OK')"
```

**Expected**: No syntax errors, prints "✅ Syntax OK"

### Step 2: Verify Backend Authentication

```bash
# Test without authentication (should return 401)
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Expected: {"detail": "Not authenticated"} with status 401
```

### Step 3: Verify Frontend Token Key

```bash
# Navigate to frontend directory
cd frontend

# Check token key in chatApi.ts
grep "access_token" services/chatApi.ts

# Expected: Should find "localStorage.getItem('access_token')"
```

### Step 4: Verify TypeScript Compilation

```bash
# In frontend directory
npm run build

# Expected: No type errors, successful build
```

## Detailed Testing Guide

### Backend Testing

#### Test 1: Chat Endpoint Authentication

**Purpose**: Verify endpoint requires valid JWT token

**Steps**:
1. Start backend server: `uvicorn main:app --reload`
2. Test without token:
   ```bash
   curl -X POST http://localhost:8000/api/v1/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}'
   ```
   **Expected**: 401 Unauthorized

3. Test with invalid token:
   ```bash
   curl -X POST http://localhost:8000/api/v1/chat \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer invalid-token" \
     -d '{"message": "Hello"}'
   ```
   **Expected**: 401 Unauthorized

4. Test with valid token:
   ```bash
   # First, login to get token
   TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password"}' \
     | jq -r '.data.access_token')

   # Then use token for chat
   curl -X POST http://localhost:8000/api/v1/chat \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"message": "Hello"}'
   ```
   **Expected**: 200 OK with ChatResponse

**Pass Criteria**:
- ✅ Returns 401 without token
- ✅ Returns 401 with invalid token
- ✅ Returns 200 with valid token
- ✅ Response includes conversation_id, response, tool_calls, timestamp

#### Test 2: Message Validation

**Purpose**: Verify message length validation

**Steps**:
1. Test empty message:
   ```bash
   curl -X POST http://localhost:8000/api/v1/chat \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message": ""}'
   ```
   **Expected**: 400 Bad Request

2. Test message over 2000 characters:
   ```bash
   curl -X POST http://localhost:8000/api/v1/chat \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"message\": \"$(python -c 'print("a" * 2001)')\"}"
   ```
   **Expected**: 400 Bad Request

3. Test valid message:
   ```bash
   curl -X POST http://localhost:8000/api/v1/chat \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message": "Add a task to buy groceries"}'
   ```
   **Expected**: 200 OK

**Pass Criteria**:
- ✅ Rejects empty messages with 400
- ✅ Rejects messages >2000 chars with 400
- ✅ Accepts valid messages with 200

#### Test 3: MCP Tool Invocation

**Purpose**: Verify MCP tools receive correct user_id

**Steps**:
1. Send message to create task:
   ```bash
   curl -X POST http://localhost:8000/api/v1/chat \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message": "Add a task to buy milk tomorrow"}'
   ```

2. Check response includes tool_calls:
   ```json
   {
     "tool_calls": [
       {
         "tool": "add_task",
         "parameters": {"title": "buy milk", "due_date": "..."},
         "result": {"success": true, "data": {...}}
       }
     ]
   }
   ```

3. Verify task in database:
   ```sql
   SELECT * FROM tasks WHERE user_id = '<user-id-from-token>';
   ```

**Pass Criteria**:
- ✅ Tool is invoked with correct user_id
- ✅ Task is created in database
- ✅ Task belongs to authenticated user
- ✅ Response includes tool execution results

#### Test 4: Conversation Management

**Purpose**: Verify conversation creation and history loading

**Steps**:
1. Send first message (no conversation_id):
   ```bash
   RESPONSE=$(curl -X POST http://localhost:8000/api/v1/chat \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}')

   CONV_ID=$(echo $RESPONSE | jq -r '.conversation_id')
   echo "Conversation ID: $CONV_ID"
   ```

2. Send second message (with conversation_id):
   ```bash
   curl -X POST http://localhost:8000/api/v1/chat \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"conversation_id\": \"$CONV_ID\", \"message\": \"How are you?\"}"
   ```

3. Verify messages in database:
   ```sql
   SELECT * FROM messages WHERE conversation_id = '<conv-id>' ORDER BY created_at;
   ```

**Pass Criteria**:
- ✅ First message creates new conversation
- ✅ Subsequent messages use same conversation_id
- ✅ All messages saved to database
- ✅ Conversation history maintained

### Frontend Testing

#### Test 5: Authentication Check

**Purpose**: Verify chat page requires authentication

**Steps**:
1. Clear localStorage: `localStorage.clear()`
2. Navigate to http://localhost:3000/chat
3. **Expected**: Redirect to /login

4. Login at http://localhost:3000/login
5. Navigate to http://localhost:3000/chat
6. **Expected**: Chat page loads successfully

**Pass Criteria**:
- ✅ Unauthenticated users redirected to login
- ✅ Authenticated users can access chat page
- ✅ userId extracted from JWT token

#### Test 6: useAuth Hook

**Purpose**: Verify useAuth hook extracts userId correctly

**Steps**:
1. Open browser DevTools console
2. Navigate to chat page (while logged in)
3. Check React DevTools for useAuth hook state
4. Verify userId is set and matches token

**Pass Criteria**:
- ✅ useAuth returns userId from token
- ✅ useAuth returns isAuthenticated = true
- ✅ userId matches JWT token sub claim

#### Test 7: Chat Message Flow

**Purpose**: Verify end-to-end chat functionality

**Steps**:
1. Login and navigate to chat page
2. Send message: "Add a task to call mom"
3. Verify:
   - Message appears in chat UI
   - Loading indicator shows
   - Assistant response appears
   - Tool execution result shown

4. Check browser Network tab:
   - POST request to /api/v1/chat
   - Authorization header includes Bearer token
   - Token key is 'access_token'

5. Check database:
   - User message saved
   - Assistant message saved
   - Task created with correct user_id

**Pass Criteria**:
- ✅ Messages sent successfully
- ✅ Responses received and displayed
- ✅ Tool calls executed
- ✅ Data persisted to database
- ✅ Correct token used in requests

#### Test 8: Type Safety

**Purpose**: Verify no TypeScript errors

**Steps**:
1. Run TypeScript compiler:
   ```bash
   cd frontend
   npx tsc --noEmit
   ```

2. Check for errors related to:
   - userId being undefined
   - useChat parameter mismatch
   - Token key types

**Pass Criteria**:
- ✅ No TypeScript compilation errors
- ✅ Strict mode passes
- ✅ All userId types are string (not string | undefined)

### Integration Testing

#### Test 9: Full User Journey

**Purpose**: Verify complete workflow from login to task management

**Steps**:
1. **Signup**: Create new user account
2. **Login**: Authenticate and receive JWT token
3. **Navigate to Chat**: Access chat page
4. **Create Task**: Send "Add a task to buy groceries tomorrow"
5. **List Tasks**: Send "Show me my tasks"
6. **Complete Task**: Send "Mark the grocery task as done"
7. **Delete Task**: Send "Delete the grocery task"

**Verification**:
- Check each step succeeds
- Verify database state after each operation
- Confirm user isolation (tasks belong to correct user)

**Pass Criteria**:
- ✅ All operations succeed
- ✅ Data persisted correctly
- ✅ User isolation maintained
- ✅ No authentication errors

#### Test 10: Error Handling

**Purpose**: Verify all error codes work correctly

**Steps**:
1. **400 Error**: Send empty message
   - Expected: "Message must be 1-2000 characters"

2. **401 Error**: Send request without token
   - Expected: "Authentication required"

3. **429 Error**: Send many requests rapidly
   - Expected: "Rate limit exceeded"

4. **500 Error**: Trigger server error (e.g., database down)
   - Expected: "Internal server error"

**Pass Criteria**:
- ✅ Correct HTTP status codes returned
- ✅ Clear error messages provided
- ✅ Errors logged with structured data
- ✅ Frontend displays appropriate error messages

## Automated Testing

### Backend Unit Tests

```bash
cd backend
pytest tests/test_chat_endpoint.py -v
```

**Tests**:
- `test_chat_endpoint_requires_auth`: Verify 401 without token
- `test_chat_endpoint_validates_message`: Verify message validation
- `test_chat_endpoint_creates_conversation`: Verify conversation creation
- `test_chat_endpoint_invokes_mcp_tools`: Verify tool invocation
- `test_chat_endpoint_saves_messages`: Verify message persistence

### Frontend Unit Tests

```bash
cd frontend
npm test
```

**Tests**:
- `useAuth.test.ts`: Test auth hook extracts userId
- `useChat.test.ts`: Test chat hook with auth context
- `chatApi.test.ts`: Test API client uses correct token key
- `ChatPage.test.tsx`: Test page requires authentication

## Performance Testing

### Load Test

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test chat endpoint with 100 concurrent requests
ab -n 1000 -c 100 -H "Authorization: Bearer $TOKEN" \
   -p message.json -T application/json \
   http://localhost:8000/api/v1/chat
```

**Pass Criteria**:
- ✅ Average response time < 200ms
- ✅ No failed requests
- ✅ Handles 100 concurrent users

## Troubleshooting

### Issue: Backend syntax error persists
**Solution**: Verify chat.py has comma between parameters

### Issue: Frontend still has type errors
**Solution**: Run `npm install` and clear TypeScript cache

### Issue: Token not found in localStorage
**Solution**: Verify login sets 'access_token' key

### Issue: 401 errors on all requests
**Solution**: Check JWT_SECRET matches between login and validation

## Success Checklist

- [ ] Backend compiles without syntax errors
- [ ] Chat endpoint requires authentication (401 without token)
- [ ] Frontend compiles without TypeScript errors
- [ ] useAuth hook extracts userId from token
- [ ] Chat page redirects when not authenticated
- [ ] Messages sent and received successfully
- [ ] MCP tools invoked with correct user_id
- [ ] Conversations created and loaded correctly
- [ ] All error codes (400, 401, 429, 500) work
- [ ] Full user journey completes successfully

## Next Steps

After all tests pass:
1. Create pull request with fixes
2. Deploy to staging environment
3. Run integration tests on staging
4. Monitor error logs for issues
5. Deploy to production
6. Verify production metrics
