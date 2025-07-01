/**
 * Centralized configuration for the application
 * Handles environment variables, feature flags, and app settings
 */
import { FEATURES, validateTemplateFeatures, getEnabledFeatures } from './features';

/**
 * Type-safe environment variable getter with fallback support
 */
const getEnvVar = (key: string, fallback?: string): string => {
  // eslint-disable-next-line expo/no-dynamic-env-var
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || fallback || '';
};

/**
 * Boolean environment variable getter
 */
const getBooleanEnvVar = (key: string, fallback: boolean = false): boolean => {
  // eslint-disable-next-line expo/no-dynamic-env-var
  const value = process.env[key];
  if (!value) return fallback;
  return value.toLowerCase() === 'true';
};

/**
 * Number environment variable getter
 */
const getNumberEnvVar = (key: string, fallback?: number): number => {
  // eslint-disable-next-line expo/no-dynamic-env-var
  const value = process.env[key];
  if (!value) {
    if (fallback === undefined) {
      throw new Error(`Missing required numeric environment variable: ${key}`);
    }
    return fallback;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid numeric value for environment variable ${key}: ${value}`);
  }
  return parsed;
};

/**
 * Application configuration object
 * All environment variables and settings are centralized here
 */
export const config = {
  // API Configuration
  api: {
    baseUrl: getEnvVar('EXPO_PUBLIC_API_URL', 'http://localhost:8081'),
    timeout: getNumberEnvVar('EXPO_PUBLIC_API_TIMEOUT', 10000),
    retryAttempts: getNumberEnvVar('EXPO_PUBLIC_API_RETRY_ATTEMPTS', 3),
  },

  // AI/Chat Configuration
  ai: {
    maxMessages: getNumberEnvVar('EXPO_PUBLIC_MAX_MESSAGES', 100),
    defaultTemperature: getNumberEnvVar('EXPO_PUBLIC_DEFAULT_TEMPERATURE', 0.7),
    maxTokens: getNumberEnvVar('EXPO_PUBLIC_MAX_TOKENS', 2000),
    streamingEnabled: getBooleanEnvVar('EXPO_PUBLIC_STREAMING_ENABLED', true),
  },

  // Supabase Configuration (Phase 2.1)
  supabase: {
    url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', ''),
    anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', ''),
    isConfigured: Boolean(
      process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    ),
  },

  // Feature Flags (imported from features.ts)
  features: FEATURES,

  // UI Configuration
  ui: {
    animationDuration: getNumberEnvVar('EXPO_PUBLIC_ANIMATION_DURATION', 300),
    maxMessageLength: getNumberEnvVar('EXPO_PUBLIC_MAX_MESSAGE_LENGTH', 1000),
    messagesPerPage: getNumberEnvVar('EXPO_PUBLIC_MESSAGES_PER_PAGE', 50),
    enableAnimations: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_ANIMATIONS', true),
  },

  // Branding Configuration (Template features)
  branding: {
    appName: getEnvVar('EXPO_PUBLIC_APP_NAME', 'Template App'),
    appVersion: getEnvVar('EXPO_PUBLIC_APP_VERSION', '1.0.0'),
    buildNumber: getEnvVar('EXPO_PUBLIC_BUILD_NUMBER', '1'),
    environment: getEnvVar('EXPO_PUBLIC_ENVIRONMENT', 'development'),
    colors: {
      primary: getEnvVar('EXPO_PUBLIC_PRIMARY_COLOR', '#3B82F6'),
      secondary: getEnvVar('EXPO_PUBLIC_SECONDARY_COLOR', '#64748B'),
    },
    assets: {
      logo: getEnvVar('EXPO_PUBLIC_LOGO_URL', '/assets/logo.png'),
      icon: getEnvVar('EXPO_PUBLIC_ICON_URL', '/assets/icon.png'),
      splash: getEnvVar('EXPO_PUBLIC_SPLASH_URL', '/assets/splash.png'),
    },
    theme: {
      mode: getEnvVar('EXPO_PUBLIC_THEME_MODE', 'system') as 'light' | 'dark' | 'system',
    },
  },

  // Development Configuration
  dev: {
    enableDebugMode: getBooleanEnvVar('EXPO_PUBLIC_DEBUG_MODE', __DEV__),
    enableConsoleLogging: getBooleanEnvVar('EXPO_PUBLIC_CONSOLE_LOGGING', __DEV__),
    enablePerformanceMonitoring: getBooleanEnvVar('EXPO_PUBLIC_PERFORMANCE_MONITORING', false),
    mockApiResponses: getBooleanEnvVar('EXPO_PUBLIC_MOCK_API', false),
  },

  // Legacy app configuration (for backward compatibility)
  app: {
    name: getEnvVar('EXPO_PUBLIC_APP_NAME', 'Chat App'),
    version: getEnvVar('EXPO_PUBLIC_APP_VERSION', '1.0.0'),
    buildNumber: getEnvVar('EXPO_PUBLIC_BUILD_NUMBER', '1'),
    environment: getEnvVar('EXPO_PUBLIC_ENVIRONMENT', 'development'),
  },
} as const;

/**
 * Configuration validation
 * Ensures all required environment variables are present
 */
export const validateConfig = (): void => {
  const requiredVars = ['EXPO_PUBLIC_API_URL'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate numeric ranges
  if (config.ai.defaultTemperature < 0 || config.ai.defaultTemperature > 2) {
    throw new Error('EXPO_PUBLIC_DEFAULT_TEMPERATURE must be between 0 and 2');
  }

  if (config.ui.animationDuration < 0) {
    throw new Error('EXPO_PUBLIC_ANIMATION_DURATION must be a positive number');
  }

  // Validate template features
  const featureWarnings = validateTemplateFeatures();
  if (featureWarnings.length > 0) {
    console.warn('Template feature validation warnings:', featureWarnings);
  }
};

/**
 * Feature flag checker utility (backward compatibility)
 */
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};

/**
 * Environment checker utilities
 */
export const isDevelopment = (): boolean => config.app.environment === 'development';
export const isProduction = (): boolean => config.app.environment === 'production';
export const isStaging = (): boolean => config.app.environment === 'staging';

/**
 * Debug logging utility that respects configuration
 */
export const debugLog = (...args: any[]): void => {
  if (config.dev.enableConsoleLogging) {
    console.log('[DEBUG]', ...args);
  }
};

/**
 * Configuration summary for debugging
 */
export const getConfigSummary = (): Record<string, any> => {
  const enabledFeatures = getEnabledFeatures();

  return {
    environment: config.app.environment,
    appName: config.branding.appName,
    featuresEnabled: enabledFeatures.all,
    coreFeatures: enabledFeatures.core,
    templateFeatures: enabledFeatures.template,
    apiBaseUrl: config.api.baseUrl,
    debugMode: config.dev.enableDebugMode,
    themeMode: config.branding.theme.mode,
    primaryColor: config.branding.colors.primary,
  };
};

// Validate configuration on module load in development
if (__DEV__) {
  try {
    validateConfig();
    debugLog('Configuration loaded successfully:', getConfigSummary());
  } catch (error) {
    console.error('Configuration validation failed:', error);
  }
}

// Re-export feature utilities for convenience
export { FEATURES, getEnabledFeatures, validateTemplateFeatures } from './features';
