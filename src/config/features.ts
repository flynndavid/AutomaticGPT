/**
 * Template Feature Flags Configuration
 * Centralized management of all feature toggles for the app template
 */

/**
 * Boolean environment variable getter with fallback
 */
const getBooleanEnvVar = (key: string, fallback: boolean = false): boolean => {
  // eslint-disable-next-line expo/no-dynamic-env-var
  const value = process.env[key];
  if (!value) return fallback;
  return value.toLowerCase() === 'true';
};

/**
 * Core Features - Currently implemented and working
 */
export const CORE_FEATURES = {
  // UI Features
  enableVoiceInput: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_VOICE', false),
  enableDarkMode: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_DARK_MODE', true),
  enableHapticFeedback: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_HAPTICS', true),
  enableAnimations: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_ANIMATIONS', true),

  // Technical Features
  enableOfflineMode: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_OFFLINE', false),
  enableAnalytics: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_ANALYTICS', false),
  enablePushNotifications: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_PUSH', false),

  // Authentication & User Management (MOVED FROM TEMPLATE_FEATURES - FULLY IMPLEMENTED)
  enableAuth: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_AUTH', true),
  enableEmailAuth: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_EMAIL_AUTH', true),
  enableProfile: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_PROFILE', true),
  enableProfileManagement: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_PROFILE_MANAGEMENT', true),

  // Navigation & Layout (MOVED FROM TEMPLATE_FEATURES - FULLY IMPLEMENTED)
  enableOnboarding: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_ONBOARDING', true),
  enableSplashOnboarding: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING', true),
  enableSidebar: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_SIDEBAR', true),
  enableThemeCustomization: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_THEME_CUSTOMIZATION', true),

  // Conversation System (NEWLY DISCOVERED - FULLY IMPLEMENTED)
  enableConversationManagement: getBooleanEnvVar(
    'EXPO_PUBLIC_ENABLE_CONVERSATION_MANAGEMENT',
    true
  ),
  enableConversationAnalytics: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_CONVERSATION_ANALYTICS', true),
  enableConversationSharing: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_CONVERSATION_SHARING', true),
} as const;

/**
 * Template Features - To be implemented in future phases
 */
export const TEMPLATE_FEATURES = {
  // Authentication Extensions (not yet implemented)
  enableSocialAuth: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_SOCIAL_AUTH', false),
  enableSmsAuth: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_SMS_AUTH', false),
  enableGoogleAuth: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_GOOGLE_AUTH', false),
  enableAppleAuth: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_APPLE_AUTH', false),

  // Storage & File Management (not yet implemented)
  enableStorage: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_STORAGE', false),
  enableFileUploads: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_FILE_UPLOADS', false),

  // Navigation Extensions (not yet implemented)
  enableTabNavigation: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_TAB_NAVIGATION', false),

  // Advanced Features (not yet implemented)
  enableRealtime: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_REALTIME', false),
  enableNotifications: getBooleanEnvVar('EXPO_PUBLIC_ENABLE_NOTIFICATIONS', false),
} as const;

/**
 * Combined feature flags for easy access
 */
export const FEATURES = {
  ...CORE_FEATURES,
  ...TEMPLATE_FEATURES,
} as const;

/**
 * Feature categories for better organization
 */
export const FEATURE_CATEGORIES = {
  ui: [
    'enableVoiceInput',
    'enableDarkMode',
    'enableHapticFeedback',
    'enableAnimations',
    'enableThemeCustomization',
  ] as const,
  auth: [
    'enableAuth',
    'enableSocialAuth',
    'enableProfile',
    'enableProfileManagement',
    'enableEmailAuth',
    'enableSmsAuth',
    'enableGoogleAuth',
    'enableAppleAuth',
  ] as const,
  storage: ['enableStorage', 'enableFileUploads'] as const,
  navigation: [
    'enableOnboarding',
    'enableSplashOnboarding',
    'enableSidebar',
    'enableTabNavigation',
  ] as const,
  conversations: [
    'enableConversationManagement',
    'enableConversationAnalytics',
    'enableConversationSharing',
  ] as const,
  advanced: [
    'enableOfflineMode',
    'enableAnalytics',
    'enablePushNotifications',
    'enableRealtime',
    'enableNotifications',
  ] as const,
} as const;

/**
 * Feature flag checker utility
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};

/**
 * Category checker utility
 */
export const isCategoryEnabled = (category: keyof typeof FEATURE_CATEGORIES): boolean => {
  return FEATURE_CATEGORIES[category].some((feature) => FEATURES[feature]);
};

/**
 * Get enabled features by category
 */
export const getEnabledFeatures = (): {
  core: string[];
  template: string[];
  all: string[];
} => {
  const core = Object.entries(CORE_FEATURES)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);

  const template = Object.entries(TEMPLATE_FEATURES)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);

  return {
    core,
    template,
    all: [...core, ...template],
  };
};

/**
 * Template configuration validation
 */
export const validateTemplateFeatures = (): string[] => {
  const warnings: string[] = [];

  // Auth dependency checks
  if (FEATURES.enableProfile && !FEATURES.enableAuth) {
    warnings.push('enableProfile requires enableAuth to be enabled');
  }

  if (FEATURES.enableSocialAuth && !FEATURES.enableAuth) {
    warnings.push('enableSocialAuth requires enableAuth to be enabled');
  }

  // Storage dependency checks
  if (FEATURES.enableFileUploads && !FEATURES.enableStorage) {
    warnings.push('enableFileUploads requires enableStorage to be enabled');
  }

  // Navigation dependency checks
  if (FEATURES.enableSidebar && FEATURES.enableTabNavigation) {
    warnings.push('enableSidebar and enableTabNavigation should not both be enabled');
  }

  return warnings;
};

export type FeatureFlags = typeof FEATURES;
export type CoreFeatures = typeof CORE_FEATURES;
export type TemplateFeatures = typeof TEMPLATE_FEATURES;
