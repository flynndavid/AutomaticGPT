import { useRef, useEffect, useCallback } from 'react';
import { FlatList, type ListRenderItem, View } from 'react-native';
import { UIMessage } from 'ai';
import { MessageBubble } from './MessageBubble';

interface OptimizedMessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

// Estimated height for each message (can be adjusted based on actual measurements)
const ESTIMATED_MESSAGE_HEIGHT = 80;

export function OptimizedMessageList({ messages, isLoading }: OptimizedMessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Memoized render function to prevent unnecessary re-renders
  const renderMessage = useCallback(({ item }: { item: UIMessage }) => (
    <View className="mb-4">
      <MessageBubble message={item} />
    </View>
  ), []);

  // Memoized key extractor
  const keyExtractor = useCallback((item: UIMessage) => item.id, []);

  // Optimized getItemLayout for better performance
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ESTIMATED_MESSAGE_HEIGHT,
    offset: ESTIMATED_MESSAGE_HEIGHT * index,
    index,
  }), []);

  // Add loading message if assistant is typing
  const messagesWithLoading = isLoading && messages.at(-1)?.role !== 'assistant'
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
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        flexGrow: 1,
      }}
      // iOS-specific optimizations
      windowSize={10}
      maxToRenderPerBatch={5}
      initialNumToRender={10}
      removeClippedSubviews={true}
      scrollEventThrottle={16}
      // Smooth keyboard handling
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
    />
  );
}