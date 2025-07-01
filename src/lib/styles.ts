import { Platform } from 'react-native';
import { cn } from './utils';

/**
 * Message text styling utility
 * Provides consistent typography for chat messages
 */
export const messageTextStyle = {
  fontSize: 17,
  lineHeight: 24,
} as const;

/**
 * Header styling with platform-specific shadow
 */
export const headerStyle = cn(
  'flex-row items-center justify-between px-4 py-3',
  'border-b border-gray-200',
  Platform.select({
    ios: 'shadow-sm',
    android: '',
    web: 'shadow-sm',
  })
);

/**
 * Card styling with platform-specific elevation
 * Provides consistent shadow/elevation across platforms
 */
export const cardStyle = cn(
  'bg-input rounded-xl border border-border/10',
  Platform.select({
    ios: 'shadow-sm',
    android: 'elevation-2',
    web: 'shadow-md',
  })
);

/**
 * Suggestion card shadow style
 * Platform-specific shadow properties for better visual consistency
 */
export const suggestionCardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
  web: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  default: {},
});
