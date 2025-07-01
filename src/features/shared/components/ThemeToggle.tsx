import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      className="w-10 h-10 items-center justify-center"
      testID="theme-toggle"
    >
      <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={isDark ? '#fff' : '#000'} />
    </Pressable>
  );
}
