import { useState, useEffect, useCallback, useRef } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import type { ReconciliationReport, ReconciliationSummary } from "@/types/finance";
import {
  RECON_FRESH_TTL_MS,
  getReconPeriodKey,
  getCachedSummary,
  setCachedSummary,
  getSummaryInFlight,
  setSummaryInFlight,
  getCachedReport,
  setCachedReport,
} from "./reconciliationCache";

export interface UseReconciliationReturn {
  summary: ReconciliationSummary | null;
  report: ReconciliationReport | null;
  initialLoading: boolean;
  refreshingRead: boolean;
  runningReconciliation: boolean;
  error: string | null;
  runReconciliation: () => Promise<void>;
  refreshRead: () => Promise<void>;
}

export function useReconciliation(selectedPeriodId?: number | ""): UseReconciliationReturn {
  const periodKey = getReconPeriodKey(selectedPeriodId);
  const activeKeyRef = useRef(periodKey);
  activeKeyRef.current = periodKey;

  // Initialize from cache if available
  const cachedSum = getCachedSummary(periodKey);
  const cachedRep = getCachedReport(periodKey);

  const [summary, setSummary] = useState<ReconciliationSummary | null>(cachedSum ? cachedSum.data : null);
  const [report, setReport] = useState<ReconciliationReport | null>(cachedRep ? cachedRep.data : null);
  const [initialLoading, setInitialLoading] = useState<boolean>(!cachedSum);
  const [refreshingRead, setRefreshingRead] = useState<boolean>(false);
  const [runningReconciliation, setRunningReconciliation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Read Zero-Write Summary
  const fetchSummary = useCallback(
    async (isManualRefresh = false) => {
      const currentKey = activeKeyRef.current;
      const cached = getCachedSummary(currentKey);
      const isFresh = cached && Date.now() - cached.fetchedAt < RECON_FRESH_TTL_MS;

      // If fresh and not manual refresh, use cache
      if (!isManualRefresh && isFresh) {
        setSummary(cached.data);
        const rep = getCachedReport(currentKey);
        if (rep) setReport(rep.data);
        setInitialLoading(false);
        return;
      }

      // Check in-flight promise for deduplication
      let inFlight = getSummaryInFlight(currentKey);
      if (!inFlight) {
        const params = currentKey === "all" ? undefined : { period_id: Number(currentKey) };
        inFlight = (async () => {
          try {
            const res = await financeService.getReconciliationSummary(params);
            setCachedSummary(currentKey, res);
            return res;
          } finally {
            setSummaryInFlight(currentKey, null);
          }
        })();
        setSummaryInFlight(currentKey, inFlight);
      }

      if (isManualRefresh) {
        setRefreshingRead(true);
      } else if (!cached) {
        setInitialLoading(true);
      }

      try {
        const res = await inFlight;
        // Race condition check: only update if active key hasn't changed
        if (activeKeyRef.current === currentKey) {
          setSummary(res);
          // Also sync cached report if present
          const rep = getCachedReport(currentKey);
          setReport(rep ? rep.data : null);
          setError(null);
        }
      } catch (err) {
        if (activeKeyRef.current === currentKey) {
          const msg = extractFinanceErrorMessage(err, "Gagal memuat ringkasan rekonsiliasi.");
          // If no previous summary exists, surface blocking error
          if (!summary && !cached) {
            setError(msg);
          }
        }
      } finally {
        if (activeKeyRef.current === currentKey) {
          setInitialLoading(false);
          setRefreshingRead(false);
        }
      }
    },
    [summary]
  );

  // Sync state whenever selectedPeriodId changes
  useEffect(() => {
    const currentKey = getReconPeriodKey(selectedPeriodId);
    activeKeyRef.current = currentKey;

    const cachedSumEntry = getCachedSummary(currentKey);
    const cachedRepEntry = getCachedReport(currentKey);

    setSummary(cachedSumEntry ? cachedSumEntry.data : null);
    setReport(cachedRepEntry ? cachedRepEntry.data : null);
    setError(null);

    // Read zero-write summary for this period
    void fetchSummary(false);
  }, [selectedPeriodId, fetchSummary]);

  // Explicit Run Reconciliation (records audit log on backend)
  const runReconciliation = useCallback(async () => {
    const currentKey = activeKeyRef.current;
    if (runningReconciliation) return; // Prevent double-execution

    setRunningReconciliation(true);
    setError(null);

    try {
      const params = currentKey === "all" ? undefined : { period_id: Number(currentKey) };
      const fullReport = await financeService.getReconciliationReport(params);

      if (activeKeyRef.current === currentKey) {
        setReport(fullReport);
        setCachedReport(currentKey, fullReport);
        // Also update summary
        setSummary({
          overall_status: fullReport.overall_status,
          critical_errors: fullReport.critical_errors,
          high_errors: fullReport.high_errors,
          warnings: fullReport.warnings,
          failed_checks: fullReport.failed_checks,
          total_checks: fullReport.total_checks,
          passed_checks: fullReport.passed_checks,
          last_checked_at: fullReport.last_checked_at,
          controls: fullReport.checks,
          checks: fullReport.checks,
        });
      }
    } catch (err) {
      if (activeKeyRef.current === currentKey) {
        const msg = extractFinanceErrorMessage(err, "Rekonsiliasi tidak dapat diselesaikan.");
        setError(msg);
      }
    } finally {
      if (activeKeyRef.current === currentKey) {
        setRunningReconciliation(false);
      }
    }
  }, [runningReconciliation]);

  // Zero-write refresh
  const refreshRead = useCallback(async () => {
    await fetchSummary(true);
  }, [fetchSummary]);

  return {
    summary,
    report,
    initialLoading,
    refreshingRead,
    runningReconciliation,
    error,
    runReconciliation,
    refreshRead,
  };
}
