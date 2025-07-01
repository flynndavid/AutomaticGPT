/**
 * Route Constants
 * Centralized route definitions for type-safe navigation
 */

export const ROUTES = {
  // Auth routes
  AUTH: {
    WELCOME: '/(auth)/welcome' as const,
    LOGIN: '/(auth)/login' as const,
  },

  // App routes
  APP: {
    INDEX: '/(app)' as const,
    HOME: '/(app)/index' as const,
  },

  // Root routes
  ROOT: {
    INDEX: '/' as const,
  },
} as const;

/**
 * Type-safe route validation
 */
export function isValidRoute(route: string): boolean {
  const allRoutes = Object.values(ROUTES).flatMap((section) => Object.values(section));
  return allRoutes.includes(route as any);
}

/**
 * Safe navigation helper
 */
export function getSafeRoute(route: string, fallback: string = ROUTES.AUTH.LOGIN): string {
  return isValidRoute(route) ? route : fallback;
}
