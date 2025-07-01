import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthForm } from './AuthForm';
import { AuthMethodButton } from './AuthMethodButton';
import { FEATURES } from '@/config/features';

export function AuthScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-gray-600">
              Sign in or create an account to continue
            </Text>
          </View>

          <AuthForm />

          {(FEATURES.enableSmsAuth || FEATURES.enableGoogleAuth || FEATURES.enableAppleAuth) && (
            <>
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500">or continue with</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <View className="space-y-3">
                {FEATURES.enableSmsAuth && (
                  <AuthMethodButton
                    method="sms"
                    label="Continue with Phone"
                  />
                )}
                {FEATURES.enableGoogleAuth && (
                  <AuthMethodButton
                    method="google"
                    label="Continue with Google"
                  />
                )}
                {FEATURES.enableAppleAuth && Platform.OS === 'ios' && (
                  <AuthMethodButton
                    method="apple"
                    label="Continue with Apple"
                  />
                )}
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}