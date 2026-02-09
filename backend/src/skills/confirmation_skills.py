"""Confirmation message generation skill for Phase 3 AI-powered Todo Chatbot.

Constitutional Compliance: This skill strictly follows the Phase 3 System Constitution.
Skill is stateless and atomic.
"""

from typing import Dict, Any, Optional, List


def format_task_list(tasks: List[Dict[str, Any]], language: str = "en") -> str:
    """Format task list with numbers, titles, status, and due dates.

    This skill strictly follows the Phase 3 System Constitution.
    Phase 4: T061 - Task list formatting

    Args:
        tasks: List of task dictionaries
        language: Response language

    Returns:
        Formatted task list string
    """
    if not tasks:
        return "No tasks found" if language == "en" else "کوئی کام نہیں ملا"

    formatted_lines = []
    for idx, task in enumerate(tasks, 1):
        task_id = task.get("task_id", "?")
        title = task.get("title", "Untitled")
        status = task.get("status", "pending")
        due_date = task.get("due_date", "")

        # Status indicator
        if status == "completed":
            status_icon = "✓" if language == "en" else "✓"
            status_text = "Done" if language == "en" else "مکمل"
        else:
            status_icon = "○" if language == "en" else "○"
            status_text = "Pending" if language == "en" else "زیر التواء"

        # Build task line
        task_line = f"{idx}. {status_icon} {title} (ID: {task_id})"

        # Add due date if present
        if due_date:
            due_label = "Due" if language == "en" else "آخری تاریخ"
            task_line += f" - {due_label}: {due_date}"

        # Add status
        task_line += f" [{status_text}]"

        formatted_lines.append(task_line)

    return "\n".join(formatted_lines)


def generate_confirmation(action: str, result: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
    """Generate friendly confirmation message after successful operation.

    This skill strictly follows the Phase 3 System Constitution.

    Args:
        action: Task action performed (create, list, complete, delete, update)
        result: Action result data
        language: Response language ("en", "ur", "mixed")

    Returns:
        Dictionary with message, details, and optional next_actions
    """

    # English confirmation templates
    en_templates = {
        "create": "Got it! I've added \"{title}\" to your tasks.",
        "list": "Here are your tasks:",
        "complete": "Great! I've marked \"{title}\" as complete.",
        "delete": "Done! I've deleted \"{title}\" from your tasks.",
        "update": "Updated! I've changed \"{title}\"."
    }

    # Urdu confirmation templates
    ur_templates = {
        "create": "ٹھیک ہے! میں نے \"{title}\" آپ کے کاموں میں شامل کر دیا ہے۔",
        "list": "یہ آپ کے کام ہیں:",
        "complete": "بہترین! میں نے \"{title}\" مکمل کر دیا ہے۔",
        "delete": "ہو گیا! میں نے \"{title}\" آپ کے کاموں سے حذف کر دیا ہے۔",
        "update": "اپ ڈیٹ ہو گیا! میں نے \"{title}\" تبدیل کر دیا ہے۔"
    }

    # Select template based on language
    templates = ur_templates if language == "ur" else en_templates

    # Generate confirmation message
    if action == "create":
        title = result.get("title", "task")
        message = templates["create"].format(title=title)
        details = f"Task ID: {result.get('task_id')}"
        if result.get("due_date"):
            details += f", Due: {result.get('due_date')}"

    elif action == "list":
        tasks = result.get("tasks", [])
        count = result.get("count", 0)
        message = templates["list"]
        if count == 0:
            message += " (No tasks found)" if language == "en" else " (کوئی کام نہیں ملا)"
            details = None
        else:
            # Format task list with numbers, titles, status, and due dates
            details = format_task_list(tasks, language)

    elif action == "complete":
        title = result.get("title", "task")
        message = templates["complete"].format(title=title)
        details = f"Task ID: {result.get('task_id')}"

    elif action == "delete":
        title = result.get("title", "task")
        message = templates["delete"].format(title=title)
        details = f"Task ID: {result.get('task_id')}"

    elif action == "update":
        title = result.get("title", "task")
        message = templates["update"].format(title=title)
        details = f"Task ID: {result.get('task_id')}"

    else:
        message = "Operation completed successfully." if language == "en" else "آپریشن کامیابی سے مکمل ہوا۔"
        details = None

    # Suggest next actions
    next_actions = []
    if action == "create":
        next_actions = ["View all tasks", "Add another task"] if language == "en" else ["تمام کام دیکھیں", "ایک اور کام شامل کریں"]
    elif action == "list":
        next_actions = ["Add a task", "Complete a task"] if language == "en" else ["کام شامل کریں", "کام مکمل کریں"]

    return {
        "message": message,
        "details": details,
        "next_actions": next_actions if next_actions else None
    }


def generate_clarification(intent: Dict[str, Any], language: str = "en") -> str:
    """Generate clarification question when intent is unclear.

    This skill strictly follows the Phase 3 System Constitution.

    Args:
        intent: Intent resolution result with missing_fields and ambiguities
        language: Response language

    Returns:
        Clarification question string
    """
    missing_fields = intent.get("missing_fields", [])
    ambiguities = intent.get("ambiguities", [])
    action = intent.get("action", "unknown")

    # English clarification templates
    if language == "en":
        if action == "unknown":
            return "I'm not sure what you'd like me to do. I can help you add, view, update, complete, or delete tasks. What would you like to do?"

        if "title" in missing_fields:
            return "What task would you like me to add?"

        if "task_id or task_title" in missing_fields:
            return "Which task would you like to work with? Please provide the task number or title."

        if ambiguities:
            return f"I need more information: {ambiguities[0]}"

        return "Could you provide more details?"

    # Urdu clarification templates
    else:
        if action == "unknown":
            return "مجھے یقین نہیں ہے کہ آپ کیا کرنا چاہتے ہیں۔ میں آپ کی مدد کر سکتا ہوں کام شامل کرنے، دیکھنے، اپ ڈیٹ کرنے، مکمل کرنے، یا حذف کرنے میں۔ آپ کیا کرنا چاہتے ہیں؟"

        if "title" in missing_fields:
            return "آپ کون سا کام شامل کرنا چاہتے ہیں؟"

        if "task_id or task_title" in missing_fields:
            return "آپ کس کام کے ساتھ کام کرنا چاہتے ہیں؟ براہ کرم کام نمبر یا عنوان فراہم کریں۔"

        return "کیا آپ مزید تفصیلات فراہم کر سکتے ہیں؟"


def generate_confirmation_request(intent: Dict[str, Any], language: str = "en") -> str:
    """Generate confirmation request for destructive operations.

    This skill strictly follows the Phase 3 System Constitution.

    Args:
        intent: Intent resolution result
        language: Response language

    Returns:
        Confirmation request string
    """
    action = intent.get("action")
    parameters = intent.get("parameters", {})

    if language == "en":
        if action == "delete":
            task_ref = parameters.get("task_id") or parameters.get("task_title", "this task")
            return f"Are you sure you want to delete {task_ref}? This action cannot be undone. Please confirm (yes/no)."

        if action == "update":
            task_ref = parameters.get("task_id") or "this task"
            return f"Are you sure you want to update task {task_ref}? Please confirm (yes/no)."

        return "Please confirm this action (yes/no)."

    else:  # Urdu
        if action == "delete":
            task_ref = parameters.get("task_id") or parameters.get("task_title", "یہ کام")
            return f"کیا آپ واقعی {task_ref} کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔ براہ کرم تصدیق کریں (ہاں/نہیں)۔"

        return "براہ کرم اس عمل کی تصدیق کریں (ہاں/نہیں)۔"
