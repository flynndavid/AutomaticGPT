/**
 * useConversations Hook
 * Manages conversation list state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { db, type ConversationSummary } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface UseConversationsReturn {
  conversations: ConversationSummary[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createConversation: (title?: string) => Promise<ConversationSummary | null>;
  deleteConversation: (id: string) => Promise<boolean>;
  archiveConversation: (id: string) => Promise<boolean>;
  restoreConversation: (id: string) => Promise<boolean>;
  updateConversationTitle: (id: string, title: string) => Promise<boolean>;
}

export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!user?.id) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await db.getConversations(user.id);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch conversations'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = useCallback(
    async (title = 'New Conversation'): Promise<ConversationSummary | null> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const { data, error: createError } = await db.createConversation({
          user_id: user.id,
          title,
          metadata: {
            created_from: 'chat_interface',
            version: '1.0',
          },
        });

        if (createError) {
          throw new Error(createError.message);
        }

        if (data) {
          // Refresh conversations list
          await fetchConversations();
          return data as ConversationSummary;
        }

        return null;
      } catch (err) {
        console.error('Error creating conversation:', err);
        setError(err instanceof Error ? err : new Error('Failed to create conversation'));
        return null;
      }
    },
    [user?.id, fetchConversations]
  );

  const deleteConversation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await db.deleteConversation(id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Remove from local state
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete conversation'));
      return false;
    }
  }, []);

  const archiveConversation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: archiveError } = await db.archiveConversation(id);

      if (archiveError) {
        throw new Error(archiveError.message);
      }

      // Remove from local state (since we only show active conversations)
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      return true;
    } catch (err) {
      console.error('Error archiving conversation:', err);
      setError(err instanceof Error ? err : new Error('Failed to archive conversation'));
      return false;
    }
  }, []);

  const restoreConversation = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: restoreError } = await db.restoreConversation(id);

        if (restoreError) {
          throw new Error(restoreError.message);
        }

        // Refresh conversations to include the restored one
        await fetchConversations();
        return true;
      } catch (err) {
        console.error('Error restoring conversation:', err);
        setError(err instanceof Error ? err : new Error('Failed to restore conversation'));
        return false;
      }
    },
    [fetchConversations]
  );

  const updateConversationTitle = useCallback(
    async (id: string, title: string): Promise<boolean> => {
      try {
        const { error: updateError } = await db.updateConversation(id, { title });

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Update local state
        setConversations((prev) =>
          prev.map((conv) => (conv.id === id ? { ...conv, title } : conv))
        );
        return true;
      } catch (err) {
        console.error('Error updating conversation title:', err);
        setError(err instanceof Error ? err : new Error('Failed to update conversation title'));
        return false;
      }
    },
    []
  );

  const refetch = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch,
    createConversation,
    deleteConversation,
    archiveConversation,
    restoreConversation,
    updateConversationTitle,
  };
};
