"""MCP package for Phase 3 AI-powered Todo Chatbot."""

from .server import mcp_server
from .tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
    create_conversation,
    save_message,
    load_conversation,
    list_conversations
)

# Register all tools with the MCP server
mcp_server.register_tool("add_task", add_task)
mcp_server.register_tool("list_tasks", list_tasks)
mcp_server.register_tool("complete_task", complete_task)
mcp_server.register_tool("delete_task", delete_task)
mcp_server.register_tool("update_task", update_task)
mcp_server.register_tool("create_conversation", create_conversation)
mcp_server.register_tool("save_message", save_message)
mcp_server.register_tool("load_conversation", load_conversation)
mcp_server.register_tool("list_conversations", list_conversations)

__all__ = [
    "mcp_server",
    "add_task",
    "list_tasks",
    "complete_task",
    "delete_task",
    "update_task",
    "create_conversation",
    "save_message",
    "load_conversation",
    "list_conversations"
]
