import type { ReconciliationReport, ReconciliationSummary } from "@/types/finance";

export const RECON_FRESH_TTL_MS = 60 * 1000; // 60s
export const RECON_MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5m

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

// In-memory cache structures
const summaryCache = new Map<string, CacheEntry<ReconciliationSummary>>();
const reportCache = new Map<string, CacheEntry<ReconciliationReport>>();

// In-flight request promises for deduplication
const summaryInFlight = new Map<string, Promise<ReconciliationSummary>>();
const reportInFlight = new Map<string, Promise<ReconciliationReport>>();

export function getReconPeriodKey(periodId?: number | null | ""): string {
  if (!periodId) return "all";
  return String(periodId);
}

// Summary Cache Helpers
export function getCachedSummary(key: string): CacheEntry<ReconciliationSummary> | null {
  const entry = summaryCache.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.fetchedAt;
  if (age > RECON_MAX_STALE_TTL_MS) {
    summaryCache.delete(key);
    return null;
  }
  return entry;
}

export function setCachedSummary(key: string, data: ReconciliationSummary): void {
  summaryCache.set(key, { data, fetchedAt: Date.now() });
}

export function getSummaryInFlight(key: string): Promise<ReconciliationSummary> | null {
  return summaryInFlight.get(key) || null;
}

export function setSummaryInFlight(key: string, promise: Promise<ReconciliationSummary> | null): void {
  if (promise) {
    summaryInFlight.set(key, promise);
  } else {
    summaryInFlight.delete(key);
  }
}

// Report Cache Helpers
export function getCachedReport(key: string): CacheEntry<ReconciliationReport> | null {
  const entry = reportCache.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.fetchedAt;
  if (age > RECON_MAX_STALE_TTL_MS) {
    reportCache.delete(key);
    return null;
  }
  return entry;
}

export function setCachedReport(key: string, data: ReconciliationReport): void {
  reportCache.set(key, { data, fetchedAt: Date.now() });
  // Also derive and update summary cache from this fresh report
  setCachedSummary(key, {
    overall_status: data.overall_status,
    critical_errors: data.critical_errors,
    high_errors: data.high_errors,
    warnings: data.warnings,
    failed_checks: data.failed_checks,
    total_checks: data.total_checks,
    passed_checks: data.passed_checks,
    last_checked_at: data.last_checked_at,
    controls: data.checks,
    checks: data.checks,
  });
}

export function getReportInFlight(key: string): Promise<ReconciliationReport> | null {
  return reportInFlight.get(key) || null;
}

export function setReportInFlight(key: string, promise: Promise<ReconciliationReport> | null): void {
  if (promise) {
    reportInFlight.set(key, promise);
  } else {
    reportInFlight.delete(key);
  }
}

export function clearReconCache(key?: string): void {
  if (key) {
    summaryCache.delete(key);
    reportCache.delete(key);
  } else {
    summaryCache.clear();
    reportCache.clear();
  }
}
