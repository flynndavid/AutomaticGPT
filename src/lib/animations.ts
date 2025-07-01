import { runOnJS, withTiming, withSpring, type SharedValue } from 'react-native-reanimated';

/**
 * Safe animation utilities for React Native Reanimated v3
 * These utilities ensure proper worklet usage and prevent native crashes
 */

/**
 * Safely animate a value with a callback
 * Ensures callback is executed on the JS thread using runOnJS
 */
export const safeAnimateWithCallback = (
  value: number,
  callback: () => void,
  config?: Parameters<typeof withTiming>[1]
) => {
  'worklet';
  return withTiming(value, config, (finished) => {
    if (finished) {
      runOnJS(callback)();
    }
  });
};

/**
 * Safely animate with spring and callback
 * Ensures callback is executed on the JS thread using runOnJS
 */
export const safeSpringWithCallback = (
  value: number,
  callback: () => void,
  config?: Parameters<typeof withSpring>[1]
) => {
  'worklet';
  return withSpring(value, config, (finished) => {
    if (finished) {
      runOnJS(callback)();
    }
  });
};

/**
 * Safe shared value setter with callback
 * Updates a shared value and executes a callback on the JS thread
 */
export const safeSetValueWithCallback = (
  sharedValue: SharedValue<number>,
  newValue: number,
  callback: () => void
) => {
  'worklet';
  sharedValue.value = newValue;
  runOnJS(callback)();
};

/**
 * Safe function executor for worklets
 * Wraps any function to be safely callable from a worklet
 */
export const safeRunOnJS = <T extends (...args: any[]) => any>(fn: T) => {
  'worklet';
  return (...args: Parameters<T>) => {
    runOnJS(fn)(...args);
  };
};

/**
 * Animation configuration presets
 */
export const animationConfigs = {
  fast: { duration: 200 },
  normal: { duration: 300 },
  slow: { duration: 500 },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  bouncy: {
    damping: 10,
    stiffness: 100,
    mass: 0.8,
  },
} as const;

/**
 * Screen transition animations for Expo Router
 */
export const screenTransitions = {
  // For initial app load - smooth fade in
  fadeIn: {
    animation: 'fade' as const,
    animationDuration: 400,
  },

  // For forward navigation - slide from right
  slideFromRight: {
    animation: 'slide_from_right' as const,
    animationDuration: 300,
  },

  // For back navigation - slide to right (opposite of slideFromRight)
  slideToRight: {
    animation: 'slide_from_left' as const,
    animationDuration: 300,
  },

  // Alternative back animation that actually slides to the right
  slideBackToRight: {
    animation: 'slide_from_right' as const,
    animationDuration: 300,
    animationTypeForReplace: 'pop' as const,
  },

  // For modal presentations
  slideFromBottom: {
    animation: 'slide_from_bottom' as const,
    animationDuration: 350,
  },
} as const;
