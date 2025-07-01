import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const KeyboardPaddingView =
  process.env.EXPO_OS === 'web'
    ? () => null
    : () => {
        const keyboard = useAnimatedKeyboard();
        const { bottom } = useSafeAreaInsets();

        const keyboardHeightStyle = useAnimatedStyle(() => {
          const keyboardHeight = keyboard.height.get();
          // Only add the difference between keyboard height and safe area bottom
          // This prevents double padding since SafeAreaView already handles bottom inset
          return {
            height: keyboardHeight > 0 ? Math.max(keyboardHeight - bottom, 0) : 0,
          };
        });

        return <Animated.View style={keyboardHeightStyle} />;
      };
