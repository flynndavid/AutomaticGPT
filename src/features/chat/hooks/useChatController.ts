import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useConversation } from './useConversation';
import { useFileUpload } from './useFileUpload';
import { FileAttachment } from '@/types/api';

interface UseChatControllerProps {
  conversationId: string | null;
  onConversationCreate?: (conversationId: string) => void;
}

export function useChatController(
  { conversationId, onConversationCreate }: UseChatControllerProps = { conversationId: null }
) {
  const { user } = useAuth();
  const { messages: dbMessages, loading: conversationLoading } = useConversation(conversationId);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // File upload functionality
  const fileUpload = useFileUpload();

  const {
    messages,
    error,
    handleInputChange: coreHandleInputChange,
    input,
    handleSubmit: coreHandleSubmit,
    isLoading,
    setMessages,
    append,
  } = useChat({
    maxSteps: 5,
    body: {
      conversationId: conversationId || undefined,
      userId: user?.id || undefined,
      saveMessages: true,
    },
    onFinish: (message) => {
      // Clear attachments after successful message
      fileUpload.clearAttachments();
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

  // Enhanced submit handler that includes file attachments
  const handleSubmit = async (e?: any) => {
    e?.preventDefault();
    
    // Upload any pending files first
    if (fileUpload.attachments.length > 0) {
      await fileUpload.uploadPendingFiles();
      
      // Check if all uploads were successful
      const failedUploads = fileUpload.attachments.filter(file => file.uploadStatus === 'error');
      if (failedUploads.length > 0) {
        console.error('Some files failed to upload:', failedUploads);
        return; // Don't send message if uploads failed
      }
    }

    // Create message with attachments
    const messageContent = input.trim();
    const messageAttachments = fileUpload.attachments.filter(file => file.uploadStatus === 'uploaded');

    if (!messageContent && messageAttachments.length === 0) {
      return; // Don't send empty messages
    }

    // Use append to send message with attachments
    await append({
      role: 'user',
      content: messageContent,
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
    });

    // Haptic feedback
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
    handleSubmit,
    onSend,
    handleSuggestionPress,
    conversationId,
    isInitialized,
    // File upload functionality
    attachments: fileUpload.attachments,
    isUploading: fileUpload.isUploading,
    selectFiles: fileUpload.selectFiles,
    selectImages: fileUpload.selectImages,
    captureImage: fileUpload.captureImage,
    removeAttachment: fileUpload.removeAttachment,
    clearAttachments: fileUpload.clearAttachments,
  };
}
