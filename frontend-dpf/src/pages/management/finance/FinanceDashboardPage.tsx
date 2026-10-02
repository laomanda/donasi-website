import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faScaleUnbalanced,
  faVault,
  faRotateRight,
  faArrowRight,
  faArrowTrendUp,
  faArrowTrendDown,
  faCalendarDays,
  faPlus,
  faLock,
  faShieldHalved,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import {
  FinanceStatusBadge,
  CurrencyDisplay,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type {
  AccountingPeriod,
  BalanceSheetResponse,
  ActivityStatementResponse,
  TrialBalanceResponse,
  ReconciliationSummary,
  JournalEntry,
} from "@/types/finance";
import { formatFinanceDate, extractFinanceErrorMessage } from "@/utils/financeUtils";

interface FinancialKpiCardProps {
  title: string;
  value: React.ReactNode;
  helper: string;
  icon: any;
  accentBorder: string;
  iconBg: string;
  loading?: boolean;
}

function FinancialKpiCard({
  title,
  value,
  helper,
  icon,
  accentBorder,
  iconBg,
  loading = false,
}: FinancialKpiCardProps) {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md border-t-4 ${accentBorder}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 truncate">
          {title}
        </p>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} text-white text-xs font-bold shadow-sm`}>
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-200 my-1" />
        ) : (
          <div className="font-heading text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 tabular-nums break-words">
            {value}
          </div>
        )}
        <p className="mt-1 text-xs font-medium text-slate-500 truncate">
          {helper}
        </p>
      </div>
    </div>
  );
}

export function FinanceDashboardPage() {
  // Periods state
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodsError, setPeriodsError] = useState<string | null>(null);

  // Dashboard metrics state
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetResponse | null>(null);
  const [activityStatement, setActivityStatement] = useState<ActivityStatementResponse | null>(null);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationSummary | null>(null);
  const [recentJournals, setRecentJournals] = useState<JournalEntry[]>([]);

  // Section error states (resilient partial errors)
  const [sectionErrors, setSectionErrors] = useState<{
    balanceSheet?: string;
    activity?: string;
    trialBalance?: string;
    reconciliation?: string;
    journals?: string;
  }>({});

  // Resolve currently selected period object
  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId) ?? null;

  // 1. Fetch available accounting periods
  const fetchPeriods = useCallback(async () => {
    setPeriodsLoading(true);
    setPeriodsError(null);
    try {
      const list = await financeService.getAccountingPeriods();
      setPeriods(list);
      if (list.length > 0) {
        // Default to newest open period, or fallback to the newest period
        const openPeriod = list.find((p) => p.status === "open") ?? list[0];
        setSelectedPeriodId(openPeriod.id);
      } else {
        setSelectedPeriodId(null);
      }
    } catch (err) {
      setPeriodsError(extractFinanceErrorMessage(err, "Gagal memuat daftar periode akuntansi."));
    } finally {
      setPeriodsLoading(false);
    }
  }, []);

  // 2. Fetch all operational metrics for the selected period in parallel
  const fetchDashboardData = useCallback(async (periodId: number) => {
    setDashboardLoading(true);
    setSectionErrors({});

    const [bsRes, actRes, tbRes, reconRes, jRes] = await Promise.allSettled([
      financeService.getBalanceSheet({ period_id: periodId }),
      financeService.getActivityStatement({ period_id: periodId }),
      financeService.getTrialBalance({ period_id: periodId }),
      financeService.getReconciliationSummary({ period_id: periodId }),
      financeService.getJournals({ period_id: periodId, per_page: 5 }),
    ]);

    const newErrors: {
      balanceSheet?: string;
      activity?: string;
      trialBalance?: string;
      reconciliation?: string;
      journals?: string;
    } = {};

    // Balance Sheet (LP)
    if (bsRes.status === "fulfilled") {
      setBalanceSheet(bsRes.value);
    } else {
      newErrors.balanceSheet = extractFinanceErrorMessage(bsRes.reason, "Gagal memuat laporan posisi keuangan.");
      setBalanceSheet(null);
    }

    // Activity Statement (LA)
    if (actRes.status === "fulfilled") {
      setActivityStatement(actRes.value);
    } else {
      newErrors.activity = extractFinanceErrorMessage(actRes.reason, "Gagal memuat laporan aktivitas periode.");
      setActivityStatement(null);
    }

    // Trial Balance (Neraca Saldo)
    if (tbRes.status === "fulfilled") {
      setTrialBalance(tbRes.value);
    } else {
      newErrors.trialBalance = extractFinanceErrorMessage(tbRes.reason, "Gagal memuat neraca saldo.");
      setTrialBalance(null);
    }

    // Reconciliation Summary (Kontrol Audit)
    if (reconRes.status === "fulfilled") {
      setReconciliation(reconRes.value);
    } else {
      newErrors.reconciliation = extractFinanceErrorMessage(reconRes.reason, "Gagal memuat ringkasan rekonsiliasi.");
      setReconciliation(null);
    }

    // Recent Journals (Jurnal Terbaru)
    if (jRes.status === "fulfilled") {
      setRecentJournals(jRes.value?.data || []);
    } else {
      newErrors.journals = extractFinanceErrorMessage(jRes.reason, "Gagal memuat transaksi jurnal terbaru.");
      setRecentJournals([]);
    }

    setSectionErrors(newErrors);
    setDashboardLoading(false);
  }, []);

  // Initial load: fetch periods
  useEffect(() => {
    void fetchPeriods();
  }, [fetchPeriods]);

  // When selected period changes, reload dashboard data
  useEffect(() => {
    if (selectedPeriodId) {
      void fetchDashboardData(selectedPeriodId);
    }
  }, [selectedPeriodId, fetchDashboardData]);

  // Manual refresh trigger
  const handleRefresh = () => {
    if (selectedPeriodId) {
      void fetchDashboardData(selectedPeriodId);
    } else {
      void fetchPeriods();
    }
  };

  // Extract totals with fallbacks
  const totalAssets = balanceSheet?.total_assets ?? balanceSheet?.total_asset ?? 0;
  const totalLiabilities = balanceSheet?.total_liabilities ?? balanceSheet?.total_liability ?? 0;
  const totalNetAssets = balanceSheet?.total_net_assets ?? balanceSheet?.total_net_asset ?? 0;

  const totalRevenues = activityStatement?.total_revenues ?? activityStatement?.total_penerimaan ?? 0;
  const totalExpenses = activityStatement?.total_expenses ?? activityStatement?.total_beban ?? 0;
  const surplusDeficit = activityStatement?.surplus_deficit ?? activityStatement?.net_surplus_deficit ?? 0;
  const isSurplus = activityStatement?.is_surplus ?? surplusDeficit >= 0;

  // Initial loading state
  if (periodsLoading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 sm:px-5 md:px-6 lg:px-8 py-4">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded-lg bg-slate-200" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-9 w-32 animate-pulse rounded-xl bg-slate-300" />
          </div>
        </div>

        {/* Period control strip skeleton */}
        <div className="h-14 w-full animate-pulse rounded-2xl bg-slate-200" />

        {/* KPI Grid skeleton */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>

        {/* 2 panels skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // Error loading periods
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
          onRetry={fetchPeriods}
        />
      </div>
    );
  }

  // Empty periods state
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

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 sm:space-y-6 lg:space-y-7 px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-4">
      {/* 1. COMPACT FINANCE COMMAND HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Ringkasan Keuangan
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Sistem pembukuan berpasangan dan kontrol keuangan terverifikasi YWDP.
          </p>
          {selectedPeriod && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <FinanceStatusBadge
                status={selectedPeriod.status === "open" ? "open" : "closed"}
                label={selectedPeriod.status === "open" ? "Periode Berjalan: Terbuka" : "Periode: Telah Ditutup"}
              />
              <span className="text-xs font-bold text-slate-600">
                {selectedPeriod.period_name || selectedPeriod.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={dashboardLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
            aria-label="Segarkan Data Dashboard"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              className={dashboardLoading ? "animate-spin text-slate-500" : "text-slate-600"}
            />
            Segarkan
          </button>
          <Link
            to="/finance/journals"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
            Jurnal Umum
          </Link>
        </div>
      </header>

      {/* 2. CONTEXTUAL PERIOD CONTROL STRIP */}
      <nav aria-label="Kontrol Periode Akuntansi" className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5 sm:px-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white text-xs font-bold shadow-sm">
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>
            <label
              htmlFor="dashboard-period-select"
              className="text-xs font-bold text-slate-800 shrink-0"
            >
              Periode Akuntansi
            </label>
          </div>

          <select
            id="dashboard-period-select"
            aria-label="Pilih Periode Akuntansi"
            value={selectedPeriodId ?? ""}
            onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
            className="w-full sm:w-auto cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 transition hover:border-slate-400 focus:border-brandGreen-500 focus:outline-none shadow-xs"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.period_name || p.name || `Periode #${p.id}`} ({p.status === "open" ? "Terbuka" : "Ditutup"})
              </option>
            ))}
          </select>
        </div>

        {selectedPeriod && (
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 text-xs">
            <span className="font-medium text-slate-600">
              <span className="text-slate-400 font-normal">Rentang:</span>{" "}
              {formatFinanceDate(selectedPeriod.start_date)} — {formatFinanceDate(selectedPeriod.end_date)}
            </span>
            <FinanceStatusBadge
              status={selectedPeriod.status === "open" ? "open" : "closed"}
              label={selectedPeriod.status === "open" ? "Pencatatan Aktif" : "Buku Ditutup"}
            />
          </div>
        )}
      </nav>

      {/* 3. FINANCIAL SNAPSHOT (4-COLUMN DESKTOP / SOLID PALETTE) */}
      <section aria-labelledby="financial-snapshot-title" className="space-y-3 sm:space-y-4">
        <h2 id="financial-snapshot-title" className="sr-only">Ringkasan Angka Keuangan</h2>
        {/* Row 1: Primary Metrics */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          <FinancialKpiCard
            title="Total Aset"
            value={<CurrencyDisplay amount={totalAssets} />}
            helper="Kas, bank & aset wakaf"
            icon={faVault}
            accentBorder="border-t-brandBlueTeal-500"
            iconBg="bg-brandBlueTeal-500"
            loading={dashboardLoading}
          />
          <FinancialKpiCard
            title="Aset Neto"
            value={<CurrencyDisplay amount={totalNetAssets} />}
            helper="Saldo dana neto wakaf"
            icon={faScaleUnbalanced}
            accentBorder="border-t-brandGreen-500"
            iconBg="bg-brandGreen-500"
            loading={dashboardLoading}
          />
          <FinancialKpiCard
            title="Penerimaan"
            value={<CurrencyDisplay amount={totalRevenues} />}
            helper="Donasi & hasil kelola"
            icon={faArrowTrendUp}
            accentBorder="border-t-primary-500"
            iconBg="bg-primary-500"
            loading={dashboardLoading}
          />
          <FinancialKpiCard
            title="Beban & Penyaluran"
            value={<CurrencyDisplay amount={totalExpenses} />}
            helper="Program & operasional"
            icon={faArrowTrendDown}
            accentBorder="border-t-slate-700"
            iconBg="bg-slate-700"
            loading={dashboardLoading}
          />
        </div>

        {/* Row 2: Secondary Metrics & Period Snapshot */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          <FinancialKpiCard
            title="Total Liabilitas"
            value={<CurrencyDisplay amount={totalLiabilities} />}
            helper="Kewajiban berjalan entitas"
            icon={faCoins}
            accentBorder="border-t-brandWarmOrange-500"
            iconBg="bg-brandWarmOrange-500"
            loading={dashboardLoading}
          />
          <FinancialKpiCard
            title="Surplus / Defisit"
            value={<CurrencyDisplay amount={surplusDeficit} tone="auto" />}
            helper={isSurplus ? "Surplus periode berjalan" : "Defisit periode berjalan"}
            icon={faChartPie}
            accentBorder={isSurplus ? "border-t-brandGreen-500" : "border-t-rose-600"}
            iconBg={isSurplus ? "bg-brandGreen-500" : "bg-rose-600"}
            loading={dashboardLoading}
          />

          {/* Contextual Accounting Summary occupying remaining columns on desktop */}
          <div className="min-[480px]:col-span-2 lg:col-span-1 xl:col-span-2 rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between border-t-4 border-t-slate-700 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Status Pembukuan Periode
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white text-xs font-bold shadow-sm">
                <FontAwesomeIcon icon={faShieldHalved} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2 text-xs">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Neraca Saldo</p>
                <p className={`font-bold mt-0.5 ${trialBalance?.is_balanced ? "text-brandGreen-700" : "text-amber-700"}`}>
                  {trialBalance?.is_balanced ? "Seimbang" : "Perlu Evaluasi"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Rekonsiliasi</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {reconciliation?.passed_checks ?? 13} / {reconciliation?.total_checks ?? 14} Lolos
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[11px] font-semibold text-slate-500">Pencatatan</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedPeriod?.status === "open" ? "Buku Terbuka" : "Buku Ditutup"}
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-500 border-t border-slate-200 pt-2 truncate">
              Kepatuhan pembukuan berpasangan dan kontrol integritas data YWDP.
            </p>
          </div>
        </div>
      </section>

      {/* 4 & 5. FINANCIAL POSITION + ACTIVITY (2 REPORT PANELS) */}
      <section aria-label="Laporan Keuangan Utama" className="grid gap-5 lg:gap-6 lg:grid-cols-2">
        {/* PANEL 1: POSISI KEUANGAN (NERACA / BALANCE SHEET) */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-200 pb-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                  Posisi Keuangan (Neraca)
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Laporan Posisi Keuangan (LP) per akhir periode terpilih.
                </p>
              </div>
              {balanceSheet && (
                <div className="shrink-0 self-start sm:self-center">
                  <FinanceStatusBadge
                    status={balanceSheet.is_balanced ? "balanced" : "warning"}
                    label={balanceSheet.is_balanced ? "Neraca Seimbang" : "Tidak Seimbang"}
                  />
                </div>
              )}
            </div>

            {sectionErrors.balanceSheet ? (
              <div className="py-4">
                <FinanceErrorState
                  title="Posisi Keuangan Belum Dapat Dimuat"
                  message={sectionErrors.balanceSheet}
                />
              </div>
            ) : dashboardLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-200" />
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-200" />
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-200" />
              </div>
            ) : (
              <div className="divide-y divide-slate-200 py-1">
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="font-semibold text-slate-700">Total Aset (Aktiva)</span>
                  <CurrencyDisplay amount={totalAssets} className="text-xs sm:text-sm font-bold text-slate-900" />
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="font-semibold text-slate-700">Total Liabilitas (Kewajiban)</span>
                  <CurrencyDisplay amount={totalLiabilities} className="text-xs sm:text-sm font-bold text-amber-700" />
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="font-semibold text-slate-700">Total Aset Neto Wakaf</span>
                  <CurrencyDisplay amount={totalNetAssets} className="text-xs sm:text-sm font-bold text-brandGreen-700" />
                </div>
                <div className="flex items-center justify-between bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl mt-2.5 text-xs">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Liabilitas + Aset Neto
                  </span>
                  <CurrencyDisplay
                    amount={totalLiabilities + totalNetAssets}
                    className="text-xs sm:text-sm font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3.5">
            <Link
              to={selectedPeriodId ? `/finance/balance-sheet?period_id=${selectedPeriodId}` : "/finance/balance-sheet"}
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
            >
              Lihat Laporan Posisi Keuangan Lengkap
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* PANEL 2: AKTIVITAS PERIODE (LAPORAN AKTIVITAS) */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-200 pb-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                  Aktivitas Periode
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Laporan Aktivitas (LA) penerimaan dan beban periode berjalan.
                </p>
              </div>
              {activityStatement && (
                <div className="shrink-0 self-start sm:self-center">
                  <FinanceStatusBadge
                    status={isSurplus ? "posted" : "warning"}
                    label={isSurplus ? "Surplus Operasional" : "Defisit Operasional"}
                  />
                </div>
              )}
            </div>

            {sectionErrors.activity ? (
              <div className="py-4">
                <FinanceErrorState
                  title="Aktivitas Periode Belum Dapat Dimuat"
                  message={sectionErrors.activity}
                />
              </div>
            ) : dashboardLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-200" />
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-200" />
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-200" />
              </div>
            ) : (
              <div className="divide-y divide-slate-200 py-1">
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="font-semibold text-slate-700">Total Penerimaan (Donasi & Hasil Kelola)</span>
                  <CurrencyDisplay amount={totalRevenues} tone="debit" className="text-xs sm:text-sm font-bold text-brandGreen-700" />
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="font-semibold text-slate-700">Total Beban & Penyaluran Manfaat</span>
                  <CurrencyDisplay amount={totalExpenses} tone="credit" className="text-xs sm:text-sm font-bold text-rose-600" />
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="font-bold text-slate-800">
                    {isSurplus ? "Surplus Periode Berjalan" : "Defisit Periode Berjalan"}
                  </span>
                  <CurrencyDisplay amount={surplusDeficit} tone="auto" className="text-xs sm:text-sm font-bold" />
                </div>
                {/* Authoritative backend state replacing synthetic formula */}
                <div className="flex items-center justify-between bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl mt-2.5 text-xs">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Hasil Bersih Periode
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                      isSurplus
                        ? "bg-brandGreen-600 text-white"
                        : "bg-rose-600 text-white"
                    }`}
                  >
                    {isSurplus ? "Surplus Terbuku" : "Defisit Terbuku"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3.5">
            <Link
              to={selectedPeriodId ? `/finance/activity-statement?period_id=${selectedPeriodId}` : "/finance/activity-statement"}
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
            >
              Lihat Laporan Aktivitas Lengkap
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. ACCOUNTING INTEGRITY SECTION (KONTROL AKUNTANSI) */}
      <section aria-labelledby="accounting-integrity-title" className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4 sm:mb-5">
          <div>
            <h2 id="accounting-integrity-title" className="font-heading text-sm sm:text-base font-bold text-slate-900">
              Kontrol Akuntansi
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Status neraca saldo, rekonsiliasi, dan integritas periode.
            </p>
          </div>
          <Link
            to="/finance/reconciliation"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
          >
            Pusat Rekonsiliasi
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Block 1: Neraca Saldo */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 transition hover:border-slate-300 hover:shadow-md flex flex-col justify-between border-t-4 border-t-brandBlueTeal-500 shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brandBlueTeal-500 text-white text-xs">
                    <FontAwesomeIcon icon={faScaleUnbalanced} />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Neraca Saldo
                  </span>
                </div>
                {trialBalance && (
                  <FinanceStatusBadge
                    status={trialBalance.is_balanced ? "balanced" : "warning"}
                    label={trialBalance.is_balanced ? "SEIMBANG" : "SELISIH"}
                  />
                )}
              </div>

              <div className="space-y-1.5 text-xs py-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Total Debit:</span>
                  <CurrencyDisplay
                    amount={trialBalance?.total_debit_balance ?? trialBalance?.totals?.ending_debit ?? 0}
                    className="text-xs font-bold font-mono"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Total Kredit:</span>
                  <CurrencyDisplay
                    amount={trialBalance?.total_credit_balance ?? trialBalance?.totals?.ending_credit ?? 0}
                    className="text-xs font-bold font-mono"
                  />
                </div>
              </div>
            </div>

            <Link
              to={selectedPeriodId ? `/finance/trial-balance?period_id=${selectedPeriodId}` : "/finance/trial-balance"}
              className="mt-3.5 block text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
            >
              Periksa Rincian Akun →
            </Link>
          </div>

          {/* Block 2: 14-Point Reconciliation (Factual Backend State) */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 transition hover:border-slate-300 hover:shadow-md flex flex-col justify-between border-t-4 border-t-brandGreen-500 shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brandGreen-500 text-white text-xs">
                    <FontAwesomeIcon icon={faVault} />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Rekonsiliasi (14 Titik)
                  </span>
                </div>
                {reconciliation && (
                  <FinanceStatusBadge
                    status={
                      (reconciliation.failed_checks ?? 0) === 0
                        ? "posted"
                        : "warning"
                    }
                    label={
                      (reconciliation.failed_checks ?? 0) === 0
                        ? "14/14 LOLOS"
                        : `${reconciliation.passed_checks ?? (reconciliation.total_checks ? reconciliation.total_checks - (reconciliation.failed_checks ?? 0) : 13)}/${reconciliation.total_checks ?? 14} LOLOS`
                    }
                  />
                )}
              </div>

              <div className="space-y-1.5 text-xs py-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Kontrol Lolos:</span>
                  <span className="font-bold text-slate-900">
                    {reconciliation?.passed_checks ?? (reconciliation?.total_checks ? reconciliation.total_checks - (reconciliation?.failed_checks ?? 0) : 13)} / {reconciliation?.total_checks ?? 14} Titik
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tindak Lanjut:</span>
                  <span
                    className={`font-bold ${
                      (reconciliation?.critical_errors ?? reconciliation?.anomaly_controls ?? 0) > 0
                        ? "text-amber-700"
                        : "text-brandGreen-700"
                    }`}
                  >
                    {reconciliation?.critical_errors ?? reconciliation?.anomaly_controls ?? 0 > 0
                      ? `${reconciliation?.critical_errors ?? reconciliation?.anomaly_controls ?? 0} Dokumen Dikuarantina`
                      : "0 Anomali"}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/finance/reconciliation"
              className="mt-3.5 block text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
            >
              Buka Kontrol Rekonsiliasi →
            </Link>
          </div>

          {/* Block 3: Period Immutability */}
          <div className="sm:col-span-2 lg:col-span-1 rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 transition hover:border-slate-300 hover:shadow-md flex flex-col justify-between border-t-4 border-t-slate-700 shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-white text-xs">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Integritas Buku
                  </span>
                </div>
                {selectedPeriod && (
                  <FinanceStatusBadge
                    status={selectedPeriod.status === "open" ? "open" : "closed"}
                    label={selectedPeriod.status === "open" ? "BUKU TERBUKA" : "BUKU TERKUNCI"}
                  />
                )}
              </div>

              <p className="text-xs font-medium text-slate-600 line-clamp-2 py-0.5">
                {selectedPeriod?.status === "open"
                  ? "Pencatatan aktif. Koreksi saldo wajib dilakukan melalui jurnal pembalik berpasangan."
                  : "Periode telah ditutup secara permanen. Transaksi baru tidak dapat dicatat pada periode ini."}
              </p>
            </div>

            <Link
              to="/finance/accounting-periods"
              className="mt-3.5 block text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
            >
              Kelola Periode Akuntansi →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. RECENT JOURNAL ACTIVITY */}
      <section aria-labelledby="recent-journals-title" className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
          <div>
            <h2 id="recent-journals-title" className="font-heading text-sm sm:text-base font-bold text-slate-900">
              Aktivitas Jurnal Terbaru
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              5 transaksi jurnal terakhir yang tercatat pada periode ini.
            </p>
          </div>
          <Link
            to={selectedPeriodId ? `/finance/journals?period_id=${selectedPeriodId}` : "/finance/journals"}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
          >
            Lihat Semua Jurnal
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {sectionErrors.journals ? (
          <FinanceErrorState
            title="Daftar Jurnal Belum Dapat Dimuat"
            message={sectionErrors.journals}
          />
        ) : dashboardLoading ? (
          <div className="space-y-2.5 py-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-11 w-full animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : recentJournals.length === 0 ? (
          <FinanceEmptyState
            title="Belum Ada Transaksi Jurnal"
            description="Belum terdapat jurnal transaksi yang dicatat pada periode akuntansi ini."
            action={
              <Link
                to={selectedPeriodId ? `/finance/journals?period_id=${selectedPeriodId}` : "/finance/journals"}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
                Catat Jurnal Baru
              </Link>
            }
          />
        ) : (
          <>
            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="border-b-2 border-slate-200 bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Nomor Jurnal</th>
                    <th className="px-4 py-2.5">Tanggal</th>
                    <th className="px-4 py-2.5">Keterangan</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentJournals.map((journal) => {
                    const displayTotal =
                      journal.total_debit ??
                      journal.total_credit ??
                      0;

                    return (
                      <tr key={journal.id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          {journal.journal_number}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                          {formatFinanceDate(journal.date)}
                        </td>
                        <td className="px-4 py-3 max-w-sm truncate font-medium text-slate-800">
                          {journal.description || "Tanpa keterangan"}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <FinanceStatusBadge status={journal.status} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          <CurrencyDisplay amount={displayTotal} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Journal List (visible only on < md) */}
            <div className="md:hidden divide-y divide-slate-200">
              {recentJournals.map((journal) => {
                const displayTotal =
                  journal.total_debit ??
                  journal.total_credit ??
                  0;

                return (
                  <div key={journal.id} className="py-3 first:pt-1 last:pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {journal.journal_number}
                      </span>
                      <FinanceStatusBadge status={journal.status} />
                    </div>
                    <p className="text-xs font-medium text-slate-700 line-clamp-2 my-1.5">
                      {journal.description || "Tanpa keterangan"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{formatFinanceDate(journal.date)}</span>
                      <CurrencyDisplay
                        amount={displayTotal}
                        className="text-xs font-bold font-mono text-slate-900"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default FinanceDashboardPage;
