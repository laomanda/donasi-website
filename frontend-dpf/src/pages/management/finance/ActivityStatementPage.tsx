import { useState, useMemo, useCallback } from "react";
import { toast } from "@/components/ui/ToastProvider";
import {
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage, downloadBlobFile } from "@/utils/financeUtils";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import { useActivityStatementFilters } from "@/hooks/finance/useActivityStatementFilters";
import { useActivityStatement } from "@/hooks/finance/useActivityStatement";
import { buildActivityStatementExportParams } from "@/utils/finance/activityStatementQuery";
import { normalizeActivityStatementResponse } from "@/utils/finance/activityStatementDisplay";
import {
  ActivityStatementHeader,
  ActivityStatementFilters,
  ActivityStatementReportHeader,
  ActivityStatementSummary,
  ActivityStatementSection,
  ActivityStatementResult,
  ActivityStatementFinancialNotes,
} from "@/components/management/finance/activity-statement";

export function ActivityStatementPage() {
  const [exporting, setExporting] = useState<boolean>(false);

  // 1. Shared accounting periods cache
  const { periods } = useFinancePeriods();

  // 2. Query filter state with URL synchronization
  const {
    filters,
    periodId,
    startDate,
    endDate,
    isFilterActive,
    setPeriodId,
    setStartDate,
    setEndDate,
    resetFilters,
  } = useActivityStatementFilters();

  // 3. Activity Statement SWR cache hook
  const {
    activityStatementData,
    initialLoading,
    refreshing,
    error,
    refresh,
  } = useActivityStatement(filters);

  // 4. Schema normalization (strictly avoids frontend math/calculations)
  const report = useMemo(
    () => normalizeActivityStatementResponse(activityStatementData),
    [activityStatementData]
  );

  // Active period name resolution
  const activePeriodName = useMemo(() => {
    if (periodId === "") return undefined;
    const found = periods.find((p) => p.id === Number(periodId));
    return found?.name || found?.period_name || `Periode #${periodId}`;
  }, [periodId, periods]);

  // Handle Excel Export
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const exportParams = buildActivityStatementExportParams(filters);
      const blob = await financeService.exportActivityStatement(exportParams);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blob as unknown as BlobPart,
        `Laporan_Aktivitas_${today}.xlsx`
      );
      toast.success("Berhasil mengunduh berkas Excel Laporan Aktivitas.");
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(
          err,
          "Gagal mengunduh Excel Laporan Aktivitas."
        )
      );
    } finally {
      setExporting(false);
    }
  }, [filters]);

  // Handle Browser Print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0 max-w-[1440px] mx-auto">
      {/* 1. Page Header */}
      <ActivityStatementHeader
        isSurplus={report.hasData ? report.isSurplus : undefined}
        hasData={report.hasData}
        refreshing={refreshing}
        exporting={exporting}
        onRefresh={() => void refresh()}
        onExport={() => void handleExport()}
        onPrint={handlePrint}
      />

      {/* 2. Filter Toolbar */}
      <ActivityStatementFilters
        periods={periods}
        periodId={periodId}
        startDate={startDate}
        endDate={endDate}
        isFilterActive={isFilterActive}
        activePeriodName={activePeriodName}
        onPeriodChange={setPeriodId}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={resetFilters}
      />

      {/* 3. Initial Loading Skeleton */}
      {initialLoading && (
        <div className="space-y-6">
          <FinanceTableSkeleton />
        </div>
      )}

      {/* 4. Error State */}
      {!initialLoading && error && (
        <FinanceErrorState
          title="Gagal Memuat Laporan Aktivitas"
          message={error}
          onRetry={() => void refresh()}
        />
      )}

      {/* 5. Empty State */}
      {!initialLoading && !error && !report.hasData && (
        <FinanceEmptyState
          title="Laporan Aktivitas Belum Memiliki Data"
          description="Tidak terdapat penerimaan, beban, atau penyaluran terposting pada filter yang dipilih."
          action={
            isFilterActive ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
              >
                Reset Filter
              </button>
            ) : undefined
          }
        />
      )}

      {/* 6. Report Presentation Content */}
      {!initialLoading && !error && report.hasData && (
        <div className="space-y-6 print:space-y-4">
          {/* Institutional Report Header */}
          <ActivityStatementReportHeader
            period={report.period}
            startDate={report.startDate}
            endDate={report.endDate}
          />

          {/* 3-Card Summary */}
          <ActivityStatementSummary
            totalRevenues={report.totalRevenues}
            totalExpenses={report.totalExpenses}
            surplusDeficit={report.surplusDeficit}
            isSurplus={report.isSurplus}
            revenueCount={report.revenues.length}
            expenseCount={report.expenses.length}
          />

          {/* Section 1: Penerimaan */}
          <ActivityStatementSection
            title="Penerimaan"
            sectionNumber="1"
            items={report.revenues}
            subtotalLabel="Total Penerimaan"
            subtotalAmount={report.totalRevenues}
            tone="brandGreen"
            emptyMessage="Tidak ada akun penerimaan yang terdaftar pada periode ini."
            periodId={periodId}
            startDate={startDate}
            endDate={endDate}
          />

          {/* Section 2: Beban dan Penyaluran */}
          <ActivityStatementSection
            title="Beban dan Penyaluran"
            sectionNumber="2"
            items={report.expenses}
            subtotalLabel="Total Beban & Penyaluran"
            subtotalAmount={report.totalExpenses}
            tone="primary"
            emptyMessage="Tidak ada akun beban atau penyaluran yang terdaftar pada periode ini."
            periodId={periodId}
            startDate={startDate}
            endDate={endDate}
          />

          {/* Section 3: Hasil Bersih Aktivitas (Backend Authoritative) */}
          <ActivityStatementResult
            surplusDeficit={report.surplusDeficit}
            isSurplus={report.isSurplus}
            totalRevenues={report.totalRevenues}
            totalExpenses={report.totalExpenses}
          />

          {/* Section 4: Catatan atas Laporan Keuangan (if present) */}
          <ActivityStatementFinancialNotes
            notes={report.notes}
            periodId={periodId}
          />
        </div>
      )}
    </div>
  );
}

export default ActivityStatementPage;
