import { Text, View, SafeAreaView, StatusBar } from 'react-native';
import { KeyboardPaddingView, useTheme } from '@/features/shared';
import { useChatController } from '../hooks/useChatController';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { EmptyState } from './EmptyState';
import { InputBar } from './InputBar';

export function Chat() {
  const { messages, error, input, isLoading, handleInputChange, onSend, handleSuggestionPress } =
    useChatController();
  const { isDark } = useTheme();

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#000' : '#fff'}
        />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-500 text-center">{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000' : '#fff'}
      />
      <ChatHeader />

      <View className="flex-1">
        <MessageList messages={messages} isLoading={isLoading} />

        <View className="bg-background pb-4">
          {messages.length === 0 && <EmptyState onSuggestionPress={handleSuggestionPress} />}

          <InputBar
            input={input}
            onInputChange={handleInputChange}
            onSend={onSend}
            isLoading={isLoading}
          />
        </View>
        <KeyboardPaddingView />
      </View>
    </SafeAreaView>
  );
}
