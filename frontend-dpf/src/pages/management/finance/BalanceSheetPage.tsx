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
import { useBalanceSheetFilters } from "@/hooks/finance/useBalanceSheetFilters";
import { useBalanceSheet } from "@/hooks/finance/useBalanceSheet";
import { buildBalanceSheetExportParams } from "@/utils/finance/balanceSheetQuery";
import { normalizeBalanceSheetResponse } from "@/utils/finance/balanceSheetDisplay";
import {
  BalanceSheetHeader,
  BalanceSheetFilters,
  BalanceSheetReportHeader,
  BalanceSheetSummary,
  BalanceSheetSection,
  BalanceSheetVerification,
  BalanceSheetFinancialNotes,
} from "@/components/management/finance/balance-sheet";

export function BalanceSheetPage() {
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
  } = useBalanceSheetFilters();

  // 3. Balance Sheet SWR cache hook
  const {
    balanceSheetData,
    initialLoading,
    refreshing,
    error,
    refresh,
  } = useBalanceSheet(filters);

  // 4. Schema normalization (strictly avoids frontend math/calculations)
  const report = useMemo(
    () => normalizeBalanceSheetResponse(balanceSheetData),
    [balanceSheetData]
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
      const exportParams = buildBalanceSheetExportParams(filters);
      const blob = await financeService.exportBalanceSheet(exportParams);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blob as unknown as BlobPart,
        `Laporan_Posisi_Keuangan_${today}.xlsx`
      );
      toast.success("Berhasil mengunduh berkas Excel Laporan Posisi Keuangan.");
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(
          err,
          "Gagal mengunduh Excel Laporan Posisi Keuangan."
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
      <BalanceSheetHeader
        isBalanced={report.hasData ? report.isBalanced : undefined}
        hasData={report.hasData}
        refreshing={refreshing}
        exporting={exporting}
        onRefresh={() => void refresh()}
        onExport={() => void handleExport()}
        onPrint={handlePrint}
      />

      {/* 2. Filter Toolbar */}
      <BalanceSheetFilters
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
          title="Gagal Memuat Laporan Posisi Keuangan"
          message={error}
          onRetry={() => void refresh()}
        />
      )}

      {/* 5. Empty State */}
      {!initialLoading && !error && !report.hasData && (
        <FinanceEmptyState
          title="Laporan Posisi Keuangan Belum Memiliki Data"
          description="Tidak terdapat transaksi jurnal yang telah diposting pada filter yang dipilih."
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
          <BalanceSheetReportHeader
            period={report.period}
            startDate={report.startDate}
            endDate={report.endDate}
          />

          {/* 4-Card Summary */}
          <BalanceSheetSummary
            totalAssets={report.totalAssets}
            totalLiabilities={report.totalLiabilities}
            totalNetAssets={report.totalNetAssets}
            currentPeriodSurplus={report.currentPeriodSurplus}
            isBalanced={report.isBalanced}
            assetCount={report.assets.length}
            liabilityCount={report.liabilities.length}
            netAssetCount={report.netAssets.length}
          />

          {/* Section 1: Aset */}
          <BalanceSheetSection
            title="Aset"
            sectionNumber="1"
            items={report.assets}
            subtotalLabel="Total Aset"
            subtotalAmount={report.totalAssets}
            tone="brandBlueTeal"
            emptyMessage="Tidak ada akun aset yang terdaftar pada periode ini."
            periodId={periodId}
            startDate={startDate}
            endDate={endDate}
          />

          {/* Section 2: Liabilitas */}
          <BalanceSheetSection
            title="Liabilitas"
            sectionNumber="2"
            items={report.liabilities}
            subtotalLabel="Total Liabilitas"
            subtotalAmount={report.totalLiabilities}
            tone="brandWarmOrange"
            emptyMessage="Tidak ada akun liabilitas yang terdaftar pada periode ini."
            periodId={periodId}
            startDate={startDate}
            endDate={endDate}
          />

          {/* Section 3: Aset Neto */}
          <BalanceSheetSection
            title="Aset Neto"
            sectionNumber="3"
            items={report.netAssets}
            subtotalLabel="Total Aset Neto"
            subtotalAmount={report.totalNetAssets}
            tone="brandPurple"
            emptyMessage="Tidak ada akun aset neto yang terdaftar pada periode ini."
            periodId={periodId}
            startDate={startDate}
            endDate={endDate}
          />

          {/* Section 4: Verifikasi Persamaan Akuntansi (Backend Authoritative) */}
          <BalanceSheetVerification
            isBalanced={report.isBalanced}
            totalAssets={report.totalAssets}
            totalLiabilities={report.totalLiabilities}
            totalNetAssets={report.totalNetAssets}
            periodId={periodId}
          />

          {/* Section 5: Catatan atas Laporan Keuangan (if present) */}
          <BalanceSheetFinancialNotes
            notes={report.notes}
            periodId={periodId}
          />
        </div>
      )}
    </div>
  );
}

export default BalanceSheetPage;
