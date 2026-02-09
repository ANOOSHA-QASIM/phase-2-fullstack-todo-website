"""Rate limiting middleware for Phase 3 AI-powered Todo Chatbot.

This middleware enforces rate limits to prevent abuse.

Constitutional Compliance: This middleware strictly follows the Phase 3 System Constitution.
Phase 7: T093 - Security event logging
"""

from fastapi import Request, HTTPException
from datetime import datetime, timedelta
from typing import Dict
import os
import logging

# Phase 7: T093 - Security event logging
logger = logging.getLogger(__name__)

# In-memory rate limit tracker (in production, use Redis)
rate_limit_tracker: Dict[str, Dict] = {}

# Get rate limit from environment
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))


async def rate_limit_middleware(user_id: str) -> None:
    """Enforce rate limiting per user.

    This middleware strictly follows the Phase 3 System Constitution.
    Phase 7: T093 - Logs security events for rate limit violations

    Args:
        user_id: User UUID

    Raises:
        HTTPException: 429 if rate limit exceeded
    """
    now = datetime.utcnow()

    # Initialize tracker for user if not exists
    if user_id not in rate_limit_tracker:
        rate_limit_tracker[user_id] = {
            "count": 0,
            "window_start": now
        }

    user_data = rate_limit_tracker[user_id]

    # Check if we're in a new time window (1 minute)
    time_since_window_start = (now - user_data["window_start"]).total_seconds()

    if time_since_window_start >= 60:
        # Reset counter for new window
        user_data["count"] = 0
        user_data["window_start"] = now

    # Increment request count
    user_data["count"] += 1

    # Check if limit exceeded
    if user_data["count"] > RATE_LIMIT_PER_MINUTE:
        retry_after = 60 - int(time_since_window_start)

        # Phase 7: T093 - Log security event for rate limit violation
        logger.warning(
            "SECURITY_EVENT: Rate limit exceeded",
            extra={
                "event_type": "rate_limit_violation",
                "user_id": user_id,
                "request_count": user_data["count"],
                "limit": RATE_LIMIT_PER_MINUTE,
                "window_seconds": 60,
                "retry_after": retry_after,
                "timestamp": now.isoformat()
            }
        )

        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": "You've sent too many messages. Please wait a moment and try again.",
                "retry_after": retry_after,
                "limit": RATE_LIMIT_PER_MINUTE,
                "window": "1 minute"
            }
        )
