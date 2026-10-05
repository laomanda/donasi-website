import { useState, useMemo, useCallback } from "react";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import {
  AccountingPeriodsHeader,
  AccountingPeriodsOverview,
  AccountingPeriodsToolbar,
  AccountingPeriodsDesktopTable,
  AccountingPeriodsMobileList,
  type PeriodStatusFilterType,
} from "@/components/management/finance/accounting-periods";

export function AccountingPeriodsPage() {
  // Shared finance period cache & hook
  const { periods, initialLoading, refreshing, error, refresh } = useFinancePeriods();

  // Local presentation state for search & status filtering
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<PeriodStatusFilterType>("all");

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
  }, []);

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter !== "all");

  // Client-side filtering via useMemo (dataset is small and authoritative)
  const filteredPeriods = useMemo(() => {
    return periods.filter((period) => {
      // 1. Status Filter
      const statusNorm = (period.status || "").toLowerCase().trim();
      if (statusFilter === "open") {
        if (statusNorm !== "open" && statusNorm !== "aktif") return false;
      } else if (statusFilter === "closed") {
        if (statusNorm !== "closed" && statusNorm !== "ditutup") return false;
      }

      // 2. Search Query (period_name, name, year)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = (period.period_name || period.name || "").toLowerCase();
      const year = period.year != null ? String(period.year).toLowerCase() : "";

      return name.includes(q) || year.includes(q);
    });
  }, [periods, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header with Title, Badge, Description, and Neutral Segarkan Action */}
      <AccountingPeriodsHeader
        refreshing={refreshing}
        onRefresh={() => void refresh()}
      />

      {/* Full Error State only when no cached data exists */}
      {error && periods.length === 0 ? (
        <FinanceErrorState
          title="Tidak dapat memuat periode akuntansi"
          message={error}
          onRetry={() => void refresh()}
        />
      ) : (
        <>
          {/* Compact Overview Strip: [Periode Aktif] [Total Periode] [Ditutup] */}
          <AccountingPeriodsOverview
            periods={periods}
            loading={initialLoading}
          />

          {/* Compact Toolbar: Search + Segmented Status Filter */}
          <AccountingPeriodsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Desktop Table: Dark Header, Solid Badges, No Action Column */}
          <AccountingPeriodsDesktopTable
            periods={filteredPeriods}
            totalPeriodsCount={periods.length}
            loading={initialLoading}
            onResetFilters={handleResetFilters}
          />

          {/* Dedicated Mobile List */}
          <AccountingPeriodsMobileList
            periods={filteredPeriods}
            totalPeriodsCount={periods.length}
            loading={initialLoading}
            onResetFilters={handleResetFilters}
          />
        </>
      )}
    </div>
  );
}

export default AccountingPeriodsPage;
