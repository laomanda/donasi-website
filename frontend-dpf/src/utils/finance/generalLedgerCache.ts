import type { GeneralLedgerResponse } from "@/types/finance";

export interface GeneralLedgerCacheEntry {
  data: GeneralLedgerResponse;
  fetchedAt: number;
}

export const GL_FRESH_TTL_MS = 60 * 1000; // 60 seconds fresh
export const GL_MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes max stale
const MAX_GL_CACHE_ENTRIES = 30;

// Module-level in-memory cache and in-flight promise map
const glCacheMap = new Map<string, GeneralLedgerCacheEntry>();
const glInFlightMap = new Map<string, Promise<GeneralLedgerResponse>>();

/**
 * Retrieves cached General Ledger data by key if present and not past max stale.
 */
export function getGeneralLedgerCache(key: string): GeneralLedgerCacheEntry | null {
  const entry = glCacheMap.get(key);
  if (!entry) return null;

  // If entry exceeds maximum stale duration, discard it
  if (Date.now() - entry.fetchedAt > GL_MAX_STALE_TTL_MS) {
    glCacheMap.delete(key);
    return null;
  }

  return entry;
}

/**
 * Checks whether a cache entry is strictly fresh (within fresh TTL).
 */
export function isGeneralLedgerCacheFresh(entry: GeneralLedgerCacheEntry | null): boolean {
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < GL_FRESH_TTL_MS;
}

/**
 * Stores a General Ledger response in the in-memory cache with size limiting.
 */
export function setGeneralLedgerCache(key: string, data: GeneralLedgerResponse): void {
  // Prune cache if exceeding limit
  if (glCacheMap.size >= MAX_GL_CACHE_ENTRIES) {
    const now = Date.now();
    for (const [k, e] of glCacheMap.entries()) {
      if (now - e.fetchedAt > GL_MAX_STALE_TTL_MS) {
        glCacheMap.delete(k);
      }
    }
    // If still at or over capacity, delete oldest keys
    if (glCacheMap.size >= MAX_GL_CACHE_ENTRIES) {
      const oldestKeys = Array.from(glCacheMap.keys()).slice(0, 5);
      oldestKeys.forEach((k) => glCacheMap.delete(k));
    }
  }

  glCacheMap.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}

/**
 * Invalidate General Ledger cache entries.
 * Can target a specific account, period, or clear all entries.
 */
export interface InvalidateGLOptions {
  accountId?: number;
  periodId?: number;
}

export function invalidateGeneralLedgerCache(options?: InvalidateGLOptions): void {
  if (!options || (options.accountId === undefined && options.periodId === undefined)) {
    glCacheMap.clear();
    return;
  }

  for (const key of Array.from(glCacheMap.keys())) {
    let shouldDelete = false;
    if (options.accountId !== undefined && key.includes(`acc=${options.accountId}:`)) {
      shouldDelete = true;
    }
    if (options.periodId !== undefined && key.includes(`period=${options.periodId}:`)) {
      shouldDelete = true;
    }
    if (shouldDelete) {
      glCacheMap.delete(key);
    }
  }
}

/**
 * Accessor for deduplicating concurrent in-flight requests for the same cache key.
 */
export function getGeneralLedgerInFlight(
  key: string
): Promise<GeneralLedgerResponse> | undefined {
  return glInFlightMap.get(key);
}

export function setGeneralLedgerInFlight(
  key: string,
  promise: Promise<GeneralLedgerResponse> | null
): void {
  if (promise) {
    glInFlightMap.set(key, promise);
  } else {
    glInFlightMap.delete(key);
  }
}
