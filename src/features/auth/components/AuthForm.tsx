import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthForm } from '../hooks/useAuthForm';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const { submit, loading, error } = useAuthForm();

  const handleSubmit = async () => {
    try {
      await submit({ email, password, fullName, mode });
    } catch (error) {
      // Error is handled by the hook
      console.error('Auth form submission error:', error);
    }
  };

  const isFormValid = email && password && (mode === 'login' || fullName);

  return (
    <View className="space-y-4">
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3">
          <Text className="text-red-700 text-sm">{error}</Text>
        </View>
      )}

      {mode === 'signup' && (
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-base border border-gray-200"
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>
      )}

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-base border border-gray-200"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          className="w-full px-4 py-3 bg-gray-50 rounded-lg text-base border border-gray-200"
          secureTextEntry
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !isFormValid}
        className={`w-full py-4 rounded-lg items-center ${
          loading || !isFormValid 
            ? 'bg-gray-300' 
            : 'bg-blue-500'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-base font-semibold">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
        className="py-2"
      >
        <Text className="text-center text-blue-500">
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}