"""Error response generation skill for Phase 3 AI-powered Todo Chatbot.

Constitutional Compliance: This skill strictly follows the Phase 3 System Constitution.
Skill is stateless and atomic.
"""

from typing import Dict, Any, List


def generate_error_response(error: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
    """Transform technical errors into user-friendly messages.

    This skill strictly follows the Phase 3 System Constitution.

    Args:
        error: Error information with type and message
        language: Response language ("en", "ur", "mixed")

    Returns:
        Dictionary with message, suggestions, and retry_possible flag
    """
    error_type = error.get("type", "unknown")
    error_message = error.get("message", "")

    # English error templates
    en_messages = {
        "validation_error": "I couldn't process that because: {message}",
        "not_found": "I couldn't find that task. Could you check the task number?",
        "permission_denied": "You don't have permission to access that task.",
        "database_error": "I'm having trouble connecting right now. Please try again in a moment.",
        "tool_not_found": "I don't know how to do that yet.",
        "execution_error": "Something went wrong while processing your request.",
        "rate_limit": "You've sent too many messages. Please wait a moment and try again.",
        "unknown": "I encountered an unexpected error. Please try again."
    }

    # Urdu error templates
    ur_messages = {
        "validation_error": "میں اسے پروسیس نہیں کر سکا کیونکہ: {message}",
        "not_found": "مجھے وہ کام نہیں ملا۔ کیا آپ کام نمبر چیک کر سکتے ہیں؟",
        "permission_denied": "آپ کو اس کام تک رسائی کی اجازت نہیں ہے۔",
        "database_error": "مجھے ابھی کنکشن میں مسئلہ ہو رہا ہے۔ براہ کرم ایک لمحے میں دوبارہ کوشش کریں۔",
        "tool_not_found": "میں ابھی تک یہ نہیں جانتا کہ یہ کیسے کرنا ہے۔",
        "execution_error": "آپ کی درخواست پر کارروائی کرتے وقت کچھ غلط ہو گیا۔",
        "rate_limit": "آپ نے بہت زیادہ پیغامات بھیجے ہیں۔ براہ کرم ایک لمحہ انتظار کریں اور دوبارہ کوشش کریں۔",
        "unknown": "مجھے ایک غیر متوقع خرابی کا سامنا کرنا پڑا۔ براہ کرم دوبارہ کوشش کریں۔"
    }

    # Select templates based on language
    messages = ur_messages if language == "ur" else en_messages

    # Get error message
    message_template = messages.get(error_type, messages["unknown"])
    message = message_template.format(message=error_message) if "{message}" in message_template else message_template

    # Generate suggestions based on error type
    suggestions = []
    retry_possible = True

    if error_type == "validation_error":
        suggestions = [
            "Check your input and try again" if language == "en" else "اپنی ان پٹ چیک کریں اور دوبارہ کوشش کریں",
            "Make sure task titles are 1-200 characters" if language == "en" else "یقینی بنائیں کہ کام کے عنوانات 1-200 حروف ہیں"
        ]
        retry_possible = True

    elif error_type == "not_found":
        suggestions = [
            "Use 'show my tasks' to see all tasks" if language == "en" else "'میرے کام دکھاؤ' استعمال کریں تمام کام دیکھنے کے لیے",
            "Check the task number or title" if language == "en" else "کام نمبر یا عنوان چیک کریں"
        ]
        retry_possible = True

    elif error_type == "permission_denied":
        suggestions = [
            "You can only access your own tasks" if language == "en" else "آپ صرف اپنے کاموں تک رسائی حاصل کر سکتے ہیں"
        ]
        retry_possible = False

    elif error_type == "database_error":
        suggestions = [
            "Wait a moment and try again" if language == "en" else "ایک لمحہ انتظار کریں اور دوبارہ کوشش کریں",
            "Check your internet connection" if language == "en" else "اپنا انٹرنیٹ کنکشن چیک کریں"
        ]
        retry_possible = True

    elif error_type == "rate_limit":
        suggestions = [
            "Wait 60 seconds before sending more messages" if language == "en" else "مزید پیغامات بھیجنے سے پہلے 60 سیکنڈ انتظار کریں"
        ]
        retry_possible = True

    else:
        suggestions = [
            "Try rephrasing your request" if language == "en" else "اپنی درخواست کو دوبارہ لکھنے کی کوشش کریں",
            "Contact support if the problem persists" if language == "en" else "اگر مسئلہ برقرار رہے تو سپورٹ سے رابطہ کریں"
        ]
        retry_possible = True

    return {
        "message": message,
        "suggestions": suggestions,
        "retry_possible": retry_possible
    }
