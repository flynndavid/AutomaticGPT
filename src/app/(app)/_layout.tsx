import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/features/auth';
import { FEATURES } from '@/config/features';

export default function AppLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return null; // Or a loading component
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated && FEATURES.enableAuth) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
