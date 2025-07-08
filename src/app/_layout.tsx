import '../global.css';
import '@/utils/fetch-polyfill';
import '@/lib/reanimated-config';

import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { SplashScreen } from '@/features/splash';
import { AuthProvider, useAuth } from '@/features/auth';
import { ThemeProvider, ErrorAlert, useSplashManager } from '@/features/shared';
import { screenTransitions } from '@/lib/animations';

export { ErrorBoundary } from 'expo-router';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

// Disable Reanimated strict mode warnings
LogBox.ignoreLogs([
  '[Reanimated] Reading from `value` during component render',
  '[Reanimated] Writing to `value` during component render',
]);

function RootLayoutNav() {
  const { error, clearError } = useAuth();
  const { shouldShowSplash, setAppReady } = useSplashManager();

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      // Add any initialization logic here (fonts, etc.)
      setTimeout(async () => {
        setAppReady(true);
        // Always hide the native splash once React is ready
        await ExpoSplashScreen.hideAsync();
      }, 300); // Reduced from 1500ms to 300ms for faster transitions
    };

    initializeApp();
  }, [setAppReady]);

  // Show splash screen if enabled and conditions require it
  if (shouldShowSplash) {
    return <SplashScreen appName="Automatic ExpoGPT" />;
  }

  return (
    <>
      {error && (
        <ErrorAlert
          error={error}
          onDismiss={clearError}
          title="Authentication Error"
          showAlert={true}
        />
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            animationTypeForReplace: 'push',
            ...screenTransitions.fadeIn,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            ...screenTransitions.slideFromRight,
          }}
        />
        <Stack.Screen
          name="(app)"
          options={{
            ...screenTransitions.slideFromRight,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
