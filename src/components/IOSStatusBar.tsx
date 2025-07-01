import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/features/shared';

interface IOSStatusBarProps {
  /**
   * Override the automatic theme detection
   */
  style?: 'auto' | 'light' | 'dark';
  
  /**
   * Show network activity indicator (iOS only)
   */
  networkActivityIndicatorVisible?: boolean;
}

/**
 * iOS-optimized status bar component
 * Automatically adapts to light/dark themes and provides proper iOS styling
 */
export function IOSStatusBar({ 
  style = 'auto',
  networkActivityIndicatorVisible = false 
}: IOSStatusBarProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Determine status bar style
  const statusBarStyle = (() => {
    if (style === 'auto') {
      return isDark ? 'light' : 'dark';
    }
    return style;
  })();

  return (
    <StatusBar
      style={statusBarStyle}
      backgroundColor="transparent"
      translucent={true}
      networkActivityIndicatorVisible={networkActivityIndicatorVisible}
    />
  );
}

/**
 * Hook to get safe area aware status bar height
 */
export function useStatusBarHeight() {
  const insets = useSafeAreaInsets();
  return insets.top;
}