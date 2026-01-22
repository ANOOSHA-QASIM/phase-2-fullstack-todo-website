# Data Model: Todo Web Application – Frontend UI (Antigravity Design)

## User Entity

**Fields**:
- `id`: string - Unique identifier for the user
- `email`: string - User's email address (validation: proper email format)
- `name`: string - User's display name (optional)
- `createdAt`: Date - Account creation timestamp
- `updatedAt`: Date - Last update timestamp

**Validation Rules**:
- Email must follow standard email format
- Name must be 1-100 characters if provided

## Todo Entity

**Fields**:
- `id`: string - Unique identifier for the todo
- `title`: string - Title of the todo (required, 1-200 characters)
- `description`: string - Optional description (max 1000 characters)
- `completed`: boolean - Completion status (default: false)
- `createdAt`: Date - Creation timestamp
- `updatedAt`: Date - Last update timestamp
- `userId`: string - Reference to the owning user

**Validation Rules**:
- Title must be between 1-200 characters
- Description must be max 1000 characters if provided
- Completed field must be boolean
- userId must reference an existing user

## State Transitions

**Todo States**:
- Active (completed: false)
- Completed (completed: true)

**Transitions**:
- Active → Completed (via mark complete action)
- Completed → Active (via mark incomplete action)

## API Response Models

**TodoResponse**:
- `data`: Todo | Todo[] - Single todo or array of todos
- `success`: boolean - Request success status
- `message`: string - Optional success/error message
- `error`: string - Optional error details

**AuthResponse**:
- `token`: string - Authentication token
- `user`: User - User object
- `success`: boolean - Request success status