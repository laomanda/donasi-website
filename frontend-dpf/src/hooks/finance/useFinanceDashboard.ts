import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import {
  type FinanceDashboardData,
  type FinanceDashboardSectionErrors,
  type FinanceDashboardMetrics,
  normalizeFinanceMetrics,
} from "@/utils/financeDashboardMetrics";
import {
  DASHBOARD_FRESH_TTL_MS,
  DASHBOARD_MAX_STALE_TTL_MS,
  getDashboardCache,
  setDashboardCache,
  invalidateFinanceDashboardCache,
  getDashboardInFlight,
  setDashboardInFlight,
} from "@/utils/financeDashboardCache";

const EMPTY_DASHBOARD_DATA: FinanceDashboardData = {
  balanceSheet: null,
  activityStatement: null,
  trialBalance: null,
  reconciliation: null,
  recentJournals: [],
};

async function fetchAuthoritativeDashboard(
  periodId: number
): Promise<{ data: FinanceDashboardData; errors: FinanceDashboardSectionErrors }> {
  const existingInFlight = getDashboardInFlight(periodId);
  if (existingInFlight) {
    return existingInFlight;
  }

  const promise = (async () => {
    try {
      const [bsRes, actRes, tbRes, reconRes, jRes] = await Promise.allSettled([
        financeService.getBalanceSheet({ period_id: periodId }),
        financeService.getActivityStatement({ period_id: periodId }),
        financeService.getTrialBalance({ period_id: periodId }),
        financeService.getReconciliationSummary({ period_id: periodId }),
        financeService.getJournals({ period_id: periodId, per_page: 5 }),
      ]);

      const data: FinanceDashboardData = { ...EMPTY_DASHBOARD_DATA };
      const errors: FinanceDashboardSectionErrors = {};

      // 1. Balance Sheet
      if (bsRes.status === "fulfilled") {
        data.balanceSheet = bsRes.value;
      } else {
        errors.balanceSheet = extractFinanceErrorMessage(
          bsRes.reason,
          "Gagal memuat laporan posisi keuangan."
        );
      }

      // 2. Activity Statement
      if (actRes.status === "fulfilled") {
        data.activityStatement = actRes.value;
      } else {
        errors.activity = extractFinanceErrorMessage(
          actRes.reason,
          "Gagal memuat laporan aktivitas periode."
        );
      }

      // 3. Trial Balance
      if (tbRes.status === "fulfilled") {
        data.trialBalance = tbRes.value;
      } else {
        errors.trialBalance = extractFinanceErrorMessage(
          tbRes.reason,
          "Gagal memuat neraca saldo."
        );
      }

      // 4. Reconciliation
      if (reconRes.status === "fulfilled") {
        data.reconciliation = reconRes.value;
      } else {
        errors.reconciliation = extractFinanceErrorMessage(
          reconRes.reason,
          "Gagal memuat ringkasan rekonsiliasi."
        );
      }

      // 5. Recent Journals
      if (jRes.status === "fulfilled") {
        data.recentJournals = jRes.value?.data || [];
      } else {
        errors.journals = extractFinanceErrorMessage(
          jRes.reason,
          "Gagal memuat transaksi jurnal terbaru."
        );
      }

      setDashboardCache(periodId, data, errors);
      return { data, errors };
    } finally {
      setDashboardInFlight(periodId, null);
    }
  })();

  setDashboardInFlight(periodId, promise);
  return promise;
}

export interface UseFinanceDashboardReturn {
  data: FinanceDashboardData;
  sectionErrors: FinanceDashboardSectionErrors;
  initialLoading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  metrics: FinanceDashboardMetrics;
}

