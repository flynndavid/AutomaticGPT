/**
 * useChatManager Hook
 * Higher-level hook that manages conversation state and chat flow
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useConversations } from './useConversations';
import { useChatController } from './useChatController';

export const useChatManager = () => {
  const { user } = useAuth();
  const { createConversation } = useConversations();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [needsConversation, setNeedsConversation] = useState(false);

  const chatController = useChatController({
    conversationId: currentConversationId,
    onConversationCreate: setCurrentConversationId,
  });

  const handleConversationSelect = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    setNeedsConversation(false);
  }, []);

  const handleNewConversation = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const newConversation = await createConversation();
      if (newConversation) {
        setCurrentConversationId(newConversation.id);
        setNeedsConversation(false);
        return newConversation.id;
      }
      return null;
    } catch (error) {
      console.error('Failed to create new conversation:', error);
      return null;
    }
  }, [user?.id, createConversation]);

  const handleSendMessage = useCallback(async () => {
    // If no conversation exists, create one
    if (!currentConversationId && user?.id) {
      const newConversationId = await handleNewConversation();
      if (!newConversationId) {
        console.error('Failed to create conversation for message');
        return;
      }
      // The message will be sent once the conversation is created
      setNeedsConversation(true);
      return;
    }

    // Send the message using the chat controller
    chatController.onSend();
  }, [currentConversationId, user?.id, handleNewConversation, chatController]);

  // Auto-send when conversation is created and we need to send a message
  useEffect(() => {
    if (needsConversation && currentConversationId && chatController.input.trim()) {
      setNeedsConversation(false);
      chatController.onSend();
    }
  }, [needsConversation, currentConversationId, chatController]);

  return {
    ...chatController,
    onSend: handleSendMessage,
    currentConversationId,
    handleConversationSelect,
    handleNewConversation,
  };
};
