import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { buildFinancialNoteDetailCacheKey } from "@/utils/finance/financialNotesQuery";
import {
  getFinancialNoteDetailCache,
  setFinancialNoteDetailCache,
  getFinancialNoteDetailInFlight,
  setFinancialNoteDetailInFlight,
  isFinancialNoteCacheFresh,
  FINANCIAL_NOTES_DETAIL_FRESH_TTL_MS,
  invalidateFinancialNoteDetailCache,
} from "@/utils/finance/financialNotesCache";
import type { FinancialNote } from "@/types/finance";

export { invalidateFinancialNoteDetailCache };

export interface UseFinancialNoteReturn {
  note: FinancialNote | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFinancialNote(
  noteId: number | string | undefined
): UseFinancialNoteReturn {
  const numId = noteId !== undefined ? Number(noteId) : NaN;
  const isValidId = !isNaN(numId) && numId > 0;

  const currentKey = isValidId ? buildFinancialNoteDetailCacheKey(numId) : "";
  const activeKeyRef = useRef<string>(currentKey);
  const isMountedRef = useRef<boolean>(true);

  const initialCache = isValidId ? getFinancialNoteDetailCache(currentKey) : null;
  const isFresh = isFinancialNoteCacheFresh(initialCache, FINANCIAL_NOTES_DETAIL_FRESH_TTL_MS);

  const [note, setNote] = useState<FinancialNote | null>(initialCache ? initialCache.data : null);
  const [loading, setLoading] = useState<boolean>(Boolean(isValidId && !initialCache));
  const [refreshing, setRefreshing] = useState<boolean>(Boolean(initialCache && !isFresh));
  const [error, setError] = useState<string | null>(
    !isValidId && noteId !== undefined ? "ID Catatan keuangan tidak valid." : null
  );

  activeKeyRef.current = currentKey;

  const executeFetch = useCallback(async (id: number, forceBypass = false) => {
    const key = buildFinancialNoteDetailCacheKey(id);

    if (!forceBypass) {
      const cached = getFinancialNoteDetailCache(key);
      if (cached) {
        if (activeKeyRef.current === key && isMountedRef.current) {
          setNote(cached.data);
          setError(null);
        }
        if (isFinancialNoteCacheFresh(cached, FINANCIAL_NOTES_DETAIL_FRESH_TTL_MS)) {
          if (isMountedRef.current) {
            setLoading(false);
            setRefreshing(false);
          }
          return;
        }
      }
    }

    if (isMountedRef.current) {
      const cached = getFinancialNoteDetailCache(key);
      if (!cached) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
    }

    try {
      let promise = getFinancialNoteDetailInFlight(key);
      if (!promise || forceBypass) {
        promise = financeService.getFinancialNote(id);
        setFinancialNoteDetailInFlight(key, promise);
      }

      const res = await promise;
      setFinancialNoteDetailCache(key, res);

      if (activeKeyRef.current === key && isMountedRef.current) {
        setNote(res);
        setError(null);
      }
    } catch (err) {
      if (activeKeyRef.current === key && isMountedRef.current) {
        setError(extractFinanceErrorMessage(err, "Gagal memuat catatan keuangan."));
      }
    } finally {
      setFinancialNoteDetailInFlight(key, null);
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (isValidId) {
      void executeFetch(numId, false);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [isValidId, numId, executeFetch]);

  const refresh = useCallback(async () => {
    if (isValidId) {
      await executeFetch(numId, true);
    }
  }, [isValidId, numId, executeFetch]);

  return {
    note,
    loading,
    refreshing,
    error,
    refresh,
  };
}
