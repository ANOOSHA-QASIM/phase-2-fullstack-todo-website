/**
 * Chat API client for Phase 3 AI-powered Todo Chatbot.
 *
 * Constitutional Compliance: This client strictly follows the Phase 3 System Constitution.
 * Phase 7: T098 - Retry logic with exponential backoff
 */

import { ChatMessage, ChatRequest } from '@/types/chat';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Phase 7: T098 - Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send chat message with retry logic
 * Phase 7: T098 - Exponential backoff for transient failures
 *
 * Note: user_id is extracted from JWT token by backend, not passed as parameter
 */
export async function sendChatMessage(
  message: string,
  conversationId?: string
): Promise<ChatMessage> {
  const token = localStorage.getItem('access_token');
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: conversationId ?? null,
          message
        } as ChatRequest)
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login (not retryable)
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          throw new Error('Authentication required');
        }

        if (response.status === 429) {
          // Rate limit - wait and retry
          if (attempt < MAX_RETRIES) {
            const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
            console.log(`Rate limited. Retrying in ${retryDelay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
            await sleep(retryDelay);
            continue;
          }
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail?.message || 'Rate limit exceeded. Please wait a moment.');
        }

        if (response.status >= 500) {
          // Server error - retry with exponential backoff
          if (attempt < MAX_RETRIES) {
            const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
            console.log(`Server error (${response.status}). Retrying in ${retryDelay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
            await sleep(retryDelay);
            continue;
          }
          throw new Error('Server error. Please try again later.');
        }

        // Other client errors (4xx) - don't retry
        throw new Error('Failed to send message');
      }

      // Success - return data
      return response.json();

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // If it's a network error, retry
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (attempt < MAX_RETRIES) {
          const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          console.log(`Network error. Retrying in ${retryDelay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(retryDelay);
          continue;
        }
      }

      // If we've exhausted retries or it's not retryable, throw
      if (attempt >= MAX_RETRIES || !(error instanceof TypeError)) {
        throw lastError;
      }
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error('Failed to send message after retries');
}
