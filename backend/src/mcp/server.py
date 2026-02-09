"""MCP Server initialization for Phase 3 AI-powered Todo Chatbot.

This module initializes the Model Context Protocol (MCP) server that exposes
tools for task and conversation operations.

Constitutional Compliance: This server strictly follows the Phase 3 System Constitution.
All tools are stateless and atomic. Database is the single source of truth.
"""

from typing import Dict, Any


class MCPServer:
    """MCP Server for exposing tools to agents.

    This server acts as the bridge between agents and database operations.
    It exposes tools that agents can invoke to perform task and conversation operations.
    """

    def __init__(self):
        """Initialize MCP server with tool registry."""
        self.tools: Dict[str, Any] = {}
        print("MCP Server initialized")

    def register_tool(self, name: str, handler: callable):
        """Register a tool with the MCP server.

        Args:
            name: Tool name (e.g., "add_task", "list_tasks")
            handler: Async function that implements the tool
        """
        self.tools[name] = handler
        print(f"Registered tool: {name}")

    async def call_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        """Invoke a tool by name with parameters.

        Args:
            tool_name: Name of the tool to invoke
            **kwargs: Tool parameters

        Returns:
            Tool execution result with success/error status
        """
        if tool_name not in self.tools:
            return {
                "success": False,
                "error": {
                    "type": "tool_not_found",
                    "message": f"Tool '{tool_name}' not found"
                }
            }

        try:
            handler = self.tools[tool_name]
            result = await handler(**kwargs)
            return result
        except Exception as e:
            return {
                "success": False,
                "error": {
                    "type": "execution_error",
                    "message": str(e)
                }
            }


# Global MCP server instance
mcp_server = MCPServer()
