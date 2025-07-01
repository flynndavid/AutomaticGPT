import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/features/auth';
import { FEATURES } from '@/config/features';
import { useEffect } from 'react';

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Add logging to debug auth state changes
  useEffect(() => {
    console.log('[APP_LAYOUT] Auth state changed:', {
      isAuthenticated,
      isLoading,
      userId: user?.id,
      enableAuth: FEATURES.enableAuth,
    });
  }, [isAuthenticated, isLoading, user]);

  // Show loading state while checking auth
  if (isLoading) {
    console.log('[APP_LAYOUT] Showing loading state');
    return null; // Or a loading component
  }

  // Redirect to auth if not authenticated and auth is enabled
  if (!isAuthenticated && FEATURES.enableAuth) {
    console.log('[APP_LAYOUT] Redirecting to auth - user not authenticated');
    return <Redirect href="/(auth)/welcome" />;
  }

  console.log('[APP_LAYOUT] Rendering app content');
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
