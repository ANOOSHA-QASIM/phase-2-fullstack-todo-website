"""Intent resolution and language detection skills for Phase 3 AI-powered Todo Chatbot.

Constitutional Compliance: These skills strictly follow the Phase 3 System Constitution.
All skills are stateless and atomic.
"""

from typing import Dict, Any, List, Optional
import re


def detect_language(message: str) -> Dict[str, Any]:
    """Detect language of user input.

    This skill strictly follows the Phase 3 System Constitution.

    Args:
        message: User message text

    Returns:
        Dictionary with language ("en", "ur", "mixed") and confidence
    """
    if not message:
        return {"language": "en", "confidence": 0.0}

    # Check for Urdu Unicode characters (U+0600 to U+06FF)
    urdu_chars = sum(1 for c in message if '\u0600' <= c <= '\u06FF')
    total_chars = len(message)

    if total_chars == 0:
        return {"language": "en", "confidence": 0.0}

    urdu_ratio = urdu_chars / total_chars

    # If more than 30% Urdu characters, classify as Urdu
    if urdu_ratio > 0.3:
        return {"language": "ur", "confidence": urdu_ratio}

    # Check for common Urdu words in Roman script
    urdu_keywords = ["kaam", "karna", "hai", "mujhe", "aap", "karo", "kya", "mein", "ne"]
    message_lower = message.lower()
    urdu_keyword_count = sum(1 for keyword in urdu_keywords if keyword in message_lower)

    if urdu_keyword_count >= 2:
        return {"language": "mixed", "confidence": 0.7}

    # Default to English
    return {"language": "en", "confidence": 0.9}


async def resolve_intent(message: str, language: str = "en") -> Dict[str, Any]:
    """Analyze user message and determine intended action.

    This skill strictly follows the Phase 3 System Constitution.

    Args:
        message: User message text
        language: Detected language

    Returns:
        Dictionary with action, confidence, parameters, missing_fields, ambiguities
    """
    message_lower = message.lower()

    # Check for confirmation responses first (Phase 4: T064)
    confirmation_patterns = [
        r"\byes\b", r"\byeah\b", r"\byep\b", r"\bsure\b", r"\bok\b", r"\bokay\b",
        r"\bconfirm\b", r"\bproceed\b", r"\bgo ahead\b",
        r"\bہاں\b", r"\bٹھیک\b", r"\bکرو\b"  # Urdu: yes, ok, do it
    ]

    if any(re.search(pattern, message_lower) for pattern in confirmation_patterns):
        return {
            "action": "confirm",
            "confidence": 0.95,
            "parameters": {"confirmed": True},
            "missing_fields": [],
            "ambiguities": []
        }

    # Intent patterns for task operations
    create_patterns = [
        r"add\s+(?:a\s+)?task",
        r"create\s+(?:a\s+)?task",
        r"new\s+task",
        r"remind\s+me",
        r"i\s+need\s+to",
        r"kaam\s+add",
        r"task\s+banana"
    ]

    list_patterns = [
        r"show\s+(?:me\s+)?(?:my\s+)?tasks",
        r"list\s+(?:my\s+)?tasks",
        r"what\s+(?:are\s+)?(?:my\s+)?tasks",
        r"view\s+tasks",
        r"display\s+tasks",
        r"get\s+(?:my\s+)?tasks",
        r"kaam\s+dikhao",
        r"mere\s+kaam"
    ]

    complete_patterns = [
        r"complete\s+task",
        r"mark\s+(?:task\s+)?(?:\d+\s+)?(?:as\s+)?(?:done|complete)",
        r"finish\s+task",
        r"done\s+with",
        r"kaam\s+complete"
    ]

    delete_patterns = [
        r"delete\s+task",
        r"remove\s+task",
        r"cancel\s+task",
        r"kaam\s+delete"
    ]

    update_patterns = [
        r"update\s+task",
        r"change\s+task",
        r"modify\s+task",
        r"edit\s+task",
        r"kaam\s+change"
    ]

    # Determine action
    action = "unknown"
    confidence = 0.0
    parameters = {}
    missing_fields = []
    ambiguities = []

    # Check for create intent
    if any(re.search(pattern, message_lower) for pattern in create_patterns):
        action = "create"
        confidence = 0.9

        # Extract title (everything after the trigger phrase)
        for pattern in create_patterns:
            match = re.search(pattern, message_lower)
            if match:
                title_start = match.end()
                title = message[title_start:].strip()
                if title:
                    parameters["title"] = title
                break

        if "title" not in parameters:
            missing_fields.append("title")
            confidence = 0.5

        # Extract due date if mentioned
        if "tomorrow" in message_lower:
            parameters["due_date"] = "tomorrow"
        elif "today" in message_lower:
            parameters["due_date"] = "today"
        elif re.search(r"\d{4}-\d{2}-\d{2}", message):
            date_match = re.search(r"\d{4}-\d{2}-\d{2}", message)
            parameters["due_date"] = date_match.group()

    # Check for list intent
    elif any(re.search(pattern, message_lower) for pattern in list_patterns):
        action = "list"
        confidence = 0.95

        # Check for status filter
        if "pending" in message_lower or "incomplete" in message_lower or "active" in message_lower:
            parameters["status"] = "pending"
        elif "completed" in message_lower or "done" in message_lower or "finished" in message_lower:
            parameters["status"] = "completed"
        else:
            parameters["status"] = "all"

    # Check for complete intent
    elif any(re.search(pattern, message_lower) for pattern in complete_patterns):
        action = "complete"
        confidence = 0.85

        # Extract task ID
        task_id_match = re.search(r"task\s+(\d+)", message_lower)
        if task_id_match:
            parameters["task_id"] = int(task_id_match.group(1))
        else:
            # Try to extract task title (Phase 4: T062)
            for pattern in complete_patterns:
                match = re.search(pattern, message_lower)
                if match:
                    title = message[match.end():].strip()
                    if title and not title.startswith(('task', 'the')):
                        parameters["task_title"] = title
                    break

        if "task_id" not in parameters and "task_title" not in parameters:
            missing_fields.append("task_id or task_title")
            confidence = 0.5

    # Check for delete intent
    elif any(re.search(pattern, message_lower) for pattern in delete_patterns):
        action = "delete"
        confidence = 0.85

        # Extract task ID
        task_id_match = re.search(r"task\s+(\d+)", message_lower)
        if task_id_match:
            parameters["task_id"] = int(task_id_match.group(1))
        else:
            # Try to extract task title (Phase 4: T062)
            for pattern in delete_patterns:
                match = re.search(pattern, message_lower)
                if match:
                    title = message[match.end():].strip()
                    if title and not title.startswith(('task', 'the')):
                        parameters["task_title"] = title
                    break

        if "task_id" not in parameters and "task_title" not in parameters:
            missing_fields.append("task_id or task_title")
            confidence = 0.5

    # Check for update intent
    elif any(re.search(pattern, message_lower) for pattern in update_patterns):
        action = "update"
        confidence = 0.85

        # Extract task ID
        task_id_match = re.search(r"task\s+(\d+)", message_lower)
        if task_id_match:
            parameters["task_id"] = int(task_id_match.group(1))

        if "task_id" not in parameters:
            missing_fields.append("task_id")
            confidence = 0.5

    else:
        # Unknown intent
        action = "unknown"
        confidence = 0.0
        ambiguities.append("Could not determine intent from message")

    return {
        "action": action,
        "confidence": confidence,
        "parameters": parameters,
        "missing_fields": missing_fields,
        "ambiguities": ambiguities
    }


