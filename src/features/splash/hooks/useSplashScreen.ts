import { useEffect, useState } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';

interface UseSplashScreenOptions {
  minimumDuration?: number;
  onComplete?: () => void;
}

export function useSplashScreen({
  minimumDuration = 2000,
  onComplete,
}: UseSplashScreenOptions = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Prevent auto-hide while we're loading
      await ExpoSplashScreen.preventAutoHideAsync();

      // Simulate app initialization (fonts, assets, etc.)
      // In a real app, you'd load actual resources here
      const startTime = Date.now();

      // Your app initialization logic here
      // await loadFonts();
      // await loadAssets();
      // await checkAuthState();

      // Ensure minimum duration is met
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumDuration - elapsedTime);

      setTimeout(async () => {
        setIsReady(true);
        setIsVisible(false);
        await ExpoSplashScreen.hideAsync();
        onComplete?.();
      }, remainingTime);
    };

    initializeApp();
  }, [minimumDuration, onComplete]);

  return {
    isReady,
    isVisible,
  };
}
