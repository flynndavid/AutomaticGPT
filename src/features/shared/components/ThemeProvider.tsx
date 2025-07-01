import { ReactNode } from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { themes } from '../utils/themes';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { colorScheme } = useColorScheme();

  return (
    <View style={themes[colorScheme]} className="flex-1">
      {children}
    </View>
  );
}
