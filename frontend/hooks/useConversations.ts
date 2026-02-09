/**
 * useConversations hook for Phase 3 AI-powered Todo Chatbot.
 *
 * Constitutional Compliance: This hook strictly follows the Phase 3 System Constitution.
 * Phase 5: T070 - Conversation list management
 */

'use client';

import { useState, useEffect } from 'react';
import { getConversations } from '@/services/conversationApi';
import { Conversation } from '@/types/conversation';
import { useAuth } from '@/lib/auth';

export function useConversations() {
  const { userId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getConversations(userId);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load conversations on mount
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  // Refresh conversations (Phase 5: T075)
  const refreshConversations = async () => {
    await loadConversations();
  };

  return {
    conversations,
    loading,
    error,
    refreshConversations
  };
}
