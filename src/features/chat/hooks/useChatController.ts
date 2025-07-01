import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useConversation } from './useConversation';
import { useModelSelection } from './useModelSelection';

interface UseChatControllerProps {
  conversationId: string | null;
  onConversationCreate?: (conversationId: string) => void;
}

export function useChatController(
  { conversationId, onConversationCreate }: UseChatControllerProps = { conversationId: null }
) {
  const { user } = useAuth();
  const { messages: dbMessages, loading: conversationLoading } = useConversation(conversationId);
  const { selectedModel } = useModelSelection();
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    messages,
    error,
    handleInputChange: coreHandleInputChange,
    input,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    maxSteps: 5,
    body: {
      conversationId: conversationId || undefined,
      userId: user?.id || undefined,
      saveMessages: true,
      model: selectedModel?.id,
    },
    onFinish: (message) => {
      // Conversation should be created by now if needed
      console.log('Chat finished:', message);
    },
  });

  // Load persisted messages when conversation changes
  useEffect(() => {
    if (!conversationLoading && dbMessages && conversationId && !isInitialized) {
      // Convert database messages to useChat format
      const chatMessages = dbMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        createdAt: new Date(msg.created_at),
      }));

      setMessages(chatMessages);
      setIsInitialized(true);
    }
  }, [dbMessages, conversationLoading, conversationId, isInitialized, setMessages]);

  // Reset initialization when conversation changes
  useEffect(() => {
    setIsInitialized(false);
  }, [conversationId]);

  const handleInputChange = (text: string) => {
    coreHandleInputChange({
      target: {
        value: text,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const onSend = async () => {
    if (!input.trim()) return;

    // The parent hook (useChatManager) is now responsible for creating the conversation.
    // This hook will only proceed if a conversationId is present.
    if (!conversationId) {
      console.warn('onSend called without a conversationId. The message will not be sent.');
      // Optionally, you could trigger a callback here to notify the parent
      // that a conversation is needed, but the current design handles this.
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSubmit();
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleInputChange(suggestion);
  };

  return {
    messages,
    error,
    input,
    isLoading: isLoading || conversationLoading,
    handleInputChange,
    onSend,
    handleSuggestionPress,
    conversationId,
    isInitialized,
  };
}
