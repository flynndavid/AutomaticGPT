import '../global.css';
import '@/utils/fetch-polyfill';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { SplashScreen } from '@/features/splash';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/features/shared';
import { FEATURES } from '@/config/features';

export { ErrorBoundary } from 'expo-router';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      // Add any initialization logic here (fonts, etc.)
      setTimeout(async () => {
        setIsReady(true);
        await ExpoSplashScreen.hideAsync();
      }, 2000);
    };

    initializeApp();
  }, []);

  if (!isReady && FEATURES.enableSplashOnboarding) {
    return <SplashScreen appName="MyApp" />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="index" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
