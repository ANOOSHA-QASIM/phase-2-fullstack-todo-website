# API Contract: Backend Implementation for Phase II: Todo Full-Stack Web Application

**Date**: 2026-01-14
**Version**: 1.0
**Feature**: 001-backend-spec

## Overview

This document defines the API contract for the backend Todo application. All endpoints require JWT authentication via the Authorization header. The API follows RESTful principles with consistent request/response formats and standardized error handling.

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

The JWT token is obtained through the Better Auth integration on the frontend and contains user claims that will be validated by the backend.

## Base URL

All endpoints are prefixed with `/api/`

## Common Response Formats

### Success Response Format
```json
{
  "success": true,
  "data": { /* response payload */ },
  "message": "Optional descriptive message"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional field-specific details */ }
  }
}
```

## Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Create a new user account via Better Auth integration.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "User Name"
}
```

**Response:**
- 200: User created successfully
- 400: Invalid input data
- 409: User already exists

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response:**
- 200: Login successful
  ```json
  {
    "success": true,
    "data": {
      "access_token": "jwt-token",
      "token_type": "bearer",
      "expires_in": 900
    }
  }
  ```
- 400: Invalid input data
- 401: Invalid credentials

#### POST /api/auth/logout
Logout user and invalidate session.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
- 200: Logout successful
- 401: Invalid or expired token

#### GET /api/auth/me
Get current logged-in user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
- 200: User information retrieved
  ```json
  {
    "success": true,
    "data": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "created_at": "2026-01-14T10:00:00Z"
    }
  }
  ```
- 401: Invalid or expired token

### Task Endpoints

#### GET /api/tasks
Retrieve all tasks for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `completed` (optional): Filter by completion status (true/false)
- `limit` (optional): Number of results per page (default: 10)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
- 200: Tasks retrieved successfully
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": "task-id",
          "user_id": "user-id",
          "title": "Task title",
          "description": "Task description",
          "completed": false,
          "created_at": "2026-01-14T10:00:00Z",
          "updated_at": "2026-01-14T10:00:00Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
  ```
- 401: Invalid or expired token

#### POST /api/tasks
Create a new task for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description (optional)",
  "completed": false
}
```

**Response:**
- 201: Task created successfully
  ```json
  {
    "success": true,
    "data": {
      "id": "task-id",
      "user_id": "user-id",
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z"
    }
  }
  ```
- 400: Invalid input data
- 401: Invalid or expired token

#### GET /api/tasks/{id}
Retrieve a specific task for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id`: Task ID

**Response:**
- 200: Task retrieved successfully
  ```json
  {
    "success": true,
    "data": {
      "id": "task-id",
      "user_id": "user-id",
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z"
    }
  }
  ```
- 401: Invalid or expired token
- 403: Task belongs to another user
- 404: Task not found

#### PUT /api/tasks/{id}
Update a specific task for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id`: Task ID

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated task description (optional)",
  "completed": true
}
```

**Response:**
- 200: Task updated successfully
  ```json
  {
    "success": true,
    "data": {
      "id": "task-id",
      "user_id": "user-id",
      "title": "Updated task title",
      "description": "Updated task description",
      "completed": true,
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:05:00Z"
    }
  }
  ```
- 400: Invalid input data
- 401: Invalid or expired token
- 403: Task belongs to another user
- 404: Task not found

#### DELETE /api/tasks/{id}
Delete a specific task for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id`: Task ID

**Response:**
- 200: Task deleted successfully
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```
- 401: Invalid or expired token
- 403: Task belongs to another user
- 404: Task not found

#### PATCH /api/tasks/{id}/complete
Toggle the completion status of a specific task for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id`: Task ID

**Request Body:**
```json
{
  "completed": true
}
```

**Response:**
- 200: Task completion status updated
  ```json
  {
    "success": true,
    "data": {
      "id": "task-id",
      "user_id": "user-id",
      "title": "Task title",
      "description": "Task description",
      "completed": true,
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:05:00Z"
    }
  }
  ```
- 400: Invalid input data
- 401: Invalid or expired token
- 403: Task belongs to another user
- 404: Task not found

## HTTP Status Codes

- 200: OK - Request successful
- 201: Created - Resource created successfully
- 400: Bad Request - Invalid request data
- 401: Unauthorized - Missing or invalid authentication
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 409: Conflict - Resource already exists
- 422: Unprocessable Entity - Validation error
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - Server error

## Security Requirements

1. All endpoints except auth endpoints require valid JWT token
2. User isolation: users can only access their own tasks
3. Input validation: all request bodies must be validated
4. Rate limiting: implement on auth endpoints to prevent brute force
5. JWT validation: verify token signature and expiration
6. User ID extraction: derive user ID from JWT token claims, not URL parameters