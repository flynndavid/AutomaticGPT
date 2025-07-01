import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/features/shared';

interface MessageSkeletonProps {
  isUser?: boolean;
  count?: number;
}

/**
 * Skeleton loading animation for chat messages
 * Provides perceived performance improvement during loading
 */
export function MessageSkeleton({ isUser = false, count = 1 }: MessageSkeletonProps) {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const skeletonColor = isDark ? 'bg-gray-700' : 'bg-gray-300';
  const avatarColor = isDark ? 'bg-gray-600' : 'bg-gray-400';

  const renderSkeleton = () => (
    <View className={`flex-row items-end gap-2 mb-4 ${isUser ? 'self-end flex-row-reverse' : ''}`}>
      {!isUser && (
        <Animated.View
          style={animatedStyle}
          className={`w-8 h-8 ${avatarColor} rounded-full`}
        />
      )}
      <View
        className={`${skeletonColor} p-3 rounded-2xl max-w-[85%] ${
          isUser ? 'rounded-br-none' : 'rounded-bl-none'
        }`}
      >
        <Animated.View
          style={animatedStyle}
          className={`h-4 ${isDark ? 'bg-gray-600' : 'bg-gray-400'} rounded mb-2`}
        />
        <Animated.View
          style={animatedStyle}
          className={`h-4 ${isDark ? 'bg-gray-600' : 'bg-gray-400'} rounded w-3/4`}
        />
      </View>
    </View>
  );

  return (
    <>{Array.from({ length: count }, (_, index) => (
      <View key={index}>{renderSkeleton()}</View>
    ))}</>
  );
}

/**
 * Skeleton for conversation list items
 */
export function ConversationSkeleton() {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 1200 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const skeletonColor = isDark ? 'bg-gray-700' : 'bg-gray-300';
  const avatarColor = isDark ? 'bg-gray-600' : 'bg-gray-400';

  return (
    <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <Animated.View
        style={animatedStyle}
        className={`w-12 h-12 ${avatarColor} rounded-full mr-3`}
      />
      <View className="flex-1">
        <Animated.View
          style={animatedStyle}
          className={`h-4 ${skeletonColor} rounded mb-2 w-3/4`}
        />
        <Animated.View
          style={animatedStyle}
          className={`h-3 ${skeletonColor} rounded w-1/2`}
        />
      </View>
      <Animated.View
        style={animatedStyle}
        className={`w-16 h-3 ${skeletonColor} rounded`}
      />
    </View>
  );
}