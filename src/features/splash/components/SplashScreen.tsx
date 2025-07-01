import React from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface SplashScreenProps {
  appName?: string;
  logoSource?: any;
  backgroundSource?: any;
}

export function SplashScreen({
  appName = 'MyApp',
  logoSource,
  backgroundSource,
}: SplashScreenProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      className="flex-1 items-center justify-center bg-white"
    >
      {backgroundSource && (
        <Image
          source={backgroundSource}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
      )}

      <View className="items-center space-y-8">
        {logoSource && <Image source={logoSource} className="w-32 h-32" resizeMode="contain" />}

        <Text className="text-3xl font-bold text-gray-900">{appName}</Text>

        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    </Animated.View>
  );
}
