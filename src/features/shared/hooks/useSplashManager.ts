import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FEATURES } from '@/config/features';

export function useSplashManager() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [appReady, setAppReady] = useState(false);

  // Hide splash immediately when auth state is determined (success or failure)
  useEffect(() => {
    if (!authLoading && appReady) {
      // Auth is no longer loading and app is ready - hide splash
      console.log('[SPLASH] Auth state determined, hiding splash');
    }
  }, [authLoading, appReady, isAuthenticated]);

  const shouldShowSplash = useMemo(() => {
    if (!FEATURES.enableSplashOnboarding) return false;

    // Only show splash if app is not ready AND auth is still loading
    // This prevents splash from showing after auth operations complete
    return !appReady && authLoading;
  }, [appReady, authLoading]);

  return {
    shouldShowSplash,
    setAppReady,
    isAppReady: appReady,
    isAuthLoading: authLoading,
  };
}
