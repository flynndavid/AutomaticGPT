import { Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeToggle, useTheme } from '@/features/shared';

interface ChatHeaderProps {
  onMenuPress?: () => void;
}

export function ChatHeader({ onMenuPress }: ChatHeaderProps) {
  const { isDark } = useTheme();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-background border-b border-border">
      <Pressable onPress={onMenuPress} className="w-10 h-10 items-center justify-center">
        <Ionicons name="menu" size={24} color={isDark ? '#fff' : '#000'} />
      </Pressable>

      <View className="flex-row items-center flex-1 justify-center">
        <Text className="text-lg font-semibold text-foreground mr-1">ChatGPT</Text>
        <Text className="text-base text-muted-foreground mr-1">4o</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? '#9ca3af' : '#666'}
          className="ml-0.5"
        />
      </View>

      <View className="flex-row items-center gap-2">
        <ThemeToggle />
      </View>
    </View>
  );
}
