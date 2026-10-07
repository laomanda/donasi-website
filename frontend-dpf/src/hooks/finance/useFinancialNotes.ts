import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import {
  buildFinancialNoteFilterParams,
  buildFinancialNotesListCacheKey,
  buildFinancialNotesSummaryCacheKey,
  type FinancialNoteFilterState,
} from "@/utils/finance/financialNotesQuery";
import {
  getFinancialNotesListCache,
  setFinancialNotesListCache,
  getFinancialNotesInFlight,
  setFinancialNotesInFlight,
  getFinancialNotesSummaryCache,
  setFinancialNotesSummaryCache,
  getFinancialNotesSummaryInFlight,
  setFinancialNotesSummaryInFlight,
  isFinancialNoteCacheFresh,
  FINANCIAL_NOTES_FRESH_TTL_MS,
  FINANCIAL_NOTES_SUMMARY_FRESH_TTL_MS,
} from "@/utils/finance/financialNotesCache";
import type { FinancialNote, FinancialNoteSummary } from "@/types/finance";

export interface UseFinancialNotesReturn {
  notes: FinancialNote[];
  summary: FinancialNoteSummary | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  summaryError: string | null;
  refresh: () => Promise<void>;
}

export function useFinancialNotes(
  filters: Pick<FinancialNoteFilterState, "periodId" | "category" | "status">
): UseFinancialNotesReturn {
  const listKey = buildFinancialNotesListCacheKey(filters);
  const summaryKey = buildFinancialNotesSummaryCacheKey(filters.periodId);

  const activeListKeyRef = useRef<string>(listKey);
  const activeSummaryKeyRef = useRef<string>(summaryKey);
  const isMountedRef = useRef<boolean>(true);

  // Synchronous cache checks on mount / filter change
  const cachedListEntry = getFinancialNotesListCache(listKey);
  const cachedSummaryEntry = getFinancialNotesSummaryCache(summaryKey);

  const isListFresh = isFinancialNoteCacheFresh(cachedListEntry, FINANCIAL_NOTES_FRESH_TTL_MS);
  const isSummaryFresh = isFinancialNoteCacheFresh(cachedSummaryEntry, FINANCIAL_NOTES_SUMMARY_FRESH_TTL_MS);

  const [notes, setNotes] = useState<FinancialNote[]>(cachedListEntry ? cachedListEntry.data : []);
  const [summary, setSummary] = useState<FinancialNoteSummary | null>(
    cachedSummaryEntry ? cachedSummaryEntry.data : null
  );

  const [loading, setLoading] = useState<boolean>(!cachedListEntry);
  const [refreshing, setRefreshing] = useState<boolean>(
    Boolean(cachedListEntry && (!isListFresh || !isSummaryFresh))
  );
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    activeListKeyRef.current = listKey;
    activeSummaryKeyRef.current = summaryKey;
  }, [listKey, summaryKey]);

  const executeFetch = useCallback(
    async (
      targetListKey: string,
      targetSummaryKey: string,
      filterState: Pick<FinancialNoteFilterState, "periodId" | "category" | "status">,
      forceBypass = false
    ) => {
      // 1. Check notes cache
      const cachedNotes = !forceBypass ? getFinancialNotesListCache(targetListKey) : null;
      const cachedSummary = !forceBypass ? getFinancialNotesSummaryCache(targetSummaryKey) : null;

      const needsNotesFetch = !cachedNotes || !isFinancialNoteCacheFresh(cachedNotes, FINANCIAL_NOTES_FRESH_TTL_MS);
      const needsSummaryFetch = !cachedSummary || !isFinancialNoteCacheFresh(cachedSummary, FINANCIAL_NOTES_SUMMARY_FRESH_TTL_MS);

      if (!needsNotesFetch && !needsSummaryFetch) {
        if (cachedNotes && activeListKeyRef.current === targetListKey && isMountedRef.current) {
          setNotes(cachedNotes.data);
          setError(null);
        }
        if (cachedSummary && activeSummaryKeyRef.current === targetSummaryKey && isMountedRef.current) {
          setSummary(cachedSummary.data);
          setSummaryError(null);
        }
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }

      if (isMountedRef.current) {
        if (!cachedNotes) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
      }

      // Deduplicated or new fetch for Notes List
      let notesPromise = getFinancialNotesInFlight(targetListKey);
      if (!notesPromise || forceBypass) {
        const queryParams = buildFinancialNoteFilterParams(filterState);
        notesPromise = financeService.getFinancialNotes(queryParams);
        setFinancialNotesInFlight(targetListKey, notesPromise);
      }

      // Deduplicated or new fetch for Summary
      let summaryPromise = getFinancialNotesSummaryInFlight(targetSummaryKey);
      if (!summaryPromise || forceBypass) {
        summaryPromise = financeService.getFinancialNotesSummary({
          period_id: filterState.periodId !== "" ? filterState.periodId : undefined,
          accounting_period_id: filterState.periodId !== "" ? filterState.periodId : undefined,
        });
        setFinancialNotesSummaryInFlight(targetSummaryKey, summaryPromise);
      }

      // Use Promise.allSettled for Partial Failure Resilience (Section 40)
      const [notesResult, summaryResult] = await Promise.allSettled([
        notesPromise,
        summaryPromise,
      ]);

      setFinancialNotesInFlight(targetListKey, null);
      setFinancialNotesSummaryInFlight(targetSummaryKey, null);

      if (!isMountedRef.current) return;

      // Handle Notes Result
      if (notesResult.status === "fulfilled") {
        const data = notesResult.value || [];
        setFinancialNotesListCache(targetListKey, data);
        if (activeListKeyRef.current === targetListKey) {
          setNotes(data);
          setError(null);
        }
      } else {
        if (activeListKeyRef.current === targetListKey) {
          setError(extractFinanceErrorMessage(notesResult.reason, "Gagal memuat catatan keuangan."));
        }
      }

      // Handle Summary Result
      if (summaryResult.status === "fulfilled") {
        const summaryData = summaryResult.value || null;
        if (summaryData) {
          setFinancialNotesSummaryCache(targetSummaryKey, summaryData);
        }
        if (activeSummaryKeyRef.current === targetSummaryKey) {
          setSummary(summaryData);
          setSummaryError(null);
        }
      } else {
        if (activeSummaryKeyRef.current === targetSummaryKey) {
          setSummaryError(extractFinanceErrorMessage(summaryResult.reason, "Gagal memuat ringkasan catatan."));
        }
      }

      setLoading(false);
      setRefreshing(false);
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    void executeFetch(listKey, summaryKey, filters, false);

    return () => {
      isMountedRef.current = false;
    };
  }, [listKey, summaryKey, executeFetch]);

  const refresh = useCallback(async () => {
    await executeFetch(listKey, summaryKey, filters, true);
  }, [executeFetch, listKey, summaryKey, filters]);

  return {
    notes,
    summary,
    loading,
    refreshing,
    error,
    summaryError,
    refresh,
  };
}
