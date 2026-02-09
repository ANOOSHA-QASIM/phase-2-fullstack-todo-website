/**
 * Conversation API service for Phase 3 AI-powered Todo Chatbot.
 *
 * Constitutional Compliance: This service strictly follows the Phase 3 System Constitution.
 * Phase 5: T069 - Conversation API client
 */

import { Conversation, ConversationDetail } from '@/types/conversation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get list of user's conversations
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Get specific conversation with all messages
 */
export async function getConversation(
  userId: string,
  conversationId: string
): Promise<ConversationDetail> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/conversations/${userId}/${conversationId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (response.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (response.status === 404) {
      throw new Error('Conversation not found');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}
