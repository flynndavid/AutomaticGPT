import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import type { OnboardingSlide as OnboardingSlideType } from '../data/slides';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlideProps {
  slide: OnboardingSlideType;
}

export function OnboardingSlide({ slide }: OnboardingSlideProps) {
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: slide.backgroundColor || '#ffffff',
      }}
      className="flex-1 items-center justify-center px-8"
    >
      {slide.image && (
        <Image
          source={slide.image}
          className="w-64 h-64 mb-12"
          resizeMode="contain"
        />
      )}

      <View className="items-center space-y-6 max-w-sm">
        <Text className="text-4xl font-bold text-white text-center">
          {slide.title}
        </Text>
        
        <Text className="text-lg text-white/90 text-center leading-relaxed">
          {slide.description}
        </Text>
      </View>
    </View>
  );
}