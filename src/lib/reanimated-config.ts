import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Configure Reanimated logger to disable strict mode warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disable strict mode
});
