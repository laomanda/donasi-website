import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { buildWaqfAssetDetailCacheKey } from "@/utils/finance/waqfAssetQuery";
import {
  getWaqfAssetDetailCache,
  isWaqfAssetCacheFresh,
  setWaqfAssetDetailCache,
  getWaqfAssetDetailInFlight,
  setWaqfAssetDetailInFlight,
  invalidateWaqfAssetDetailCache,
} from "@/utils/finance/waqfAssetCache";
import type { WaqfAssetItem } from "@/types/finance";

export { invalidateWaqfAssetDetailCache };

export interface UseWaqfAssetReturn {
  assetData: WaqfAssetItem | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWaqfAsset(
  assetId: number | string | undefined,
  periodId?: number | string | null
): UseWaqfAssetReturn {
  const numId = assetId !== undefined ? Number(assetId) : NaN;
  const isValidId = !isNaN(numId) && numId > 0;

  const currentKey = isValidId ? buildWaqfAssetDetailCacheKey(numId, periodId) : "";
  const activeKeyRef = useRef<string>(currentKey);
  const isMountedRef = useRef<boolean>(true);

  const initialCacheEntry = isValidId ? getWaqfAssetDetailCache(currentKey) : null;
  const initialIsFresh = isWaqfAssetCacheFresh(initialCacheEntry);

  const [assetData, setAssetData] = useState<WaqfAssetItem | null>(
    initialCacheEntry ? initialCacheEntry.data : null
  );
  const [loading, setLoading] = useState<boolean>(Boolean(isValidId && !initialCacheEntry));
  const [refreshing, setRefreshing] = useState<boolean>(
    Boolean(initialCacheEntry && !initialIsFresh)
  );
  const [error, setError] = useState<string | null>(
    !isValidId && assetId !== undefined ? "ID Aset Wakaf tidak valid." : null
  );

  activeKeyRef.current = currentKey;

  const executeFetch = useCallback(
    async (id: number, pId?: number | string | null, forceBypass = false) => {
      const key = buildWaqfAssetDetailCacheKey(id, pId);

      // 1. Cache lookup
      if (!forceBypass) {
        const cached = getWaqfAssetDetailCache(key);
        if (cached) {
          if (activeKeyRef.current === key && isMountedRef.current) {
            setAssetData(cached.data);
            setError(null);
            setLoading(false);
          }

          if (isWaqfAssetCacheFresh(cached)) {
            if (activeKeyRef.current === key && isMountedRef.current) {
              setRefreshing(false);
            }
            return;
          }

          if (activeKeyRef.current === key && isMountedRef.current) {
            setRefreshing(true);
          }
        } else {
          if (activeKeyRef.current === key && isMountedRef.current) {
            setLoading(true);
            setError(null);
          }
        }
      } else {
        if (activeKeyRef.current === key && isMountedRef.current) {
          setRefreshing(true);
          setError(null);
        }
      }

      // 2. Request deduplication
      let requestPromise = getWaqfAssetDetailInFlight(key);

      if (!requestPromise || forceBypass) {
        const params: { period_id?: number; accounting_period_id?: number } = {};
        if (pId !== undefined && pId !== null && pId !== "" && !isNaN(Number(pId))) {
          params.period_id = Number(pId);
          params.accounting_period_id = Number(pId);
        }

        requestPromise = financeService
          .getWaqfAssetDetail(id, params)
          .then((res) => {
            setWaqfAssetDetailCache(key, res);
            return res;
          })
          .finally(() => {
            setWaqfAssetDetailInFlight(key, null);
          });

        setWaqfAssetDetailInFlight(key, requestPromise);
      }

      try {
        const response = await requestPromise;

        // 3. Race protection
        if (activeKeyRef.current === key && isMountedRef.current) {
          setAssetData(response);
          setError(null);
        }
      } catch (err) {
        if (activeKeyRef.current === key && isMountedRef.current) {
          if (!getWaqfAssetDetailCache(key)) {
            setError(extractFinanceErrorMessage(err, "Gagal memuat detail aset wakaf."));
          }
        }
      } finally {
        if (activeKeyRef.current === key && isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    if (isValidId) {
      activeKeyRef.current = buildWaqfAssetDetailCacheKey(numId, periodId);
      void executeFetch(numId, periodId, false);
    } else if (assetId !== undefined) {
      setLoading(false);
      setError("ID Aset Wakaf tidak valid.");
      setAssetData(null);
    }
  }, [isValidId, numId, periodId, assetId, executeFetch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (isValidId) {
      await executeFetch(numId, periodId, true);
    }
  }, [isValidId, numId, periodId, executeFetch]);

  return {
    assetData,
    loading,
    refreshing,
    error,
    refresh,
  };
}
