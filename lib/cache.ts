/**
 * Cache Manager - In-memory + localStorage caching for Supabase queries
 * Provides instant data on subsequent loads with background refresh
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface CacheConfig {
    ttl: number; // Time to live in milliseconds
    staleWhileRevalidate: boolean;
}

const DEFAULT_CONFIG: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: true,
};

// In-memory cache for fastest access
const memoryCache = new Map<string, CacheEntry<unknown>>();

// Cache key prefixes
const CACHE_PREFIX = 'wcp_cache_';

/**
 * Get cached data from memory or localStorage
 */
export function getFromCache<T>(key: string): { data: T | null; isStale: boolean } {
    const fullKey = CACHE_PREFIX + key;
    const now = Date.now();

    // Try memory cache first (fastest)
    const memEntry = memoryCache.get(fullKey) as CacheEntry<T> | undefined;
    if (memEntry) {
        const isStale = now > memEntry.expiresAt;
        return { data: memEntry.data, isStale };
    }

    // Fall back to localStorage
    try {
        const stored = localStorage.getItem(fullKey);
        if (stored) {
            const entry: CacheEntry<T> = JSON.parse(stored);
            const isStale = now > entry.expiresAt;

            // Populate memory cache for next access
            memoryCache.set(fullKey, entry);

            return { data: entry.data, isStale };
        }
    } catch {
        // localStorage not available or parse error
    }

    return { data: null, isStale: true };
}

/**
 * Save data to cache (memory + localStorage)
 */
export function saveToCache<T>(key: string, data: T, config: Partial<CacheConfig> = {}): void {
    const fullKey = CACHE_PREFIX + key;
    const { ttl } = { ...DEFAULT_CONFIG, ...config };
    const now = Date.now();

    const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt: now + ttl,
    };

    // Save to memory cache
    memoryCache.set(fullKey, entry);

    // Save to localStorage for persistence
    try {
        localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch {
        // localStorage full or not available - memory cache still works
    }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
    const fullKey = CACHE_PREFIX + key;
    memoryCache.delete(fullKey);
    try {
        localStorage.removeItem(fullKey);
    } catch {
        // Ignore errors
    }
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
    memoryCache.clear();
    try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
        keys.forEach(k => localStorage.removeItem(k));
    } catch {
        // Ignore errors
    }
}

/**
 * Generate cache key from query parameters
 */
export function generateCacheKey(base: string, params: Record<string, unknown> = {}): string {
    const sortedParams = Object.keys(params)
        .filter(k => params[k] !== undefined && params[k] !== null)
        .sort()
        .map(k => `${k}=${JSON.stringify(params[k])}`)
        .join('&');

    return sortedParams ? `${base}?${sortedParams}` : base;
}

// Cache TTL constants for different data types
export const CACHE_TTL = {
    LISTINGS: 3 * 60 * 1000,      // 3 minutes - changes occasionally
    CATEGORIES: 10 * 60 * 1000,   // 10 minutes - rarely changes
    FEATURED: 5 * 60 * 1000,      // 5 minutes
    PLANS: 30 * 60 * 1000,        // 30 minutes - rarely changes
    STATIC: 60 * 60 * 1000,       // 1 hour
} as const;
