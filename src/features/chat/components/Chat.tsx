import { Text, View, SafeAreaView, StatusBar } from 'react-native';
import { KeyboardPaddingView, useTheme, Sidebar, useSidebar } from '@/features/shared';
import { useChatController } from '../hooks/useChatController';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { EmptyState } from './EmptyState';
import { InputBar } from './InputBar';

export function Chat() {
  const { messages, error, input, isLoading, handleInputChange, onSend, handleSuggestionPress } =
    useChatController();
  const { isDark } = useTheme();
  const sidebar = useSidebar();

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#0f0f11' : '#fafaf9'}
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
        backgroundColor={isDark ? '#0f0f11' : '#fafaf9'}
      />
      <ChatHeader onMenuPress={sidebar.open} />

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

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebar.isOpen}
        onClose={sidebar.close}
        appName="ChatGPT"
        userName="Jane Smith"
        userEmail="jane.smith@example.com"
      />
    </SafeAreaView>
  );
}
