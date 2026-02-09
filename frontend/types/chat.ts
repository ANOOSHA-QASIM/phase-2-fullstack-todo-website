/**
 * Chat-related TypeScript types for Phase 3 AI-powered Todo Chatbot.
 *
 * Constitutional Compliance: These types strictly follow the Phase 3 System Constitution.
 */

export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
  result: Record<string, any>;
}

// Backend chat response format (snake_case from API)
export interface ChatMessage {
  conversation_id: string;
  response: string;
  tool_calls: ToolCall[];
  language_detected: 'en' | 'ur' | 'mixed';
  requires_confirmation: boolean;
  pending_intent?: any | null;
  timestamp: string;
}

export interface ChatRequest {
  conversation_id?: string | null;
  message: string;
}

// Frontend message format (camelCase for UI components)
export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  requiresConfirmation?: boolean;
  pendingIntent?: any;
}
