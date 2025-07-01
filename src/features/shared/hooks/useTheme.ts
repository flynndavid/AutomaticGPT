import { useColorScheme } from 'nativewind';

export function useTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();

  return {
    theme: colorScheme,
    isDark: colorScheme === 'dark',
    toggleTheme: toggleColorScheme,
    setTheme: setColorScheme,
  };
}
