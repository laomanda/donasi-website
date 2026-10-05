import type { WaqfAssetReportResponse, WaqfAssetItem } from "@/types/finance";
import {
  buildWaqfAssetReportCacheKey,
  buildWaqfAssetDetailCacheKey,
  type WaqfAssetFilterState,
} from "./waqfAssetQuery";

export const WAQF_ASSET_FRESH_TTL_MS = 60 * 1000; // 60 seconds fresh
export const WAQF_ASSET_MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes max stale
const MAX_REPORT_ENTRIES = 30;
const MAX_DETAIL_ENTRIES = 50;

export interface WaqfAssetCacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache stores
const waqfAssetReportCache = new Map<string, WaqfAssetCacheEntry<WaqfAssetReportResponse>>();
const waqfAssetDetailCache = new Map<string, WaqfAssetCacheEntry<WaqfAssetItem>>();

// In-flight request promise maps
const inFlightReportRequests = new Map<string, Promise<WaqfAssetReportResponse>>();
const inFlightDetailRequests = new Map<string, Promise<WaqfAssetItem>>();

// ==========================================
// 1. REPORT CACHE METHODS
// ==========================================

export function getWaqfAssetReportCache(
  key: string
): WaqfAssetCacheEntry<WaqfAssetReportResponse> | null {
  const entry = waqfAssetReportCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > WAQF_ASSET_MAX_STALE_TTL_MS) {
    waqfAssetReportCache.delete(key);
    return null;
  }

  return entry;
}

export function isWaqfAssetCacheFresh<T>(
  entry: WaqfAssetCacheEntry<T> | null
): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < WAQF_ASSET_FRESH_TTL_MS;
}

export function setWaqfAssetReportCache(
  key: string,
  data: WaqfAssetReportResponse
): void {
  if (waqfAssetReportCache.size >= MAX_REPORT_ENTRIES) {
    const oldestKey = waqfAssetReportCache.keys().next().value;
    if (oldestKey) {
      waqfAssetReportCache.delete(oldestKey);
    }
  }

  waqfAssetReportCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function getWaqfAssetReportInFlight(
  key: string
): Promise<WaqfAssetReportResponse> | null {
  return inFlightReportRequests.get(key) || null;
}

export function setWaqfAssetReportInFlight(
  key: string,
  promise: Promise<WaqfAssetReportResponse> | null
): void {
  if (promise) {
    inFlightReportRequests.set(key, promise);
  } else {
    inFlightReportRequests.delete(key);
  }
}

export function invalidateWaqfAssetsCache(
  filters?: Pick<WaqfAssetFilterState, "periodId" | "categoryId" | "status">
): void {
  if (filters) {
    const key = buildWaqfAssetReportCacheKey(filters);
    waqfAssetReportCache.delete(key);
    inFlightReportRequests.delete(key);
  } else {
    waqfAssetReportCache.clear();
    inFlightReportRequests.clear();
  }
}

// ==========================================
// 2. DETAIL CACHE METHODS
// ==========================================

export function getWaqfAssetDetailCache(
  key: string
): WaqfAssetCacheEntry<WaqfAssetItem> | null {
  const entry = waqfAssetDetailCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > WAQF_ASSET_MAX_STALE_TTL_MS) {
    waqfAssetDetailCache.delete(key);
    return null;
  }

  return entry;
}

export function setWaqfAssetDetailCache(
  key: string,
  data: WaqfAssetItem
): void {
  if (waqfAssetDetailCache.size >= MAX_DETAIL_ENTRIES) {
    const oldestKey = waqfAssetDetailCache.keys().next().value;
    if (oldestKey) {
      waqfAssetDetailCache.delete(oldestKey);
    }
  }

  waqfAssetDetailCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function getWaqfAssetDetailInFlight(
  key: string
): Promise<WaqfAssetItem> | null {
  return inFlightDetailRequests.get(key) || null;
}

export function setWaqfAssetDetailInFlight(
  key: string,
  promise: Promise<WaqfAssetItem> | null
): void {
  if (promise) {
    inFlightDetailRequests.set(key, promise);
  } else {
    inFlightDetailRequests.delete(key);
  }
}

export function invalidateWaqfAssetDetailCache(
  assetId?: number | string,
  periodId?: number | string | null
): void {
  if (assetId !== undefined) {
    if (periodId !== undefined && periodId !== null) {
      const specificKey = buildWaqfAssetDetailCacheKey(assetId, periodId);
      waqfAssetDetailCache.delete(specificKey);
      inFlightDetailRequests.delete(specificKey);
    } else {
      const prefix = `finance:waqf-asset:${assetId}:`;
      for (const k of waqfAssetDetailCache.keys()) {
        if (k.startsWith(prefix)) {
          waqfAssetDetailCache.delete(k);
          inFlightDetailRequests.delete(k);
        }
      }
    }
  } else {
    waqfAssetDetailCache.clear();
    inFlightDetailRequests.clear();
  }
}
