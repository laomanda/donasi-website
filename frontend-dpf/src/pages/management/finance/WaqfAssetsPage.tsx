import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { FinanceErrorState } from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import { useWaqfAssetFilters } from "@/hooks/finance/useWaqfAssetFilters";
import { useWaqfAssets } from "@/hooks/finance/useWaqfAssets";
import { useWaqfAssetTable } from "@/hooks/finance/useWaqfAssetTable";
import {
  normalizeWaqfAssetReport,
  extractCategoriesFromAssets,
  type WaqfCategoryOption,
} from "@/utils/finance/waqfAssetDisplay";
import { buildWaqfAssetExportParams } from "@/utils/finance/waqfAssetQuery";
import {
  extractFinanceErrorMessage,
  downloadBlobFile,
} from "@/utils/financeUtils";
import {
  WaqfAssetsHeader,
  WaqfAssetsFilters,
  WaqfAssetsReportHeader,
  WaqfAssetsSummary,
  WaqfAssetCategorySummary,
  WaqfAssetsDesktopTable,
  WaqfAssetsMobileList,
} from "@/components/management/finance/waqf-assets";

export function WaqfAssetsPage() {
  const [exporting, setExporting] = useState<boolean>(false);

  // 1. Shared Accounting Periods Cache
  const { periods } = useFinancePeriods();

  // 2. URL Synchronized Filters
  const {
    filters,
    periodId,
    categoryId,
    status,
    search,
    isFilterActive,
    setPeriodId,
    setCategoryId,
    setStatus,
    setSearch,
    resetFilters,
  } = useWaqfAssetFilters();

  // 3. SWR Cached Waqf Asset Report
  const {
    reportData,
    initialLoading,
    refreshing,
    error,
    refresh,
  } = useWaqfAssets({ periodId, categoryId, status });

  // 4. Schema-Normalized Report Data (Strictly avoids frontend calculations)
  const report = useMemo(
    () => normalizeWaqfAssetReport(reportData),
    [reportData]
  );

  // 5. Category Discovery (Cumulative fallback per Requirement 24)
  const [cumulativeCategories, setCumulativeCategories] = useState<WaqfCategoryOption[]>([]);

  React.useEffect(() => {
    if (report.assets.length > 0) {
      const discovered = extractCategoriesFromAssets(report.assets);
      setCumulativeCategories((prev) => {
        const map = new Map<number, string>();
        prev.forEach((c) => map.set(c.id, c.name));
        discovered.forEach((c) => map.set(c.id, c.name));
        return Array.from(map.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name));
      });
    }
  }, [report.assets]);

  // 6. Client Search Filtering
  const {
    filteredAssets,
    totalCount,
    filteredCount,
  } = useWaqfAssetTable({
    assets: report.assets,
    searchQuery: search,
  });

  // 7. Handle Excel Export
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const exportParams = buildWaqfAssetExportParams(filters);
      const blob = await financeService.exportWaqfAssets(exportParams);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blob as unknown as BlobPart,
        `Laporan_Rincian_Aset_Wakaf_${today}.xlsx`
      );
      toast.success("Laporan Aset Wakaf Excel berhasil diunduh.");
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(err, "Gagal mengunduh laporan aset wakaf.")
      );
    } finally {
      setExporting(false);
    }
  }, [filters]);

  // 8. Handle Browser Print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <WaqfAssetsHeader
        totalAssetsCount={report.summary.total_assets}
        hasData={report.hasData}
        refreshing={refreshing}
        exporting={exporting}
        onRefresh={() => void refresh()}
        onExport={() => void handleExport()}
        onPrint={handlePrint}
      />

      {/* Filter Toolbar */}
      <WaqfAssetsFilters
        periods={periods}
        categories={cumulativeCategories}
        periodId={periodId}
        categoryId={categoryId}
        status={status}
        searchQuery={search}
        isFilterActive={isFilterActive}
        onPeriodChange={setPeriodId}
        onCategoryChange={setCategoryId}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        onReset={resetFilters}
      />

      {/* Initial Loading Skeleton */}
      {initialLoading && !reportData && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-80 rounded-2xl bg-slate-200" />
        </div>
      )}

      {/* Error State */}
      {error && !reportData && (
        <FinanceErrorState
          title="Gagal Memuat Laporan Rincian Aset Wakaf"
          message={error}
          onRetry={refresh}
        />
      )}

      {/* Main Report Body */}
      {reportData && (
        <div className="space-y-6">
          {/* Report Context Strip & Formal Print Header */}
          <WaqfAssetsReportHeader
            period={report.period}
            summary={report.summary}
          />

          {/* 4 Summary KPI Cards (Backend Authoritative Values Only) */}
          <WaqfAssetsSummary
            summary={report.summary}
            loading={refreshing}
          />

          {/* Category Summary Breakdown */}
          <WaqfAssetCategorySummary
            categories={report.summary.by_category}
          />

          {/* Search Result Feedback Indicator */}
          {search && (
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl print:hidden">
              <div>
                Menampilkan <strong className="text-slate-900">{filteredCount}</strong> dari{" "}
                <strong className="text-slate-900">{totalCount}</strong> aset untuk pencarian &quot;
                <span className="font-semibold text-slate-800">{search}</span>&quot;
              </div>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Hapus Pencarian
              </button>
            </div>
          )}

          {/* Asset Register Table for Desktop */}
          <WaqfAssetsDesktopTable
            assets={filteredAssets}
            periodId={periodId}
          />

          {/* Asset Register Cards for Mobile */}
          <WaqfAssetsMobileList
            assets={filteredAssets}
            periodId={periodId}
          />
        </div>
      )}
    </div>
  );
}

export default WaqfAssetsPage;
