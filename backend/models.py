from sqlmodel import SQLModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # This will store the user ID from JWT
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(TaskBase):
    pass

class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None

class TaskRead(TaskBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

# Standardized response models
class SuccessResponse(SQLModel):
    success: bool = True
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

class ErrorResponse(SQLModel):
    success: bool = False
    error: Dict[str, Any]

class PaginatedTasksResponse(SQLModel):
    success: bool = True
    data: Dict[str, Any]