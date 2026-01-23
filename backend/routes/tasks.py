from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from models import Task, TaskCreate, TaskUpdate, TaskRead, SuccessResponse, ErrorResponse, PaginatedTasksResponse
from db import get_session
from dependencies import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=PaginatedTasksResponse)
async def get_tasks(
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> PaginatedTasksResponse:
    """
    Retrieve all tasks for the authenticated user.
    Ensures user isolation by filtering tasks based on the user_id from JWT token.
    """
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()

    task_list = []
    for task in tasks:
        task_dict = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "user_id": task.user_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at
        }
        task_list.append(task_dict)

    return PaginatedTasksResponse(
        success=True,
        data={
            "tasks": task_list,
            "total": len(task_list),
            "page": 1,
            "limit": len(task_list)
        }
    )

@router.post("/", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """
    Create a new task for the authenticated user.
    Associates the task with the user based on the user_id from JWT token.
    Validates task field constraints (title max 200 chars, description max 1000 chars).
    """
    # Validation is handled by Pydantic models in TaskCreate
    task = Task(
        title=task_data.title,
        description=task_data.description,
        completed=task_data.completed,
        user_id=user_id
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    return SuccessResponse(
        success=True,
        data={
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "user_id": task.user_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at
        }
    )

@router.get("/{task_id}", response_model=SuccessResponse)
async def get_task(
    task_id: int,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """
    Retrieve a specific task for the authenticated user.
    Verifies that the task belongs to the authenticated user.
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return SuccessResponse(
        success=True,
        data={
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "user_id": task.user_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at
        }
    )

@router.put("/{task_id}", response_model=SuccessResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """
    Update a specific task for the authenticated user.
    Verifies that the task belongs to the authenticated user.
    Validates task field constraints (title max 200 chars, description max 1000 chars).
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update task fields
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed

    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    return SuccessResponse(
        success=True,
        data={
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "user_id": task.user_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at
        }
    )

@router.delete("/{task_id}", response_model=SuccessResponse)
async def delete_task(
    task_id: int,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """
    Delete a specific task for the authenticated user.
    Verifies that the task belongs to the authenticated user.
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    session.delete(task)
    session.commit()

    return SuccessResponse(
        success=True,
        data={
            "message": "Task deleted successfully"
        }
    )

@router.patch("/{task_id}/complete", response_model=SuccessResponse)
async def toggle_task_completion(
    task_id: int,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """
    Toggle the completion status of a specific task for the authenticated user.
    Verifies that the task belongs to the authenticated user.
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    return SuccessResponse(
        success=True,
        data={
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "user_id": task.user_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at
        }
    )