import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth';
import { FEATURES } from '@/config/features';
import { useEffect } from 'react';

export default function IndexScreen() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Add logging to debug initial routing
  useEffect(() => {
    console.log('[INDEX] Initial routing decision:', {
      isAuthenticated,
      isLoading,
      userId: user?.id,
      enableAuth: FEATURES.enableAuth,
    });
  }, [isAuthenticated, isLoading, user]);

  // Don't render anything while loading - splash is handled by _layout
  if (isLoading) {
    console.log('[INDEX] Loading - showing splash');
    return null;
  }

  // If auth is disabled, go directly to app
  if (!FEATURES.enableAuth) {
    console.log('[INDEX] Auth disabled - redirecting to app');
    return <Redirect href="/(app)" />;
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    console.log('[INDEX] User authenticated - redirecting to app');
    return <Redirect href="/(app)" />;
  }

  console.log('[INDEX] User not authenticated - redirecting to auth');
  return <Redirect href="/(auth)/welcome" />;
}
