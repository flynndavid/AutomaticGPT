import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuthForm } from '../hooks/useAuthForm';
import { useTheme } from '@/features/shared';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const { submit, loading } = useAuthForm();
  const { isDark } = useTheme();

  // Check if Supabase is configured
  const isSupabaseConfigured = !!(
    process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSubmit = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Setup Required',
        'Supabase authentication is not configured. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
      );
      return;
    }

    try {
      await submit({ email, password, fullName, mode });
    } catch (error) {
      // Error handling is now done in useAuthForm, but we can still show alerts for critical errors
      console.error('Auth form error:', error);
    }
  };

  return (
    <View className="space-y-5">
      {!isSupabaseConfigured && (
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-2">
          <Text className="text-amber-800 text-sm font-medium mb-1">Setup Required</Text>
          <Text className="text-amber-700 text-sm">
            To use authentication, please configure Supabase in your .env.local file.
          </Text>
        </View>
      )}

      <View className="space-y-4 gap-4">
        {mode === 'signup' && (
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
              className="w-full px-4 py-4 bg-input rounded-xl text-base text-foreground border border-border"
              autoCapitalize="words"
            />
          </View>
        )}

        <View>
          <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
            className="w-full px-4 py-4 bg-input rounded-xl text-base text-foreground border border-border"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
            className="w-full px-4 py-4 bg-input rounded-xl text-base text-foreground border border-border"
            secureTextEntry
            autoComplete="password"
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !isSupabaseConfigured}
        className="w-full bg-primary py-4 rounded-xl items-center mt-8 shadow-sm"
        style={{ opacity: loading || !isSupabaseConfigured ? 0.7 : 1 }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-primary-foreground text-base font-semibold">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
        className="py-3"
      >
        <Text className="text-center text-primary font-medium">
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
