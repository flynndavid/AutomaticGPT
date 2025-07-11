import { Text, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardPaddingView, useTheme, Sidebar, useSidebar } from '@/features/shared';
import { useChatManager } from '../hooks/useChatManager';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { EmptyState } from './EmptyState';
import { InputBar } from './InputBar';

export function Chat() {
  const {
    messages,
    error,
    input,
    isLoading,
    handleInputChange,
    onSend,
    handleSuggestionPress,
    currentConversationId,
    handleConversationSelect,
    handleNewConversation,
  } = useChatManager();
  const { isDark } = useTheme();
  const sidebar = useSidebar();

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f0f11' : '#fafaf9'}
      />
      <ChatHeader onMenuPress={sidebar.open} />

      <View className="flex-1">
        <MessageList messages={messages} isLoading={isLoading} />

        <View className="bg-background">
          {messages.length === 0 && <EmptyState onSuggestionPress={handleSuggestionPress} />}
        </View>

        <InputBar
          input={input}
          onInputChange={handleInputChange}
          onSend={onSend}
          isLoading={isLoading}
        />
        <KeyboardPaddingView />
      </View>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebar.isOpen}
        onClose={sidebar.close}
        appName="AI Assistant"
        onConversationSelect={handleConversationSelect}
        currentConversationId={currentConversationId ?? undefined}
      />
    </SafeAreaView>
  );
}
