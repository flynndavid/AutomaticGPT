import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { AuthForm } from './AuthForm';
import { AuthMethodButton } from './AuthMethodButton';
import { useTheme } from '@/features/shared';
import { useOnboarding } from '@/features/onboarding';
import { FEATURES } from '@/config/features';

export function AuthScreen() {
  const { isDark } = useTheme();
  const { resetOnboarding } = useOnboarding();
  const navigation = useNavigation();

  // Only show back button if onboarding is enabled or we can actually go back
  const shouldShowBackButton = FEATURES.enableOnboarding || navigation.canGoBack();

  const handleBack = async () => {
    try {
      await resetOnboarding();

      // Check if we can go back in the navigation stack
      if (navigation.canGoBack()) {
        // Use the navigation API directly for proper back animation
        navigation.goBack();
      } else {
        // If no back navigation is possible, use replace to go back to welcome
        if (FEATURES.enableOnboarding) {
          // Use router.replace with back parameter to trigger back animation
          router.replace({
            pathname: '/(auth)/welcome',
            params: { fromBack: 'true' },
          });
        } else {
          console.warn('No navigation path available from AuthScreen');
        }
      }
    } catch (error) {
      console.error('Error handling back navigation:', error);
      // Fallback: try to go back anyway
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f0f11' : '#fafaf9'}
      />

      {/* Back Button - Only show when it makes sense */}
      {shouldShowBackButton && (
        <View className="absolute top-12 left-6 z-10 mt-12">
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 rounded-full bg-muted items-center justify-center"
            style={{
              shadowColor: isDark ? '#000' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-muted-foreground text-xl font-medium">←</Text>
          </TouchableOpacity>
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Logo */}
            <View className="items-center mb-12">
              <Text className="text-2xl font-bold text-foreground">Welcome</Text>
              <Text className="text-base text-muted-foreground text-center mt-2">
                Sign in or create an account to continue
              </Text>
            </View>

            <View className="max-w-sm mx-auto w-full">
              <AuthForm />

              {(FEATURES.enableSmsAuth ||
                FEATURES.enableGoogleAuth ||
                FEATURES.enableAppleAuth) && (
                <View className="mt-12">
                  <View className="flex-row items-center my-8">
                    <View className="flex-1 h-px bg-border" />
                    <Text className="mx-4 text-sm text-muted-foreground">or continue with</Text>
                    <View className="flex-1 h-px bg-border" />
                  </View>

                  <View className="space-y-4 gap-2">
                    {FEATURES.enableSmsAuth && (
                      <AuthMethodButton method="sms" label="Continue with Phone" />
                    )}
                    {FEATURES.enableGoogleAuth && (
                      <AuthMethodButton method="google" label="Continue with Google" />
                    )}
                    {FEATURES.enableAppleAuth && Platform.OS === 'ios' && (
                      <AuthMethodButton method="apple" label="Continue with Apple" />
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
