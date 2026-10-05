import type { BalanceSheetResponse } from "@/types/finance";

export interface BalanceSheetCacheEntry {
  data: BalanceSheetResponse;
  fetchedAt: number;
}

export const BS_FRESH_TTL_MS = 60 * 1000; // 60 seconds fresh
export const BS_MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes max stale
const MAX_BS_CACHE_ENTRIES = 30;

// Module-level in-memory cache and in-flight promise map
const bsCacheMap = new Map<string, BalanceSheetCacheEntry>();
const bsInFlightMap = new Map<string, Promise<BalanceSheetResponse>>();

/**
 * Retrieves cached Balance Sheet data by key if present and not past max stale.
 */
export function getBalanceSheetCache(key: string): BalanceSheetCacheEntry | null {
  const entry = bsCacheMap.get(key);
  if (!entry) return null;

  // Discard expired stale entries
  if (Date.now() - entry.fetchedAt > BS_MAX_STALE_TTL_MS) {
    bsCacheMap.delete(key);
    return null;
  }

  return entry;
}

/**
 * Checks whether a cache entry is strictly fresh (within fresh TTL).
 */
export function isBalanceSheetCacheFresh(
  entry: BalanceSheetCacheEntry | null
): boolean {
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < BS_FRESH_TTL_MS;
}

/**
 * Stores a Balance Sheet response in the in-memory cache with size limiting.
 */
export function setBalanceSheetCache(
  key: string,
  data: BalanceSheetResponse
): void {
  // Prune cache if exceeding limit
  if (bsCacheMap.size >= MAX_BS_CACHE_ENTRIES) {
    const now = Date.now();
    for (const [k, e] of bsCacheMap.entries()) {
      if (now - e.fetchedAt > BS_MAX_STALE_TTL_MS) {
        bsCacheMap.delete(k);
      }
    }
    // If still at or over capacity, delete oldest keys
    if (bsCacheMap.size >= MAX_BS_CACHE_ENTRIES) {
      const oldestKeys = Array.from(bsCacheMap.keys()).slice(0, 5);
      oldestKeys.forEach((k) => bsCacheMap.delete(k));
    }
  }

  bsCacheMap.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}

/**
 * Options for invalidating Balance Sheet cache.
 */
export interface InvalidateBSOptions {
  periodId?: number;
}

/**
 * Invalidates Balance Sheet cache entries.
 * Can target a specific period or clear all entries.
 */
export function invalidateBalanceSheetCache(options?: InvalidateBSOptions): void {
  if (!options || options.periodId === undefined) {
    bsCacheMap.clear();
    return;
  }

  for (const key of Array.from(bsCacheMap.keys())) {
    if (key.includes(`period=${options.periodId}:`)) {
      bsCacheMap.delete(key);
    }
  }
}

/**
 * Accessor for deduplicating concurrent in-flight requests for the same cache key.
 */
export function getBalanceSheetInFlight(
  key: string
): Promise<BalanceSheetResponse> | undefined {
  return bsInFlightMap.get(key);
}

/**
 * Sets or clears the pending in-flight promise for a cache key.
 */
export function setBalanceSheetInFlight(
  key: string,
  promise: Promise<BalanceSheetResponse> | null
): void {
  if (promise) {
    bsInFlightMap.set(key, promise);
  } else {
    bsInFlightMap.delete(key);
  }
}
