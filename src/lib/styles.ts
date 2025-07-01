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
 */
export const cardStyle = cn(
  'bg-white rounded-xl p-4',
  Platform.select({
    ios: 'shadow-sm',
    android: '',
    web: 'shadow-sm',
  })
);