export function useFinanceDashboard(
  periodId: number | null
): UseFinanceDashboardReturn {
  const isMountedRef = useRef(true);
  const activePeriodIdRef = useRef<number | null>(periodId);
  activePeriodIdRef.current = periodId;

  // Determine initial state from cache
  const cached = periodId != null ? getDashboardCache(periodId) : null;
  const now = Date.now();
  const initialCacheValid =
    cached != null && now - cached.fetchedAt <= DASHBOARD_MAX_STALE_TTL_MS;

  const [data, setData] = useState<FinanceDashboardData>(
    initialCacheValid ? cached!.data : EMPTY_DASHBOARD_DATA
  );
  const [sectionErrors, setSectionErrors] = useState<FinanceDashboardSectionErrors>(
    initialCacheValid ? cached!.errors : {}
  );
  const [initialLoading, setInitialLoading] = useState<boolean>(
    periodId != null && !initialCacheValid
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(
    async (targetPeriodId: number, force = false) => {
      const cachedEntry = getDashboardCache(targetPeriodId);
      const currentTime = Date.now();
      const hasCached = cachedEntry != null;
      const isFresh =
        hasCached && currentTime - cachedEntry!.fetchedAt < DASHBOARD_FRESH_TTL_MS;
      const isUsableStale =
        hasCached &&
        currentTime - cachedEntry!.fetchedAt <= DASHBOARD_MAX_STALE_TTL_MS;

      // 1. Fresh cache hit without force
      if (!force && isFresh) {
        if (
          isMountedRef.current &&
          activePeriodIdRef.current === targetPeriodId
        ) {
          setData(cachedEntry!.data);
          setSectionErrors(cachedEntry!.errors);
          setInitialLoading(false);
          setRefreshing(false);
        }
        return;
      }

      // 2. Usable stale hit: immediately show cached data, background refresh
      if (isUsableStale && !force) {
        if (
          isMountedRef.current &&
          activePeriodIdRef.current === targetPeriodId
        ) {
          setData(cachedEntry!.data);
          setSectionErrors(cachedEntry!.errors);
          setInitialLoading(false);
          setRefreshing(true);
        }
      } else if (force && hasCached) {
        if (
          isMountedRef.current &&
          activePeriodIdRef.current === targetPeriodId
        ) {
          setRefreshing(true);
        }
      } else {
        if (
          isMountedRef.current &&
          activePeriodIdRef.current === targetPeriodId
        ) {
          setInitialLoading(true);
        }
      }

      try {
        if (force) {
          invalidateFinanceDashboardCache(targetPeriodId);
        }
        const result = await fetchAuthoritativeDashboard(targetPeriodId);

        // Only commit to component state if this targetPeriod is still the active one
        if (
          isMountedRef.current &&
          activePeriodIdRef.current === targetPeriodId
        ) {
          setData(result.data);
          setSectionErrors(result.errors);
        }
      } catch (err) {
        if (
          isMountedRef.current &&
          activePeriodIdRef.current === targetPeriodId
        ) {
          const msg = extractFinanceErrorMessage(
            err,
            "Gagal memuat data ringkasan keuangan."
          );
          setSectionErrors((prev) => ({
            ...prev,
            balanceSheet: prev.balanceSheet || msg,
          }));
        }
      } finally {
        if (
          isMountedRef.current &&
          activePeriodIdRef.current === targetPeriodId
        ) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (periodId != null) {
      // Check cache when periodId changes to ensure instant switch
      const targetCached = getDashboardCache(periodId);
      const currentTime = Date.now();
      const valid =
        targetCached != null &&
        currentTime - targetCached.fetchedAt <= DASHBOARD_MAX_STALE_TTL_MS;

      if (valid) {
        setData(targetCached!.data);
        setSectionErrors(targetCached!.errors);
        setInitialLoading(false);
      } else {
        setData(EMPTY_DASHBOARD_DATA);
        setSectionErrors({});
        setInitialLoading(true);
      }

      loadData(periodId, false);
    } else {
      setData(EMPTY_DASHBOARD_DATA);
      setSectionErrors({});
      setInitialLoading(false);
      setRefreshing(false);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [periodId, loadData]);

  const refresh = useCallback(async () => {
    if (periodId != null) {
      await loadData(periodId, true);
    }
  }, [periodId, loadData]);

  const metrics = useMemo(() => {
    return normalizeFinanceMetrics(data.balanceSheet, data.activityStatement);
  }, [data.balanceSheet, data.activityStatement]);

  return {
    data,
    sectionErrors,
    initialLoading,
    refreshing,
    refresh,
    metrics,
  };
}
