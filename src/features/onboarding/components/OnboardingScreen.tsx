import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { router } from 'expo-router';
import { OnboardingSlide } from './OnboardingSlide';
import { OnboardingIndicator } from './OnboardingIndicator';
import { defaultSlides } from '../data/slides';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (currentIndex < defaultSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={defaultSlides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => <OnboardingSlide slide={item} />}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-12">
        <OnboardingIndicator
          count={defaultSlides.length}
          currentIndex={currentIndex}
        />

        <View className="flex-row justify-between mt-8">
          <TouchableOpacity onPress={handleSkip} className="p-4">
            <Text className="text-gray-600 text-base">Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className="bg-blue-500 px-8 py-4 rounded-full"
          >
            <Text className="text-white text-base font-semibold">
              {currentIndex === defaultSlides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}