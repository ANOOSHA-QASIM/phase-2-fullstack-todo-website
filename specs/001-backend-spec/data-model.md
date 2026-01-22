# Data Model: Backend Implementation for Phase II: Todo Full-Stack Web Application

**Date**: 2026-01-14
**Feature**: 001-backend-spec
**Model Version**: 1.0

## Overview

This document defines the data models for the backend Todo application. The system uses SQLModel as the ORM to interact with the Neon PostgreSQL database. The data model enforces user isolation and proper authentication through foreign key relationships and access controls.

## Entity Definitions

### User Entity
*Note: User entity is managed by Better Auth and referenced via user_id*

- **Reference Name**: User
- **Fields**:
  - `id` (UUID/str): Unique identifier for the user (managed by Better Auth)
  - `email` (str): User's email address
  - `name` (str): User's display name
  - `created_at` (datetime): Timestamp when user account was created
  - `updated_at` (datetime): Timestamp when user account was last updated

### Task Entity
- **Entity Name**: Task
- **Description**: Represents a to-do item owned by a specific user
- **Fields**:
  - `id` (UUID/int): Primary key, unique identifier for the task
  - `user_id` (str): Foreign key reference to the owning user (from JWT token)
  - `title` (str): Task title (max 255 characters, not null)
  - `description` (str, optional): Detailed task description (TEXT type)
  - `completed` (bool): Completion status (default: False)
  - `created_at` (datetime): Timestamp when task was created
  - `updated_at` (datetime): Timestamp when task was last updated

- **Relationships**:
  - `user_id` → `User.id` (many-to-one relationship)

- **Constraints**:
  - `title` VARCHAR(255) NOT NULL
  - `completed` BOOLEAN DEFAULT FALSE
  - `created_at` TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

- **Indexes**:
  - `idx_user_id`: Index on `user_id` for efficient user-based queries
  - `idx_completed`: Index on `completed` for efficient status-based queries
  - `idx_user_completed`: Composite index on `(user_id, completed)` for efficient user-status queries

## Validation Rules

### Task Validation
- **Title**: Required field, 1-255 characters
- **Description**: Optional, maximum 1000 characters (based on TEXT type)
- **Completed**: Boolean value, defaults to False
- **User Ownership**: Each task must be owned by a valid user (verified through JWT token)

### Business Logic Validation
- Users can only access tasks where `user_id` matches their authenticated user ID
- Users cannot modify or view tasks owned by other users
- Completed status can be toggled by the task owner only

## State Transitions

### Task State Transitions
- **Active → Completed**: When user marks task as complete via PATCH /api/tasks/{id}/complete
- **Completed → Active**: When user marks task as incomplete via PATCH /api/tasks/{id}/complete
- **Created**: New task added via POST /api/tasks
- **Deleted**: Task removed via DELETE /api/tasks/{id}

## Database Schema

```sql
-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- or SERIAL for auto-increment
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint (referenced via application logic since user table is managed by Better Auth)
    CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);

-- Update trigger for updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## API Response Format

### Task Object Format
```json
{
  "id": "uuid-string",
  "user_id": "user-identifier",
  "title": "Task title",
  "description": "Task description (optional)",
  "completed": false,
  "created_at": "2026-01-14T10:00:00Z",
  "updated_at": "2026-01-14T10:00:00Z"
}
```

### Collection Response Format
```json
{
  "tasks": [
    {
      "id": "uuid-string",
      "user_id": "user-identifier",
      "title": "Task title",
      "description": "Task description (optional)",
      "completed": false,
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

## Security Considerations

- All database queries must be parameterized to prevent SQL injection
- User isolation enforced through user_id verification in all queries
- Direct database access restricted to application layer only
- JWT token verification occurs before any database operations
- User_id is extracted from JWT token claims, not from URL parameters