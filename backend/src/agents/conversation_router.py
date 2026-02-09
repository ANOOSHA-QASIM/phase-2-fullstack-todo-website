"""Conversation Router Agent for Phase 3 AI-powered Todo Chatbot.

This agent orchestrates the entire chat interaction lifecycle.

Constitutional Compliance: This agent strictly follows the Phase 3 System Constitution.
Agent handles decision-making only; skills handle execution.
"""

from typing import Dict, Any, Optional
from src.skills.intent_skills import resolve_intent, detect_language
from src.skills.confirmation_skills import (
    generate_confirmation,
    generate_clarification,
    generate_confirmation_request
)
from src.skills.error_skills import generate_error_response
from src.skills.conversation_skills import format_conversation_context, log_tool_call
from src.mcp import mcp_server


async def conversation_router_agent(
    user_id: str,
    message: str,
    conversation_id: Optional[str] = None,
    conversation_history: Optional[list] = None
) -> Dict[str, Any]:
    """Main agent for routing chat messages to appropriate tools.

    This agent strictly follows the Phase 3 System Constitution.

    Constitutional Compliance Statement:
    - Agent handles decision-making only; skills handle execution
    - Stateless design: no hidden state, database is source of truth
    - Intent validation before execution
    - Confirmation required for destructive operations
    - Bilingual support (English/Urdu/Roman Urdu)
    - Clear error messages with corrective suggestions

    Args:
        user_id: User UUID
        message: User message text
        conversation_id: Optional conversation UUID
        conversation_history: Optional conversation history for context

    Returns:
        Dictionary with response, tool_calls, language_detected, requires_confirmation
    """

    # 1. Detect language
    language_result = detect_language(message)
    language = language_result["language"]

    # 2. Resolve intent
    intent = await resolve_intent(message, language)

    # Phase 4: T064 - Handle confirmation responses
    if intent["action"] == "confirm":
        # User is confirming a previous action
        # In a real implementation, we'd retrieve the pending intent from conversation context
        # For now, return a message asking them to repeat the action
        return {
            "response": "I'm ready to help! What would you like me to do?" if language == "en" else "میں مدد کے لیے تیار ہوں! آپ کیا کرنا چاہتے ہیں؟",
            "tool_calls": [],
            "language_detected": language,
            "requires_confirmation": False
        }

    # 3. Check if clarification needed
    if intent["confidence"] < 0.7 or intent["missing_fields"]:
        return {
            "response": generate_clarification(intent, language),
            "tool_calls": [],
            "language_detected": language,
            "requires_confirmation": False
        }

    # 4. Check if confirmation needed (destructive operations) - Phase 4: T060
    action = intent["action"]
    if action in ["delete", "update"] and not intent.get("confirmed"):
        return {
            "response": generate_confirmation_request(intent, language),
            "tool_calls": [],
            "language_detected": language,
            "requires_confirmation": True,
            "pending_intent": intent  # Store intent for confirmation
        }

    # Phase 4: T062, T063 - Handle task reference resolution for operations that need it
    if action in ["complete", "delete", "update"] and "task_title" in intent["parameters"]:
        # Need to resolve task title to task ID
        # First, get user's tasks
        tasks_result = await mcp_server.call_tool("list_tasks", user_id=user_id, status="all")

        if tasks_result["success"]:
            from src.skills.intent_skills import resolve_task_reference

            task_ref = intent["parameters"].get("task_title", "")
            resolution = await resolve_task_reference(task_ref, tasks_result["data"]["tasks"])

            if resolution.get("ambiguous"):
                # Multiple matches - ask user to clarify (Phase 4: T063)
                matches = resolution.get("matches", [])
                match_list = "\n".join([
                    f"{i+1}. {task['title']} (ID: {task['task_id']})"
                    for i, task in enumerate(matches)
                ])

                clarification_msg = (
                    f"I found multiple tasks matching '{task_ref}':\n\n{match_list}\n\n"
                    f"Please specify which one by saying 'task {matches[0]['task_id']}' or the full title."
                ) if language == "en" else (
                    f"مجھے '{task_ref}' سے مماثل متعدد کام ملے:\n\n{match_list}\n\n"
                    f"براہ کرم 'task {matches[0]['task_id']}' یا مکمل عنوان بتا کر وضاحت کریں۔"
                )

                return {
                    "response": clarification_msg,
                    "tool_calls": [],
                    "language_detected": language,
                    "requires_confirmation": False
                }

            elif not resolution.get("success"):
                # Task not found (Phase 4: T068)
                error_msg = resolution.get("error", "Task not found")
                error_response = generate_error_response(
                    {"type": "not_found", "message": error_msg},
                    language
                )
                return {
                    "response": error_response["message"] + "\n\n" + "\n".join(f"- {s}" for s in error_response.get("suggestions", [])),
                    "tool_calls": [],
                    "language_detected": language,
                    "requires_confirmation": False
                }

            else:
                # Successfully resolved - use the task_id
                intent["parameters"]["task_id"] = resolution["task"]["task_id"]
                del intent["parameters"]["task_title"]

    # 5. Select and invoke MCP tool
    tool_name = None
    tool_params = {"user_id": user_id}

    if action == "create":
        tool_name = "add_task"
        tool_params.update({
            "title": intent["parameters"].get("title"),
            "description": intent["parameters"].get("description"),
            "due_date": intent["parameters"].get("due_date")
        })

    elif action == "list":
        tool_name = "list_tasks"
        tool_params["status"] = intent["parameters"].get("status", "all")

    elif action == "complete":
        tool_name = "complete_task"
        tool_params["task_id"] = intent["parameters"].get("task_id")

    elif action == "delete":
        tool_name = "delete_task"
        tool_params["task_id"] = intent["parameters"].get("task_id")

    elif action == "update":
        tool_name = "update_task"
        tool_params.update({
            "task_id": intent["parameters"].get("task_id"),
            "title": intent["parameters"].get("title"),
            "description": intent["parameters"].get("description"),
            "due_date": intent["parameters"].get("due_date")
        })

    else:
        # Unknown action
        return {
            "response": generate_clarification(intent, language),
            "tool_calls": [],
            "language_detected": language,
            "requires_confirmation": False
        }

    # 6. Invoke tool
    import time
    start_time = time.time()
    tool_result = await mcp_server.call_tool(tool_name, **tool_params)
    duration_ms = int((time.time() - start_time) * 1000)

    # 7. Log tool call
    log_tool_call({
        "tool": tool_name,
        "parameters": tool_params,
        "result": tool_result,
        "duration_ms": duration_ms
    })

    # 8. Generate response
    if tool_result["success"]:
        confirmation = generate_confirmation(action, tool_result["data"], language)
        response_text = confirmation["message"]
        if confirmation.get("details"):
            response_text += f"\n{confirmation['details']}"

        return {
            "response": response_text,
            "tool_calls": [{
                "tool": tool_name,
                "parameters": tool_params,
                "result": tool_result.get("data", {})
            }],
            "language_detected": language,
            "requires_confirmation": False
        }
    else:
        error_response = generate_error_response(tool_result["error"], language)
        response_text = error_response["message"]
        if error_response.get("suggestions"):
            response_text += "\n\nSuggestions:\n" + "\n".join(f"- {s}" for s in error_response["suggestions"])

        return {
            "response": response_text,
            "tool_calls": [],
            "language_detected": language,
            "requires_confirmation": False,
            "error": tool_result["error"]
        }
