import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTheme } from '@/features/shared';
import type { OnboardingSlide as OnboardingSlideType } from '../data/slides';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlideProps {
  slide: OnboardingSlideType;
}

export function OnboardingSlide({ slide }: OnboardingSlideProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="flex-1 bg-background items-center justify-center px-8"
    >
      <View className="items-center max-w-sm">
        {/* Icon placeholder - using emoji as icon */}
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-12">
          <Text className="text-4xl">{slide.icon}</Text>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-center text-foreground mb-6 tracking-tight">
          {slide.title}
        </Text>

        {/* Description */}
        <Text className="text-lg text-center leading-relaxed text-muted-foreground">
          {slide.description}
        </Text>
      </View>
    </View>
  );
}
