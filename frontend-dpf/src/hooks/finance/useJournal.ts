import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import type { JournalEntry } from "@/types/finance";

// ============================================================================
// IN-MEMORY CACHE FOR INDIVIDUAL JOURNAL DETAILS
// ============================================================================
export interface JournalDetailCacheEntry {
  data: JournalEntry;
  fetchedAt: number;
}

const FRESH_TTL_MS = 60 * 1000; // 60 seconds
const MAX_STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const detailCache = new Map<number, JournalDetailCacheEntry>();
const inFlightDetailRequests = new Map<number, Promise<JournalEntry>>();

/**
 * Invalidate individual journal cache or all journal details.
 */
export function invalidateJournalDetailCache(id?: number): void {
  if (id !== undefined) {
    detailCache.delete(id);
  } else {
    detailCache.clear();
  }
}

/**
 * Seed detail cache with authoritative response (e.g., from create or list preview).
 */
export function seedJournalDetailCache(journal: JournalEntry): void {
  if (journal?.id) {
    detailCache.set(journal.id, { data: journal, fetchedAt: Date.now() });
  }
}

export interface UseJournalReturn {
  journal: JournalEntry | null;
  loading: boolean;
  isRefreshing: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
}

export function useJournal(id: number | null | undefined): UseJournalReturn {
  const isMountedRef = useRef(true);
  const activeIdRef = useRef<number | null | undefined>(id);
  activeIdRef.current = id;

  const cachedEntry = id != null ? detailCache.get(id) : null;
  const isUsable = Boolean(cachedEntry && Date.now() - cachedEntry.fetchedAt < MAX_STALE_TTL_MS);

  const [journal, setJournal] = useState<JournalEntry | null>(isUsable && cachedEntry ? cachedEntry.data : null);
  const [loading, setLoading] = useState<boolean>(id != null && (!isUsable || !cachedEntry));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(
    async (targetId: number, force = false) => {
      const cached = detailCache.get(targetId);
      const isFresh = cached && Date.now() - cached.fetchedAt < FRESH_TTL_MS;

      if (!force && isFresh) {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setJournal(cached.data);
          setLoading(false);
          setIsRefreshing(false);
          setError(null);
        }
        return;
      }

      if (cached) {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setJournal(cached.data);
          setLoading(false);
          setIsRefreshing(true);
        }
      } else {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setLoading(true);
          setIsRefreshing(false);
        }
      }

      // Deduplicate request
      let inFlight = inFlightDetailRequests.get(targetId);
      if (!inFlight || force) {
        inFlight = financeService.getJournal(targetId).then((res) => {
          detailCache.set(targetId, { data: res, fetchedAt: Date.now() });
          inFlightDetailRequests.delete(targetId);
          return res;
        }).catch((err) => {
          inFlightDetailRequests.delete(targetId);
          throw err;
        });
        inFlightDetailRequests.set(targetId, inFlight);
      }

      try {
        const result = await inFlight;
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setJournal(result);
          setError(null);
        }
      } catch (err) {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setError(extractFinanceErrorMessage(err, "Gagal memuat rincian jurnal umum."));
        }
      } finally {
        if (isMountedRef.current && activeIdRef.current === targetId) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (id != null && Number.isFinite(id) && id > 0) {
      const existing = detailCache.get(id);
      if (existing) {
        setJournal(existing.data);
        setLoading(false);
      } else {
        setLoading(true);
      }
      void fetchDetail(id, false);
    } else {
      setJournal(null);
      setLoading(false);
      setError(id != null ? "ID jurnal tidak valid." : null);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [id, fetchDetail]);

  const refresh = useCallback(
    async (force = true) => {
      if (id != null && Number.isFinite(id) && id > 0) {
        await fetchDetail(id, force);
      }
    },
    [id, fetchDetail]
  );

  return {
    journal,
    loading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    refresh,
  };
}

export default useJournal;
