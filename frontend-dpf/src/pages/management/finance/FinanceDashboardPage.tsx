import { Link } from "react-router-dom";
import {
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import {
  DashboardPageSkeleton,
  FinanceDashboardHeader,
  FinancePeriodSelector,
  FinanceSnapshot,
  FinancialPositionPanel,
  ActivitySummaryPanel,
  AccountingIntegrityPanel,
  RecentJournalsPanel,
} from "@/components/management/finance/dashboard";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import { useFinanceDashboard } from "@/hooks/finance/useFinanceDashboard";

export function FinanceDashboardPage() {
  // 1. Accounting Periods hook
  const {
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    selectedPeriod,
    loading: periodsLoading,
    error: periodsError,
    refresh: refreshPeriods,
  } = useFinancePeriods();

  // 2. Dashboard Operational Data hook (SWR cached per-period)
  const {
    data,
    sectionErrors,
    initialLoading: dashboardLoading,
    refreshing,
    refresh: refreshDashboard,
    metrics,
  } = useFinanceDashboard(selectedPeriodId);

  // Coordinated manual refresh
  const handleRefresh = async () => {
    if (selectedPeriodId) {
      await refreshDashboard();
    } else {
      await refreshPeriods();
    }
  };

  // 3. Initial loading state (no cached periods)
  if (periodsLoading) {
    return <DashboardPageSkeleton />;
  }

  // 4. Period fetching error state
  if (periodsError) {
    return (
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 sm:px-5 md:px-6 lg:px-8 py-4">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="font-heading text-xl md:text-2xl font-bold text-slate-900">
            Ringkasan Keuangan
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Sistem pembukuan berpasangan dan kontrol akuntansi Yayasan Wakaf Djalaludin Pane.
          </p>
        </div>
        <FinanceErrorState
          title="Gagal Memuat Periode Akuntansi"
          message={periodsError}
          onRetry={refreshPeriods}
        />
      </div>
    );
  }

  // 5. Zero periods state
  if (periods.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 sm:px-5 md:px-6 lg:px-8 py-4">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="font-heading text-xl md:text-2xl font-bold text-slate-900">
            Ringkasan Keuangan
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Sistem pembukuan berpasangan dan kontrol akuntansi Yayasan Wakaf Djalaludin Pane.
          </p>
        </div>
        <FinanceEmptyState
          title="Belum Ada Periode Akuntansi"
          description="Belum ada periode akuntansi yang dibuat di sistem. Periode diperlukan untuk mencatat dan mengelompokkan laporan keuangan."
          action={
            <Link
              to="/finance/accounting-periods"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
            >
              Kelola Periode Akuntansi
            </Link>
          }
        />
      </div>
    );
  }

  // 6. Composition Shell
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 sm:space-y-6 lg:space-y-7 px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-4">
      {/* 1. Header with Refresh & Quick CTA */}
      <FinanceDashboardHeader
        selectedPeriod={selectedPeriod}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* 2. Period Selector & Contextual Date Strip */}
      <FinancePeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriodId}
      />

      {/* 3. Financial Snapshot (KPIs + Accounting Status Card) */}
      <FinanceSnapshot
        metrics={metrics}
        trialBalance={data.trialBalance}
        reconciliation={data.reconciliation}
        selectedPeriod={selectedPeriod}
        loading={dashboardLoading}
      />

      {/* 4 & 5. Balance Sheet & Activity Statement Panels */}
      <section
        aria-label="Laporan Keuangan Utama"
        className="grid gap-5 lg:gap-6 lg:grid-cols-2"
      >
        <FinancialPositionPanel
          balanceSheet={data.balanceSheet}
          totalAssets={metrics.totalAssets}
          totalLiabilities={metrics.totalLiabilities}
          totalNetAssets={metrics.totalNetAssets}
          selectedPeriodId={selectedPeriodId}
          error={sectionErrors.balanceSheet}
          loading={dashboardLoading}
        />

        <ActivitySummaryPanel
          activityStatement={data.activityStatement}
          totalRevenues={metrics.totalRevenues}
          totalExpenses={metrics.totalExpenses}
          surplusDeficit={metrics.surplusDeficit}
          isSurplus={metrics.isSurplus}
          selectedPeriodId={selectedPeriodId}
          error={sectionErrors.activity}
          loading={dashboardLoading}
        />
      </section>

      {/* 6. Accounting Integrity Panel (Trial Balance + 14-Point Recon + Period Immutability) */}
      <AccountingIntegrityPanel
        trialBalance={data.trialBalance}
        reconciliation={data.reconciliation}
        selectedPeriod={selectedPeriod}
        selectedPeriodId={selectedPeriodId}
      />

      {/* 7. Recent Journals Panel (Desktop Table + Mobile Cards) */}
      <RecentJournalsPanel
        journals={data.recentJournals}
        selectedPeriodId={selectedPeriodId}
        error={sectionErrors.journals}
        loading={dashboardLoading}
      />
    </div>
  );
}

export default FinanceDashboardPage;