async def resolve_task_reference(task_reference: str, user_tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Resolve task reference (ID or title) to actual task.

    This skill strictly follows the Phase 3 System Constitution.
    Phase 4: T062 - Task reference resolution

    Args:
        task_reference: Task ID or title from user input
        user_tasks: List of user's tasks

    Returns:
        Dictionary with matched task or ambiguity information
    """
    # Try to parse as task ID
    try:
        task_id = int(task_reference)
        matching_tasks = [t for t in user_tasks if t.get("task_id") == task_id]
        if len(matching_tasks) == 1:
            return {
                "success": True,
                "task": matching_tasks[0],
                "ambiguous": False
            }
        elif len(matching_tasks) == 0:
            return {
                "success": False,
                "error": "Task not found",
                "ambiguous": False
            }
    except ValueError:
        # Not a number, treat as title
        pass

    # Search by title (case-insensitive partial match)
    task_reference_lower = task_reference.lower()
    matching_tasks = [
        t for t in user_tasks
        if task_reference_lower in t.get("title", "").lower()
    ]

    if len(matching_tasks) == 0:
        return {
            "success": False,
            "error": "No tasks found matching that description",
            "ambiguous": False
        }
    elif len(matching_tasks) == 1:
        return {
            "success": True,
            "task": matching_tasks[0],
            "ambiguous": False
        }
    else:
        # Multiple matches - ambiguous (Phase 4: T063)
        return {
            "success": False,
            "error": "Multiple tasks match that description",
            "ambiguous": True,
            "matches": matching_tasks[:5]  # Return up to 5 matches
        }

    """Analyze user message and determine intended action.

    This skill strictly follows the Phase 3 System Constitution.

    Args:
        message: User message text
        language: Detected language

    Returns:
        Dictionary with action, confidence, parameters, missing_fields, ambiguities
    """
    message_lower = message.lower()

    # Intent patterns for task operations
    create_patterns = [
        r"add\s+(?:a\s+)?task",
        r"create\s+(?:a\s+)?task",
        r"new\s+task",
        r"remind\s+me",
        r"i\s+need\s+to",
        r"kaam\s+add",
        r"task\s+banana"
    ]

    list_patterns = [
        r"show\s+(?:me\s+)?(?:my\s+)?tasks",
        r"list\s+(?:my\s+)?tasks",
        r"what\s+(?:are\s+)?(?:my\s+)?tasks",
        r"view\s+tasks",
        r"kaam\s+dikhao",
        r"mere\s+kaam"
    ]

    complete_patterns = [
        r"complete\s+task",
        r"mark\s+(?:task\s+)?(?:\d+\s+)?(?:as\s+)?(?:done|complete)",
        r"finish\s+task",
        r"done\s+with",
        r"kaam\s+complete"
    ]

    delete_patterns = [
        r"delete\s+task",
        r"remove\s+task",
        r"cancel\s+task",
        r"kaam\s+delete"
    ]

    update_patterns = [
        r"update\s+task",
        r"change\s+task",
        r"modify\s+task",
        r"edit\s+task",
        r"kaam\s+change"
    ]

    # Determine action
    action = "unknown"
    confidence = 0.0
    parameters = {}
    missing_fields = []
    ambiguities = []

    # Check for create intent
    if any(re.search(pattern, message_lower) for pattern in create_patterns):
        action = "create"
        confidence = 0.9

        # Extract title (everything after the trigger phrase)
        for pattern in create_patterns:
            match = re.search(pattern, message_lower)
            if match:
                title_start = match.end()
                title = message[title_start:].strip()
                if title:
                    parameters["title"] = title
                break

        if "title" not in parameters:
            missing_fields.append("title")
            confidence = 0.5

        # Extract due date if mentioned
        if "tomorrow" in message_lower:
            parameters["due_date"] = "tomorrow"
        elif "today" in message_lower:
            parameters["due_date"] = "today"
        elif re.search(r"\d{4}-\d{2}-\d{2}", message):
            date_match = re.search(r"\d{4}-\d{2}-\d{2}", message)
            parameters["due_date"] = date_match.group()

    # Check for list intent
    elif any(re.search(pattern, message_lower) for pattern in list_patterns):
        action = "list"
        confidence = 0.95

        # Check for status filter
        if "pending" in message_lower or "incomplete" in message_lower:
            parameters["status"] = "pending"
        elif "completed" in message_lower or "done" in message_lower:
            parameters["status"] = "completed"
        else:
            parameters["status"] = "all"

    # Check for complete intent
    elif any(re.search(pattern, message_lower) for pattern in complete_patterns):
        action = "complete"
        confidence = 0.85

        # Extract task ID
        task_id_match = re.search(r"task\s+(\d+)", message_lower)
        if task_id_match:
            parameters["task_id"] = int(task_id_match.group(1))
        else:
            # Try to extract task title
            for pattern in complete_patterns:
                match = re.search(pattern, message_lower)
                if match:
                    title = message[match.end():].strip()
                    if title:
                        parameters["task_title"] = title
                    break

        if "task_id" not in parameters and "task_title" not in parameters:
            missing_fields.append("task_id or task_title")
            confidence = 0.5

    # Check for delete intent
    elif any(re.search(pattern, message_lower) for pattern in delete_patterns):
        action = "delete"
        confidence = 0.85

        # Extract task ID
        task_id_match = re.search(r"task\s+(\d+)", message_lower)
        if task_id_match:
            parameters["task_id"] = int(task_id_match.group(1))
        else:
            # Try to extract task title
            for pattern in delete_patterns:
                match = re.search(pattern, message_lower)
                if match:
                    title = message[match.end():].strip()
                    if title:
                        parameters["task_title"] = title
                    break

        if "task_id" not in parameters and "task_title" not in parameters:
            missing_fields.append("task_id or task_title")
            confidence = 0.5

    # Check for update intent
    elif any(re.search(pattern, message_lower) for pattern in update_patterns):
        action = "update"
        confidence = 0.85

        # Extract task ID
        task_id_match = re.search(r"task\s+(\d+)", message_lower)
        if task_id_match:
            parameters["task_id"] = int(task_id_match.group(1))

        if "task_id" not in parameters:
            missing_fields.append("task_id")
            confidence = 0.5

    else:
        # Unknown intent
        action = "unknown"
        confidence = 0.0
        ambiguities.append("Could not determine intent from message")

    return {
        "action": action,
        "confidence": confidence,
        "parameters": parameters,
        "missing_fields": missing_fields,
        "ambiguities": ambiguities
    }
