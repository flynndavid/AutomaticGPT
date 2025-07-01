/**
 * useConversationSharing Hook
 * Manages conversation sharing functionality
 */

import { useState, useCallback } from 'react';
import { db, type ConversationShare } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ShareConversationParams {
  conversationId: string;
  sharedWith?: string; // User ID, null for public share
  permissions?: string[];
  expiresAt?: string;
}

interface UseConversationSharingReturn {
  loading: boolean;
  error: Error | null;
  shareConversation: (params: ShareConversationParams) => Promise<ConversationShare | null>;
  getSharedConversations: () => Promise<ConversationShare[]>;
  getConversationShares: (conversationId: string) => Promise<ConversationShare[]>;
  removeShare: (shareId: string) => Promise<boolean>;
  updateSharePermissions: (shareId: string, permissions: string[]) => Promise<boolean>;
  generateShareLink: (conversationId: string, expiresInDays?: number) => Promise<string | null>;
  validateShareAccess: (shareToken: string) => Promise<boolean>;
}

export const useConversationSharing = (): UseConversationSharingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const shareConversation = useCallback(
    async (params: ShareConversationParams): Promise<ConversationShare | null> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        setLoading(true);
        setError(null);

        const shareData = {
          conversation_id: params.conversationId,
          shared_by: user.id,
          shared_with: params.sharedWith || null,
          permissions: params.permissions || ['read'],
          expires_at: params.expiresAt || null,
        };

        const { data, error: shareError } = await db.shareConversation(shareData);

        if (shareError) {
          throw new Error(shareError.message);
        }

        return data;
      } catch (err) {
        console.error('Error sharing conversation:', err);
        setError(err instanceof Error ? err : new Error('Failed to share conversation'));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const getSharedConversations = useCallback(async (): Promise<ConversationShare[]> => {
    if (!user?.id) {
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await db.getSharedConversations(user.id);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching shared conversations:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch shared conversations'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getConversationShares = useCallback(
    async (conversationId: string): Promise<ConversationShare[]> => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await db.getConversationShares(conversationId);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        return data || [];
      } catch (err) {
        console.error('Error fetching conversation shares:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch conversation shares'));
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeShare = useCallback(async (shareId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: removeError } = await db.removeConversationShare(shareId);

      if (removeError) {
        throw new Error(removeError.message);
      }

      return true;
    } catch (err) {
      console.error('Error removing share:', err);
      setError(err instanceof Error ? err : new Error('Failed to remove share'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSharePermissions = useCallback(
    async (shareId: string, permissions: string[]): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        // We need to implement an update method in the db helpers
        // For now, we'll use the existing removeShare and recreate
        // This is a simplified implementation
        console.warn(
          'updateSharePermissions not fully implemented - consider removing and recreating share'
        );
        return false;
      } catch (err) {
        console.error('Error updating share permissions:', err);
        setError(err instanceof Error ? err : new Error('Failed to update share permissions'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateShareLink = useCallback(
    async (conversationId: string, expiresInDays = 7): Promise<string | null> => {
      try {
        // First get the conversation to get its share token
        const { data: conversation } = await db.getConversation(conversationId);

        if (!conversation) {
          throw new Error('Conversation not found');
        }

        // Create a public share
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        await shareConversation({
          conversationId,
          sharedWith: undefined, // null for public share
          permissions: ['read'],
          expiresAt: expiresAt.toISOString(),
        });

        // Generate the share link using the conversation's share_token
        const baseUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://your-app.com';
        return `${baseUrl}/shared/${conversation.share_token}`;
      } catch (err) {
        console.error('Error generating share link:', err);
        setError(err instanceof Error ? err : new Error('Failed to generate share link'));
        return null;
      }
    },
    [shareConversation]
  );

  const validateShareAccess = useCallback(async (shareToken: string): Promise<boolean> => {
    try {
      // This would typically involve a database query to check if the share token is valid
      // and not expired. For now, we'll return true as a placeholder
      console.log('Validating share access for token:', shareToken);
      return true;
    } catch (err) {
      console.error('Error validating share access:', err);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    shareConversation,
    getSharedConversations,
    getConversationShares,
    removeShare,
    updateSharePermissions,
    generateShareLink,
    validateShareAccess,
  };
};
