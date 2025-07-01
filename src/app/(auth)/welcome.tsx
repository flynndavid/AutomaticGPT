import { OnboardingScreen } from '@/features/onboarding';
import { AuthScreen } from '@/features/auth';
import { FEATURES } from '@/config/features';

export default function WelcomeScreen() {
  // If onboarding is disabled, go directly to auth
  if (!FEATURES.enableOnboarding) {
    return <AuthScreen />;
  }

  // Show onboarding flow
  return <OnboardingScreen />;
}
