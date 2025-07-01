import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '@/features/shared';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

interface AuthMethodButtonProps {
  method: 'google' | 'apple' | 'sms';
  label: string;
  onPress?: () => void;
}

export function AuthMethodButton({ method, label, onPress }: AuthMethodButtonProps) {
  const { isDark } = useTheme();

  const renderIcon = () => {
    const containerStyle = {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

    switch (method) {
      case 'google':
        return (
          <View style={containerStyle}>
            <FontAwesome6 name="google" size={18} color={isDark ? '#ffffff' : '#000000'} />
          </View>
        );
      case 'apple':
        return (
          <View style={containerStyle}>
            <FontAwesome6 name="apple" size={18} color={isDark ? '#ffffff' : '#000000'} />
          </View>
        );
      case 'sms':
        return (
          <View style={containerStyle}>
            <FontAwesome6 name="mobile-screen" size={18} color={isDark ? '#ffffff' : '#000000'} />
          </View>
        );
      default:
        return null;
    }
  };

  const handlePress = () => {
    // TODO: Implement actual auth methods
    console.log(`${method} auth not implemented yet`);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-full flex-row items-center justify-center py-4 px-6 rounded-xl border border-border bg-card"
      style={{
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View className="mr-3">{renderIcon()}</View>
      <Text className="text-base font-medium text-foreground">{label}</Text>
    </TouchableOpacity>
  );
}
