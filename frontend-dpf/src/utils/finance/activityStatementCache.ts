import type { ActivityStatementResponse } from "@/types/finance";
import {
  buildActivityStatementCacheKey,
  type ActivityStatementFilterState,
} from "./activityStatementQuery";

export const ACTIVITY_STATEMENT_FRESH_TTL_MS = 60 * 1000; // 60 seconds fresh
export const ACTIVITY_STATEMENT_MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes max stale
const MAX_CACHE_ENTRIES = 30;

export interface ActivityStatementCacheEntry {
  data: ActivityStatementResponse;
  timestamp: number;
}

// In-memory cache storage
const activityStatementCache = new Map<string, ActivityStatementCacheEntry>();

// In-flight promises map for request deduplication
const inFlightRequests = new Map<string, Promise<ActivityStatementResponse>>();

/**
 * Retrieves a valid (fresh or usable stale) cache entry.
 */
export function getActivityStatementCache(
  key: string
): ActivityStatementCacheEntry | null {
  const entry = activityStatementCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > ACTIVITY_STATEMENT_MAX_STALE_TTL_MS) {
    activityStatementCache.delete(key);
    return null;
  }

  return entry;
}

/**
 * Checks if a cache entry is strictly fresh (< 60s).
 */
export function isActivityStatementCacheFresh(
  entry: ActivityStatementCacheEntry | null
): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ACTIVITY_STATEMENT_FRESH_TTL_MS;
}

/**
 * Stores response into memory cache with LRU cleanup if capacity is exceeded.
 */
export function setActivityStatementCache(
  key: string,
  data: ActivityStatementResponse
): void {
  // Evict oldest entries if capacity reached
  if (activityStatementCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = activityStatementCache.keys().next().value;
    if (oldestKey) {
      activityStatementCache.delete(oldestKey);
    }
  }

  activityStatementCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * In-flight promise tracker for request deduplication.
 */
export function getActivityStatementInFlight(
  key: string
): Promise<ActivityStatementResponse> | null {
  return inFlightRequests.get(key) || null;
}

export function setActivityStatementInFlight(
  key: string,
  promise: Promise<ActivityStatementResponse> | null
): void {
  if (promise) {
    inFlightRequests.set(key, promise);
  } else {
    inFlightRequests.delete(key);
  }
}

/**
 * Invalidates cache entry for specific filter state or all entries.
 */
export function invalidateActivityStatementCache(
  filters?: ActivityStatementFilterState
): void {
  if (filters) {
    const key = buildActivityStatementCacheKey(filters);
    activityStatementCache.delete(key);
    inFlightRequests.delete(key);
  } else {
    activityStatementCache.clear();
    inFlightRequests.clear();
  }
}
