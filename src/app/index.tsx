import { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { useAuth } from '@/features/auth';
import { FEATURES } from '@/config/features';

export default function IndexScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // If auth is disabled, go directly to app
  if (!FEATURES.enableAuth) {
    return <Redirect href="/(app)" />;
  }

  // Redirect based on auth status
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  } else {
    return <Redirect href="/(auth)/welcome" />;
  }
}
