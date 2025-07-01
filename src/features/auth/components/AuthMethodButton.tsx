import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

type AuthMethod = 'sms' | 'google' | 'apple';

interface AuthMethodButtonProps {
  method: AuthMethod;
  label: string;
  onPress?: () => void;
}

const getMethodIcon = (method: AuthMethod): string => {
  switch (method) {
    case 'sms':
      return '📱';
    case 'google':
      return '🔍';
    case 'apple':
      return '🍎';
    default:
      return '🔐';
  }
};

const getMethodColor = (method: AuthMethod): string => {
  switch (method) {
    case 'sms':
      return 'bg-green-500';
    case 'google':
      return 'bg-red-500';
    case 'apple':
      return 'bg-black';
    default:
      return 'bg-gray-500';
  }
};

export function AuthMethodButton({ method, label, onPress }: AuthMethodButtonProps) {
  const handlePress = () => {
    // TODO: Implement actual auth method handlers
    console.log(`${method} auth pressed`);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`w-full py-4 px-6 rounded-lg flex-row items-center justify-center space-x-3 ${getMethodColor(method)}`}
    >
      <Text className="text-xl">{getMethodIcon(method)}</Text>
      <Text className="text-white text-base font-semibold">{label}</Text>
    </TouchableOpacity>
  );
}