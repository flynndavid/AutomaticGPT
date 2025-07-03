import { Text, View, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardPaddingView, useTheme, Sidebar, useSidebar } from '@/features/shared';
import { useChatManager } from '../hooks/useChatManager';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { EmptyState } from './EmptyState';
import { InputBar } from './InputBar';
import { platformContainer, webLayoutUtils } from '@/lib/styles';
import { cn } from '@/lib/utils';

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

  // Desktop layout with persistent sidebar
  if (Platform.OS === 'web') {
    return (
      <View className={cn(platformContainer)}>
        {/* Desktop Sidebar - Always visible */}
        <View className={cn('fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border', webLayoutUtils.sidebarWidth)}>
          <Sidebar
            isOpen={true}
            onClose={() => {}} // No-op on desktop since sidebar is persistent
            appName="AI Assistant"
            onConversationSelect={handleConversationSelect}
            currentConversationId={currentConversationId}
          />
        </View>

        {/* Main Content Area */}
        <View className={cn('flex-1 min-h-screen bg-background', webLayoutUtils.mainContentWithSidebar)}>
          <SafeAreaView className="flex-1 bg-background" edges={['top', 'right']}>
            <StatusBar
              barStyle={isDark ? 'light-content' : 'dark-content'}
              backgroundColor={isDark ? '#0f0f11' : '#fafaf9'}
            />
            
            {/* Desktop Header - streamlined */}
            <View className={cn('border-b border-border/10', webLayoutUtils.desktopHeaderHeight)}>
              <ChatHeader 
                onMenuPress={() => {}} // No-op on desktop
                showMenuButton={false} // Hide menu button on desktop
              />
            </View>

            {/* Chat Content with responsive container */}
            <View className="flex-1">
              <View className={cn(webLayoutUtils.chatContentArea, 'flex-1')}>
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
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  // Mobile layout (unchanged)
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

      {/* Mobile Sidebar (overlay) */}
      <Sidebar
        isOpen={sidebar.isOpen}
        onClose={sidebar.close}
        appName="AI Assistant"
        onConversationSelect={handleConversationSelect}
        currentConversationId={currentConversationId}
      />
    </SafeAreaView>
  );
}
