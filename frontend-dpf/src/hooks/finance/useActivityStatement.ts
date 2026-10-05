import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import {
  buildActivityStatementParams,
  buildActivityStatementCacheKey,
  type ActivityStatementFilterState,
} from "@/utils/finance/activityStatementQuery";
import {
  getActivityStatementCache,
  isActivityStatementCacheFresh,
  setActivityStatementCache,
  getActivityStatementInFlight,
  setActivityStatementInFlight,
  invalidateActivityStatementCache,
} from "@/utils/finance/activityStatementCache";
import type { ActivityStatementResponse } from "@/types/finance";

export { invalidateActivityStatementCache };

export interface UseActivityStatementReturn {
  activityStatementData: ActivityStatementResponse | null;
  initialLoading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  cacheKey: string;
}

export function useActivityStatement(
  filters: ActivityStatementFilterState
): UseActivityStatementReturn {
  const currentKey = buildActivityStatementCacheKey(filters);
  const activeKeyRef = useRef<string>(currentKey);
  const isMountedRef = useRef<boolean>(true);

  // Check initial cache state synchronously
  const initialCacheEntry = getActivityStatementCache(currentKey);
  const initialIsFresh = isActivityStatementCacheFresh(initialCacheEntry);

  const [activityStatementData, setActivityStatementData] =
    useState<ActivityStatementResponse | null>(
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
      filterParams: ReturnType<typeof buildActivityStatementParams>,
      forceBypassCache = false
    ) => {
      // 1. Check cache unless forced refresh
      if (!forceBypassCache) {
        const cached = getActivityStatementCache(key);
        if (cached) {
          if (activeKeyRef.current === key && isMountedRef.current) {
            setActivityStatementData(cached.data);
            setError(null);
            setInitialLoading(false);
          }

          // If strictly fresh, no network request needed
          if (isActivityStatementCacheFresh(cached)) {
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
      let requestPromise = getActivityStatementInFlight(key);

      if (!requestPromise || forceBypassCache) {
        requestPromise = financeService
          .getActivityStatement(filterParams)
          .then((res) => {
            setActivityStatementCache(key, res);
            return res;
          })
          .finally(() => {
            setActivityStatementInFlight(key, null);
          });

        setActivityStatementInFlight(key, requestPromise);
      }

      try {
        const response = await requestPromise;

        // 3. Race protection: only update state if this key is still the active one
        if (activeKeyRef.current === key && isMountedRef.current) {
          setActivityStatementData(response);
          setError(null);
        }
      } catch (err) {
        // Only set error if still on this active key
        if (activeKeyRef.current === key && isMountedRef.current) {
          if (!getActivityStatementCache(key)) {
            setError(extractFinanceErrorMessage(err, "Gagal memuat laporan aktivitas."));
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
    const key = buildActivityStatementCacheKey(filters);
    const params = buildActivityStatementParams(filters);

    void executeFetch(key, params, false);
  }, [filters, executeFetch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const key = buildActivityStatementCacheKey(filters);
    const params = buildActivityStatementParams(filters);
    await executeFetch(key, params, true);
  }, [filters, executeFetch]);

  return {
    activityStatementData,
    initialLoading,
    refreshing,
    error,
    refresh,
    cacheKey: currentKey,
  };
}
