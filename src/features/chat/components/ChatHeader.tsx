import { Text, View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/features/shared';
import { webLayoutUtils, webInteractionUtils } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  onMenuPress?: () => void;
  onNewChatPress?: () => void;
  showMenuButton?: boolean;
}

export function ChatHeader({ onMenuPress, onNewChatPress, showMenuButton = true }: ChatHeaderProps) {
  const { isDark } = useTheme();

  return (
    <View className={cn(
      'flex-row items-center justify-between px-4 py-3',
      Platform.OS === 'web' ? webLayoutUtils.desktopHeaderHeight : 'h-14'
    )}>
      {/* Menu Button - Hidden on desktop */}
      {showMenuButton ? (
        <Pressable 
          onPress={onMenuPress} 
          className={cn('w-10 h-10 items-center justify-center rounded-lg', webInteractionUtils.buttonHover)}
        >
          <Ionicons name="menu" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
      ) : (
        <View className="w-10 h-10" />
      )}

      {/* Title Section - Enhanced for desktop */}
      <View className="flex-row items-center flex-1 justify-center">
        <Text className={cn(
          'text-lg font-semibold text-foreground mr-1',
          Platform.OS === 'web' ? 'text-xl' : 'text-lg'
        )}>
          ChatGPT
        </Text>
        <Text className="text-base text-muted-foreground mr-1">4o</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? '#9ca3af' : '#666'}
          className="ml-0.5"
        />
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-2">
        <Pressable 
          onPress={onNewChatPress} 
          className={cn(
            'w-10 h-10 items-center justify-center rounded-lg',
            webInteractionUtils.buttonHover
          )}
        >
          <Ionicons name="create-outline" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
      </View>
    </View>
  );
}
