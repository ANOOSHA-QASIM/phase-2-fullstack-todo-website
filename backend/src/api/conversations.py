"""Conversation API endpoints for Phase 3 AI-powered Todo Chatbot.

This module implements endpoints for conversation management.

Constitutional Compliance: These endpoints strictly follow the Phase 3 System Constitution.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

from src.mcp import mcp_server

router = APIRouter()


class ConversationSummary(BaseModel):
    """Conversation summary model."""
    id: str
    title: str | None
    preview: str
    created_at: str
    updated_at: str


class Message(BaseModel):
    """Message model."""
    id: str
    role: str
    content: str
    tool_calls: Dict[str, Any] | None
    language: str | None
    created_at: str


class ConversationDetail(BaseModel):
    """Conversation detail model."""
    id: str
    user_id: str
    title: str | None
    messages: List[Message]
    created_at: str
    updated_at: str


class ConversationListResponse(BaseModel):
    """Conversation list response model."""
    conversations: List[ConversationSummary]
    total: int


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = 50
) -> ConversationListResponse:
    """List user's conversations.

    This endpoint strictly follows the Phase 3 System Constitution.

    Args:
        user_id: User UUID
        limit: Maximum conversations to return (default: 50, max: 100)

    Returns:
        List of conversations with summaries

    Raises:
        HTTPException: 400 (bad request), 500 (server error)
    """

    # Validate limit
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

    try:
        result = await mcp_server.call_tool(
            "list_conversations",
            context="auto",
            limit=limit
        )

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", {}).get("message", "Failed to list conversations")
            )

        conversations_data = result["data"]["conversations"]
        conversations = [
            ConversationSummary(
                id=conv["conversation_id"],
                title=conv.get("title"),
                preview=conv.get("preview", ""),
                created_at=conv["created_at"],
                updated_at=conv["updated_at"]
            )
            for conv in conversations_data
        ]

        return ConversationListResponse(
            conversations=conversations,
            total=result["data"]["total"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str
) -> ConversationDetail:
    """Get conversation with all messages.

    This endpoint strictly follows the Phase 3 System Constitution.

    Args:
        user_id: User UUID
        conversation_id: Conversation UUID

    Returns:
        Conversation detail with all messages

    Raises:
        HTTPException: 404 (not found), 403 (forbidden), 500 (server error)
    """

    try:
        result = await mcp_server.call_tool(
            "load_conversation",
            context="auto"
            conversation_id=conversation_id
        )

        if not result["success"]:
            error = result.get("error", {})
            error_type = error.get("type")

            if error_type == "not_found":
                raise HTTPException(status_code=404, detail="Conversation not found")
            elif error_type == "permission_denied":
                raise HTTPException(status_code=403, detail="Access denied")
            else:
                raise HTTPException(status_code=500, detail=error.get("message", "Failed to load conversation"))

        data = result["data"]
        messages = [
            Message(
                id=msg["message_id"],
                role=msg["role"],
                content=msg["content"],
                tool_calls=msg.get("tool_calls"),
                language=msg.get("language"),
                created_at=msg["created_at"]
            )
            for msg in data["messages"]
        ]

        # Note: We don't have user_id, title, created_at, updated_at in the load_conversation response
        # We'll need to fetch the conversation metadata separately or extend the MCP tool
        # For now, using conversation_id as placeholder
        return ConversationDetail(
            id=conversation_id,
            user_id=user_id,
            title=None,  # TODO: Fetch from conversation metadata
            messages=messages,
            created_at=messages[0].created_at if messages else datetime.utcnow().isoformat(),
            updated_at=messages[-1].created_at if messages else datetime.utcnow().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
