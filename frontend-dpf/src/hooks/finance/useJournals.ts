import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import type {
  JournalEntry,
  JournalStatus,
  JournalFilterParams,
  PaginatedFinanceResponse,
} from "@/types/finance";

// ============================================================================
// IN-MEMORY / MODULE-LEVEL CACHE & DEDUPLICATION FOR JOURNAL LISTS
// ============================================================================
export interface JournalListCacheEntry {
  response: PaginatedFinanceResponse<JournalEntry>;
  fetchedAt: number;
}

const FRESH_TTL_MS = 35 * 1000; // 35 seconds fresh
const MAX_STALE_TTL_MS = 2.5 * 60 * 1000; // 2.5 minutes maximum usable stale
const MAX_CACHE_ENTRIES = 50; // Bound cache size to prevent memory leaks

const listCache = new Map<string, JournalListCacheEntry>();
const inFlightRequests = new Map<string, Promise<PaginatedFinanceResponse<JournalEntry>>>();

/**
 * Deterministic serialization of journal query parameters into a cache key.
 */
export function buildJournalQueryKey(params: JournalFilterParams): string {
  const p = params.period_id !== undefined && params.period_id !== "" ? params.period_id : "";
  const s = params.status || "";
  const q = (params.q || "").trim().toLowerCase();
  const from = params.date_from || "";
  const to = params.date_to || "";
  const page = params.page || 1;
  const perPage = params.per_page || 15;
  const acc = params.account_id || "";

  return `finance:journals:p=${p}:s=${s}:q=${q}:f=${from}:t=${to}:acc=${acc}:pg=${page}:size=${perPage}`;
}

/**
 * Invalidate all journal list cache entries or targeted entries.
 */
export function invalidateJournalListCache(): void {
  listCache.clear();
}
export const invalidateJournalsCache = invalidateJournalListCache;

/**
 * Clean up old cache entries if map exceeds maximum allowed capacity.
 */
function pruneCacheIfNeeded() {
  if (listCache.size > MAX_CACHE_ENTRIES) {
    const now = Date.now();
    for (const [key, entry] of listCache.entries()) {
      if (now - entry.fetchedAt > MAX_STALE_TTL_MS) {
        listCache.delete(key);
      }
    }
    // If still too large, delete oldest
    if (listCache.size > MAX_CACHE_ENTRIES) {
      const oldestKeys = Array.from(listCache.keys()).slice(0, 10);
      oldestKeys.forEach((k) => listCache.delete(k));
    }
  }
}

export type UseJournalsOptions = JournalFilterParams | {
  page?: number;
  perPage?: number;
  per_page?: number;
  q?: string;
  debouncedSearch?: string;
  status?: JournalStatus | "";
  statusFilter?: JournalStatus | "";
  period_id?: number | "";
  periodFilter?: number | "";
  date_from?: string;
  dateFrom?: string;
  date_to?: string;
  dateTo?: string;
  account_id?: number | "";
  accountId?: number | "";
};

export interface UseJournalsReturn {
  journals: JournalEntry[];
  currentPage: number;
  lastPage: number;
  totalItems: number;
  fromItem: number;
  toItem: number;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
  };
  loading: boolean;
  isRefreshing: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
}

