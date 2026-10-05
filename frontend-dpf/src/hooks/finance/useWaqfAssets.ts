import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import {
  buildWaqfAssetReportParams,
  buildWaqfAssetReportCacheKey,
  type WaqfAssetFilterState,
} from "@/utils/finance/waqfAssetQuery";
import {
  getWaqfAssetReportCache,
  isWaqfAssetCacheFresh,
  setWaqfAssetReportCache,
  getWaqfAssetReportInFlight,
  setWaqfAssetReportInFlight,
  invalidateWaqfAssetsCache,
} from "@/utils/finance/waqfAssetCache";
import type { WaqfAssetReportResponse } from "@/types/finance";

export { invalidateWaqfAssetsCache };

export interface UseWaqfAssetsReturn {
  reportData: WaqfAssetReportResponse | null;
  initialLoading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  cacheKey: string;
}

export function useWaqfAssets(
  filters: Pick<WaqfAssetFilterState, "periodId" | "categoryId" | "status">
): UseWaqfAssetsReturn {
  const currentKey = buildWaqfAssetReportCacheKey(filters);
  const activeKeyRef = useRef<string>(currentKey);
  const isMountedRef = useRef<boolean>(true);

  // Synchronously check cache entry on mount/key change
  const initialCacheEntry = getWaqfAssetReportCache(currentKey);
  const initialIsFresh = isWaqfAssetCacheFresh(initialCacheEntry);

  const [reportData, setReportData] = useState<WaqfAssetReportResponse | null>(
    initialCacheEntry ? initialCacheEntry.data : null
  );
  const [initialLoading, setInitialLoading] = useState<boolean>(!initialCacheEntry);
  const [refreshing, setRefreshing] = useState<boolean>(
    Boolean(initialCacheEntry && !initialIsFresh)
  );
  const [error, setError] = useState<string | null>(null);

  activeKeyRef.current = currentKey;

  const executeFetch = useCallback(
    async (
      key: string,
      filterParams: ReturnType<typeof buildWaqfAssetReportParams>,
      forceBypassCache = false
    ) => {
      // 1. Cache lookup
      if (!forceBypassCache) {
        const cached = getWaqfAssetReportCache(key);
        if (cached) {
          if (activeKeyRef.current === key && isMountedRef.current) {
            setReportData(cached.data);
            setError(null);
            setInitialLoading(false);
          }

          if (isWaqfAssetCacheFresh(cached)) {
            if (activeKeyRef.current === key && isMountedRef.current) {
              setRefreshing(false);
            }
            return;
          }

          // Stale-while-revalidate
          if (activeKeyRef.current === key && isMountedRef.current) {
            setRefreshing(true);
          }
        } else {
          // No cache entry
          if (activeKeyRef.current === key && isMountedRef.current) {
            setInitialLoading(true);
            setError(null);
          }
        }
      } else {
        // Forced manual refresh
        if (activeKeyRef.current === key && isMountedRef.current) {
          setRefreshing(true);
          setError(null);
        }
      }

      // 2. Request deduplication
      let requestPromise = getWaqfAssetReportInFlight(key);

      if (!requestPromise || forceBypassCache) {
        requestPromise = financeService
          .getWaqfAssetReport(filterParams)
          .then((res) => {
            setWaqfAssetReportCache(key, res);
            return res;
          })
          .finally(() => {
            setWaqfAssetReportInFlight(key, null);
          });

        setWaqfAssetReportInFlight(key, requestPromise);
      }

      try {
        const response = await requestPromise;

        // 3. Race protection
        if (activeKeyRef.current === key && isMountedRef.current) {
          setReportData(response);
          setError(null);
        }
      } catch (err) {
        if (activeKeyRef.current === key && isMountedRef.current) {
          if (!getWaqfAssetReportCache(key)) {
            setError(extractFinanceErrorMessage(err, "Gagal memuat laporan aset wakaf."));
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

  // Trigger query fetch on key changes
  useEffect(() => {
    isMountedRef.current = true;
    const key = buildWaqfAssetReportCacheKey(filters);
    const params = buildWaqfAssetReportParams(filters);

    void executeFetch(key, params, false);
  }, [filters, executeFetch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const key = buildWaqfAssetReportCacheKey(filters);
    const params = buildWaqfAssetReportParams(filters);
    await executeFetch(key, params, true);
  }, [filters, executeFetch]);

  return {
    reportData,
    initialLoading,
    refreshing,
    error,
    refresh,
    cacheKey: currentKey,
  };
}
