import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import type { Account, AccountSummary } from "@/types/finance";

// ============================================================================
// IN-MEMORY / MODULE-LEVEL CACHE & DEDUPLICATION
// ============================================================================
export interface AccountsCacheData {
  accounts: Account[];
  summary: AccountSummary | null;
  fetchedAt: number;
}

const FRESH_TTL_MS = 60 * 1000; // 60 seconds fresh TTL
const MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes maximum stale usable cache

let accountsModuleCache: AccountsCacheData | null = null;
let inFlightRequest: Promise<{ accounts: Account[]; summary: AccountSummary | null }> | null = null;

/**
 * Invalidate the in-memory accounts cache.
 * Call after account creation, update, deletion, or deactivation.
 */
export function invalidateAccountsCache(): void {
  accountsModuleCache = null;
}
export const invalidateAccountsDataCache = invalidateAccountsCache;

/**
 * Authoritative fetcher with request deduplication.
 * Prevents multiple identical simultaneous calls caused by remounts or rapid interactions.
 */
async function fetchAuthoritativeAccounts(): Promise<{ accounts: Account[]; summary: AccountSummary | null }> {
  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = (async () => {
    try {
      const res = await financeService.getAccounts({ all: true });
      const rawData = res.data;
      const list: Account[] = Array.isArray(rawData)
        ? rawData
        : (rawData as { data?: Account[] })?.data ?? [];

      const summary = res.summary ?? null;

      accountsModuleCache = {
        accounts: list,
        summary,
        fetchedAt: Date.now(),
      };

      return { accounts: list, summary };
    } finally {
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
}

export interface UseAccountsDataReturn {
  accounts: Account[];
  summary: AccountSummary | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

export function useAccountsData(): UseAccountsDataReturn {
  const isMountedRef = useRef(true);

  // Initialize from cache if within usable stale TTL
  const now = Date.now();
  const initialCacheValid =
    accountsModuleCache != null &&
    now - accountsModuleCache.fetchedAt <= MAX_STALE_TTL_MS;

  const [accounts, setAccounts] = useState<Account[]>(
    initialCacheValid ? accountsModuleCache!.accounts : []
  );
  const [summary, setSummary] = useState<AccountSummary | null>(
    initialCacheValid ? accountsModuleCache!.summary : null
  );
  const [loading, setLoading] = useState<boolean>(!initialCacheValid);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (force = false) => {
    const currentTime = Date.now();
    const hasCached = accountsModuleCache != null;
    const isFresh =
      hasCached && currentTime - accountsModuleCache!.fetchedAt < FRESH_TTL_MS;
    const isUsableStale =
      hasCached &&
      currentTime - accountsModuleCache!.fetchedAt <= MAX_STALE_TTL_MS;

    // If cache is fresh and not a forced refresh, use cache directly
    if (!force && isFresh) {
      if (isMountedRef.current) {
        setAccounts(accountsModuleCache!.accounts);
        setSummary(accountsModuleCache!.summary);
        setLoading(false);
        setIsRefreshing(false);
        setError(null);
      }
      return;
    }

    // Determine loading UI state:
    // If we have usable stale data, do NOT blank screen with skeleton; show refreshing indicator instead.
    if (isUsableStale && !force) {
      if (isMountedRef.current) {
        setAccounts(accountsModuleCache!.accounts);
        setSummary(accountsModuleCache!.summary);
        setLoading(false);
        setIsRefreshing(true);
      }
    } else if (force && accounts.length > 0) {
      if (isMountedRef.current) {
        setIsRefreshing(true);
      }
    } else {
      if (isMountedRef.current) {
        setLoading(true);
      }
    }

    try {
      if (force) {
        invalidateAccountsCache();
      }
      const data = await fetchAuthoritativeAccounts();
      if (isMountedRef.current) {
        setAccounts(data.accounts);
        setSummary(data.summary);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const msg = extractFinanceErrorMessage(err, "Gagal memuat daftar akun.");
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [accounts.length]);

  useEffect(() => {
    isMountedRef.current = true;
    loadData(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  const refresh = useCallback(
    async (force = true) => {
      await loadData(force);
    },
    [loadData]
  );

  return {
    accounts,
    summary,
    loading,
    isRefreshing,
    error,
    refresh,
    invalidateCache: invalidateAccountsCache,
  };
}
