import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import {
  ReconciliationHeader,
  ReconciliationScopeBar,
  ReconciliationOverallStatus,
  ReconciliationControlsToolbar,
  ReconciliationControlList,
  useReconciliation,
  type ReconciliationTabFilter,
} from "@/components/management/finance/reconciliation";

export function ReconciliationPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL-synchronized period filter (refresh-safe, back-button safe)
  const rawPeriodId = searchParams.get("period_id");
  const selectedPeriodId: number | "" = rawPeriodId ? Number(rawPeriodId) : "";

  const handlePeriodChange = useCallback(
    (newPeriodId: number | "") => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newPeriodId) {
            next.set("period_id", String(newPeriodId));
          } else {
            next.delete("period_id");
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // 2. Shared Accounting Periods Cache
  const { periods } = useFinancePeriods();

  // 3. Reconciliation Data Hook (Zero-write summary read + Explicit run)
  const {
    summary,
    report,
    initialLoading,
    refreshingRead,
    runningReconciliation,
    error,
    runReconciliation,
    refreshRead,
  } = useReconciliation(selectedPeriodId);

  // 4. Local presentation states for controls filtering & expansion
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tabFilter, setTabFilter] = useState<ReconciliationTabFilter>("all");
  const [expandedControls, setExpandedControls] = useState<Record<string, boolean>>({});

  const handleToggleExpand = useCallback((code: string) => {
    setExpandedControls((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setTabFilter("all");
  }, []);

  // 5. Authoritative checks & metrics derivation
  const checks = useMemo(() => {
    return report?.checks ?? summary?.checks ?? summary?.controls ?? [];
  }, [report, summary]);

  const totalChecksCount = report?.total_checks ?? summary?.total_checks ?? checks.length;
  const passedChecksCount =
    report?.passed_checks ??
    summary?.passed_checks ??
    checks.filter((c) => c.status === "passed").length;
  const reviewChecksCount =
    (report?.failed_checks ?? summary?.failed_checks ?? 0) +
    (report?.warnings ?? summary?.warnings ?? 0);

  // 6. Filtered checks derivation (useMemo for immediate client-side responsiveness)
  const filteredChecks = useMemo(() => {
    return checks.filter((check) => {
      // Tab filter
      if (tabFilter === "passed" && check.status !== "passed") return false;
      if (tabFilter === "review" && check.status === "passed") return false;

      // Search query (name, check_code, message)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = check.name.toLowerCase().includes(q);
        const matchesCode = check.check_code.toLowerCase().includes(q);
        const matchesMsg = check.message.toLowerCase().includes(q);
        return matchesName || matchesCode || matchesMsg;
      }

      return true;
    });
  }, [checks, tabFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Title, Badge, Description, and Explicit Run Action */}
      <ReconciliationHeader
        runningReconciliation={runningReconciliation}
        onRunReconciliation={() => void runReconciliation()}
      />

      {/* 2. Scope Bar with Period Selector, Last Checked Timestamp, and Zero-write Refresh */}
      <ReconciliationScopeBar
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onPeriodChange={handlePeriodChange}
        lastCheckedAt={report?.last_checked_at ?? summary?.last_checked_at}
        refreshingRead={refreshingRead}
        runningReconciliation={runningReconciliation}
        onRefreshRead={() => void refreshRead()}
      />

      {/* 3. Error Banner / State */}
      {error && !summary && !report ? (
        <FinanceErrorState
          title="Tidak dapat memuat ringkasan rekonsiliasi"
          message={error}
          onRetry={() => void refreshRead()}
        />
      ) : (
        <>
          {/* Non-blocking error notification if an explicit run or refresh fails while data exists */}
          {error && (summary || report) && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
              {error}
            </div>
          )}

          {/* 4. Authoritative Overall Status Panel */}
          <ReconciliationOverallStatus
            summary={summary}
            report={report}
            loading={initialLoading}
          />

          {/* 5. Controls Toolbar: Search & Segmented Filter Tabs */}
          <ReconciliationControlsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            tabFilter={tabFilter}
            onTabFilterChange={setTabFilter}
            totalChecks={totalChecksCount}
            reviewChecks={reviewChecksCount}
            passedChecks={passedChecksCount}
          />

          {/* 6. List of Audit Controls with Diagnostics */}
          <ReconciliationControlList
            checks={filteredChecks}
            hasFullReport={report != null}
            loading={initialLoading}
            runningReconciliation={runningReconciliation}
            onRunReconciliation={() => void runReconciliation()}
            expandedControls={expandedControls}
            onToggleExpand={handleToggleExpand}
            onResetFilters={handleResetFilters}
          />
        </>
      )}
    </div>
  );
}

export default ReconciliationPage;
