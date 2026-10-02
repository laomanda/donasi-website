import type { TrialBalanceResponse } from "@/types/finance";

export interface TrialBalanceCacheEntry {
  data: TrialBalanceResponse;
  fetchedAt: number;
}

export const TB_FRESH_TTL_MS = 60 * 1000; // 60 seconds fresh
export const TB_MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes max stale
const MAX_TB_CACHE_ENTRIES = 30;

// Module-level in-memory cache and in-flight promise map
const tbCacheMap = new Map<string, TrialBalanceCacheEntry>();
const tbInFlightMap = new Map<string, Promise<TrialBalanceResponse>>();

/**
 * Retrieves cached Trial Balance data by key if present and not past max stale.
 */
export function getTrialBalanceCache(key: string): TrialBalanceCacheEntry | null {
  const entry = tbCacheMap.get(key);
  if (!entry) return null;

  // Discard expired stale entries
  if (Date.now() - entry.fetchedAt > TB_MAX_STALE_TTL_MS) {
    tbCacheMap.delete(key);
    return null;
  }

  return entry;
}

/**
 * Checks whether a cache entry is strictly fresh (within fresh TTL).
 */
export function isTrialBalanceCacheFresh(
  entry: TrialBalanceCacheEntry | null
): boolean {
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < TB_FRESH_TTL_MS;
}

/**
 * Stores a Trial Balance response in the in-memory cache with size limiting.
 */
export function setTrialBalanceCache(
  key: string,
  data: TrialBalanceResponse
): void {
  // Prune cache if exceeding limit
  if (tbCacheMap.size >= MAX_TB_CACHE_ENTRIES) {
    const now = Date.now();
    for (const [k, e] of tbCacheMap.entries()) {
      if (now - e.fetchedAt > TB_MAX_STALE_TTL_MS) {
        tbCacheMap.delete(k);
      }
    }
    // If still at or over capacity, delete oldest keys
    if (tbCacheMap.size >= MAX_TB_CACHE_ENTRIES) {
      const oldestKeys = Array.from(tbCacheMap.keys()).slice(0, 5);
      oldestKeys.forEach((k) => tbCacheMap.delete(k));
    }
  }

  tbCacheMap.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}

/**
 * Options for invalidating Trial Balance cache.
 */
export interface InvalidateTBOptions {
  periodId?: number;
}

/**
 * Invalidates Trial Balance cache entries.
 * Can target a specific period or clear all entries.
 */
export function invalidateTrialBalanceCache(options?: InvalidateTBOptions): void {
  if (!options || options.periodId === undefined) {
    tbCacheMap.clear();
    return;
  }

  for (const key of Array.from(tbCacheMap.keys())) {
    if (key.includes(`period=${options.periodId}:`)) {
      tbCacheMap.delete(key);
    }
  }
}

/**
 * Accessor for deduplicating concurrent in-flight requests for the same cache key.
 */
export function getTrialBalanceInFlight(
  key: string
): Promise<TrialBalanceResponse> | undefined {
  return tbInFlightMap.get(key);
}

/**
 * Sets or clears the pending in-flight promise for a cache key.
 */
export function setTrialBalanceInFlight(
  key: string,
  promise: Promise<TrialBalanceResponse> | null
): void {
  if (promise) {
    tbInFlightMap.set(key, promise);
  } else {
    tbInFlightMap.delete(key);
  }
}
