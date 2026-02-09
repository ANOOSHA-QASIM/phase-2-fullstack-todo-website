/**
 * useChat hook for Phase 3 AI-powered Todo Chatbot.
 *
 * Constitutional Compliance: This hook strictly follows the Phase 3 System Constitution.
 * Phase 4: T066 - Confirmation flow support
 * Phase 5: T073, T074, T075 - Conversation management
 */

'use client';

import { useState, useCallback } from 'react';
import { sendChatMessage } from '@/services/chatApi';
import { getConversation } from '@/services/conversationApi';
import { Message, ToolCall } from '@/types/chat';
import { BackendMessage } from '@/types/conversation';
import { useAuth } from '@/lib/auth';

interface UseChatOptions {
  onConversationCreated?: () => void;
}

export function useChat(options?: UseChatOptions) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<any>(null);

  const sendMessage = async (content: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    if (!content.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (content.length > 2000) {
      setError('Message must be 2000 characters or less');
      return;
    }

    // Clear previous error and pending confirmation
    setError(null);
    setPendingConfirmation(null);

    // Track if this is the first message in a new conversation
    const isFirstMessage = !conversationId;

    // Optimistic update - add user message immediately
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    setLoading(true);
    try {
      const response = await sendChatMessage(content, conversationId ?? undefined);

      // Update conversation ID if new (Phase 5: T073)
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);

        // Trigger conversation list refresh after first message (Phase 5: T075)
        if (isFirstMessage && options?.onConversationCreated) {
          options.onConversationCreated();
        }
      }

      // Add assistant message (map from backend format)
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
        toolCalls: response.tool_calls,
        requiresConfirmation: response.requires_confirmation,
        pendingIntent: response.pending_intent
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Store pending confirmation if needed
      if (response.requires_confirmation) {
        setPendingConfirmation(response.pending_intent);
      }

    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  // Load conversation by ID (Phase 5: T074)
  const loadConversation = useCallback(async (convId: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const conversation = await getConversation(userId, convId);

      // Set conversation ID
      setConversationId(convId);

      // Convert backend messages to frontend Message format
      const loadedMessages: Message[] = conversation.messages.map((msg: BackendMessage) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        toolCalls: msg.tool_calls ? [msg.tool_calls as any] : undefined
      }));

      setMessages(loadedMessages);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleConfirm = async () => {
    // Send "yes" to confirm the pending action
    await sendMessage('yes');
  };

  const handleCancel = () => {
    // Clear pending confirmation and add a cancel message
    setPendingConfirmation(null);
    const cancelMessage: Message = {
      role: 'user',
      content: 'no',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, cancelMessage]);

    // Send cancel to backend
    sendMessage('no');
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setPendingConfirmation(null);
  };

  return {
    messages,
    conversationId,
    loading,
    error,
    pendingConfirmation,
    sendMessage,
    loadConversation,
    handleConfirm,
    handleCancel,
    startNewConversation
  };
}
