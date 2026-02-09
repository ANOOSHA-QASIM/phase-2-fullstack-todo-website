/**
 * Conversation-related TypeScript types for Phase 3 AI-powered Todo Chatbot.
 *
 * Constitutional Compliance: These types strictly follow the Phase 3 System Constitution.
 */

export interface Conversation {
  id: string;
  title: string | null;
  preview: string;
  created_at: string;
  updated_at: string;
}

// Backend message format (snake_case from API)
export interface BackendMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: Record<string, any> | null;
  language?: string | null;
  created_at: string;
}

export interface ConversationDetail {
  id: string;
  user_id: string;
  title: string | null;
  messages: BackendMessage[];
  created_at: string;
  updated_at: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}
