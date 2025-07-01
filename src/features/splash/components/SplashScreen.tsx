import React from 'react';
import { View, StatusBar, Image } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/features/shared';

interface SplashScreenProps {
  appName?: string;
}

export function SplashScreen({ appName = 'MyApp' }: SplashScreenProps) {
  const { isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      className="flex-1 items-center justify-center bg-background"
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f0f11' : '#fafaf9'}
      />

      {/* Simple Logo Icon */}
      <Animated.View
        entering={FadeIn.delay(200).duration(600)}
        className="items-center justify-center"
      >
        <Image
          source={require('../../../../assets/images/logo_icon.png')}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}
