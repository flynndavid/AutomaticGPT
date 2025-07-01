import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { OnboardingSlide } from './OnboardingSlide';
import { OnboardingIndicator } from './OnboardingIndicator';
import { useTheme } from '@/features/shared';
import { useOnboarding } from '../hooks/useOnboarding';
import { ROUTES, getSafeRoute } from '@/config/routes';
import { defaultSlides } from '../data/slides';
import { logger } from '@/lib/logger';
import { haptics } from '@/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { isDark } = useTheme();
  const { hasCompletedOnboarding, checkOnboardingStatus, completeOnboarding } = useOnboarding();

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  // Redirect if onboarding is already completed
  useEffect(() => {
    if (hasCompletedOnboarding === true) {
      const safeRoute = getSafeRoute(ROUTES.AUTH.LOGIN);
      router.replace(safeRoute as any);
    }
  }, [hasCompletedOnboarding]);

  const handleSkip = async () => {
    haptics.buttonPress();
    try {
      await completeOnboarding();
      haptics.screenTransition();
      const safeRoute = getSafeRoute(ROUTES.AUTH.LOGIN);
      router.replace(safeRoute as any);
    } catch (error) {
      haptics.error();
      logger.error('Error completing onboarding:', error);
      // Still navigate even if storage fails
      const safeRoute = getSafeRoute(ROUTES.AUTH.LOGIN);
      router.replace(safeRoute as any);
    }
  };

  const handleNext = async () => {
    haptics.buttonPress();
    if (currentIndex < defaultSlides.length - 1) {
      haptics.selection();
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      try {
        await completeOnboarding();
        haptics.success();
        const safeRoute = getSafeRoute(ROUTES.AUTH.LOGIN);
        router.replace(safeRoute as any);
      } catch (error) {
        haptics.error();
        logger.error('Error completing onboarding:', error);
        // Still navigate even if storage fails
        const safeRoute = getSafeRoute(ROUTES.AUTH.LOGIN);
        router.replace(safeRoute as any);
      }
    }
  };

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  // Don't render anything while checking onboarding status
  if (hasCompletedOnboarding === null) {
    return null;
  }

  // Don't render if onboarding is completed (will redirect)
  if (hasCompletedOnboarding === true) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f0f11' : '#fafaf9'}
      />

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

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-12 bg-background">
        <OnboardingIndicator count={defaultSlides.length} currentIndex={currentIndex} />

        <View className="flex-row justify-between items-center mt-12">
          <TouchableOpacity onPress={handleSkip} className="py-4 px-6" style={{ minWidth: 80 }}>
            <Text className="text-muted-foreground text-base font-medium">Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className="bg-primary px-8 py-4 rounded-full shadow-sm"
            style={{ minWidth: 120 }}
          >
            <Text className="text-primary-foreground text-base font-semibold text-center">
              {currentIndex === defaultSlides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