export function useJournals(options: UseJournalsOptions = {}): UseJournalsReturn {
  const page = options.page || 1;
  const perPage =
    "per_page" in options && options.per_page
      ? options.per_page
      : "perPage" in options && options.perPage
      ? options.perPage
      : 15;
  const q =
    "q" in options && options.q
      ? options.q
      : "debouncedSearch" in options && options.debouncedSearch
      ? options.debouncedSearch
      : "";
  const status =
    "status" in options && options.status
      ? options.status
      : "statusFilter" in options && options.statusFilter
      ? options.statusFilter
      : "";
  const periodId =
    "period_id" in options && options.period_id !== undefined
      ? options.period_id
      : "periodFilter" in options && options.periodFilter !== undefined
      ? options.periodFilter
      : "";
  const dateFrom =
    "date_from" in options && options.date_from
      ? options.date_from
      : "dateFrom" in options && options.dateFrom
      ? options.dateFrom
      : "";
  const dateTo =
    "date_to" in options && options.date_to
      ? options.date_to
      : "dateTo" in options && options.dateTo
      ? options.dateTo
      : "";
  const accountId =
    "account_id" in options && options.account_id !== undefined
      ? options.account_id
      : "accountId" in options && options.accountId !== undefined
      ? options.accountId
      : "";

  const queryParams: JournalFilterParams = {
    page,
    per_page: perPage,
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(periodId !== "" ? { period_id: periodId } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
    ...(accountId !== "" ? { account_id: accountId } : {}),
  };

  const cacheKey = buildJournalQueryKey(queryParams);

  // Read initial cache
  const cachedEntry = listCache.get(cacheKey);
  const isUsable = Boolean(cachedEntry && Date.now() - cachedEntry.fetchedAt < MAX_STALE_TTL_MS);

  const initialResponse = isUsable && cachedEntry ? cachedEntry.response : null;

  const [response, setResponse] = useState<PaginatedFinanceResponse<JournalEntry> | null>(
    initialResponse
  );
  const [loading, setLoading] = useState<boolean>(!initialResponse);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const activeKeyRef = useRef(cacheKey);
  activeKeyRef.current = cacheKey;

  const fetchAuthoritative = useCallback(
    async (key: string, params: JournalFilterParams, force = false) => {
      const existing = listCache.get(key);
      const freshHit = existing && Date.now() - existing.fetchedAt < FRESH_TTL_MS;

      if (!force && freshHit) {
        if (isMountedRef.current && activeKeyRef.current === key) {
          setResponse(existing.response);
          setLoading(false);
          setIsRefreshing(false);
          setError(null);
        }
        return;
      }

      // If we have stale usable data, show background refresh indicator
      if (existing) {
        if (isMountedRef.current && activeKeyRef.current === key) {
          setResponse(existing.response);
          setLoading(false);
          setIsRefreshing(true);
        }
      } else {
        if (isMountedRef.current && activeKeyRef.current === key) {
          setLoading(true);
          setIsRefreshing(false);
        }
      }

      // Request Deduplication
      let inFlight = inFlightRequests.get(key);
      if (!inFlight || force) {
        inFlight = financeService.getJournals(params).then((res) => {
          pruneCacheIfNeeded();
          listCache.set(key, { response: res, fetchedAt: Date.now() });
          inFlightRequests.delete(key);
          return res;
        }).catch((err) => {
          inFlightRequests.delete(key);
          throw err;
        });
        inFlightRequests.set(key, inFlight);
      }

      try {
        const result = await inFlight;
        // Race Protection: only update state if key matches current query
        if (isMountedRef.current && activeKeyRef.current === key) {
          setResponse(result);
          setError(null);
        }
      } catch (err) {
        if (isMountedRef.current && activeKeyRef.current === key) {
          const msg = extractFinanceErrorMessage(err, "Gagal memuat daftar jurnal umum.");
          setError(msg);
        }
      } finally {
        if (isMountedRef.current && activeKeyRef.current === key) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    void fetchAuthoritative(cacheKey, queryParams, false);

    return () => {
      isMountedRef.current = false;
    };
  }, [cacheKey, fetchAuthoritative]);

  const refresh = useCallback(
    async (force = true) => {
      await fetchAuthoritative(cacheKey, queryParams, force);
    },
    [cacheKey, queryParams, fetchAuthoritative]
  );

  const journals = response?.data || [];
  const currentPage = response?.current_page || 1;
  const lastPage = response?.last_page || 1;
  const totalItems = response?.total || 0;
  const fromItem = response?.from || 0;
  const toItem = response?.to || 0;

  return {
    journals,
    currentPage,
    lastPage,
    totalItems,
    fromItem,
    toItem,
    pagination: {
      current_page: currentPage,
      last_page: lastPage,
      total: totalItems,
      from: fromItem,
      to: toItem,
      per_page: queryParams.per_page || 15,
    },
    loading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    refresh,
  };
}

export default useJournals;
