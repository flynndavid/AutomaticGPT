import { logger } from './logger';

/**
 * Simple network utilities for performance optimization
 */

/**
 * Request timeout wrapper
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  timeoutMessage = 'Request timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  );

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Simple request retry with exponential backoff
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      
      if (attempt > 0) {
        logger.log(`Request succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        logger.error(`Request failed after ${maxRetries + 1} attempts:`, lastError);
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn(`Request failed (attempt ${attempt + 1}), retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Simple cache implementation
 */
class SimpleCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // 5 minutes default
    this.ttl = ttlMs;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Clean expired entries first
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// Global cache instances
export const apiCache = new SimpleCache<any>(5 * 60 * 1000); // 5 minutes
export const uiCache = new SimpleCache<any>(30 * 60 * 1000); // 30 minutes

/**
 * Cached fetch wrapper
 */
export async function cachedFetch(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  cacheTtl?: number
): Promise<any> {
  const key = cacheKey || `${options.method || 'GET'}:${url}`;
  
  // Check cache first
  if (apiCache.has(key)) {
    logger.network(options.method || 'GET', url, undefined, 'CACHED');
    return apiCache.get(key);
  }

  // Make request with timeout and retry
  const fetchRequest = () => withTimeout(fetch(url, options));
  const response = await retryRequest(fetchRequest, 2);
  
  logger.network(options.method || 'GET', url, response.status);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Cache successful responses
  apiCache.set(key, data);
  
  return data;
}