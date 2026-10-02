import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import {
  buildTrialBalanceParams,
  buildTrialBalanceCacheKey,
  type TrialBalanceFilterState,
} from "@/utils/finance/trialBalanceQuery";
import {
  getTrialBalanceCache,
  isTrialBalanceCacheFresh,
  setTrialBalanceCache,
  getTrialBalanceInFlight,
  setTrialBalanceInFlight,
  invalidateTrialBalanceCache,
} from "@/utils/finance/trialBalanceCache";
import type { TrialBalanceResponse } from "@/types/finance";

export { invalidateTrialBalanceCache };

export interface UseTrialBalanceReturn {
  trialBalanceData: TrialBalanceResponse | null;
  initialLoading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  cacheKey: string;
}

export function useTrialBalance(
  filters: TrialBalanceFilterState
): UseTrialBalanceReturn {
  const currentKey = buildTrialBalanceCacheKey(filters);
  const activeKeyRef = useRef<string>(currentKey);
  const isMountedRef = useRef<boolean>(true);

  // Check initial cache state synchronously
  const initialCacheEntry = getTrialBalanceCache(currentKey);
  const initialIsFresh = isTrialBalanceCacheFresh(initialCacheEntry);

  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceResponse | null>(
    initialCacheEntry ? initialCacheEntry.data : null
  );
  const [initialLoading, setInitialLoading] = useState<boolean>(!initialCacheEntry);
  const [refreshing, setRefreshing] = useState<boolean>(
    Boolean(initialCacheEntry && !initialIsFresh)
  );
  const [error, setError] = useState<string | null>(null);

  // Update activeKeyRef on each render
  activeKeyRef.current = currentKey;

  const executeFetch = useCallback(
    async (
      key: string,
      filterParams: ReturnType<typeof buildTrialBalanceParams>,
      forceBypassCache = false
    ) => {
      // 1. Check cache unless forced refresh
      if (!forceBypassCache) {
        const cached = getTrialBalanceCache(key);
        if (cached) {
          if (activeKeyRef.current === key && isMountedRef.current) {
            setTrialBalanceData(cached.data);
            setError(null);
            setInitialLoading(false);
          }

          // If strictly fresh, no network request needed
          if (isTrialBalanceCacheFresh(cached)) {
            if (activeKeyRef.current === key && isMountedRef.current) {
              setRefreshing(false);
            }
            return;
          }

          // Stale-while-revalidate: keep visible cached data while refreshing in background
          if (activeKeyRef.current === key && isMountedRef.current) {
            setRefreshing(true);
          }
        } else {
          // No cache entry: show initial loading skeleton
          if (activeKeyRef.current === key && isMountedRef.current) {
            setInitialLoading(true);
            setError(null);
          }
        }
      } else {
        // Forced manual refresh: keep current visible data, show refreshing indicator
        if (activeKeyRef.current === key && isMountedRef.current) {
          setRefreshing(true);
          setError(null);
        }
      }

      // 2. Request deduplication: reuse in-flight promise if one is already pending
      let requestPromise = getTrialBalanceInFlight(key);

      if (!requestPromise || forceBypassCache) {
        requestPromise = financeService
          .getTrialBalance(filterParams)
          .then((res) => {
            // Update cache
            setTrialBalanceCache(key, res);
            return res;
          })
          .finally(() => {
            setTrialBalanceInFlight(key, null);
          });

        setTrialBalanceInFlight(key, requestPromise);
      }

      try {
        const response = await requestPromise;

        // 3. Race protection: only update state if this key is still the active one
        if (activeKeyRef.current === key && isMountedRef.current) {
          setTrialBalanceData(response);
          setError(null);
        }
      } catch (err) {
        // Only set error if still on this active key
        if (activeKeyRef.current === key && isMountedRef.current) {
          // If we already have cached data rendered, do not wipe it; just clear refreshing
          if (!getTrialBalanceCache(key)) {
            setError(extractFinanceErrorMessage(err, "Gagal memuat data neraca saldo."));
          }
        }
      } finally {
        if (activeKeyRef.current === key && isMountedRef.current) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  // Trigger query fetch whenever current key or filters change
  useEffect(() => {
    isMountedRef.current = true;
    const key = buildTrialBalanceCacheKey(filters);
    const params = buildTrialBalanceParams(filters);

    void executeFetch(key, params, false);

    return () => {
      // Don't mark isMountedRef false here because React StrictMode triggers cleanup/remount
    };
  }, [filters, executeFetch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const key = buildTrialBalanceCacheKey(filters);
    const params = buildTrialBalanceParams(filters);
    await executeFetch(key, params, true);
  }, [filters, executeFetch]);

  return {
    trialBalanceData,
    initialLoading,
    refreshing,
    error,
    refresh,
    cacheKey: currentKey,
  };
}
