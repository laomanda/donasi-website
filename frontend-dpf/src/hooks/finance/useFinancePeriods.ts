import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import type { AccountingPeriod } from "@/types/finance";
import {
  PERIODS_FRESH_TTL_MS,
  PERIODS_MAX_STALE_TTL_MS,
  getPeriodsCache,
  setPeriodsCache,
  invalidateFinancePeriodsCache,
  getPeriodsInFlight,
  setPeriodsInFlight,
} from "@/utils/financeDashboardCache";

function normalizePeriods(list: AccountingPeriod[]): AccountingPeriod[] {
  return (list || []).map((p) => ({
    ...p,
    name: p.name || p.period_name || `Periode #${p.id}`,
    period_name: p.period_name || p.name || `Periode #${p.id}`,
  }));
}

async function fetchAuthoritativePeriods(): Promise<AccountingPeriod[]> {
  const existingInFlight = getPeriodsInFlight();
  if (existingInFlight) {
    return existingInFlight;
  }

  const promise = (async () => {
    try {
      const rawList = await financeService.getAccountingPeriods();
      const list = normalizePeriods(rawList);
      setPeriodsCache(list);
      return list;
    } finally {
      setPeriodsInFlight(null);
    }
  })();

  setPeriodsInFlight(promise);
  return promise;
}

export interface UseFinancePeriodsReturn {
  periods: AccountingPeriod[];
  selectedPeriodId: number | null;
  setSelectedPeriodId: (id: number | null) => void;
  selectedPeriod: AccountingPeriod | null;
  loading: boolean;
  initialLoading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFinancePeriods(): UseFinancePeriodsReturn {
  const isMountedRef = useRef(true);

  // Initialize from cache if within usable stale TTL
  const cached = getPeriodsCache();
  const now = Date.now();
  const initialCacheValid =
    cached != null && now - cached.fetchedAt <= PERIODS_MAX_STALE_TTL_MS;

  const [periods, setPeriods] = useState<AccountingPeriod[]>(
    initialCacheValid ? cached!.data : []
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(() => {
    if (initialCacheValid && cached!.data.length > 0) {
      const openPeriod =
        cached!.data.find((p) => p.status === "open") ?? cached!.data[0];
      return openPeriod.id;
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!initialCacheValid);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPeriods = useCallback(async (force = false) => {
    const cachedEntry = getPeriodsCache();
    const currentTime = Date.now();
    const hasCached = cachedEntry != null;
    const isFresh =
      hasCached && currentTime - cachedEntry!.fetchedAt < PERIODS_FRESH_TTL_MS;
    const isUsableStale =
      hasCached &&
      currentTime - cachedEntry!.fetchedAt <= PERIODS_MAX_STALE_TTL_MS;

    // Use fresh cache immediately
    if (!force && isFresh) {
      if (isMountedRef.current) {
        setPeriods(cachedEntry!.data);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      }
      return;
    }

    if (force) {
      if (isMountedRef.current) {
        setRefreshing(true);
        // Only set blocking loading if there is currently no data
        setPeriods((prev) => {
          if (prev.length === 0) {
            setLoading(true);
          }
          return prev;
        });
      }
    } else if (isUsableStale) {
      // If usable stale, show cached data without blocking with skeleton
      if (isMountedRef.current) {
        setPeriods(cachedEntry!.data);
        setLoading(false);
        setRefreshing(true);
      }
    } else {
      if (isMountedRef.current) {
        setLoading(true);
      }
    }

    try {
      if (force) {
        invalidateFinancePeriodsCache();
      }
      const list = await fetchAuthoritativePeriods();
      if (isMountedRef.current) {
        setPeriods(list);
        setError(null);
        setSelectedPeriodId((prev) => {
          if (prev != null && list.some((p) => p.id === prev)) {
            return prev;
          }
          if (list.length > 0) {
            const openPeriod =
              list.find((p) => p.status === "open") ?? list[0];
            return openPeriod.id;
          }
          return null;
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        const msg = extractFinanceErrorMessage(
          err,
          "Gagal memuat daftar periode akuntansi."
        );
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadPeriods(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [loadPeriods]);

  const refresh = useCallback(async () => {
    await loadPeriods(true);
  }, [loadPeriods]);

  const selectedPeriod = useMemo(() => {
    return periods.find((p) => p.id === selectedPeriodId) ?? null;
  }, [periods, selectedPeriodId]);

  const initialLoading = loading && periods.length === 0;

  return {
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    selectedPeriod,
    loading,
    initialLoading,
    refreshing,
    error,
    refresh,
  };
}
