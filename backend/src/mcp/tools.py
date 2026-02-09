"""MCP Tools implementation for Phase 3 AI-powered Todo Chatbot.

This module implements all MCP tools for task and conversation operations.

Constitutional Compliance: All tools strictly follow the Phase 3 System Constitution.
Tools are stateless, atomic, and perform exactly one operation.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlmodel import Session, select
from datetime import datetime
from uuid import UUID
from typing import Dict, Any, Optional
from db import engine
from models import Task
from src.models import Conversation, Message, MessageRole


async def add_task(user_id: str, title: str, description: Optional[str] = None,
                   due_date: Optional[str] = None) -> Dict[str, Any]:
    """Add a new task for the user.

    Args:
        user_id: User UUID
        title: Task title (1-200 characters)
        description: Task description (0-1000 characters)
        due_date: Due date in ISO format (YYYY-MM-DD)

    Returns:
        Success response with task_id, title, status, due_date
        or error response with error type and message
    """
    try:
        # Validate inputs
        if not title or len(title) > 200:
            return {
                "success": False,
                "error": {
                    "type": "validation_error",
                    "message": "Title must be 1-200 characters"
                }
            }

        if description and len(description) > 1000:
            return {
                "success": False,
                "error": {
                    "type": "validation_error",
                    "message": "Description must be 0-1000 characters"
                }
            }

        # Create task in database
        with Session(engine) as session:
            task = Task(
                user_id=user_id,
                title=title,
                description=description,
                due_date=due_date,
                completed=False
            )
            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "success": True,
                "data": {
                    "task_id": task.id,
                    "title": task.title,
                    "status": "created",
                    "due_date": task.due_date
                }
            }

    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "database_error",
                "message": str(e)
            }
        }


async def list_tasks(user_id: str, status: Optional[str] = "all") -> Dict[str, Any]:
    """List user's tasks with optional filtering.

    Args:
        user_id: User UUID
        status: Filter by status ("all", "pending", "completed")

    Returns:
        Success response with tasks array and count
        or error response with error type and message
    """
    try:
        with Session(engine) as session:
            query = select(Task).where(Task.user_id == user_id)

            if status == "pending":
                query = query.where(Task.completed == False)
            elif status == "completed":
                query = query.where(Task.completed == True)

            tasks = session.exec(query).all()

            return {
                "success": True,
                "data": {
                    "tasks": [
                        {
                            "task_id": task.id,
                            "title": task.title,
                            "description": task.description,
                            "completed": task.completed,
                            "status": "completed" if task.completed else "pending",
                            "due_date": task.due_date,
                            "created_at": task.created_at.isoformat() if task.created_at else None
                        }
                        for task in tasks
                    ],
                    "count": len(tasks)
                }
            }

    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "database_error",
                "message": str(e)
            }
        }


async def complete_task(user_id: str, task_id: int) -> Dict[str, Any]:
    """Mark a task as completed.

    Args:
        user_id: User UUID
        task_id: Task ID

    Returns:
        Success response with task_id, title, status
        or error response with error type and message
    """
    try:
        with Session(engine) as session:
            task = session.get(Task, task_id)

            if not task:
                return {
                    "success": False,
                    "error": {
                        "type": "not_found",
                        "message": "Task not found"
                    }
                }

            if task.user_id != user_id:
                return {
                    "success": False,
                    "error": {
                        "type": "permission_denied",
                        "message": "Task doesn't belong to user"
                    }
                }

            task.completed = True
            session.add(task)
            session.commit()

            return {
                "success": True,
                "data": {
                    "task_id": task.id,
                    "title": task.title,
                    "status": "completed"
                }
            }

    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "database_error",
                "message": str(e)
            }
        }


async def delete_task(user_id: str, task_id: int) -> Dict[str, Any]:
    """Permanently delete a task.

    Args:
        user_id: User UUID
        task_id: Task ID

    Returns:
        Success response with task_id, title, status
        or error response with error type and message
    """
    try:
        with Session(engine) as session:
            task = session.get(Task, task_id)

            if not task:
                return {
                    "success": False,
                    "error": {
                        "type": "not_found",
                        "message": "Task not found"
                    }
                }

            if task.user_id != user_id:
                return {
                    "success": False,
                    "error": {
                        "type": "permission_denied",
                        "message": "Task doesn't belong to user"
                    }
                }

            title = task.title
            session.delete(task)
            session.commit()

            return {
                "success": True,
                "data": {
                    "task_id": task_id,
                    "title": title,
                    "status": "deleted"
                }
            }

    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "database_error",
                "message": str(e)
            }
        }


async def update_task(user_id: str, task_id: int, title: Optional[str] = None,
                     description: Optional[str] = None, due_date: Optional[str] = None) -> Dict[str, Any]:
    """Update task properties.

    Args:
        user_id: User UUID
        task_id: Task ID
        title: New title (1-200 characters)
        description: New description (0-1000 characters)
        due_date: New due date in ISO format

    Returns:
        Success response with task_id, title, status
        or error response with error type and message
    """
    try:
        # Validate inputs
        if title and len(title) > 200:
            return {
                "success": False,
                "error": {
                    "type": "validation_error",
                    "message": "Title must be 1-200 characters"
                }
            }

        if description and len(description) > 1000:
            return {
                "success": False,
                "error": {
                    "type": "validation_error",
                    "message": "Description must be 0-1000 characters"
                }
            }

        with Session(engine) as session:
            task = session.get(Task, task_id)

            if not task:
                return {
                    "success": False,
                    "error": {
                        "type": "not_found",
                        "message": "Task not found"
                    }
                }

            if task.user_id != user_id:
                return {
                    "success": False,
                    "error": {
                        "type": "permission_denied",
                        "message": "Task doesn't belong to user"
                    }
                }

            if title:
                task.title = title
            if description is not None:
                task.description = description
            if due_date is not None:
                task.due_date = due_date

            session.add(task)
            session.commit()

            return {
                "success": True,
                "data": {
                    "task_id": task.id,
                    "title": task.title,
                    "status": "updated"
                }
            }

    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "database_error",
                "message": str(e)
            }
        }


async def create_conversation(user_id: str) -> Dict[str, Any]:
    """Create a new conversation.

    Args:
        user_id: User UUID

    Returns:
        Success response with conversation_id and created_at
        or error response with error type and message
    """
    try:
        with Session(engine) as session:
            conversation = Conversation(
                user_id=UUID(user_id)
            )
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

            return {
                "success": True,
                "data": {
                    "conversation_id": str(conversation.id),
                    "created_at": conversation.created_at.isoformat()
                }
            }

    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "database_error",
                "message": str(e)
            }
        }


async def save_message(user_id: str, conversation_id: str, role: str,
                      content: str, tool_calls: Optional[Dict] = None,
                      language: Optional[str] = None) -> Dict[str, Any]:
    """Save a message to a conversation.

    Args:
        user_id: User UUID
        conversation_id: Conversation UUID
        role: Message role ("user" or "assistant")
        content: Message content (1-2000 characters)
        tool_calls: Tool invocations (for assistant messages)
        language: Detected language ("en", "ur", "mixed")

    Returns:
        Success response with message_id and created_at
        or error response with error type and message
    """
    try:
        # Validate inputs
        if role not in ["user", "assistant"]:
            return {
                "success": False,
                "error": {
                    "type": "validation_error",
                    "message": "Role must be 'user' or 'assistant'"
                }
            }

        if not content or len(content) > 2000:
            return {
                "success": False,
                "error": {
                    "type": "validation_error",
                    "message": "Content must be 1-2000 characters"
                }
            }

        with Session(engine) as session:
            # Verify conversation exists and belongs to user
            conversation = session.get(Conversation, UUID(conversation_id))
            if not conversation:
                return {
                    "success": False,
                    "error": {
                        "type": "not_found",
                        "message": "Conversation not found"
                    }
                }

            if str(conversation.user_id) != user_id:
                return {
                    "success": False,
                    "error": {
                        "type": "permission_denied",
                        "message": "Conversation doesn't belong to user"
                    }
                }

            # Create message
            message = Message(
                conversation_id=UUID(conversation_id),
                user_id=UUID(user_id),
                role=MessageRole(role),
                content=content,
                tool_calls=tool_calls,
                language=language
            )
            session.add(message)

            # Update conversation updated_at timestamp
            conversation.updated_at = datetime.utcnow()
            session.add(conversation)

            # Generate title from first user message if not set
            if not conversation.title and role == "user":
                conversation.title = content[:50]
                session.add(conversation)

            session.commit()
            session.refresh(message)

            return {
                "success": True,
                "data": {
                    "message_id": str(message.id),
                    "created_at": message.created_at.isoformat()
                }
            }

    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "database_error",
                "message": str(e)
            }
        }


async def load_conversation(user_id: str, conversation_id: str,
                           limit: int = 20) -> Dict[str, Any]:
    """Load conversation with all messages.

    Args:
        user_id: User UUID
        conversation_id: Conversation UUID
        limit: Maximum messages to load (default: 20)

    Returns:
        Success response with conversation_id, messages array, total_messages
        or error response with error type and message
    """
    try:
        with Session(engine) as session:
            # Verify conversation exists and belongs to user
            conversation = session.get(Conversation, UUID(conversation_id))
            if not conversation:
                return {
                    "success": False,
                    "error": {
                        "type": "not_found",
                        "message": "Conversation not found"
                    }
                }

            if str(conversation.user_id) != user_id:
                return {
                    "success": False,
                    "error": {
                        "type": "permission_denied",
                        "message": "Conversation doesn't belong to user"
                    }
                }

            # Load messages ordered by created_at
            query = select(Message).where(
                Message.conversation_id == UUID(conversation_id)
            ).order_by(Message.created_at).limit(limit)

            messages = session.exec(query).all()

            return {
                "success": True,
                "data": {
                    "conversation_id": conversation_id,
                    "messages": [
                        {
                            "message_id": str(msg.id),
                            "role": msg.role.value,
                            "content": msg.content,
                            "tool_calls": msg.tool_calls,
                            "language": msg.language,
                            "created_at": msg.created_at.isoformat()
                        }
                        for msg in messages
                    ],
                    "total_messages": len(messages)
                }
            }

    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "database_error",
                "message": str(e)
            }
        }


async def list_conversations(user_id: str, limit: int = 50) -> Dict[str, Any]:
    """List user's conversations.

    Args:
        user_id: User UUID
        limit: Maximum conversations to return (default: 50)

    Returns:
        Success response with conversations array and total
        or error response with error type and message
    """
    try:
        with Session(engine) as session:
            # Load conversations ordered by updated_at DESC
            query = select(Conversation).where(
                Conversation.user_id == UUID(user_id)
            ).order_by(Conversation.updated_at.desc()).limit(limit)

            conversations = session.exec(query).all()

            # Get preview (last message) for each conversation
            result_conversations = []
            for conv in conversations:
                # Get last message
                last_msg_query = select(Message).where(
                    Message.conversation_id == conv.id
                ).order_by(Message.created_at.desc()).limit(1)
                last_msg = session.exec(last_msg_query).first()

                preview = last_msg.content[:100] if last_msg else ""

                result_conversations.append({
                    "conversation_id": str(conv.id),
                    "title": conv.title,
                    "preview": preview,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat()
                })

            return {
                "success": True,
                "data": {
                    "conversations": result_conversations,
                    "total": len(result_conversations)
                }
            }

    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "database_error",
                "message": str(e)
            }
        }
