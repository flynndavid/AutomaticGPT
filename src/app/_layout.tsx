import '../global.css';
import '@/utils/fetch-polyfill';

import { Stack } from 'expo-router';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { ThemeProvider } from '@/features/shared';

export { ErrorBoundary } from 'expo-router';

// These are the default stack options for iOS, they disable on other platforms.
const DEFAULT_STACK_HEADER: NativeStackNavigationOptions =
  process.env.EXPO_OS !== 'ios'
    ? {}
    : {
        headerTransparent: false,
        headerShadowVisible: true,
        headerLargeTitleShadowVisible: false,
      };

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={DEFAULT_STACK_HEADER}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
