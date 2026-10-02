import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import type { Account } from "@/types/finance";
import { useAccountsData } from "./useAccountsData";

// In-memory cache for individual account details
const singleAccountCache = new Map<number, { data: Account; fetchedAt: number }>();
const FRESH_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateAccountCache(id?: number): void {
  if (id !== undefined) {
    singleAccountCache.delete(id);
  } else {
    singleAccountCache.clear();
  }
}

export interface UseAccountReturn {
  account: Account | null;
  loading: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
}

export function useAccount(id: number | null | undefined): UseAccountReturn {
  const isMountedRef = useRef(true);
  const activeIdRef = useRef<number | null | undefined>(id);
  activeIdRef.current = id;

  // Check if account already exists in list cache
  const { accounts } = useAccountsData();

  const getCachedAccount = useCallback(
    (targetId: number): Account | null => {
      // 1. Check detailed single account cache
      const detailed = singleAccountCache.get(targetId);
      if (detailed) {
        return detailed.data;
      }
      // 2. Fallback to list cache if present
      const fromList = accounts.find((a) => a.id === targetId);
      return fromList ?? null;
    },
    [accounts]
  );

  const initialAccount = id != null ? getCachedAccount(id) : null;
  const [account, setAccount] = useState<Account | null>(initialAccount);
  const [loading, setLoading] = useState<boolean>(id != null && !initialAccount);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(
    async (targetId: number, force = false) => {
      const cached = singleAccountCache.get(targetId);
      const isFresh =
        cached && Date.now() - cached.fetchedAt < FRESH_TTL_MS;

      // If fresh cache hit and not force, use it directly
      if (!force && isFresh) {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setAccount(cached.data);
          setLoading(false);
          setError(null);
        }
        return;
      }

      // If we have stale or list-derived account, do not show blocking skeleton
      const existing = getCachedAccount(targetId);
      if (existing) {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setAccount(existing);
          setLoading(false);
        }
      } else {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setLoading(true);
        }
      }

      try {
        if (force) {
          invalidateAccountCache(targetId);
        }
        const data = await financeService.getAccount(targetId);
        singleAccountCache.set(targetId, { data, fetchedAt: Date.now() });

        if (isMountedRef.current && activeIdRef.current === targetId) {
          setAccount(data);
          setError(null);
        }
      } catch (err) {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          // If we already have list data, keep it and show non-blocking notice
          if (!existing) {
            const msg = extractFinanceErrorMessage(
              err,
              "Gagal memuat detail akun perkiraan."
            );
            setError(msg);
          }
        }
      } finally {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setLoading(false);
        }
      }
    },
    [getCachedAccount]
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (id != null && Number.isFinite(id)) {
      const immediate = getCachedAccount(id);
      if (immediate) {
        setAccount(immediate);
        setLoading(false);
      } else {
        setAccount(null);
        setLoading(true);
      }
      fetchDetail(id, false);
    } else {
      setAccount(null);
      setLoading(false);
      setError(id != null ? "ID akun tidak valid." : null);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [id, fetchDetail, getCachedAccount]);

  const refresh = useCallback(async (force = true) => {
    if (id != null && Number.isFinite(id)) {
      await fetchDetail(id, force);
    }
  }, [id, fetchDetail]);

  return {
    account,
    loading,
    error,
    refresh,
  };
}
