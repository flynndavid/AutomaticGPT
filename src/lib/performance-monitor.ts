import { logger } from './logger';

/**
 * Simple performance monitoring utility
 * Tracks key performance metrics for optimization
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  /**
   * End timing and log the result
   */
  endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logger.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);
    this.metrics.set(label, duration);
    
    logger.perf(label, duration);
    return duration;
  }

  /**
   * Time a function execution
   */
  async timeFunction<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      summary[key] = value;
    });
    return summary;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.timers.clear();
  }

  /**
   * Log slow operations (> threshold ms)
   */
  logSlowOperations(threshold = 1000): void {
    const slowOps: string[] = [];
    this.metrics.forEach((duration, label) => {
      if (duration > threshold) {
        slowOps.push(`${label}: ${duration}ms`);
      }
    });

    if (slowOps.length > 0) {
      logger.warn('Slow operations detected:', slowOps);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Performance decorator for timing functions
 */
export function timed(label: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.timeFunction(label, () => method.apply(this, args));
    };

    return descriptor;
  };
}

/**
 * Memory usage monitoring (simplified)
 */
export const memoryMonitor = {
  /**
   * Get current memory usage info
   */
  getUsage(): object {
    // Note: React Native doesn't have process.memoryUsage()
    // This is a placeholder for platform-specific memory monitoring
    return {
      timestamp: Date.now(),
      // Could integrate with native modules for actual memory usage
      estimated: 'Available via native modules',
    };
  },

  /**
   * Log memory warning if usage is high
   */
  checkMemoryPressure(): void {
    // Placeholder for memory pressure detection
    // In a real app, this would integrate with native memory APIs
    logger.log('Memory pressure check - integrate with native APIs for real monitoring');
  },
};