"""Conversation context and tool call trace skills for Phase 3 AI-powered Todo Chatbot.

Constitutional Compliance: These skills strictly follow the Phase 3 System Constitution.
All skills are stateless and atomic.
"""

from typing import Dict, Any, List, Optional


def format_conversation_context(messages: List[Dict[str, Any]],
                                options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Prepare conversation history for agent context.

    This skill strictly follows the Phase 3 System Constitution.

    Args:
        messages: List of message dictionaries with role, content, created_at
        options: Optional context options (max_messages, include_tool_calls)

    Returns:
        Dictionary with formatted messages, summary, and token_count estimate
    """
    if not messages:
        return {
            "messages": [],
            "summary": "No conversation history",
            "token_count": 0
        }

    options = options or {}
    max_messages = options.get("max_messages", 20)
    include_tool_calls = options.get("include_tool_calls", True)

    # Apply windowing - keep last N messages
    windowed_messages = messages[-max_messages:] if len(messages) > max_messages else messages

    # Format messages for agent
    formatted_messages = []
    total_tokens = 0

    for msg in windowed_messages:
        formatted_msg = {
            "role": msg.get("role"),
            "content": msg.get("content"),
            "timestamp": msg.get("created_at")
        }

        if include_tool_calls and msg.get("tool_calls"):
            formatted_msg["tool_calls"] = msg.get("tool_calls")

        formatted_messages.append(formatted_msg)

        # Rough token estimate (4 chars per token)
        total_tokens += len(msg.get("content", "")) // 4

    # Generate summary
    message_count = len(formatted_messages)
    user_messages = sum(1 for m in formatted_messages if m["role"] == "user")
    assistant_messages = sum(1 for m in formatted_messages if m["role"] == "assistant")

    summary = f"{message_count} messages ({user_messages} user, {assistant_messages} assistant)"

    return {
        "messages": formatted_messages,
        "summary": summary,
        "token_count": total_tokens
    }


def log_tool_call(call: Dict[str, Any], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Log tool invocations for debugging and audit.

    This skill strictly follows the Phase 3 System Constitution.

    Args:
        call: Tool call information with tool, parameters, result, duration_ms
        options: Optional trace options (sanitize_sensitive, include_result)

    Returns:
        Dictionary with trace_id and logged status
    """
    import uuid
    import json
    from datetime import datetime

    options = options or {}
    sanitize_sensitive = options.get("sanitize_sensitive", True)
    include_result = options.get("include_result", True)

    # Generate trace ID
    trace_id = str(uuid.uuid4())

    # Sanitize sensitive data if requested
    parameters = call.get("parameters", {})
    if sanitize_sensitive:
        # Remove sensitive fields
        sensitive_fields = ["password", "token", "api_key", "secret"]
        parameters = {
            k: "***REDACTED***" if k.lower() in sensitive_fields else v
            for k, v in parameters.items()
        }

    # Build trace entry
    trace_entry = {
        "trace_id": trace_id,
        "timestamp": datetime.utcnow().isoformat(),
        "tool": call.get("tool"),
        "parameters": parameters,
        "duration_ms": call.get("duration_ms", 0)
    }

    if include_result:
        result = call.get("result", {})
        # Sanitize result as well
        if sanitize_sensitive and isinstance(result, dict):
            result = {
                k: "***REDACTED***" if k.lower() in sensitive_fields else v
                for k, v in result.items()
            }
        trace_entry["result"] = result

    # In production, this would write to a logging system
    # For now, we just return the trace info
    print(f"[TOOL_TRACE] {json.dumps(trace_entry)}")

    return {
        "trace_id": trace_id,
        "logged": True
    }
