# Chat API Contract

**Version**: 1.0.0
**Feature**: 002-phase3-chat-fixes
**Date**: 2026-02-09

## Overview

This contract defines the fixed chat endpoint for Phase III Todo AI Chatbot. The endpoint processes natural language messages, invokes MCP tools, and returns AI-generated responses.

## Endpoint

```
POST /api/v1/chat
```

## Authentication

**Required**: Yes

**Method**: JWT Bearer Token

**Header**:
```
Authorization: Bearer <jwt-token>
```

**Token Claims**:
- `sub`: User ID (UUID string)
- `exp`: Expiration timestamp
- `iat`: Issued at timestamp

**Error Response** (401 Unauthorized):
```json
{
  "detail": "Could not validate credentials"
}
```

## Request

### Headers

| Header | Required | Type | Description |
|--------|----------|------|-------------|
| Authorization | Yes | string | JWT Bearer token |
| Content-Type | Yes | string | Must be "application/json" |

### Body

**Content-Type**: `application/json`

**Schema**:
```json
{
  "conversation_id": "string | null",
  "message": "string"
}
```

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| conversation_id | string \| null | No | UUID format or null | Existing conversation ID. If null or omitted, creates new conversation |
| message | string | Yes | 1-2000 characters | User message text |

**Example Request**:
```json
{
  "conversation_id": null,
  "message": "Add a task to buy groceries tomorrow"
}
```

**Example Request (Existing Conversation)**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Show me all my tasks"
}
```

## Response

### Success Response (200 OK)

**Content-Type**: `application/json`

**Schema**:
```json
{
  "conversation_id": "string",
  "response": "string",
  "tool_calls": [
    {
      "tool": "string",
      "parameters": {},
      "result": {}
    }
  ],
  "language_detected": "string",
  "requires_confirmation": "boolean",
  "pending_intent": "object | null",
  "timestamp": "string"
}
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| conversation_id | string | UUID of the conversation (new or existing) |
| response | string | AI-generated response text |
| tool_calls | array | List of MCP tools invoked during processing |
| language_detected | string | Detected language: "en", "ur", or "mixed" |
| requires_confirmation | boolean | Whether user confirmation is needed for destructive action |
| pending_intent | object \| null | Intent awaiting confirmation (if requires_confirmation is true) |
| timestamp | string | ISO-8601 timestamp of response |

**Tool Call Object**:
```json
{
  "tool": "string",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  },
  "result": {
    "success": true,
    "data": {}
  }
}
```

**Example Success Response**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "I've added a task to buy groceries with a due date of tomorrow.",
  "tool_calls": [
    {
      "tool": "add_task",
      "parameters": {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Buy groceries",
        "due_date": "2026-02-10"
      },
      "result": {
        "success": true,
        "data": {
          "task_id": 42,
          "title": "Buy groceries",
          "status": "created",
          "due_date": "2026-02-10"
        }
      }
    }
  ],
  "language_detected": "en",
  "requires_confirmation": false,
  "pending_intent": null,
  "timestamp": "2026-02-09T10:30:00.000Z"
}
```

**Example Response (Requires Confirmation)**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "Are you sure you want to delete all completed tasks? This action cannot be undone. Reply 'yes' to confirm or 'no' to cancel.",
  "tool_calls": [],
  "language_detected": "en",
  "requires_confirmation": true,
  "pending_intent": {
    "action": "delete_completed_tasks",
    "parameters": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000"
    }
  },
  "timestamp": "2026-02-09T10:30:00.000Z"
}
```

### Error Responses

#### 400 Bad Request

**Cause**: Invalid message content

**Response**:
```json
{
  "detail": "Message must be 1-2000 characters"
}
```

**Scenarios**:
- Empty message
- Message exceeds 2000 characters
- Invalid JSON in request body

#### 401 Unauthorized

**Cause**: Missing or invalid authentication

**Response**:
```json
{
  "detail": "Could not validate credentials"
}
```

**Scenarios**:
- No Authorization header
- Invalid JWT token
- Expired JWT token
- Token signature verification failed

#### 429 Too Many Requests

**Cause**: Rate limit exceeded

**Response**:
```json
{
  "detail": "Rate limit exceeded. Please wait a moment."
}
```

**Scenarios**:
- User exceeded rate limit (configured in backend)

