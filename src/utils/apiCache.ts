/**
 * API Response Caching Utility
 * Prevents redundant API calls by caching responses in memory
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache] Hit: ${key}`);
    return entry.data as T;
  }

  /**
   * Set data in cache with optional custom TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });

    console.log(`[Cache] Set: ${key} (expires in ${(ttl || this.defaultTTL) / 1000}s)`);
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    console.log(`[Cache] Invalidated: ${key}`);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        console.log(`[Cache] Invalidated: ${key}`);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache] Cleared all entries');
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton instance
export const apiCache = new APICache();

// Clean up expired entries every 10 minutes
setInterval(() => {
  apiCache.cleanup();
}, 10 * 60 * 1000);

/**
 * Cached fetch wrapper
 * Automatically caches GET requests
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  ttl?: number
): Promise<T> {
  const method = options.method?.toUpperCase() || 'GET';

  // Only cache GET requests
  if (method !== 'GET') {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Create cache key from URL and relevant options
  const cacheKey = `${method}:${url}`;

  // Check cache first
  const cached = apiCache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch from API
  console.log(`[Cache] Miss: ${cacheKey} - Fetching from API`);
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache the result
  apiCache.set(cacheKey, data, ttl);

  return data;
}

/**
 * Helper to create cache key for specific resources
 */
export const createCacheKey = {
  products: () => 'GET:/products',
  product: (id: string | number) => `GET:/products/${id}`,
  guilds: () => 'GET:/guilds',
  guild: (id: string | number) => `GET:/guilds/${id}`,
  projects: () => 'GET:/projects',
  project: (id: string | number) => `GET:/projects/${id}`,
  user: () => 'GET:/users/me',
};

export default apiCache;
