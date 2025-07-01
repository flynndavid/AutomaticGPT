import { useRef, useEffect, useCallback } from 'react';
import { FlatList, type ListRenderItem, View } from 'react-native';
import { UIMessage } from 'ai';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage: ListRenderItem<UIMessage> = ({ item }) => (
    <View className="mb-4">
      <MessageBubble message={item} />
    </View>
  );

  // Add loading message if assistant is typing
  const messagesWithLoading =
    isLoading && messages.at(-1)?.role !== 'assistant'
      ? [
          ...messages,
          {
            id: 'loading',
            role: 'assistant',
            content: '',
            parts: [{ type: 'text', text: '' }],
          } as UIMessage,
        ]
      : messages;

  return (
    <FlatList
      ref={flatListRef}
      data={messagesWithLoading}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        flexGrow: 1,
      }}
      keyboardDismissMode="interactive"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
    />
  );
}
