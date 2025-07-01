import { Stack, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/features/auth';
import { useEffect } from 'react';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Add logging to debug auth state changes
  useEffect(() => {
    console.log('[AUTH_LAYOUT] Auth state changed:', {
      isAuthenticated,
      isLoading,
      userId: user?.id,
    });
  }, [isAuthenticated, isLoading, user]);

  // Show loading state while checking auth
  if (isLoading) {
    console.log('[AUTH_LAYOUT] Showing loading state');
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  // Redirect to app if already authenticated
  if (isAuthenticated) {
    console.log('[AUTH_LAYOUT] Redirecting to app - user already authenticated');
    return <Redirect href="/(app)" />;
  }

  console.log('[AUTH_LAYOUT] Rendering auth screens');

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="welcome">
      <Stack.Screen
        name="welcome"
        options={({ route }) => {
          // Check if coming from back navigation
          const isFromBack = (route.params as any)?.fromBack === 'true';
          return {
            animation: isFromBack ? 'slide_from_left' : 'slide_from_right',
            animationDuration: 300,
          };
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      />
    </Stack>
  );
}
