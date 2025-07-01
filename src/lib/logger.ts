/**
 * Development-only logger
 * Replaces console.* calls to prevent performance impact in production
 */

const isDevelopment = __DEV__;

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always logged, sent to crash reporting in production)
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, send to crash reporting service
      // TODO: Integrate with crash reporting service (e.g., Sentry, Crashlytics)
      // crashlytics().recordError(args[0]);
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log performance information (only in development)
   */
  perf: (label: string, value: number) => {
    if (isDevelopment) {
      console.log(`🏁 Performance: ${label} - ${value.toFixed(2)}ms`);
    }
  },

  /**
   * Log network requests (only in development)
   */
  network: (method: string, url: string, status?: number, cached?: string) => {
    if (isDevelopment) {
      const statusColor = status && status >= 400 ? '🔴' : '🟢';
      const cachePrefix = cached ? `💾 ${cached} ` : '';
      console.log(`${cachePrefix}${statusColor} Network: ${method} ${url}${status ? ` - ${status}` : ''}`);
    }
  },

  /**
   * Group logs together (only in development)
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  /**
   * End log group (only in development)
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
};

/**
 * Performance timer utility
 */
export const createTimer = (label: string) => {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - start;
      logger.perf(label, duration);
      return duration;
    },
  };
};