import type { AccountingPeriod } from "@/types/finance";
import type {
  FinanceDashboardData,
  FinanceDashboardSectionErrors,
} from "./financeDashboardMetrics";

// ============================================================================
// CACHE POLICIES (TIME-TO-LIVE)
// ============================================================================
export const PERIODS_FRESH_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh
export const PERIODS_MAX_STALE_TTL_MS = 15 * 60 * 1000; // 15 minutes max stale

export const DASHBOARD_FRESH_TTL_MS = 60 * 1000; // 60 seconds fresh
export const DASHBOARD_MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes max stale

const MAX_DASHBOARD_ENTRIES = 20;

// ============================================================================
// IN-MEMORY CACHE STRUCTURES
// ============================================================================
export interface PeriodsCacheEntry {
  data: AccountingPeriod[];
  fetchedAt: number;
}

export interface DashboardCacheEntry {
  data: FinanceDashboardData;
  errors: FinanceDashboardSectionErrors;
  fetchedAt: number;
}

let periodsCache: PeriodsCacheEntry | null = null;
let periodsInFlightPromise: Promise<AccountingPeriod[]> | null = null;

const dashboardCacheMap = new Map<number, DashboardCacheEntry>();
const dashboardInFlightMap = new Map<
  number,
  Promise<{ data: FinanceDashboardData; errors: FinanceDashboardSectionErrors }>
>();

// ============================================================================
// PERIODS CACHE ACCESSORS
// ============================================================================
export function getPeriodsCache(): PeriodsCacheEntry | null {
  return periodsCache;
}

export function setPeriodsCache(data: AccountingPeriod[]): void {
  periodsCache = {
    data,
    fetchedAt: Date.now(),
  };
}

export function invalidateFinancePeriodsCache(): void {
  periodsCache = null;
}

export function getPeriodsInFlight(): Promise<AccountingPeriod[]> | null {
  return periodsInFlightPromise;
}

export function setPeriodsInFlight(
  p: Promise<AccountingPeriod[]> | null
): void {
  periodsInFlightPromise = p;
}

// ============================================================================
// DASHBOARD CACHE ACCESSORS
// ============================================================================
export function getDashboardCache(periodId: number): DashboardCacheEntry | null {
  return dashboardCacheMap.get(periodId) ?? null;
}

export function setDashboardCache(
  periodId: number,
  data: FinanceDashboardData,
  errors: FinanceDashboardSectionErrors
): void {
  // Prune cache if exceeding limit
  if (dashboardCacheMap.size >= MAX_DASHBOARD_ENTRIES) {
    const now = Date.now();
    for (const [key, entry] of dashboardCacheMap.entries()) {
      if (now - entry.fetchedAt > DASHBOARD_MAX_STALE_TTL_MS) {
        dashboardCacheMap.delete(key);
      }
    }
    if (dashboardCacheMap.size >= MAX_DASHBOARD_ENTRIES) {
      // Remove the oldest inserted entry
      const firstKey = dashboardCacheMap.keys().next().value;
      if (firstKey !== undefined) {
        dashboardCacheMap.delete(firstKey);
      }
    }
  }

  dashboardCacheMap.set(periodId, {
    data,
    errors,
    fetchedAt: Date.now(),
  });
}

/**
 * Invalidate dashboard cache for a specific period or all periods.
 * Safe to be called from mutation workflows (e.g. journal creation, reversal).
 */
export function invalidateFinanceDashboardCache(periodId?: number): void {
  if (periodId !== undefined) {
    dashboardCacheMap.delete(periodId);
  } else {
    dashboardCacheMap.clear();
  }
}

export function getDashboardInFlight(
  periodId: number
):
  | Promise<{ data: FinanceDashboardData; errors: FinanceDashboardSectionErrors }>
  | undefined {
  return dashboardInFlightMap.get(periodId);
}

export function setDashboardInFlight(
  periodId: number,
  p:
    | Promise<{
        data: FinanceDashboardData;
        errors: FinanceDashboardSectionErrors;
      }>
    | null
): void {
  if (p) {
    dashboardInFlightMap.set(periodId, p);
  } else {
    dashboardInFlightMap.delete(periodId);
  }
}
