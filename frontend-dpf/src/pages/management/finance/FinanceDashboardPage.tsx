import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faCoins,
  faScaleUnbalanced,
  faVault,
  faRotateRight,
  faArrowRight,
  faArrowTrendUp,
  faArrowTrendDown,
  faChartPie,
  faCalendarDays,
  faPlus,
  faBoxesStacked,
  faFileLines,
  faFolderTree,
} from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceStatCard,
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
      <div className="space-y-6">
        <FinancePageHeader
          title="Ringkasan Keuangan"
          description="Memuat konfigurasi periode akuntansi dan data keuangan..."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  // Error loading periods
  if (periodsError) {
    return (
      <div className="space-y-6">
        <FinancePageHeader
          title="Ringkasan Keuangan"
          description="Sistem pembukuan berpasangan dan kontrol akuntansi Yayasan Wakaf Djalaludin Pane."
        />
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
      <div className="space-y-6">
        <FinancePageHeader
          title="Ringkasan Keuangan"
          description="Sistem pembukuan berpasangan dan kontrol akuntansi Yayasan Wakaf Djalaludin Pane."
        />
        <FinanceEmptyState
          title="Belum Ada Periode Akuntansi"
          description="Belum ada periode akuntansi yang dibuat di sistem. Periode diperlukan untuk mencatat dan mengelompokkan laporan keuangan."
          action={
            <Link
              to="/finance/accounting-periods"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              Kelola Periode Akuntansi
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <FinancePageHeader
        title="Ringkasan Keuangan"
        description="Ringkasan posisi keuangan, aktivitas, dan kontrol akuntansi pada periode terpilih."
        badge={
          selectedPeriod ? (
            <FinanceStatusBadge
              status={selectedPeriod.status === "open" ? "open" : "closed"}
              label={selectedPeriod.status === "open" ? "Periode Terbuka" : "Periode Ditutup"}
            />
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={dashboardLoading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
              aria-label="Segarkan Data Dashboard"
            >
              <FontAwesomeIcon
                icon={faRotateRight}
                className={dashboardLoading ? "animate-spin text-emerald-600" : "text-emerald-600"}
              />
              Segarkan Data
            </button>
            <Link
              to="/finance/journals"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <FontAwesomeIcon icon={faPlus} />
              Jurnal Umum
            </Link>
          </div>
        }
      />

      {/* 2. PERIOD SELECTOR & CONTROL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:px-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
          </div>
          <div>
            <label
              htmlFor="dashboard-period-select"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-400"
            >
              Periode Akuntansi
            </label>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <select
                id="dashboard-period-select"
                value={selectedPeriodId ?? ""}
                onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
                className="cursor-pointer rounded-xl border border-slate-300 bg-slate-50/60 px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:border-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.period_name || p.name || `Periode #${p.id}`} ({p.status === "open" ? "Terbuka" : "Ditutup"})
                  </option>
                ))}
              </select>

              {selectedPeriod && (
                <span className="text-xs font-medium text-slate-500">
                  Rentang: {formatFinanceDate(selectedPeriod.start_date)} — {formatFinanceDate(selectedPeriod.end_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        {selectedPeriod && (
          <div className="flex items-center gap-2">
            <FinanceStatusBadge
              status={selectedPeriod.status === "open" ? "open" : "closed"}
              label={selectedPeriod.status === "open" ? "Pencatatan Aktif" : "Buku Ditutup"}
            />
          </div>
        )}
      </div>

      {/* 3. KPI OVERVIEW (6 Operational Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <FinanceStatCard
          title="Total Aset"
          value={<CurrencyDisplay amount={totalAssets} />}
          helper="Kas, bank & aset wakaf"
          icon={faVault}
          tone="emerald"
          loading={dashboardLoading}
        />
        <FinanceStatCard
          title="Total Liabilitas"
          value={<CurrencyDisplay amount={totalLiabilities} />}
          helper="Kewajiban berjalan"
          icon={faCoins}
          tone="amber"
          loading={dashboardLoading}
        />
        <FinanceStatCard
          title="Aset Neto"
          value={<CurrencyDisplay amount={totalNetAssets} />}
          helper="Saldo dana neto wakaf"
          icon={faScaleUnbalanced}
          tone="teal"
          loading={dashboardLoading}
        />
        <FinanceStatCard
          title="Penerimaan"
          value={<CurrencyDisplay amount={totalRevenues} />}
          helper="Donasi & hasil kelola"
          icon={faArrowTrendUp}
          tone="emerald"
          loading={dashboardLoading}
        />
        <FinanceStatCard
          title="Beban & Penyaluran"
          value={<CurrencyDisplay amount={totalExpenses} />}
          helper="Program & operasional"
          icon={faArrowTrendDown}
          tone="blue"
          loading={dashboardLoading}
        />
        <FinanceStatCard
          title="Surplus / Defisit"
          value={<CurrencyDisplay amount={surplusDeficit} tone="auto" />}
          helper={isSurplus ? "Surplus periode berjalan" : "Defisit periode berjalan"}
          icon={faChartPie}
          tone={isSurplus ? "emerald" : "rose"}
          loading={dashboardLoading}
        />
      </div>

      {/* 4 & 5. FINANCIAL POSITION & ACTIVITY SUMMARY (2-COLUMN GRID) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SECTION 4: FINANCIAL POSITION (NERACA / BALANCE SHEET) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-heading text-base font-bold text-slate-900">
                  Posisi Keuangan (Neraca)
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Laporan Posisi Keuangan (LP) per akhir periode terpilih.
                </p>
              </div>
              {balanceSheet && (
                <FinanceStatusBadge
                  status={balanceSheet.is_balanced ? "balanced" : "warning"}
                  label={balanceSheet.is_balanced ? "Neraca Seimbang" : "Tidak Seimbang"}
                />
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
              <div className="space-y-4 py-5">
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-100" />
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-100" />
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-100" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100 py-2">
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-semibold text-slate-600">Total Aset (Aktiva)</span>
                  <CurrencyDisplay amount={totalAssets} className="text-sm font-bold text-slate-900" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-semibold text-slate-600">Total Liabilitas (Kewajiban)</span>
                  <CurrencyDisplay amount={totalLiabilities} className="text-sm font-bold text-amber-700" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-semibold text-slate-600">Total Aset Neto Wakaf</span>
                  <CurrencyDisplay amount={totalNetAssets} className="text-sm font-bold text-teal-700" />
                </div>
                <div className="flex items-center justify-between bg-slate-50/70 px-3 py-2.5 rounded-xl mt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Liabilitas + Aset Neto
                  </span>
                  <CurrencyDisplay
                    amount={totalLiabilities + totalNetAssets}
                    className="text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <Link
              to={selectedPeriodId ? `/finance/balance-sheet?period_id=${selectedPeriodId}` : "/finance/balance-sheet"}
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
            >
              Lihat Laporan Posisi Keuangan Lengkap
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* SECTION 5: ACTIVITY SUMMARY (LAPORAN AKTIVITAS) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-heading text-base font-bold text-slate-900">
                  Aktivitas Periode
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Laporan Aktivitas (LA) penerimaan dan beban periode berjalan.
                </p>
              </div>
              {activityStatement && (
                <FinanceStatusBadge
                  status={isSurplus ? "posted" : "warning"}
                  label={isSurplus ? "Surplus Operasional" : "Defisit Operasional"}
                />
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
              <div className="space-y-4 py-5">
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-100" />
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-100" />
                <div className="h-6 w-full animate-pulse rounded-lg bg-slate-100" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100 py-2">
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-semibold text-slate-600">Total Penerimaan (Pendapatan & Donasi)</span>
                  <CurrencyDisplay amount={totalRevenues} tone="debit" className="text-sm font-bold" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-semibold text-slate-600">Total Beban dan Penyaluran Program</span>
                  <CurrencyDisplay amount={totalExpenses} tone="credit" className="text-sm font-bold" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs font-bold text-slate-800">
                    {isSurplus ? "Surplus Periode Berjalan" : "Defisit Periode Berjalan"}
                  </span>
                  <CurrencyDisplay amount={surplusDeficit} tone="auto" className="text-sm font-bold" />
                </div>
                <div className="flex items-center justify-between bg-emerald-50/50 px-3 py-2.5 rounded-xl mt-2">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Rasio Beban terhadap Penerimaan
                  </span>
                  <span className="text-xs font-bold text-emerald-900 tabular-nums">
                    {totalRevenues > 0 ? `${((totalExpenses / totalRevenues) * 100).toFixed(1)}%` : "0%"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <Link
              to={selectedPeriodId ? `/finance/activity-statement?period_id=${selectedPeriodId}` : "/finance/activity-statement"}
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
            >
              Lihat Laporan Aktivitas Lengkap
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6. ACCOUNTING INTEGRITY & CONTROLS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="font-heading text-base font-bold text-slate-900">
              Kontrol Akuntansi & Integritas Data
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Status validasi neraca saldo, 14 titik rekonsiliasi otomatis, dan kuncian buku pembukuan.
            </p>
          </div>
          <Link
            to="/finance/reconciliation"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
          >
            Buka Kontrol Rekonsiliasi
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Trial Balance */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Neraca Saldo
              </span>
              {trialBalance && (
                <FinanceStatusBadge
                  status={trialBalance.is_balanced ? "balanced" : "warning"}
                  label={trialBalance.is_balanced ? "SEIMBANG" : "SELISIH"}
                />
              )}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Debit:</span>
                <CurrencyDisplay
                  amount={trialBalance?.total_debit_balance ?? trialBalance?.totals?.ending_debit ?? 0}
                  className="text-xs font-bold"
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Kredit:</span>
                <CurrencyDisplay
                  amount={trialBalance?.total_credit_balance ?? trialBalance?.totals?.ending_credit ?? 0}
                  className="text-xs font-bold"
                />
              </div>
            </div>
            <Link
              to="/finance/trial-balance"
              className="mt-3 block text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
            >
              Periksa Rincian Akun →
            </Link>
          </div>

          {/* Card 2: 14-Point Reconciliation */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Rekonsiliasi Otomatis
              </span>
              {reconciliation && (
                <FinanceStatusBadge
                  status={
                    reconciliation.overall_status === "reconciled" || reconciliation.overall_status === "healthy"
                      ? "posted"
                      : reconciliation.overall_status === "reconciled_with_warnings"
                      ? "warning"
                      : "anomaly"
                  }
                  label={
                    reconciliation.overall_status === "reconciled" || reconciliation.overall_status === "healthy"
                      ? "TERKONTROL"
                      : "PERIKSA"
                  }
                />
              )}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Titik Kontrol:</span>
                <span className="font-bold text-slate-800">
                  {reconciliation?.passed_checks ?? (reconciliation?.total_checks ? reconciliation.total_checks - (reconciliation?.failed_checks ?? 0) : 14)} / {reconciliation?.total_checks ?? 14} CHECK
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Anomali Terdeteksi:</span>
                <span className={`font-bold ${(reconciliation?.critical_errors ?? 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {reconciliation?.critical_errors ?? reconciliation?.anomaly_controls ?? 0} Anomali
                </span>
              </div>
            </div>
            <Link
              to="/finance/reconciliation"
              className="mt-3 block text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
            >
              Jalankan Rekonsiliasi →
            </Link>
          </div>

          {/* Card 3: Period Immutability */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Integritas Buku
              </span>
              {selectedPeriod && (
                <FinanceStatusBadge
                  status={selectedPeriod.status === "open" ? "open" : "closed"}
                  label={selectedPeriod.status === "open" ? "BUKU TERBUKA" : "BUKU TERKUNCI"}
                />
              )}
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500 line-clamp-2">
              {selectedPeriod?.status === "open"
                ? "Jurnal diposting secara permanen. Koreksi saldo dilakukan melalui jurnal pembalik (reversal)."
                : "Periode telah ditutup. Transaksi baru tidak dapat dicatat pada periode ini."}
            </p>
            <Link
              to="/finance/accounting-periods"
              className="mt-3 block text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
            >
              Kelola Periode Akuntansi →
            </Link>
          </div>
        </div>
      </div>

      {/* 7. RECENT JOURNAL ACTIVITY */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="font-heading text-base font-bold text-slate-900">
              Aktivitas Jurnal Terbaru
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              5 transaksi jurnal terakhir yang tercatat pada periode ini.
            </p>
          </div>
          <Link
            to={selectedPeriodId ? `/finance/journals?period_id=${selectedPeriodId}` : "/finance/journals"}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
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
          <div className="space-y-3 py-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-12 w-full animate-pulse rounded-xl bg-slate-50" />
            ))}
          </div>
        ) : recentJournals.length === 0 ? (
          <FinanceEmptyState
            title="Belum Ada Transaksi Jurnal"
            description="Belum terdapat jurnal transaksi yang dicatat pada periode akuntansi ini."
            action={
              <Link
                to={selectedPeriodId ? `/finance/journals?period_id=${selectedPeriodId}` : "/finance/journals"}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlus} />
                Catat Jurnal Baru
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nomor Jurnal</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentJournals.map((journal) => {
                  const displayTotal =
                    journal.total_debit ??
                    journal.total_credit ??
                    0;

                  return (
                    <tr key={journal.id} className="transition hover:bg-slate-50/75">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {journal.journal_number}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {formatFinanceDate(journal.date)}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate font-medium text-slate-700">
                        {journal.description}
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
        )}
      </div>

      {/* 8. QUICK ACTIONS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="font-heading text-base font-bold text-slate-900 mb-1">
          Akses Cepat Operasional
        </h2>
        <p className="text-xs font-medium text-slate-500 mb-5">
          Pintasan langsung ke modul inti pembukuan, pelaporan, dan audit kontrol YWDP.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/finance/accounts"
            className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-slate-300 hover:bg-slate-100/50 hover:shadow-xs"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                <FontAwesomeIcon icon={faFolderTree} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800 group-hover:text-slate-900">
                Bagan Akun (COA)
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Struktur hirarki 4-level kode akun standar yayasan wakaf.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
              Daftar Bagan Akun
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px] transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to={selectedPeriodId ? `/finance/journals?period_id=${selectedPeriodId}` : "/finance/journals"}
            className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-xs"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <FontAwesomeIcon icon={faBookOpen} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800 group-hover:text-emerald-800">
                Jurnal Umum
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Pencatatan transaksi berpasangan, posting, void & reversal.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              Buka Jurnal Umum
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px] transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to={selectedPeriodId ? `/finance/general-ledger?period_id=${selectedPeriodId}` : "/finance/general-ledger"}
            className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-xs"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <FontAwesomeIcon icon={faCoins} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800 group-hover:text-amber-800">
                Buku Besar
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Kartu mutasi transaksi kronologis dan saldo berjalan per akun.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
              Lihat Buku Besar
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px] transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to={selectedPeriodId ? `/finance/trial-balance?period_id=${selectedPeriodId}` : "/finance/trial-balance"}
            className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-xs"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <FontAwesomeIcon icon={faScaleUnbalanced} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800 group-hover:text-blue-800">
                Neraca Saldo
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Validasi saldo akhir debit dan kredit seluruh bagan akun.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
              Lihat Neraca Saldo
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px] transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to={selectedPeriodId ? `/finance/balance-sheet?period_id=${selectedPeriodId}` : "/finance/balance-sheet"}
            className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-teal-200 hover:bg-teal-50/30 hover:shadow-xs"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                <FontAwesomeIcon icon={faVault} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800 group-hover:text-teal-800">
                Posisi Keuangan
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Neraca keuangan formal entitas wakaf (Aset, Liabilitas, Aset Neto).
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-teal-600">
              Buka Posisi Keuangan
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px] transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to={selectedPeriodId ? `/finance/activity-statement?period_id=${selectedPeriodId}` : "/finance/activity-statement"}
            className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-xs"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <FontAwesomeIcon icon={faArrowTrendUp} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800 group-hover:text-emerald-800">
                Laporan Aktivitas
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Penerimaan, beban operasional, dan perubahan aset neto wakaf.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              Buka Laporan Aktivitas
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px] transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to={selectedPeriodId ? `/finance/waqf-assets?period_id=${selectedPeriodId}` : "/finance/waqf-assets"}
            className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-xs"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <FontAwesomeIcon icon={faBoxesStacked} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800 group-hover:text-purple-800">
                Rincian Aset Wakaf
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                LRAW PSAK 112: aset wakaf bergerak & tidak bergerak.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-purple-600">
              Buka LRAW
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px] transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to={selectedPeriodId ? `/finance/financial-notes?period_id=${selectedPeriodId}` : "/finance/financial-notes"}
            className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-xs"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <FontAwesomeIcon icon={faFileLines} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800 group-hover:text-indigo-800">
                Catatan Keuangan (CLK)
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Pengungkapan narasi dan tabel pelengkap laporan keuangan.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600">
              Buka Catatan Keuangan
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px] transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
