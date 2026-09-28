import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faFileExcel,
  faScaleBalanced,
  faScaleUnbalanced,
  faSearch,
  faTimes,
  faBookOpen,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";

import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
  FinanceStatusBadge,
  CurrencyDisplay,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import {
  formatRupiah,
  extractFinanceErrorMessage,
  downloadBlobFile,
  getAccountTypeLabel,
  getNormalBalanceLabel,
  getAccountTypeBadgeClass,
} from "@/utils/financeUtils";
import type {
  AccountingPeriod,
  TrialBalanceResponse,
  TrialBalanceFilterParams,
} from "@/types/finance";

export function TrialBalancePage() {
  // Data States
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Master Data
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);

  // Filter States
  const [periodFilter, setPeriodFilter] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeZeroBalance, setIncludeZeroBalance] = useState(false);

  // Client Search & Table Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

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
        // Fallback silently
      }
    };

    void loadPeriods();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Trial Balance data from backend
  const fetchTrialBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: TrialBalanceFilterParams = {};
      if (periodFilter !== "") {
        params.period_id = periodFilter;
      }
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }
      if (includeZeroBalance) {
        params.include_zero_balance = true;
      }

      const res = await financeService.getTrialBalance(params);
      setTrialBalanceData(res);
      setCurrentPage(1);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat neraca saldo."));
    } finally {
      setLoading(false);
    }
  }, [periodFilter, startDate, endDate, includeZeroBalance]);

  useEffect(() => {
    void fetchTrialBalance();
  }, [fetchTrialBalance]);

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return Boolean(
      periodFilter !== "" ||
        startDate ||
        endDate ||
        includeZeroBalance
    );
  }, [periodFilter, startDate, endDate, includeZeroBalance]);

  // Reset all filters
  const handleResetFilter = () => {
    setPeriodFilter("");
    setStartDate("");
    setEndDate("");
    setIncludeZeroBalance(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Export Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams: Record<string, string> = {};
      if (periodFilter !== "") exportParams.period_id = String(periodFilter);
      if (startDate) exportParams.start_date = startDate;
      if (endDate) exportParams.end_date = endDate;
      if (includeZeroBalance) exportParams.include_zero_balance = "1";

      const blob = await financeService.exportTrialBalance(exportParams);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blob as unknown as BlobPart,
        `Neraca_Saldo_${today}.xlsx`
      );
      toast.success("Berhasil mengunduh berkas Excel Neraca Saldo.");
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengunduh Excel Neraca Saldo."));
    } finally {
      setExporting(false);
    }
  };

  // Filtered accounts based on client search query
  const filteredAccounts = useMemo(() => {
    if (!trialBalanceData?.accounts) return [];
    if (!searchQuery.trim()) return trialBalanceData.accounts;
    const q = searchQuery.toLowerCase();
    return trialBalanceData.accounts.filter(
      (acc) =>
        acc.code.toLowerCase().includes(q) ||
        acc.name.toLowerCase().includes(q)
    );
  }, [trialBalanceData?.accounts, searchQuery]);

  // Paginated accounts for the table
  const paginatedAccounts = useMemo(() => {
    if (perPage === -1) return filteredAccounts; // Show all
    const start = (currentPage - 1) * perPage;
    return filteredAccounts.slice(start, start + perPage);
  }, [filteredAccounts, currentPage, perPage]);

  const totalPages = useMemo(() => {
    if (perPage === -1 || filteredAccounts.length === 0) return 1;
    return Math.ceil(filteredAccounts.length / perPage);
  }, [filteredAccounts.length, perPage]);

  // Balance status helper
  const isBalanced = trialBalanceData?.is_balanced ?? false;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <FinancePageHeader
        title="Neraca Saldo"
        description="Ringkasan saldo debit dan kredit seluruh akun berdasarkan jurnal terposting (Trial Balance)."
        badge={
          trialBalanceData ? (
            <FinanceStatusBadge
              status={isBalanced ? "balanced" : "warning"}
              label={isBalanced ? "Neraca Seimbang" : "Tidak Seimbang"}
            />
          ) : undefined
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchTrialBalance}
              disabled={loading}
              title="Segarkan Data"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon
                icon={faRotateRight}
                className={loading ? "animate-spin text-slate-400" : "text-slate-500"}
              />
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-emerald-600" />
              <span>{exporting ? "Mengunduh..." : "Export Excel"}</span>
            </button>
          </div>
        }
      />

      {/* 2. Filter Toolbar */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Periode Akuntansi */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Periode Akuntansi
            </label>
            <select
              value={periodFilter}
              onChange={(e) =>
                setPeriodFilter(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">-- Semua Periode --</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.status === "closed" ? "(Tertutup)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Tanggal Akhir */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Second Row: Toggle Zero Balance & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={includeZeroBalance}
              onChange={(e) => setIncludeZeroBalance(e.target.checked)}
              className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Sertakan akun bersaldo nol tanpa mutasi (Include Zero Balance)</span>
          </label>

          <div className="flex items-center gap-2">
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition active:scale-95"
              >
                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                <span>Reset Filter</span>
              </button>
            )}

            <div className="text-xs text-slate-500 hidden sm:block">
              Periode: <strong>{trialBalanceData?.period?.name || "Semua Periode"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Error State */}
      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat Neraca Saldo"
          message={error}
          onRetry={fetchTrialBalance}
        />
      ) : loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <FinanceTableSkeleton rows={8} cols={9} />
        </div>
      ) : !trialBalanceData || trialBalanceData.accounts.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <FinanceEmptyState
            title="Belum Ada Data Neraca Saldo"
            description="Tidak terdapat akun dengan mutasi atau saldo pada filter periode dan rentang tanggal yang dipilih."
            icon={faScaleUnbalanced}
            action={
              isFilterActive ? (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                >
                  Reset Filter
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 4. Summary / Balance Status KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Akun */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Akun Aktif
              </div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                {trialBalanceData.total_accounts}
              </div>
              <div className="text-[11px] text-slate-500">Akun dalam neraca saldo</div>
            </div>

            {/* Total Mutasi Transaksi */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Perputaran Mutasi
              </div>
              <div className="font-mono text-lg font-bold text-slate-900 truncate" title={formatRupiah(trialBalanceData.total_debit)}>
                {formatRupiah(trialBalanceData.total_debit)}
              </div>
              <div className="text-[11px] text-slate-400">Debit & Kredit Seimbang</div>
            </div>

            {/* Total Saldo Akhir */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Saldo Neraca
              </div>
              <div className="font-mono text-lg font-bold text-slate-900 truncate" title={formatRupiah(trialBalanceData.total_debit_balance)}>
                {formatRupiah(trialBalanceData.total_debit_balance)}
              </div>
              <div className="text-[11px] text-slate-400">Posisi Debit & Kredit</div>
            </div>

            {/* Status Keseimbangan */}
            <div
              className={`p-4 rounded-2xl border shadow-xs space-y-1 ${
                isBalanced
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-rose-200 bg-rose-50/50"
              }`}
            >
              <div
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isBalanced ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                Status Keseimbangan
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={isBalanced ? faCheckCircle : faTriangleExclamation}
                  className={`text-base ${isBalanced ? "text-emerald-600" : "text-rose-600"}`}
                />
                <span
                  className={`font-mono text-lg sm:text-xl font-bold ${
                    isBalanced ? "text-emerald-800" : "text-rose-800"
                  }`}
                >
                  {isBalanced ? "SEIMBANG" : "TIDAK SEIMBANG"}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {isBalanced
                  ? "Debit = Kredit (Persamaan Terpenuhi)"
                  : `Selisih: ${formatRupiah(
                      Math.abs(trialBalanceData.total_debit_balance - trialBalanceData.total_credit_balance)
                    )}`}
              </div>
            </div>
          </div>

          {/* 5. Trial Balance Table */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            {/* Table Search & Per-Page Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari kode atau nama akun perkiraan..."
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  Menampilkan <strong>{filteredAccounts.length}</strong> akun
                </span>

                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[11px] text-slate-400">Tampilkan:</span>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-hidden"
                  >
                    <option value={25}>25 baris</option>
                    <option value={50}>50 baris</option>
                    <option value={100}>100 baris</option>
                    <option value={-1}>Semua baris</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                {/* Multi-tier Header */}
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 w-28" rowSpan={2}>
                      Kode
                    </th>
                    <th className="px-4 py-3 min-w-[200px]" rowSpan={2}>
                      Nama Akun Perkiraan
                    </th>
                    <th className="px-4 py-3 w-24 text-center" rowSpan={2}>
                      Jenis
                    </th>
                    <th className="px-4 py-3 w-20 text-center" rowSpan={2}>
                      Saldo Normal
                    </th>
                    <th
                      className="px-4 py-2 text-center border-b border-slate-200 bg-slate-100/60"
                      colSpan={2}
                    >
                      Perputaran Mutasi (Rp)
                    </th>
                    <th
                      className="px-4 py-2 text-center border-b border-slate-200 bg-slate-100/90"
                      colSpan={2}
                    >
                      Posisi Saldo Akhir (Rp)
                    </th>
                    <th className="px-4 py-3 w-24 text-center" rowSpan={2}>
                      Aksi
                    </th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 text-right w-36 text-emerald-700">Debit</th>
                    <th className="px-4 py-2 text-right w-36 text-blue-700">Kredit</th>
                    <th className="px-4 py-2 text-right w-36 text-emerald-800">Saldo Debit</th>
                    <th className="px-4 py-2 text-right w-36 text-blue-800">Saldo Kredit</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        Tidak ada akun yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedAccounts.map((acc) => (
                      <tr
                        key={acc.account_id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        {/* Kode Akun */}
                        <td className="px-5 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="text-emerald-700">{acc.code}</span>
                        </td>

                        {/* Nama Akun */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">
                            {acc.name}
                          </div>
                        </td>

                        {/* Jenis Akun */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${getAccountTypeBadgeClass(
                              acc.account_type
                            )}`}
                          >
                            {getAccountTypeLabel(acc.account_type)}
                          </span>
                        </td>

                        {/* Saldo Normal */}
                        <td className="px-4 py-3 text-center text-slate-500 font-medium whitespace-nowrap">
                          {getNormalBalanceLabel(acc.normal_balance)}
                        </td>

                        {/* Mutasi Debit */}
                        <td className="px-4 py-3 text-right font-mono">
                          {acc.total_debit > 0 ? (
                            <CurrencyDisplay amount={acc.total_debit} tone="debit" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Mutasi Kredit */}
                        <td className="px-4 py-3 text-right font-mono">
                          {acc.total_credit > 0 ? (
                            <CurrencyDisplay amount={acc.total_credit} tone="credit" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Saldo Debit Akhir */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                          {acc.debit_balance > 0 ? (
                            formatRupiah(acc.debit_balance)
                          ) : (
                            <span className="text-slate-300 font-normal">-</span>
                          )}
                        </td>

                        {/* Saldo Kredit Akhir */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-blue-800">
                          {acc.credit_balance > 0 ? (
                            formatRupiah(acc.credit_balance)
                          ) : (
                            <span className="text-slate-300 font-normal">-</span>
                          )}
                        </td>

                        {/* Aksi: Drilldown ke Buku Besar */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Link
                            to={`/finance/general-ledger?account_id=${acc.account_id}`}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition active:scale-95"
                            title={`Lihat Buku Besar Akun ${acc.code}`}
                          >
                            <FontAwesomeIcon icon={faBookOpen} className="text-[10px]" />
                            <span className="hidden xl:inline">Buku Besar</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Table Footer Totals */}
                <tfoot className="border-t-2 border-slate-200 bg-slate-50/95 font-bold text-xs text-slate-800">
                  <tr>
                    <td colSpan={4} className="px-5 py-4 text-right uppercase tracking-wider text-slate-600">
                      TOTAL NERACA SALDO
                    </td>
                    {/* Total Mutasi Debit */}
                    <td className="px-4 py-4 text-right font-mono text-emerald-700 font-bold">
                      {formatRupiah(trialBalanceData.total_debit)}
                    </td>
                    {/* Total Mutasi Kredit */}
                    <td className="px-4 py-4 text-right font-mono text-blue-700 font-bold">
                      {formatRupiah(trialBalanceData.total_credit)}
                    </td>
                    {/* Total Posisi Saldo Debit */}
                    <td className="px-4 py-4 text-right font-mono text-emerald-800 font-bold text-sm">
                      {formatRupiah(trialBalanceData.total_debit_balance)}
                    </td>
                    {/* Total Posisi Saldo Kredit */}
                    <td className="px-4 py-4 text-right font-mono text-blue-800 font-bold text-sm">
                      {formatRupiah(trialBalanceData.total_credit_balance)}
                    </td>
                    {/* Status Badge in footer */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isBalanced
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isBalanced ? "SEIMBANG" : "SELISIH"}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination Controls */}
            {perPage !== -1 && filteredAccounts.length > perPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50 text-xs">
                <div className="text-slate-500">
                  Menampilkan{" "}
                  <strong>{(currentPage - 1) * perPage + 1}</strong> -{" "}
                  <strong>
                    {Math.min(currentPage * perPage, filteredAccounts.length)}
                  </strong>{" "}
                  dari <strong>{filteredAccounts.length}</strong> akun
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                    <span>Sebelumnya</span>
                  </button>

                  <div className="px-3 py-1.5 font-semibold text-slate-600">
                    Halaman <span className="font-bold text-slate-900">{currentPage}</span> dari{" "}
                    <span className="font-bold text-slate-900">{totalPages}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Selanjutnya</span>
                    <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6. Balance Verification Summary Card */}
          <div
            className={`rounded-2xl border p-5 shadow-xs transition ${
              isBalanced
                ? "border-emerald-200 bg-emerald-50/40"
                : "border-rose-200 bg-rose-50/40"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                    isBalanced
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isBalanced ? faScaleBalanced : faScaleUnbalanced}
                    className="text-base"
                  />
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      isBalanced ? "text-emerald-900" : "text-rose-900"
                    }`}
                  >
                    {isBalanced
                      ? "Keseimbangan Neraca Saldo Terpenuhi"
                      : "Peringatan: Neraca Saldo Tidak Seimbang"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isBalanced
                      ? `Seluruh saldo debit (${formatRupiah(
                          trialBalanceData.total_debit_balance
                        )}) dan saldo kredit (${formatRupiah(
                          trialBalanceData.total_credit_balance
                        )}) dinyatakan seimbang dan siap digunakan untuk penyusunan Laporan Posisi Keuangan & Laporan Aktivitas.`
                      : `Terdapat selisih matematis sebesar ${formatRupiah(
                          Math.abs(
                            trialBalanceData.total_debit_balance -
                              trialBalanceData.total_credit_balance
                          )
                        )}. Silakan periksa modul rekonsiliasi keuangan.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <Link
                  to="/finance/general-ledger"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95"
                >
                  <span>Buku Besar</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrialBalancePage;
