"""Cohere API Service for Phase 3 AI-powered Todo Chatbot.

This service handles integration with Cohere API for natural language understanding.

Constitutional Compliance: This service strictly follows the Phase 3 System Constitution.
Service is stateless and provides atomic operations.
"""

import os
from typing import List, Dict, Any, Optional
from cohere import AsyncClient
from dotenv import load_dotenv

load_dotenv()


class CohereService:
    """Service for Cohere API integration.

    This service strictly follows the Phase 3 System Constitution.
    """

    def __init__(self):
        """Initialize Cohere async client."""
        api_key = os.getenv("COHERE_API_KEY")
        if not api_key:
            raise ValueError("COHERE_API_KEY environment variable is not set")

        self.model = os.getenv("COHERE_MODEL", "xlarge")
        self.client = AsyncClient(api_key=api_key)
        print(f"CohereService initialized with model: {self.model}")

    async def chat_completion(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Get chat completion from Cohere API.

        Args:
            message: User message
            conversation_history: Optional conversation history
            temperature: Response randomness (0.0-1.0)

        Returns:
            Dictionary with response text and metadata
        """
        try:
            # Format conversation history for Cohere
            chat_history = []
            if conversation_history:
                for msg in conversation_history:
                    chat_history.append({
                        "role": msg.get("role", "USER"),
                        "message": msg.get("content", "")
                    })

            # Call Cohere API
            response = await self.client.chat(
                model=self.model,
                message=message,
                chat_history=chat_history if chat_history else None,
                temperature=temperature
            )

            return {
                "success": True,
                "text": response.text,
                "metadata": {
                    "model": self.model,
                    "generation_id": response.generation_id if hasattr(response, 'generation_id') else None
                }
            }

        except Exception as e:
            return {
                "success": False,
                "error": {
                    "type": "cohere_api_error",
                    "message": str(e)
                }
            }

    async def close(self):
        """Close the Cohere client connection."""
        if hasattr(self.client, 'close'):
            await self.client.close()


# Global Cohere service instance
cohere_service = CohereService()
