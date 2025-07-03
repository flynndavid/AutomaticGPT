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
    web: 'shadow-md hover:shadow-lg transition-shadow',
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

/**
 * Web-specific responsive layout utilities
 */
export const webLayoutUtils = {
  // Main container for desktop layout
  desktopContainer: Platform.OS === 'web' ? 'max-w-7xl mx-auto' : '',
  
  // Chat content area for desktop (centered with max width)
  chatContentArea: Platform.OS === 'web' ? 'max-w-4xl mx-auto' : '',
  
  // Sidebar width for desktop
  sidebarWidth: Platform.OS === 'web' ? 'w-80' : 'w-75',
  
  // Main content area accounting for sidebar on desktop
  mainContentWithSidebar: Platform.OS === 'web' ? 'ml-80' : '',
  
  // Hide on desktop, show on mobile
  mobileOnly: Platform.OS === 'web' ? 'hidden' : '',
  
  // Show on desktop, hide on mobile
  desktopOnly: Platform.OS === 'web' ? 'block' : 'hidden',
  
  // Responsive padding for different screen sizes
  responsivePadding: Platform.OS === 'web' ? 'px-4 sm:px-6 lg:px-8' : 'px-4',
  
  // Desktop header height
  desktopHeaderHeight: Platform.OS === 'web' ? 'h-16' : 'h-14',
} as const;

/**
 * Web-specific interaction utilities
 */
export const webInteractionUtils = {
  // Hover effects for web
  hoverEffects: Platform.OS === 'web' ? 'hover:bg-gray-50 hover:shadow-sm transition-colors' : '',
  
  // Button hover effects
  buttonHover: Platform.OS === 'web' ? 'hover:opacity-80 transition-opacity' : '',
  
  // Card hover effects
  cardHover: Platform.OS === 'web' ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all' : '',
  
  // Text selection for web
  textSelection: Platform.OS === 'web' ? 'select-text' : '',
} as const;

/**
 * Platform-specific container styles
 */
export const platformContainer = Platform.select({
  web: 'min-h-screen flex flex-row bg-background',
  default: 'flex-1 bg-background',
});

/**
 * Responsive breakpoint utilities for web
 */
export const breakpointUtils = {
  // Hide on mobile screens
  hideMobile: Platform.OS === 'web' ? 'hidden md:block' : 'hidden',
  
  // Hide on desktop screens  
  hideDesktop: Platform.OS === 'web' ? 'md:hidden' : '',
  
  // Responsive grid
  responsiveGrid: Platform.OS === 'web' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
  
  // Responsive text sizes
  responsiveText: Platform.OS === 'web' ? 'text-sm md:text-base lg:text-lg' : 'text-base',
} as const;
