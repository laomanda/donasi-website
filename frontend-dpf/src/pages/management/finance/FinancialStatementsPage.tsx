import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faFileExcel,
  faVault,
  faChartLine,
  faBuildingColumns,
  faFileInvoiceDollar,
  faScaleBalanced,
  faCoins,
  faHandHoldingHeart,
  faChartPie,
  faCheckCircle,
  faTriangleExclamation,
  faBookOpen,
  faArrowRight,
  faFileLines,
  faPrint,
  faCalendarDays,
  faBuilding,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";

import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import {
  formatRupiah,
  formatFinanceDate,
  extractFinanceErrorMessage,
  downloadBlobFile,
} from "@/utils/financeUtils";
import type {
  AccountingPeriod,
  BalanceSheetResponse,
  ActivityStatementResponse,
  FinancialStatementFilterParams,
  BalanceSheetAccount,
  ActivityStatementAccount,
  FinancialStatementNoteItem,
} from "@/types/finance";

export type StatementTab = "balance-sheet" | "activity-statement";

interface FinancialStatementsPageProps {
  defaultTab?: StatementTab;
}

export function FinancialStatementsPage({ defaultTab = "balance-sheet" }: FinancialStatementsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State: sync with URL if present or defaultTab
  const currentTab = useMemo<StatementTab>(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "activity-statement" || tabParam === "balance-sheet") {
      return tabParam;
    }
    return defaultTab;
  }, [searchParams, defaultTab]);

  const handleTabChange = (tab: StatementTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  // Data States
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetResponse | null>(null);
  const [activityStatement, setActivityStatement] = useState<ActivityStatementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Master Data
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);

  // Filter States
  const [periodFilter, setPeriodFilter] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load accounting periods on mount
  useEffect(() => {
    let isMounted = true;
    const loadPeriods = async () => {
      try {
        const periodList = await financeService.getAccountingPeriods();
        if (isMounted) {
          setPeriods(periodList || []);
        }
      } catch {
        // Silent fallback
      }
    };

    void loadPeriods();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch financial statements data based on active tab & filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: FinancialStatementFilterParams = {};
      if (periodFilter !== "") {
        params.period_id = periodFilter;
        params.accounting_period_id = periodFilter;
      }
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      if (currentTab === "balance-sheet") {
        const res = await financeService.getBalanceSheet(params);
        setBalanceSheet(res);
      } else {
        const res = await financeService.getActivityStatement(params);
        setActivityStatement(res);
      }
    } catch (err) {
      setError(
        extractFinanceErrorMessage(
          err,
          currentTab === "balance-sheet"
            ? "Gagal memuat laporan posisi keuangan."
            : "Gagal memuat laporan aktivitas."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [currentTab, periodFilter, startDate, endDate]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return Boolean(periodFilter !== "" || startDate || endDate);
  }, [periodFilter, startDate, endDate]);

  // Reset all filters
  const handleResetFilter = () => {
    setPeriodFilter("");
    setStartDate("");
    setEndDate("");
  };

  // Export Excel for current statement
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams: Record<string, string> = {};
      if (periodFilter !== "") exportParams.period_id = String(periodFilter);
      if (startDate) exportParams.start_date = startDate;
      if (endDate) exportParams.end_date = endDate;

      const today = new Date().toISOString().slice(0, 10);

      if (currentTab === "balance-sheet") {
        const blob = await financeService.exportBalanceSheet(exportParams);
        downloadBlobFile(
          blob as unknown as BlobPart,
          `Laporan_Posisi_Keuangan_${today}.xlsx`
        );
      } else {
        const blob = await financeService.exportActivityStatement(exportParams);
        downloadBlobFile(
          blob as unknown as BlobPart,
          `Laporan_Aktivitas_${today}.xlsx`
        );
      }
      toast.success("Laporan Excel berhasil diunduh.");
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengunduh laporan Excel."));
    } finally {
      setExporting(false);
    }
  };

  // Browser print trigger
  const handlePrint = () => {
    window.print();
  };

  // Active statement metadata
  const periodInfo = currentTab === "balance-sheet" ? balanceSheet?.period : activityStatement?.period;
  const rawStartDate = currentTab === "balance-sheet" ? balanceSheet?.start_date : activityStatement?.start_date;
  const rawEndDate = currentTab === "balance-sheet" ? balanceSheet?.end_date : activityStatement?.end_date;
  const notesList: FinancialStatementNoteItem[] = useMemo(() => {
    const raw = currentTab === "balance-sheet"
      ? balanceSheet?.financial_notes || balanceSheet?.notes
      : activityStatement?.financial_notes || activityStatement?.notes;
    return Array.isArray(raw) ? raw : [];
  }, [currentTab, balanceSheet, activityStatement]);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      {/* 1. PAGE HEADER */}
      <div className="print:hidden">
        <FinancePageHeader
          title="Laporan Keuangan"
          description="Laporan posisi keuangan (LP) dan laporan aktivitas (LA) entitas wakaf berdasarkan pembukuan jurnal terposting."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
                title="Cetak Laporan"
              >
                <FontAwesomeIcon icon={faPrint} className="text-slate-500" />
                <span className="hidden sm:inline">Cetak</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
              >
                <FontAwesomeIcon
                  icon={faFileExcel}
                  className={`text-emerald-600 ${exporting ? "animate-bounce" : ""}`}
                />
                <span>{exporting ? "Mengunduh..." : "Export Excel"}</span>
              </button>

              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                <FontAwesomeIcon
                  icon={faRotateRight}
                  className={loading ? "animate-spin" : ""}
                />
                <span>Segarkan</span>
              </button>
            </div>
          }
        />
      </div>

      {/* 2. REPORT NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleTabChange("balance-sheet")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === "balance-sheet"
                ? "bg-white text-emerald-950 shadow-xs ring-1 ring-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <FontAwesomeIcon
              icon={faVault}
              className={currentTab === "balance-sheet" ? "text-emerald-600" : "text-slate-400"}
            />
            <span>Laporan Posisi Keuangan (LP)</span>
            {balanceSheet && (
              <span
                className={`ml-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  balanceSheet.is_balanced
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {balanceSheet.is_balanced ? "Seimbang" : "Tidak Seimbang"}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("activity-statement")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === "activity-statement"
                ? "bg-white text-emerald-950 shadow-xs ring-1 ring-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <FontAwesomeIcon
              icon={faChartLine}
              className={currentTab === "activity-statement" ? "text-emerald-600" : "text-slate-400"}
            />
            <span>Laporan Aktivitas (LA)</span>
            {activityStatement && (
              <span
                className={`ml-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  activityStatement.is_surplus
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {activityStatement.is_surplus ? "Surplus" : "Defisit"}
              </span>
            )}
          </button>
        </div>

        {/* Shortcut Quick links */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link
            to="/finance/trial-balance"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
          >
            <FontAwesomeIcon icon={faScaleBalanced} className="text-slate-400" />
            <span>Neraca Saldo</span>
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            to="/finance/general-ledger"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
          >
            <FontAwesomeIcon icon={faBookOpen} className="text-slate-400" />
            <span>Buku Besar</span>
          </Link>
        </div>
      </div>

      {/* 3. FILTER TOOLBAR */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-xs print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          {/* Periode Akuntansi */}
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="period_select"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Periode Akuntansi
            </label>
            <select
              id="period_select"
              value={periodFilter}
              onChange={(e) =>
                setPeriodFilter(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua Periode (Default)</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.period_name} ({p.status === "open" ? "Aktif" : "Ditutup"})
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal Mulai */}
          <div className="w-full sm:w-44">
            <label
              htmlFor="start_date_input"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Tanggal Mulai
            </label>
            <input
              id="start_date_input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Tanggal Akhir */}
          <div className="w-full sm:w-44">
            <label
              htmlFor="end_date_input"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Tanggal Akhir
            </label>
            <input
              id="end_date_input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Reset Button */}
          {isFilterActive && (
            <div>
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. INSTITUTIONAL REPORT HEADER BANNER */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-sm print:bg-none print:text-black print:p-0 print:border-b-2 print:border-black print:rounded-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-400 uppercase print:text-slate-600">
              <FontAwesomeIcon icon={faBuilding} />
              <span>Yayasan Wakaf Djalaluddin Pane (YWDP)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white print:text-black">
              {currentTab === "balance-sheet"
                ? "LAPORAN POSISI KEUANGAN"
                : "LAPORAN AKTIVITAS PENGELOLAAN DANA"}
            </h2>
            <p className="text-xs text-slate-300 print:text-slate-600">
              Disusun berdasarkan Standar Akuntansi Keuangan Entitas Wakaf dan Jurnal Terposting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/10 print:border-none print:p-0">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 print:text-slate-600">
                <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-400 print:text-slate-600" />
                <span>Periode Laporan:</span>
              </div>
              <p className="text-xs font-bold text-white print:text-black">
                {periodInfo?.name || "Semua Periode"}
                {(rawStartDate || rawEndDate) && (
                  <span className="font-normal text-slate-300 print:text-slate-600 ml-1">
                    ({formatFinanceDate(rawStartDate)} s/d {formatFinanceDate(rawEndDate)})
                  </span>
                )}
              </p>
            </div>

            {periodInfo?.status && (
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  periodInfo.status === "open"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:border-black print:text-black"
                    : "bg-slate-700 text-slate-300 print:text-black"
                }`}
              >
                {periodInfo.status === "open" ? "Periode Terbuka" : "Periode Ditutup"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. ERROR STATE */}
      {error && (
        <FinanceErrorState
          title="Tidak Dapat Memuat Laporan Keuangan"
          message={error}
          onRetry={fetchData}
        />
      )}

      {/* 6. LOADING SKELETON */}
      {loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <FinanceTableSkeleton rows={8} cols={4} />
          </div>
        </div>
      )}

      {/* 7. BALANCE SHEET (LP) VIEW */}
      {!loading && !error && currentTab === "balance-sheet" && balanceSheet && (
        <BalanceSheetView
          data={balanceSheet}
          notes={notesList}
        />
      )}

      {/* 8. ACTIVITY STATEMENT (LA) VIEW */}
      {!loading && !error && currentTab === "activity-statement" && activityStatement && (
        <ActivityStatementView
          data={activityStatement}
          notes={notesList}
        />
      )}

      {/* 9. EMPTY STATE IF NO DATA AT ALL */}
      {!loading && !error && currentTab === "balance-sheet" && !balanceSheet && (
        <FinanceEmptyState
          title="Laporan Posisi Keuangan Belum Memiliki Data"
          description="Tidak terdapat transaksi jurnal terposting pada periode atau rentang tanggal yang dipilih."
          icon={faVault}
        />
      )}

      {!loading && !error && currentTab === "activity-statement" && !activityStatement && (
        <FinanceEmptyState
          title="Laporan Aktivitas Belum Memiliki Data"
          description="Tidak terdapat mutasi pendapatan atau beban terposting pada periode atau rentang tanggal yang dipilih."
          icon={faChartLine}
        />
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: BALANCE SHEET VIEW (LP)
// ==========================================
interface BalanceSheetViewProps {
  data: BalanceSheetResponse;
  notes: FinancialStatementNoteItem[];
}

function BalanceSheetView({ data, notes }: BalanceSheetViewProps) {
  const assets = data.assets || [];
  const liabilities = data.liabilities || [];
  const netAssets = data.net_assets || [];

  const totalAssets = data.total_assets ?? data.total_asset ?? 0;
  const totalLiabilities = data.total_liabilities ?? data.total_liability ?? 0;
  const totalNetAssets = data.total_net_assets ?? data.total_net_asset ?? 0;
  const totalLiabAndNetAssets = totalLiabilities + totalNetAssets;

  return (
    <div className="space-y-6">
      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        {/* Card 1: Total Aset */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL ASET
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold font-heading text-slate-900 tabular-nums">
              {formatRupiah(totalAssets)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {assets.length} akun aset aktif
            </p>
          </div>
        </div>

        {/* Card 2: Total Liabilitas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL LIABILITAS
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-xs" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold font-heading text-slate-900 tabular-nums">
              {formatRupiah(totalLiabilities)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {liabilities.length} akun kewajiban
            </p>
          </div>
        </div>

        {/* Card 3: Total Aset Neto */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL ASET NETO
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FontAwesomeIcon icon={faScaleBalanced} className="text-xs" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold font-heading text-slate-900 tabular-nums">
              {formatRupiah(totalNetAssets)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Termasuk surplus berjalan {formatRupiah(data.current_period_surplus)}
            </p>
          </div>
        </div>

        {/* Card 4: Status Keseimbangan */}
        <div
          className={`rounded-2xl border p-5 shadow-xs ${
            data.is_balanced
              ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
              : "border-rose-200 bg-rose-50/40 text-rose-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              STATUS NERACA
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                data.is_balanced
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              <FontAwesomeIcon
                icon={data.is_balanced ? faCheckCircle : faTriangleExclamation}
                className="text-xs"
              />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold font-heading tracking-tight">
              {data.is_balanced ? "SEIMBANG" : "TIDAK SEIMBANG"}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-600">
              {data.is_balanced
                ? "Aset = Liabilitas + Aset Neto"
                : "Terdapat selisih posisi pembukuan"}
            </p>
          </div>
        </div>
      </div>

      {/* DETAILED BALANCE SHEET REPORT CARD */}
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-xs overflow-hidden print:border-none print:shadow-none">
        {/* SECTION 1: ASET */}
        <div className="border-b border-slate-200">
          <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                1
              </span>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
                Aset (Aktiva)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {assets.length} Akun
            </span>
          </div>

          <AccountStatementTable
            items={assets}
            emptyMessage="Tidak ada saldo akun aset pada periode ini."
            subtotalLabel="TOTAL ASET"
            subtotalAmount={totalAssets}
            highlightTone="emerald"
          />
        </div>

        {/* SECTION 2: LIABILITAS */}
        <div className="border-b border-slate-200">
          <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
                2
              </span>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
                Liabilitas (Kewajiban)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {liabilities.length} Akun
            </span>
          </div>

          <AccountStatementTable
            items={liabilities}
            emptyMessage="Tidak ada kewajiban atau saldo liabilitas pada periode ini."
            subtotalLabel="TOTAL LIABILITAS"
            subtotalAmount={totalLiabilities}
            highlightTone="amber"
          />
        </div>

        {/* SECTION 3: ASET NETO */}
        <div className="border-b border-slate-200">
          <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                3
              </span>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
                Aset Neto (Dana Wakaf & Ekuitas)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {netAssets.length} Posisi
            </span>
          </div>

          <AccountStatementTable
            items={netAssets}
            emptyMessage="Tidak ada posisi saldo aset neto pada periode ini."
            subtotalLabel="TOTAL ASET NETO"
            subtotalAmount={totalNetAssets}
            highlightTone="blue"
          />
        </div>

        {/* SECTION 4: GRAND TOTAL & BALANCE VERIFICATION */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={data.is_balanced ? faCheckCircle : faTriangleExclamation}
                  className={data.is_balanced ? "text-emerald-400" : "text-rose-400"}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Verifikasi Persamaan Akuntansi Neraca
                </span>
              </div>
              <p className="text-sm text-slate-300">
                Total Aset (<span className="font-bold text-white">{formatRupiah(totalAssets)}</span>) =
                Total Liabilitas (<span className="font-bold text-white">{formatRupiah(totalLiabilities)}</span>) +
                Total Aset Neto (<span className="font-bold text-white">{formatRupiah(totalNetAssets)}</span>)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-xs px-5 py-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  TOTAL LIABILITAS + ASET NETO
                </span>
                <span className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white tabular-nums">
                  {formatRupiah(totalLiabAndNetAssets)}
                </span>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                    data.is_balanced
                      ? "bg-emerald-500 text-emerald-950"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={data.is_balanced ? faCheckCircle : faTriangleExclamation} />
                  {data.is_balanced ? "NERACA SEIMBANG" : "NERACA SELISIH"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FINANCIAL NOTES SECTION (IF AVAILABLE) */}
      {notes.length > 0 && <FinancialNotesSection notes={notes} />}
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: ACTIVITY STATEMENT VIEW (LA)
// ==========================================
interface ActivityStatementViewProps {
  data: ActivityStatementResponse;
  notes: FinancialStatementNoteItem[];
}

function ActivityStatementView({ data, notes }: ActivityStatementViewProps) {
  const revenues = data.revenues || [];
  const expenses = data.expenses || [];

  const totalRevenues = data.total_revenues ?? data.total_penerimaan ?? 0;
  const totalExpenses = data.total_expenses ?? data.total_beban ?? 0;
  const surplusDeficit = data.surplus_deficit ?? 0;
  const isSurplus = data.is_surplus;

  return (
    <div className="space-y-6">
      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        {/* Card 1: Total Penerimaan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL PENERIMAAN
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FontAwesomeIcon icon={faCoins} className="text-xs" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold font-heading text-emerald-700 tabular-nums">
              {formatRupiah(totalRevenues)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {revenues.length} akun penerimaan wakaf & donasi
            </p>
          </div>
        </div>

        {/* Card 2: Total Penyaluran & Beban */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL BEBAN & PENYALURAN
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <FontAwesomeIcon icon={faHandHoldingHeart} className="text-xs" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold font-heading text-rose-700 tabular-nums">
              {formatRupiah(totalExpenses)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {expenses.length} pos penyaluran program & operasional
            </p>
          </div>
        </div>

        {/* Card 3: Surplus / (Defisit) */}
        <div
          className={`rounded-2xl border p-5 shadow-xs ${
            isSurplus
              ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
              : "border-amber-200 bg-amber-50/40 text-amber-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {isSurplus ? "SURPLUS BERJALAN" : "DEFISIT BERJALAN"}
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isSurplus ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              <FontAwesomeIcon icon={faChartPie} className="text-xs" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold font-heading tabular-nums">
              {formatRupiah(surplusDeficit)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-600">
              {isSurplus ? "Penerimaan melebihi beban" : "Beban melebihi penerimaan"}
            </p>
          </div>
        </div>

        {/* Card 4: Status Hasil Operasional */}
        <div
          className={`rounded-2xl border p-5 shadow-xs ${
            isSurplus
              ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
              : "border-amber-200 bg-amber-50/40 text-amber-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              STATUS HASIL
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isSurplus ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              <FontAwesomeIcon
                icon={isSurplus ? faCheckCircle : faTriangleExclamation}
                className="text-xs"
              />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-bold font-heading">
              {isSurplus ? "SURPLUS" : "DEFISIT"}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-600">
              {isSurplus ? "Hasil positif periode berjalan" : "Beban melebihi penerimaan"}
            </p>
          </div>
        </div>
      </div>

      {/* DETAILED ACTIVITY STATEMENT REPORT CARD */}
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-xs overflow-hidden print:border-none print:shadow-none">
        {/* SECTION 1: PENERIMAAN */}
        <div className="border-b border-slate-200">
          <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                1
              </span>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
                Penerimaan (Pendapatan & Donasi Wakaf)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {revenues.length} Akun
            </span>
          </div>

          <ActivityTable
            items={revenues}
            emptyMessage="Tidak ada penerimaan yang tercatat pada periode ini."
            subtotalLabel="TOTAL PENERIMAAN"
            subtotalAmount={totalRevenues}
            highlightTone="emerald"
          />
        </div>

        {/* SECTION 2: BEBAN DAN PENYALURAN */}
        <div className="border-b border-slate-200">
          <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-600 text-xs font-bold text-white">
                2
              </span>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
                Penyaluran Program & Beban Operasional
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {expenses.length} Akun
            </span>
          </div>

          <ActivityTable
            items={expenses}
            emptyMessage="Tidak ada beban atau penyaluran yang tercatat pada periode ini."
            subtotalLabel="TOTAL BEBAN & PENYALURAN"
            subtotalAmount={totalExpenses}
            highlightTone="rose"
          />
        </div>

        {/* SECTION 3: SURPLUS / DEFISIT OPERASIONAL */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={isSurplus ? faCheckCircle : faTriangleExclamation}
                  className={isSurplus ? "text-emerald-400" : "text-amber-400"}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Hasil Operasional Pengelolaan Periode Berjalan
                </span>
              </div>
              <p className="text-sm text-slate-300">
                Total Penerimaan (<span className="font-bold text-white">{formatRupiah(totalRevenues)}</span>) −
                Total Penyaluran & Beban (<span className="font-bold text-white">{formatRupiah(totalExpenses)}</span>)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-xs px-5 py-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isSurplus ? "SURPLUS PERIODE BERJALAN" : "DEFISIT PERIODE BERJALAN"}
                </span>
                <span className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white tabular-nums">
                  {formatRupiah(surplusDeficit)}
                </span>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                    isSurplus
                      ? "bg-emerald-500 text-emerald-950"
                      : "bg-amber-500 text-amber-950"
                  }`}
                >
                  <FontAwesomeIcon icon={isSurplus ? faCheckCircle : faInfoCircle} />
                  {isSurplus ? "SURPLUS NETO" : "DEFISIT NETO"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL NOTES SECTION (IF AVAILABLE) */}
      {notes.length > 0 && <FinancialNotesSection notes={notes} />}
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: ACCOUNT STATEMENT TABLE (LP)
// ==========================================
interface AccountStatementTableProps {
  items: BalanceSheetAccount[];
  emptyMessage: string;
  subtotalLabel: string;
  subtotalAmount: number;
  highlightTone?: "emerald" | "amber" | "blue";
}

function AccountStatementTable({
  items,
  emptyMessage,
  subtotalLabel,
  subtotalAmount,
  highlightTone = "emerald",
}: AccountStatementTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-xs font-medium text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  const toneBg =
    highlightTone === "emerald"
      ? "bg-emerald-50/60 text-emerald-950"
      : highlightTone === "amber"
      ? "bg-amber-50/60 text-amber-950"
      : "bg-blue-50/60 text-blue-950";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <th className="py-3 px-6 w-36">Kode Akun</th>
            <th className="py-3 px-4">Nama Akun</th>
            <th className="py-3 px-4 w-48">Kategori Pelaporan</th>
            <th className="py-3 px-6 text-right w-48">Saldo Posisi (Rp)</th>
            <th className="py-3 px-4 text-center w-28 print:hidden">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {items.map((acc, idx) => (
            <tr
              key={acc.account_id ?? `${acc.code}-${idx}`}
              className="hover:bg-slate-50/70 transition-colors group"
            >
              <td className="py-3 px-6 font-mono font-bold text-slate-700">
                {acc.account_id ? (
                  <Link
                    to={`/finance/general-ledger?account_id=${acc.account_id}`}
                    className="hover:text-emerald-600 underline-offset-2 hover:underline transition"
                    title="Lihat Buku Besar Akun Ini"
                  >
                    {acc.code}
                  </Link>
                ) : (
                  <span>{acc.code}</span>
                )}
              </td>
              <td className="py-3 px-4 font-semibold text-slate-900">
                {acc.name}
              </td>
              <td className="py-3 px-4">
                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                  {acc.report_category || "-"}
                </span>
              </td>
              <td className="py-3 px-6 text-right font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(acc.balance)}
              </td>
              <td className="py-3 px-4 text-center print:hidden">
                {acc.account_id ? (
                  <Link
                    to={`/finance/general-ledger?account_id=${acc.account_id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    <FontAwesomeIcon icon={faBookOpen} className="text-[10px]" />
                    <span>Buku Besar</span>
                  </Link>
                ) : (
                  <span className="text-[11px] text-slate-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={`border-t-2 border-slate-300 font-bold ${toneBg}`}>
            <td colSpan={3} className="py-4 px-6 text-xs uppercase tracking-wider">
              {subtotalLabel}
            </td>
            <td className="py-4 px-6 text-right font-mono text-sm tabular-nums">
              {formatRupiah(subtotalAmount)}
            </td>
            <td className="print:hidden"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: ACTIVITY TABLE (LA)
// ==========================================
interface ActivityTableProps {
  items: ActivityStatementAccount[];
  emptyMessage: string;
  subtotalLabel: string;
  subtotalAmount: number;
  highlightTone?: "emerald" | "rose";
}

function ActivityTable({
  items,
  emptyMessage,
  subtotalLabel,
  subtotalAmount,
  highlightTone = "emerald",
}: ActivityTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-xs font-medium text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  const toneBg =
    highlightTone === "emerald"
      ? "bg-emerald-50/60 text-emerald-950"
      : "bg-rose-50/60 text-rose-950";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <th className="py-3 px-6 w-36">Kode Akun</th>
            <th className="py-3 px-4">Nama Akun</th>
            <th className="py-3 px-4 w-48">Kategori Pelaporan</th>
            <th className="py-3 px-6 text-right w-48">Jumlah Mutasi (Rp)</th>
            <th className="py-3 px-4 text-center w-28 print:hidden">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {items.map((acc, idx) => (
            <tr
              key={acc.account_id ?? `${acc.code}-${idx}`}
              className="hover:bg-slate-50/70 transition-colors group"
            >
              <td className="py-3 px-6 font-mono font-bold text-slate-700">
                <Link
                  to={`/finance/general-ledger?account_id=${acc.account_id}`}
                  className="hover:text-emerald-600 underline-offset-2 hover:underline transition"
                  title="Lihat Buku Besar Akun Ini"
                >
                  {acc.code}
                </Link>
              </td>
              <td className="py-3 px-4 font-semibold text-slate-900">
                {acc.name}
              </td>
              <td className="py-3 px-4">
                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                  {acc.report_category || "-"}
                </span>
              </td>
              <td className="py-3 px-6 text-right font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(acc.amount)}
              </td>
              <td className="py-3 px-4 text-center print:hidden">
                <Link
                  to={`/finance/general-ledger?account_id=${acc.account_id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition"
                >
                  <FontAwesomeIcon icon={faBookOpen} className="text-[10px]" />
                  <span>Buku Besar</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={`border-t-2 border-slate-300 font-bold ${toneBg}`}>
            <td colSpan={3} className="py-4 px-6 text-xs uppercase tracking-wider">
              {subtotalLabel}
            </td>
            <td className="py-4 px-6 text-right font-mono text-sm tabular-nums">
              {formatRupiah(subtotalAmount)}
            </td>
            <td className="print:hidden"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: FINANCIAL NOTES (CLK) SECTION
// ==========================================
interface FinancialNotesSectionProps {
  notes: FinancialStatementNoteItem[];
}

function FinancialNotesSection({ notes }: FinancialNotesSectionProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <FontAwesomeIcon icon={faFileLines} className="text-xs" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900">
              Catatan Atas Laporan Keuangan (CLK)
            </h3>
            <p className="text-xs text-slate-500">
              Penjelasan resmi dan catatan pengungkapan periode pelaporan.
            </p>
          </div>
        </div>

        <Link
          to="/finance/financial-notes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 print:hidden transition"
        >
          <span>Kelola Catatan (CLK)</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">{note.title}</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-[10px] font-bold text-purple-800 uppercase">
                {note.category_label || note.category}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">
              {note.content}
            </p>
            {note.creator_name && (
              <p className="text-[10px] text-slate-400 pt-1">
                Disusun oleh: {note.creator_name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