#### 500 Internal Server Error

**Cause**: Server-side error

**Response**:
```json
{
  "detail": "Internal server error: <error-message>"
}
```

**Scenarios**:
- Database connection failure
- MCP tool execution error
- Conversation router agent error
- Unexpected exception

## Behavior Specifications

### Conversation Management

1. **New Conversation**:
   - If `conversation_id` is null or omitted, create new conversation
   - Return new `conversation_id` in response
   - Auto-generate conversation title from first 50 characters of message

2. **Existing Conversation**:
   - If `conversation_id` is provided, load conversation history
   - Verify conversation belongs to authenticated user
   - Return same `conversation_id` in response

3. **Conversation History**:
   - Load last 20 messages from database
   - Pass to conversation_router_agent for context
   - Maintain stateless server (no in-memory state)

### Message Processing

1. **User Message**:
   - Save to database with role='user'
   - Include timestamp, conversation_id, user_id

2. **Agent Processing**:
   - Pass message and history to conversation_router_agent
   - Agent determines intent and selects appropriate MCP tools
   - Agent invokes tools with user_id from authenticated token

3. **Assistant Response**:
   - Save to database with role='assistant'
   - Include tool_calls, language_detected
   - Return structured response to client

### MCP Tool Invocation

1. **Tool Selection**:
   - Conversation router agent determines which tools to invoke
   - Tools: add_task, list_tasks, complete_task, delete_task, update_task

2. **User Context**:
   - All tools receive user_id from authenticated token
   - Tools validate user ownership before operations
   - Tools return structured success/error responses

3. **Tool Results**:
   - Include in response tool_calls array
   - Each tool call includes tool name, parameters, and result
   - Agent incorporates results into response text

### Confirmation Flow

1. **Destructive Operations**:
   - Delete task, delete all tasks, bulk operations
   - Set requires_confirmation=true
   - Store pending_intent with action details

2. **User Confirmation**:
   - User replies "yes" → Execute pending action
   - User replies "no" → Cancel pending action
   - Pending intent cleared after response

### Error Handling

1. **Validation Errors** (400):
   - Return immediately without processing
   - Include clear error message

2. **Authentication Errors** (401):
   - Return immediately without processing
   - Do not expose token details in error

3. **Rate Limit Errors** (429):
   - Return with retry-after suggestion
   - Log rate limit event

4. **Server Errors** (500):
   - Log full error with stack trace
   - Return generic error message (no sensitive details)
   - Include structured logging for debugging

## Security Considerations

1. **Authentication**:
   - JWT token required for all requests
   - Token validated on every request
   - User ID extracted from token (not from request body)

2. **Authorization**:
   - User can only access their own conversations
   - User can only modify their own tasks
   - MCP tools enforce user isolation

3. **Input Validation**:
   - Message length validated (1-2000 chars)
   - Conversation ID format validated (UUID)
   - SQL injection prevented by parameterized queries

4. **Rate Limiting**:
   - Enforced per user (based on user_id from token)
   - Prevents abuse and DoS attacks

5. **Error Messages**:
   - No sensitive information exposed
   - No database details in errors
   - No internal paths in errors

## Performance Requirements

- **Response Time**: < 200ms for typical requests (excluding AI processing)
- **Concurrent Users**: Support 100 concurrent users
- **Database Queries**: Optimized with indexes on user_id, conversation_id, created_at
- **Stateless Design**: No server-side session state

## Backward Compatibility

**Breaking Changes**: None

**Fixes Applied**:
- Added authentication requirement (was missing)
- Fixed function signature syntax error
- Enforced user_id type safety

**Existing Clients**:
- Must include Authorization header (was optional, now required)
- Response format unchanged
- Request format unchanged

## Testing

See [quickstart.md](../quickstart.md) for detailed testing procedures.

**Key Test Cases**:
1. Authentication required (401 without token)
2. Message validation (400 for invalid messages)
3. Conversation creation (new conversation_id returned)
4. Conversation history (existing conversation loaded)
5. MCP tool invocation (tools called with correct user_id)
6. Error handling (all error codes work correctly)

## Change Log

**Version 1.0.0** (2026-02-09):
- Fixed syntax error in endpoint function signature
- Added authentication requirement via Depends(get_current_user)
- Enforced user_id type safety (str, not Optional[str])
- Documented complete API contract
