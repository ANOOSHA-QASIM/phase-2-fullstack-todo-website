"""Chat API endpoint for Phase 3 AI-powered Todo Chatbot.

This module implements the main chat endpoint for conversational task management.

Constitutional Compliance: This endpoint strictly follows the Phase 3 System Constitution.
Phase 7: T092 - Comprehensive error logging
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
import traceback

from src.agents.conversation_router import conversation_router_agent
from src.mcp import mcp_server
from src.api.middleware.rate_limit import rate_limit_middleware
from dependencies import get_current_user

# Phase 7: T092 - Structured logging
logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    """Chat request model."""
    conversation_id: Optional[str] = None
    message: str


class ChatResponse(BaseModel):
    """Chat response model."""
    conversation_id: str
    response: str
    tool_calls: List[Dict[str, Any]]
    language_detected: str
    requires_confirmation: bool
    pending_intent: Optional[Dict[str, Any]] = None
    timestamp: str


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    user_id: str = Depends(get_current_user)
) -> ChatResponse:
    """Chat endpoint for conversational task management.

    This endpoint strictly follows the Phase 3 System Constitution.
    Phase 7: T092 - Comprehensive error logging with structured logs

    Args:
        request: Chat request with optional conversation_id and message
        user_id: User UUID (extracted from JWT token via authentication dependency)

    Returns:
        Chat response with conversation_id, response text, tool_calls, etc.

    Raises:
        HTTPException: 400 (bad request), 401 (unauthorized), 429 (rate limit), 500 (server error)
    """

    # Phase 7: T092 - Log request with structured data
    logger.info(
        "Chat request received",
        extra={
            "user_id": user_id,
            "conversation_id": request.conversation_id,
            "message_length": len(request.message),
            "timestamp": datetime.utcnow().isoformat()
        }
    )

    # Rate limiting
    try:
        await rate_limit_middleware(user_id)
    except HTTPException as e:
        # Phase 7: T092 - Log rate limit errors
        logger.warning(
            "Rate limit exceeded",
            extra={
                "user_id": user_id,
                "error_type": "rate_limit",
                "status_code": e.status_code,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        raise

    # Validate message
    if not request.message or len(request.message) > 2000:
        # Phase 7: T092 - Log validation errors
        logger.warning(
            "Message validation failed",
            extra={
                "user_id": user_id,
                "error_type": "validation_error",
                "message_length": len(request.message) if request.message else 0,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        raise HTTPException(
            status_code=400,
            detail="Message must be 1-2000 characters"
        )

    try:
        # Create conversation if needed
        conversation_id = request.conversation_id
        if not conversation_id:
            conv_result = await mcp_server.call_tool("create_conversation", user_id=user_id)
            if not conv_result["success"]:
                # Phase 7: T092 - Log conversation creation failure
                logger.error(
                    "Failed to create conversation",
                    extra={
                        "user_id": user_id,
                        "error_type": "conversation_creation_failed",
                        "error_detail": conv_result.get("error"),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
                raise HTTPException(status_code=500, detail="Failed to create conversation")
            conversation_id = conv_result["data"]["conversation_id"]

        # Load conversation history
        history_result = await mcp_server.call_tool(
            "load_conversation",
            user_id=user_id,
            conversation_id=conversation_id
        )
        conversation_history = history_result.get("data", {}).get("messages", []) if history_result["success"] else []

        # Save user message
        user_msg_result = await mcp_server.call_tool(
            "save_message",
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content=request.message
        )

        if not user_msg_result["success"]:
            # Phase 7: T092 - Log message save failure
            logger.error(
                "Failed to save user message",
                extra={
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "error_type": "message_save_failed",
                    "error_detail": user_msg_result.get("error"),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            raise HTTPException(status_code=500, detail="Failed to save user message")

        # Process with agent
        agent_response = await conversation_router_agent(
            user_id=user_id,
            message=request.message,
            conversation_id=conversation_id,
            conversation_history=conversation_history
        )

        # Save assistant message
        assistant_msg_result = await mcp_server.call_tool(
            "save_message",
            user_id=user_id,
            conversation_id=conversation_id,
            role="assistant",
            content=agent_response["response"],
            tool_calls=agent_response.get("tool_calls"),
            language=agent_response.get("language_detected")
        )

        if not assistant_msg_result["success"]:
            # Phase 7: T092 - Log assistant message save failure
            logger.error(
                "Failed to save assistant message",
                extra={
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "error_type": "message_save_failed",
                    "error_detail": assistant_msg_result.get("error"),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            raise HTTPException(status_code=500, detail="Failed to save assistant message")

        # Phase 7: T092 - Log successful response
        logger.info(
            "Chat response sent successfully",
            extra={
                "user_id": user_id,
                "conversation_id": conversation_id,
                "language_detected": agent_response.get("language_detected", "en"),
                "tool_calls_count": len(agent_response.get("tool_calls", [])),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

        return ChatResponse(
            conversation_id=conversation_id,
            response=agent_response["response"],
            tool_calls=agent_response.get("tool_calls", []),
            language_detected=agent_response.get("language_detected", "en"),
            requires_confirmation=agent_response.get("requires_confirmation", False),
            pending_intent=agent_response.get("pending_intent"),
            timestamp=datetime.utcnow().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        # Phase 7: T092 - Comprehensive error logging with stack trace
        logger.error(
            "Unexpected error in chat endpoint",
            extra={
                "user_id": user_id,
                "conversation_id": request.conversation_id,
                "error_type": type(e).__name__,
                "error_message": str(e),
                "stack_trace": traceback.format_exc(),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
