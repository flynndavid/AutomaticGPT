import { Fragment } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import Animated, { Layout, Easing, FadeIn } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import { UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import { Avatar } from './Avatar';
import { WeatherCard, CelsiusConvertCard, useTheme } from '@/features/shared';

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { isDark } = useTheme();

  const content = message.parts
    .map((part) => {
      switch (part.type) {
        case 'text': {
          if (!part.text) return null;
          return (
            <Markdown
              key={part.type}
              style={{
                body: {
                  color: isUser ? '#ffffff' : isDark ? '#fafaf9' : '#27272a',
                  fontSize: 17,
                  lineHeight: 22,
                },
                paragraph: {
                  marginTop: 0,
                  marginBottom: 0,
                },
              }}
            >
              {part.text}
            </Markdown>
          );
        }
        case 'tool-invocation': {
          const { toolInvocation } = part;
          if (toolInvocation.state === 'result') {
            if (toolInvocation.toolName === 'weather') {
              return <WeatherCard key={toolInvocation.toolName} {...toolInvocation.result} />;
            } else if (toolInvocation.toolName === 'convertFahrenheitToCelsius') {
              return (
                <CelsiusConvertCard key={toolInvocation.toolName} {...toolInvocation.result} />
              );
            }
            return (
              <Text key={toolInvocation.toolName}>
                Tool: {toolInvocation.toolName} - Result:{' '}
                {JSON.stringify(toolInvocation.result, null, 2)}
              </Text>
            );
          }
          return (
            <View key={toolInvocation.toolName} className="flex-row items-center">
              <ActivityIndicator size="small" color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className="ml-2 text-muted-foreground">
                Calling: {toolInvocation.toolName}...
              </Text>
            </View>
          );
        }
        default:
          return null;
      }
    })
    .filter(Boolean);

  // Handle loading state
  if (message.id === 'loading') {
    return (
      <Animated.View
        layout={Layout.easing(Easing.ease).delay(100)}
        entering={FadeIn.duration(200)}
        className="flex-row items-end gap-2"
      >
        <Avatar role="assistant" />
        <View className="bg-card p-3 rounded-t-2xl rounded-br-2xl">
          <ActivityIndicator testID="loading-indicator" color={isDark ? '#9ca3af' : '#6b7280'} />
        </View>
      </Animated.View>
    );
  }
  if (!content.length) return null;

  return (
    <Animated.View
      layout={Layout.easing(Easing.ease).delay(100)}
      entering={FadeIn.duration(200)}
      className={cn('flex-row items-end gap-2', isUser && 'self-end')}
    >
      {!isUser && <Avatar role="assistant" />}
      <View
        className={cn(
          'p-3 rounded-2xl max-w-[85%]',
          isUser ? 'bg-primary rounded-br-none' : 'bg-card rounded-bl-none'
        )}
      >
        {content.map((jsx, key) => (
          <Fragment key={key}>{jsx}</Fragment>
        ))}
      </View>
    </Animated.View>
  );
}
