import React, { lazy } from 'react';
import { View, ActivityIndicator } from 'react-native';

/**
 * Lazy-loaded components for bundle size optimization
 * These components are only loaded when actually needed
 */

// Analytics Dashboard - Heavy component with complex calculations
export const LazyAnalyticsDashboard = lazy(() => 
  import('../features/chat/components/AnalyticsDashboard').then(module => ({ 
    default: module.AnalyticsDashboard 
  }))
);

// Onboarding Screen - Only needed for first-time users
export const LazyOnboardingScreen = lazy(() => 
  import('../features/onboarding/components/OnboardingScreen').then(module => ({ 
    default: module.OnboardingScreen 
  }))
);

// Conversation Analytics Hook - Heavy calculations
export const LazyConversationAnalytics = lazy(() => 
  import('../features/chat/hooks/useConversationAnalytics')
);

// Auth components - Only needed when not authenticated
export const LazyAuthScreen = lazy(() => 
  import('../features/auth/components/AuthScreen').then(module => ({ 
    default: module.AuthScreen 
  }))
);

// Splash Screen - Only needed during app initialization
export const LazySplashScreen = lazy(() => 
  import('../features/splash/components/SplashScreen').then(module => ({ 
    default: module.SplashScreen 
  }))
);

/**
 * Loading skeleton components for lazy-loaded features
 */
export const AnalyticsLoadingSkeleton: React.FC = () => (
  <View className="flex-1 items-center justify-center p-4">
    <View className="animate-pulse">
      <View className="h-4 bg-gray-300 rounded w-3/4 mb-4" />
      <View className="h-4 bg-gray-300 rounded w-1/2 mb-4" />
      <View className="h-4 bg-gray-300 rounded w-5/6" />
    </View>
  </View>
);

export const FeatureLoadingSkeleton: React.FC = () => (
  <View className="flex-1 items-center justify-center">
    <ActivityIndicator size="large" color="#3b82f6" />
  </View>
);

export const AppLoadingSkeleton: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-background">
    <View className="animate-pulse flex flex-col items-center">
      <View className="h-12 w-12 bg-gray-300 rounded-full mb-4" />
      <View className="h-4 bg-gray-300 rounded w-32" />
    </View>
  </View>
);