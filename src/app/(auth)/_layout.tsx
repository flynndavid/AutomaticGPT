import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/features/auth';
import { FEATURES } from '@/config/features';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return null; // Or a loading component
  }

  // Redirect to app if already authenticated
  if (user && FEATURES.enableAuth) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
