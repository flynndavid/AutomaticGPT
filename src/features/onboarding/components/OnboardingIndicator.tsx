import React from 'react';
import { View } from 'react-native';

interface OnboardingIndicatorProps {
  count: number;
  currentIndex: number;
}

export function OnboardingIndicator({ count, currentIndex }: OnboardingIndicatorProps) {
  return (
    <View className="flex-row justify-center items-center space-x-2">
      {[...Array(count)].map((_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === currentIndex ? 'bg-primary w-8' : 'bg-muted-foreground w-2'
          }`}
          style={{
            opacity: index === currentIndex ? 1 : 0.4,
          }}
        />
      ))}
    </View>
  );
}
