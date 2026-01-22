# Todo API Contract

## Overview
This document defines the API contract for the Todo application frontend. All API endpoints follow REST conventions and return JSON responses.

## Authentication
All endpoints except login and signup require a valid JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

## Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-string",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name"
    }
  },
  "message": "Login successful"
}
```

#### POST /api/auth/signup
Register new user and return JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "User Name"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-string",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name"
    }
  },
  "message": "Signup successful"
}
```

### Todos

#### GET /api/todos
Retrieve all todos for the authenticated user

**Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "todo-id",
      "title": "Todo title",
      "description": "Todo description",
      "completed": false,
      "userId": "user-id",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "message": "Todos retrieved successfully"
}
```

#### POST /api/todos
Create a new todo

**Request Body**:
```json
{
  "title": "New todo title",
  "description": "Todo description",
  "completed": false
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "new-todo-id",
    "title": "New todo title",
    "description": "Todo description",
    "completed": false,
    "userId": "user-id",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  },
  "message": "Todo created successfully"
}
```

#### PUT /api/todos/{id}
Update an existing todo

**Request Body**:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "existing-todo-id",
    "title": "Updated title",
    "description": "Updated description",
    "completed": true,
    "userId": "user-id",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-02T00:00:00Z"
  },
  "message": "Todo updated successfully"
}
```

#### DELETE /api/todos/{id}
Delete a todo

**Success Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Todo deleted successfully"
}
```

#### PATCH /api/todos/{id}/toggle
Toggle the completed status of a todo

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "existing-todo-id",
    "title": "Todo title",
    "description": "Todo description",
    "completed": true,
    "userId": "user-id",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-02T00:00:00Z"
  },
  "message": "Todo status updated successfully"
}
```

## Error Codes

- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User not authorized to access the resource
- `404 Not Found`: Requested resource does not exist
- `500 Internal Server Error`: Unexpected server error