# Data Model: Phase III Chat & MCP Tools Fixes

**Feature**: 002-phase3-chat-fixes
**Date**: 2026-02-09
**Status**: No Schema Changes Required

## Overview

This is a bug-fix feature that does not require any database schema changes. All necessary tables already exist and are correctly structured. This document serves as a reference for the existing data model that the fixes will interact with.

## Existing Database Schema

### Users Table

**Table Name**: `users`

**Purpose**: Store user account information for authentication and authorization.

**Columns**:
- `id` (UUID, PRIMARY KEY): Unique user identifier
- `email` (VARCHAR, UNIQUE, NOT NULL): User email address for login
- `password_hash` (VARCHAR, NOT NULL): Hashed password (SHA256)
- `name` (VARCHAR, NULLABLE): User display name
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Account creation timestamp

**Relationships**:
- One-to-many with `conversations` (user can have multiple conversations)
- One-to-many with `messages` (user can send multiple messages)
- One-to-many with `tasks` (user can have multiple tasks)

**Indexes**:
- Primary key on `id`
- Unique index on `email`

**Notes**:
- User ID is extracted from JWT token for all authenticated operations
- Password is hashed using SHA256 (see `backend/routes/auth.py`)

### Conversations Table

**Table Name**: `conversations`

**Purpose**: Store chat conversation metadata for organizing messages.

**Columns**:
- `id` (UUID, PRIMARY KEY): Unique conversation identifier
- `user_id` (UUID, FOREIGN KEY → users.id, NOT NULL): Owner of the conversation
- `title` (VARCHAR, NULLABLE): Conversation title (auto-generated from first message)
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Conversation creation timestamp
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Last message timestamp

**Relationships**:
- Many-to-one with `users` (conversation belongs to one user)
- One-to-many with `messages` (conversation contains multiple messages)

**Indexes**:
- Primary key on `id`
- Foreign key index on `user_id`
- Index on `updated_at` (for sorting recent conversations)

**Notes**:
- Title is auto-generated from first 50 characters of first user message
- `updated_at` is updated whenever a new message is added
- Conversations are user-isolated (user can only access their own)

### Messages Table

**Table Name**: `messages`

**Purpose**: Store individual chat messages within conversations.

**Columns**:
- `id` (UUID, PRIMARY KEY): Unique message identifier
- `conversation_id` (UUID, FOREIGN KEY → conversations.id, NOT NULL): Parent conversation
- `user_id` (UUID, FOREIGN KEY → users.id, NOT NULL): Message owner (for verification)
- `role` (ENUM: 'user' | 'assistant', NOT NULL): Message sender role
- `content` (TEXT, NOT NULL): Message text content (1-2000 characters)
- `tool_calls` (JSONB, NULLABLE): MCP tool invocations (for assistant messages)
- `language` (VARCHAR, NULLABLE): Detected language ('en', 'ur', 'mixed')
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Message timestamp

**Relationships**:
- Many-to-one with `conversations` (message belongs to one conversation)
- Many-to-one with `users` (message belongs to one user)

**Indexes**:
- Primary key on `id`
- Foreign key index on `conversation_id`
- Foreign key index on `user_id`
- Index on `created_at` (for ordering messages chronologically)

**Notes**:
- `tool_calls` stores JSON array of tool invocations with parameters and results
- Messages are ordered by `created_at` when loading conversation history
- Both user and assistant messages are stored for conversation context

### Tasks Table

**Table Name**: `tasks`

**Purpose**: Store user todo tasks managed through the chatbot.

**Columns**:
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT): Unique task identifier
- `user_id` (VARCHAR, NOT NULL): Owner of the task (stored as string UUID)
- `title` (VARCHAR(200), NOT NULL): Task title
- `description` (VARCHAR(1000), NULLABLE): Task description
- `completed` (BOOLEAN, NOT NULL, DEFAULT FALSE): Completion status
- `due_date` (DATE, NULLABLE): Task due date (ISO format YYYY-MM-DD)
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Task creation timestamp

**Relationships**:
- Many-to-one with `users` (task belongs to one user)

**Indexes**:
- Primary key on `id`
- Index on `user_id` (for filtering user's tasks)
- Index on `completed` (for filtering by status)

**Notes**:
- `user_id` is stored as string (not UUID type) for compatibility
- Tasks are user-isolated (MCP tools validate ownership)
- No foreign key constraint on `user_id` (stored as string)

## Entity Relationships

```
users (1) ──────< (many) conversations
  │                         │
  │                         │
  │                    (1) ──────< (many) messages
  │                                       │
  └──────────────────────────────────────┘
  │
  │
  └──────< (many) tasks
```

## Data Flow for Chat Endpoint

1. **Authentication**: JWT token → Extract `user_id` (UUID)
2. **Conversation Lookup/Creation**:
   - If `conversation_id` provided → Load from `conversations` table
   - If not provided → Create new conversation in `conversations` table
3. **Message Storage**:
   - Save user message to `messages` table with role='user'
   - Process with conversation_router_agent
   - Save assistant response to `messages` table with role='assistant'
4. **MCP Tool Invocation**:
   - Extract `user_id` from authenticated request
   - Pass to MCP tools (add_task, list_tasks, etc.)
   - MCP tools query/modify `tasks` table with user_id filter
5. **Response**:
   - Return conversation_id, response text, tool_calls, timestamp

## Validation Rules

### Users
- Email must be unique
- Password must be hashed before storage
- Name is optional

### Conversations
- Must belong to authenticated user
- Title auto-generated if not set
- Cannot be accessed by other users

### Messages
- Content must be 1-2000 characters
- Role must be 'user' or 'assistant'
- Must belong to existing conversation
- Conversation must belong to message owner

### Tasks
- Title must be 1-200 characters
- Description must be 0-1000 characters
- Must belong to authenticated user
- Cannot be accessed/modified by other users

## No Schema Changes Required

**Confirmation**: All tables exist with correct schema. The bug fixes only address:
1. Backend authentication enforcement (code fix, not schema)
2. Frontend type safety (code fix, not schema)
3. Token key consistency (code fix, not schema)
4. Chat page authentication (code fix, not schema)

**No migrations needed.**
