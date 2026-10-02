import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import {
  buildGeneralLedgerParams,
  buildGeneralLedgerCacheKey,
  type GeneralLedgerFilterState,
} from "@/utils/finance/generalLedgerQuery";
import {
  getGeneralLedgerCache,
  isGeneralLedgerCacheFresh,
  setGeneralLedgerCache,
  getGeneralLedgerInFlight,
  setGeneralLedgerInFlight,
  invalidateGeneralLedgerCache,
} from "@/utils/finance/generalLedgerCache";
import type { GeneralLedgerResponse } from "@/types/finance";

export { invalidateGeneralLedgerCache };

export interface UseGeneralLedgerReturn {
  ledgerData: GeneralLedgerResponse | null;
  initialLoading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  cacheKey: string;
}

export function useGeneralLedger(
  filters: GeneralLedgerFilterState
): UseGeneralLedgerReturn {
  const currentKey = buildGeneralLedgerCacheKey(filters);
  const activeKeyRef = useRef<string>(currentKey);
  const isMountedRef = useRef<boolean>(true);

  // Check initial cache state synchronously
  const initialCacheEntry = getGeneralLedgerCache(currentKey);
  const initialIsFresh = isGeneralLedgerCacheFresh(initialCacheEntry);

  const [ledgerData, setLedgerData] = useState<GeneralLedgerResponse | null>(
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
    async (key: string, filterParams: ReturnType<typeof buildGeneralLedgerParams>, forceBypassCache = false) => {
      // 1. Check cache unless forced refresh
      if (!forceBypassCache) {
        const cached = getGeneralLedgerCache(key);
        if (cached) {
          if (activeKeyRef.current === key && isMountedRef.current) {
            setLedgerData(cached.data);
            setError(null);
            setInitialLoading(false);
          }

          // If fresh, no network call needed!
          if (isGeneralLedgerCacheFresh(cached)) {
            if (activeKeyRef.current === key && isMountedRef.current) {
              setRefreshing(false);
            }
            return;
          }

          // Stale: keep cache visible while refreshing in background
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
        // Forced manual refresh: keep current ledger visible, show subtle refreshing indicator
        if (activeKeyRef.current === key && isMountedRef.current) {
          setRefreshing(true);
          setError(null);
        }
      }

      // 2. Request deduplication: reuse in-flight promise if one is already pending for this key
      let requestPromise = getGeneralLedgerInFlight(key);

      if (!requestPromise || forceBypassCache) {
        requestPromise = financeService
          .getGeneralLedger(filterParams)
          .then((res) => {
            // Update cache
            setGeneralLedgerCache(key, res);
            setGeneralLedgerInFlight(key, null);
            return res;
          })
          .catch((err) => {
            setGeneralLedgerInFlight(key, null);
            throw err;
          });

        setGeneralLedgerInFlight(key, requestPromise);
      }

      // 3. Await response and apply race protection
      try {
        const result = await requestPromise;

        // Race protection: only update state if this request is still the active key!
        if (activeKeyRef.current === key && isMountedRef.current) {
          setLedgerData(result);
          setError(null);
          setInitialLoading(false);
          setRefreshing(false);
        }
      } catch (err) {
        if (activeKeyRef.current === key && isMountedRef.current) {
          setError(extractFinanceErrorMessage(err, "Gagal memuat data buku besar."));
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  // Trigger SWR fetch whenever currentKey changes
  useEffect(() => {
    isMountedRef.current = true;
    const params = buildGeneralLedgerParams(filters);

    void executeFetch(currentKey, params, false);

    return () => {
      // Cleanup flag on unmount
      isMountedRef.current = false;
    };
  }, [currentKey, filters, executeFetch]);

  // Manual refresh bypasses cache
  const refresh = useCallback(async () => {
    const params = buildGeneralLedgerParams(filters);
    await executeFetch(currentKey, params, true);
  }, [currentKey, filters, executeFetch]);

  return {
    ledgerData,
    initialLoading,
    refreshing,
    error,
    refresh,
    cacheKey: currentKey,
  };
}

export default useGeneralLedger;
