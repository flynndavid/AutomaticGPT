import React from 'react';
import { View, Platform } from 'react-native';
import { platformContainer, webLayoutUtils } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface WebLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

/**
 * WebLayout - Responsive layout component that provides:
 * - Desktop: Persistent sidebar + main content area
 * - Mobile: Full-screen content (sidebar handled separately as overlay)
 */
export function WebLayout({ children, sidebar, showSidebar = false, className }: WebLayoutProps) {
  // On mobile, just render children normally (sidebar is handled as overlay)
  if (Platform.OS !== 'web') {
    return <View className={cn('flex-1 bg-background', className)}>{children}</View>;
  }

  // Desktop layout with persistent sidebar
  return (
    <View className={cn(platformContainer, className)}>
      {/* Desktop Sidebar - Always visible on large screens */}
      {sidebar && showSidebar && (
        <View
          className={cn(
            'fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border',
            webLayoutUtils.sidebarWidth,
            webLayoutUtils.desktopOnly
          )}
        >
          {sidebar}
        </View>
      )}

      {/* Main Content Area */}
      <View
        className={cn(
          'flex-1 min-h-screen bg-background',
          showSidebar && Platform.OS === 'web' ? webLayoutUtils.mainContentWithSidebar : ''
        )}
      >
        {children}
      </View>
    </View>
  );
}

/**
 * WebContainer - Responsive container for content sections
 */
export function WebContainer({
  children,
  className,
  maxWidth = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'none' | 'default' | 'narrow' | 'wide';
}) {
  const maxWidthClass = Platform.OS === 'web' ? {
    none: '',
    default: 'max-w-4xl mx-auto',
    narrow: 'max-w-2xl mx-auto', 
    wide: 'max-w-6xl mx-auto',
  }[maxWidth] : '';

  return (
    <View className={cn(maxWidthClass, webLayoutUtils.responsivePadding, className)}>
      {children}
    </View>
  );
}