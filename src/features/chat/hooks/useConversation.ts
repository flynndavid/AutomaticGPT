/**
 * useConversation Hook
 * Manages individual conversation state and messages
 */

import { useState, useEffect, useCallback } from 'react';
import { db, type Conversation, type Message } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface UseConversationReturn {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addMessage: (
    content: string,
    role: Message['role'],
    metadata?: Record<string, any>
  ) => Promise<Message | null>;
  updateMessage: (messageId: string, updates: Partial<Message>) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  generateTitle: () => Promise<string | null>;
}

export const useConversation = (conversationId: string | null): UseConversationReturn => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchConversation = useCallback(async () => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch conversation details and messages in parallel
      const [conversationResult, messagesResult] = await Promise.all([
        db.getConversation(conversationId),
        db.getMessages(conversationId),
      ]);

      if (conversationResult.error) {
        throw new Error(conversationResult.error.message);
      }

      if (messagesResult.error) {
        throw new Error(messagesResult.error.message);
      }

      setConversation(conversationResult.data);
      setMessages(messagesResult.data || []);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch conversation'));
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  const addMessage = useCallback(
    async (
      content: string,
      role: Message['role'],
      metadata: Record<string, any> = {}
    ): Promise<Message | null> => {
      if (!conversationId) {
        throw new Error('No conversation ID provided');
      }

      try {
        const messageData = {
          conversation_id: conversationId,
          content,
          role,
          metadata,
        };

        const { data, error: createError } = await db.createMessage(messageData);

        if (createError) {
          throw new Error(createError.message);
        }

        if (data) {
          // Add to local state
          setMessages((prev) => [...prev, data]);
          return data;
        }

        return null;
      } catch (err) {
        console.error('Error adding message:', err);
        setError(err instanceof Error ? err : new Error('Failed to add message'));
        return null;
      }
    },
    [conversationId]
  );

  const updateMessage = useCallback(
    async (messageId: string, updates: Partial<Message>): Promise<boolean> => {
      try {
        const { error: updateError } = await db.updateMessage(messageId, updates);

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Update local state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
        );
        return true;
      } catch (err) {
        console.error('Error updating message:', err);
        setError(err instanceof Error ? err : new Error('Failed to update message'));
        return false;
      }
    },
    []
  );

  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await db.deleteMessage(messageId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Remove from local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete message'));
      return false;
    }
  }, []);

  const generateTitle = useCallback(async (): Promise<string | null> => {
    if (!conversationId) {
      return null;
    }

    try {
      const { data, error: titleError } = await db.generateConversationTitle(conversationId);

      if (titleError) {
        throw new Error(titleError.message);
      }

      if (data && conversation) {
        // Update the conversation title in local state
        setConversation((prev) => (prev ? { ...prev, title: data } : null));
        return data;
      }

      return null;
    } catch (err) {
      console.error('Error generating title:', err);
      setError(err instanceof Error ? err : new Error('Failed to generate title'));
      return null;
    }
  }, [conversationId, conversation]);

  const refetch = useCallback(async () => {
    await fetchConversation();
  }, [fetchConversation]);

  return {
    conversation,
    messages,
    loading,
    error,
    refetch,
    addMessage,
    updateMessage,
    deleteMessage,
    generateTitle,
  };
};
