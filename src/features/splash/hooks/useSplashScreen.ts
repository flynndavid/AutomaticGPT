import { useEffect, useState } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';

interface UseSplashScreenOptions {
  minDisplayTime?: number;
  onReady?: () => void;
}

export function useSplashScreen({ minDisplayTime = 2000, onReady }: UseSplashScreenOptions = {}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Keep the splash screen visible while we fetch resources
    ExpoSplashScreen.preventAutoHideAsync();

    // Simulate app initialization
    const timer = setTimeout(async () => {
      setIsReady(true);
      await ExpoSplashScreen.hideAsync();
      onReady?.();
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onReady]);

  return { isReady };
}