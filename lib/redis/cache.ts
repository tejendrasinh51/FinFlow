import { redis } from './client';

/**
 * Retrieves a key from the cache. If it doesn't exist, runs the DB query function,
 * saves the result with the specified TTL (in seconds), and returns it.
 */
export async function getOrSetCache<T>(
  key: string,
  ttl: number,
  dbQueryFn: () => Promise<T>
): Promise<T> {
  try {
    const cachedValue = await redis.get(key);
    if (cachedValue !== null && cachedValue !== undefined) {
      if (process.env.DEBUG_CACHE === 'true') {
        console.log(`[Cache Hit] Key: ${key}`);
      }
      return JSON.parse(cachedValue) as T;
    }
  } catch (error) {
    console.error(`Cache read failure for key ${key}:`, error);
  }

  if (process.env.DEBUG_CACHE === 'true') {
    console.log(`[Cache Miss] Querying DB for key: ${key}`);
  }

  const freshData = await dbQueryFn();

  try {
    await redis.set(key, JSON.stringify(freshData), 'EX', ttl);
  } catch (error) {
    console.error(`Cache write failure for key ${key}:`, error);
  }

  return freshData;
}

/**
 * Invalidates cache keys that match a specific pattern (e.g. "metrics:org_uuid:*")
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      for (const key of keys) {
        await redis.del(key);
      }
      if (process.env.DEBUG_CACHE === 'true') {
        console.log(`[Cache Invalidate] Cleared keys for pattern: ${pattern}`);
      }
    }
  } catch (error) {
    console.error(`Cache invalidation failed for pattern ${pattern}:`, error);
  }
}

/**
 * Invalidates a single exact key
 */
export async function invalidateCacheKey(key: string): Promise<void> {
  try {
    await redis.del(key);
    if (process.env.DEBUG_CACHE === 'true') {
      console.log(`[Cache Invalidate] Cleared exact key: ${key}`);
    }
  } catch (error) {
    console.error(`Cache invalidation failed for key ${key}:`, error);
  }
}
