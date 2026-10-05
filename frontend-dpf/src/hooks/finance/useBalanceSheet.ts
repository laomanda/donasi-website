import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import {
  buildBalanceSheetParams,
  buildBalanceSheetCacheKey,
  type BalanceSheetFilterState,
} from "@/utils/finance/balanceSheetQuery";
import {
  getBalanceSheetCache,
  isBalanceSheetCacheFresh,
  setBalanceSheetCache,
  getBalanceSheetInFlight,
  setBalanceSheetInFlight,
  invalidateBalanceSheetCache,
} from "@/utils/finance/balanceSheetCache";
import type { BalanceSheetResponse } from "@/types/finance";

export { invalidateBalanceSheetCache };

export interface UseBalanceSheetReturn {
  balanceSheetData: BalanceSheetResponse | null;
  initialLoading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  cacheKey: string;
}

export function useBalanceSheet(
  filters: BalanceSheetFilterState
): UseBalanceSheetReturn {
  const currentKey = buildBalanceSheetCacheKey(filters);
  const activeKeyRef = useRef<string>(currentKey);
  const isMountedRef = useRef<boolean>(true);

  // Check initial cache state synchronously
  const initialCacheEntry = getBalanceSheetCache(currentKey);
  const initialIsFresh = isBalanceSheetCacheFresh(initialCacheEntry);

  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetResponse | null>(
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
      filterParams: ReturnType<typeof buildBalanceSheetParams>,
      forceBypassCache = false
    ) => {
      // 1. Check cache unless forced refresh
      if (!forceBypassCache) {
        const cached = getBalanceSheetCache(key);
        if (cached) {
          if (activeKeyRef.current === key && isMountedRef.current) {
            setBalanceSheetData(cached.data);
            setError(null);
            setInitialLoading(false);
          }

          // If strictly fresh, no network request needed
          if (isBalanceSheetCacheFresh(cached)) {
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
      let requestPromise = getBalanceSheetInFlight(key);

      if (!requestPromise || forceBypassCache) {
        requestPromise = financeService
          .getBalanceSheet(filterParams)
          .then((res) => {
            // Update cache
            setBalanceSheetCache(key, res);
            return res;
          })
          .finally(() => {
            setBalanceSheetInFlight(key, null);
          });

        setBalanceSheetInFlight(key, requestPromise);
      }

      try {
        const response = await requestPromise;

        // 3. Race protection: only update state if this key is still the active one
        if (activeKeyRef.current === key && isMountedRef.current) {
          setBalanceSheetData(response);
          setError(null);
        }
      } catch (err) {
        // Only set error if still on this active key
        if (activeKeyRef.current === key && isMountedRef.current) {
          // If we already have cached data rendered, do not wipe it; just clear refreshing
          if (!getBalanceSheetCache(key)) {
            setError(extractFinanceErrorMessage(err, "Gagal memuat laporan posisi keuangan."));
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
    const key = buildBalanceSheetCacheKey(filters);
    const params = buildBalanceSheetParams(filters);

    void executeFetch(key, params, false);
  }, [filters, executeFetch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const key = buildBalanceSheetCacheKey(filters);
    const params = buildBalanceSheetParams(filters);
    await executeFetch(key, params, true);
  }, [filters, executeFetch]);

  return {
    balanceSheetData,
    initialLoading,
    refreshing,
    error,
    refresh,
    cacheKey: currentKey,
  };
}
