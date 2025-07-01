import React from 'react';
import { View } from 'react-native';

interface OnboardingIndicatorProps {
  count: number;
  currentIndex: number;
}

export function OnboardingIndicator({ count, currentIndex }: OnboardingIndicatorProps) {
  return (
    <View className="flex-row justify-center space-x-2">
      {[...Array(count)].map((_, index) => (
        <View
          key={index}
          className={`w-2 h-2 rounded-full ${
            index === currentIndex ? 'bg-white' : 'bg-white/30'
          }`}
        />
      ))}
    </View>
  );
}