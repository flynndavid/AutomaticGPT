import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth';
import { FEATURES } from '@/config/features';
import { View, ActivityIndicator } from 'react-native';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading indicator while auth is bootstrapping
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Auth is disabled - go to app
  if (!FEATURES.enableAuth) {
    return <Redirect href="/(app)" />;
  }

  // Declarative navigation based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  } else {
    return <Redirect href="/(auth)/welcome" />;
  }
}
