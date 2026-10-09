import { useState } from "react";
import { toast } from "@/components/ui/ToastProvider";
import { faScaleUnbalanced } from "@fortawesome/free-solid-svg-icons";

import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import { useTrialBalanceFilters } from "@/hooks/finance/useTrialBalanceFilters";
import { useTrialBalance } from "@/hooks/finance/useTrialBalance";
import { useTrialBalanceTable } from "@/hooks/finance/useTrialBalanceTable";
import { buildTrialBalanceExportParams } from "@/utils/finance/trialBalanceQuery";
import financeService from "@/services/financeService";
import {
  downloadBlobFile,
  extractFinanceErrorMessage,
} from "@/utils/financeUtils";
import {
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import {
  TrialBalanceHeader,
  TrialBalanceFilters,
  TrialBalanceSummary,
  TrialBalanceStatus,
  TrialBalanceDesktopTable,
  TrialBalanceMobileList,
  TrialBalancePagination,
} from "@/components/management/finance/trial-balance";

export function TrialBalancePage() {
  const [exporting, setExporting] = useState<boolean>(false);

  // 1. Shared cached Accounting Periods from Finance Dashboard
  const { periods } = useFinancePeriods();

  // 2. Synchronized Filter & URL state
  const {
    filters,
    periodId,
    startDate,
    endDate,
    includeZeroBalance,
    isFilterActive,
    setPeriodId,
    setStartDate,
    setEndDate,
    setIncludeZeroBalance,
    resetFilters,
  } = useTrialBalanceFilters();

  // 3. Authoritative SWR Trial Balance Data
  const {
    trialBalanceData,
    initialLoading,
    refreshing,
    error,
    refresh,
  } = useTrialBalance(filters);

  // 4. Client-side Search & Pagination
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    paginatedAccounts,
    totalPages,
    totalFilteredCount,
    resetPagination,
  } = useTrialBalanceTable(trialBalanceData?.accounts ?? []);

  // 5. Handle Reset Filter
  const handleResetFilters = () => {
    resetFilters();
    resetPagination();
  };

  // 6. Handle Excel Export
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams = buildTrialBalanceExportParams(filters);
      const blob = await financeService.exportTrialBalance(exportParams);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blob as unknown as BlobPart,
        `Neraca_Saldo_${today}.xlsx`
      );
      toast.success("Berhasil mengunduh berkas Excel Neraca Saldo.");
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(err, "Gagal mengunduh Excel Neraca Saldo.")
      );
    } finally {
      setExporting(false);
    }
  };

  // Active period display name
  const activePeriodName = trialBalanceData?.period?.name;
  const isBalanced = trialBalanceData?.is_balanced;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* 1. Header */}
      <TrialBalanceHeader
        isBalanced={isBalanced}
        hasData={Boolean(trialBalanceData)}
        refreshing={refreshing || initialLoading}
        exporting={exporting}
        onRefresh={() => void refresh()}
        onExport={() => void handleExport()}
      />

      {/* 2. Filters */}
      <TrialBalanceFilters
        periods={periods}
        periodId={periodId}
        startDate={startDate}
        endDate={endDate}
        includeZeroBalance={includeZeroBalance}
        isFilterActive={isFilterActive}
        activePeriodName={activePeriodName}
        onPeriodChange={setPeriodId}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onIncludeZeroChange={setIncludeZeroBalance}
        onReset={handleResetFilters}
      />

      {/* 3. Content States */}
      {error && !trialBalanceData ? (
        <FinanceErrorState
          title="Tidak dapat memuat Neraca Saldo"
          message={error}
          onRetry={() => void refresh()}
        />
      ) : initialLoading ? (
        <div className="space-y-6">
          {/* Skeleton Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
          {/* Skeleton Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <FinanceTableSkeleton rows={8} cols={9} />
          </div>
        </div>
      ) : !trialBalanceData || trialBalanceData.accounts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <FinanceEmptyState
            title="Belum Ada Data Neraca Saldo"
            description="Tidak terdapat saldo atau mutasi pada filter yang dipilih."
            icon={faScaleUnbalanced}
            action={
              isFilterActive ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
                >
                  Reset Filter
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 4. Authoritative Summary KPI Cards */}
          <TrialBalanceSummary data={trialBalanceData} />

          {/* 5. Desktop Table View (>= md) */}
          <div className="hidden md:block">
            <TrialBalanceDesktopTable
              accounts={paginatedAccounts}
              summaryData={trialBalanceData}
              periodId={periodId}
              startDate={startDate}
              endDate={endDate}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* 6. Mobile List View (< md) */}
          <div className="block md:hidden">
            <TrialBalanceMobileList
              accounts={paginatedAccounts}
              summaryData={trialBalanceData}
              periodId={periodId}
              startDate={startDate}
              endDate={endDate}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* 7. Pagination Controls */}
          <TrialBalancePagination
            currentPage={currentPage}
            totalPages={totalPages}
            perPage={perPage}
            totalFilteredCount={totalFilteredCount}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />

          {/* 8. Concise Verification Status Panel */}
          {isBalanced !== undefined && (
            <TrialBalanceStatus
              isBalanced={isBalanced}
              periodId={periodId}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TrialBalancePage;
