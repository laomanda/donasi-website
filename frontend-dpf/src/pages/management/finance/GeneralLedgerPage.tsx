import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faFileExcel,
  faBookOpen,
  faSearch,
  faTimes,
  faLayerGroup,
  faScaleBalanced,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faArrowUpRightFromSquare,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";

import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
  CurrencyDisplay,
} from "@/components/management/finance/shared";
import { JournalDetailModal } from "@/components/management/finance/JournalDetailModal";
import financeService from "@/services/financeService";
import {
  formatFinanceDate,
  formatRupiah,
  extractFinanceErrorMessage,
  downloadBlobFile,
  getAccountTypeLabel,
  getNormalBalanceLabel,
  getAccountTypeBadgeClass,
} from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";
import type {
  Account,
  AccountingPeriod,
  GeneralLedgerResponse,
  GeneralLedgerFilterParams,
  JournalEntry,
} from "@/types/finance";

export function GeneralLedgerPage() {
  // RBAC Permission Check
  const currentUser = getAuthUser();
  const userRoles = useMemo(() => {
    const roles = (currentUser?.roles ?? []).map((r) => r.name.toLowerCase());
    if (currentUser?.role_label) {
      roles.push(currentUser.role_label.toLowerCase());
    }
    return roles;
  }, [currentUser]);

  const canManage =
    userRoles.includes("keuangan") || userRoles.includes("superadmin");

  // Ledger Data State
  const [ledgerData, setLedgerData] = useState<GeneralLedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Master Data States
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [periodList, setPeriodList] = useState<AccountingPeriod[]>([]);

  const [searchParams] = useSearchParams();
  const initialAccountId = searchParams.get("account_id");

  // Filter States
  const [accountFilter, setAccountFilter] = useState<number | "">(
    initialAccountId ? Number(initialAccountId) : ""
  );
  const [periodFilter, setPeriodFilter] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeZeroBalance, setIncludeZeroBalance] = useState(false);

  // Synchronize with URL searchParams if changed
  useEffect(() => {
    const accId = searchParams.get("account_id");
    if (accId) {
      setAccountFilter(Number(accId));
    }
  }, [searchParams]);

  // Client search within All Accounts list & pagination
  const [accountSearchQuery, setAccountSearchQuery] = useState("");
  const [allAccountsPage, setAllAccountsPage] = useState(1);
  const accountsPerPage = 10;

  // Journal Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);

  // Load master data once on mount
  useEffect(() => {
    let isMounted = true;
    const loadMasterData = async () => {
      try {
        const [accRes, perRes] = await Promise.all([
          financeService.getAccounts({ all: true }).catch(() => ({ data: [] })),
          financeService.getAccountingPeriods().catch(() => []),
        ]);

        if (!isMounted) return;

        const rawAcc = accRes?.data;
        const accs = Array.isArray(rawAcc)
          ? rawAcc
          : (rawAcc as { data?: Account[] })?.data || [];
        setAccountList(accs);
        setPeriodList(perRes || []);
      } catch {
        // Fallback silently
      }
    };

    void loadMasterData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch General Ledger data from backend
  const fetchLedger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: GeneralLedgerFilterParams = {};
      if (accountFilter !== "") {
        params.account_id = accountFilter;
      }
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

      const res = await financeService.getGeneralLedger(params);
      setLedgerData(res);
      setAllAccountsPage(1);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat data buku besar."));
    } finally {
      setLoading(false);
    }
  }, [accountFilter, periodFilter, startDate, endDate, includeZeroBalance]);

  useEffect(() => {
    void fetchLedger();
  }, [fetchLedger]);

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return Boolean(
      accountFilter !== "" ||
        periodFilter !== "" ||
        startDate ||
        endDate ||
        includeZeroBalance
    );
  }, [accountFilter, periodFilter, startDate, endDate, includeZeroBalance]);

  // Reset all filters
  const handleResetFilter = () => {
    setAccountFilter("");
    setPeriodFilter("");
    setStartDate("");
    setEndDate("");
    setIncludeZeroBalance(false);
    setAccountSearchQuery("");
    setAllAccountsPage(1);
  };

  // Open Journal Detail
  const handleOpenJournalDetail = async (journalEntryId: number | null) => {
    if (!journalEntryId) return;
    try {
      const journal = await financeService.getJournal(journalEntryId);
      setSelectedJournal(journal);
      setDetailModalOpen(true);
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal memuat detail jurnal."));
    }
  };

  // Export Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams: Record<string, string> = {};
      if (accountFilter !== "") exportParams.account_id = String(accountFilter);
      if (periodFilter !== "") exportParams.period_id = String(periodFilter);
      if (startDate) exportParams.start_date = startDate;
      if (endDate) exportParams.end_date = endDate;
      if (includeZeroBalance) exportParams.include_zero_balance = "1";

      const blob = await financeService.exportGeneralLedger(exportParams);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blob as unknown as BlobPart,
        `Buku_Besar_${today}.xlsx`
      );
      toast.success("Berhasil mengunduh berkas Excel Buku Besar.");
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengunduh Excel Buku Besar."));
    } finally {
      setExporting(false);
    }
  };

  // Active single account ledger (if specific account is selected or exactly 1 account returned)
  const singleAccount = useMemo(() => {
    if (!ledgerData) return null;
    if (accountFilter !== "") {
      return (
        ledgerData.account ||
        ledgerData.accounts.find((a) => a.account_id === Number(accountFilter)) ||
        ledgerData.accounts[0] ||
        null
      );
    }
    return null;
  }, [ledgerData, accountFilter]);

  // Filtered accounts list for All Accounts view
  const filteredAllAccounts = useMemo(() => {
    if (!ledgerData?.accounts) return [];
    if (!accountSearchQuery.trim()) return ledgerData.accounts;
    const q = accountSearchQuery.toLowerCase();
    return ledgerData.accounts.filter(
      (a) =>
        a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [ledgerData?.accounts, accountSearchQuery]);

  // Paginated accounts in All Accounts view
  const paginatedAccounts = useMemo(() => {
    const start = (allAccountsPage - 1) * accountsPerPage;
    return filteredAllAccounts.slice(start, start + accountsPerPage);
  }, [filteredAllAccounts, allAccountsPage]);

  const totalAllAccountsPages = Math.max(
    1,
    Math.ceil(filteredAllAccounts.length / accountsPerPage)
  );

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <FinancePageHeader
        title="Buku Besar"
        description="Riwayat mutasi dan saldo akun berdasarkan jurnal yang telah diposting (General Ledger)."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchLedger}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter Akun Perkiraan */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Akun Perkiraan
            </label>
            <select
              value={accountFilter}
              onChange={(e) =>
                setAccountFilter(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">-- Semua Akun (Ikhtisar) --</option>
              {accountList
                .filter((a) => a.is_active)
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} — {acc.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Filter Periode Akuntansi */}
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
              {periodList.map((p) => (
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
              {singleAccount ? (
                <span>
                  Akun: <strong>{singleAccount.code}</strong> • {singleAccount.transactions.length} mutasi
                </span>
              ) : (
                <span>
                  Total: <strong>{ledgerData?.total_accounts ?? 0}</strong> akun dengan aktivitas
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Error State */}
      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat Buku Besar"
          message={error}
          onRetry={fetchLedger}
        />
      ) : loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <FinanceTableSkeleton rows={8} cols={7} />
        </div>
      ) : singleAccount ? (
        /* ===================================================================
           MODE A: TAMPILAN SPESIFIK AKUN TUNGGAL (DETAILED ACCOUNT LEDGER)
           =================================================================== */
        <div className="space-y-4">
          {/* Account Detail Summary Banner */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                  <FontAwesomeIcon icon={faBookOpen} className="text-lg" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-900">
                      {singleAccount.code}
                    </span>
                    <span className="text-slate-400">•</span>
                    <h2 className="text-base font-bold text-slate-900">
                      {singleAccount.name}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getAccountTypeBadgeClass(
                        singleAccount.account_type
                      )}`}
                    >
                      {getAccountTypeLabel(singleAccount.account_type)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saldo Normal:{" "}
                    <strong className="text-slate-700">
                      {getNormalBalanceLabel(singleAccount.normal_balance)}
                    </strong>
                    {singleAccount.report_category && (
                      <span> • Kategori: {singleAccount.report_category}</span>
                    )}
                    {ledgerData?.period && (
                      <span> • Periode: {ledgerData.period.name}</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAccountFilter("")}
                className="inline-flex items-center gap-1.5 self-start md:self-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition active:scale-95"
              >
                <span>Lihat Semua Akun</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </button>
            </div>

            {/* 4 KPI Cards for the selected account */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Saldo Awal */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Saldo Awal
                </div>
                <div className="font-mono text-lg font-bold text-slate-800">
                  {formatRupiah(singleAccount.opening_balance)}
                </div>
                <div className="text-[10px] text-slate-400">Sebelum rentang tanggal</div>
              </div>

              {/* Total Debit */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Total Mutasi Debit
                </div>
                <div className="font-mono text-lg font-bold text-emerald-700">
                  {formatRupiah(singleAccount.total_debit)}
                </div>
                <div className="text-[10px] text-emerald-600">Penambahan / Pengurangan</div>
              </div>

              {/* Total Kredit */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Total Mutasi Kredit
                </div>
                <div className="font-mono text-lg font-bold text-blue-700">
                  {formatRupiah(singleAccount.total_credit)}
                </div>
                <div className="text-[10px] text-blue-600">Pengurangan / Penambahan</div>
              </div>

              {/* Saldo Akhir */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Saldo Akhir (Closing)
                </div>
                <div className="font-mono text-lg font-bold text-slate-900">
                  {formatRupiah(singleAccount.closing_balance)}
                </div>
                <div className="text-[10px] text-slate-500">Saldo berjalan final</div>
              </div>
            </div>
          </div>

          {/* Ledger Transactions Table */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 w-32">Tanggal</th>
                    <th className="px-4 py-4 w-44">No. Jurnal</th>
                    <th className="px-4 py-4 min-w-[220px]">Keterangan Transaksi</th>
                    <th className="px-4 py-4 w-32">Referensi</th>
                    <th className="px-4 py-4 w-36 text-right">Debit (Rp)</th>
                    <th className="px-4 py-4 w-36 text-right">Kredit (Rp)</th>
                    <th className="px-5 py-4 w-40 text-right">Saldo Berjalan (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {/* Row Saldo Awal */}
                  <tr className="bg-slate-50/70 font-semibold text-slate-700">
                    <td className="px-5 py-3.5 text-slate-500">
                      {ledgerData?.start_date ? formatFinanceDate(ledgerData.start_date) : "-"}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400 italic">
                      [SALDO AWAL]
                    </td>
                    <td className="px-4 py-3.5 italic text-slate-600" colSpan={2}>
                      Saldo awal pembukuan sebelum periode transaksi
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">-</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">-</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(singleAccount.opening_balance)}
                    </td>
                  </tr>

                  {/* Mutasi Rows */}
                  {singleAccount.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        <div className="space-y-1">
                          <FontAwesomeIcon icon={faCircleInfo} className="text-slate-300 text-xl" />
                          <p className="font-medium text-xs text-slate-600">
                            Tidak ada mutasi transaksi pada periode atau rentang tanggal ini.
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Saldo akhir tetap sama dengan saldo awal:{" "}
                            <strong>{formatRupiah(singleAccount.closing_balance)}</strong>
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    singleAccount.transactions.map((tx, idx) => (
                      <tr key={tx.line_id || idx} className="hover:bg-slate-50/80 transition">
                        {/* Tanggal */}
                        <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                          {formatFinanceDate(tx.transaction_date)}
                        </td>

                        {/* No Jurnal - Clickable opens JournalDetailModal */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {tx.journal_entry_id ? (
                            <button
                              type="button"
                              onClick={() => handleOpenJournalDetail(tx.journal_entry_id)}
                              className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-700 hover:text-emerald-900 hover:underline transition"
                              title="Buka Voucher Jurnal Lengkap"
                            >
                              <span>{tx.journal_number}</span>
                              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px]" />
                            </button>
                          ) : (
                            <span className="font-mono font-bold text-slate-800">
                              {tx.journal_number || "-"}
                            </span>
                          )}
                        </td>

                        {/* Keterangan */}
                        <td className="px-4 py-3.5 max-w-md">
                          <div className="font-medium text-slate-800 line-clamp-2">
                            {tx.description || "-"}
                          </div>
                        </td>

                        {/* Referensi */}
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {tx.reference_type
                            ? `${tx.reference_type}${tx.reference_id ? ` #${tx.reference_id}` : ""}`
                            : "-"}
                        </td>

                        {/* Debit */}
                        <td className="px-4 py-3.5 text-right font-mono">
                          {tx.debit > 0 ? (
                            <CurrencyDisplay amount={tx.debit} tone="debit" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Kredit */}
                        <td className="px-4 py-3.5 text-right font-mono">
                          {tx.credit > 0 ? (
                            <CurrencyDisplay amount={tx.credit} tone="credit" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Saldo Berjalan (Source of truth: Backend running_balance) */}
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatRupiah(tx.running_balance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Footer Totals */}
                <tfoot className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-xs text-slate-800">
                  <tr>
                    <td colSpan={4} className="px-5 py-4 text-right uppercase tracking-wider text-slate-600">
                      Total Mutasi & Saldo Akhir
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-emerald-700">
                      {formatRupiah(singleAccount.total_debit)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-blue-700">
                      {formatRupiah(singleAccount.total_credit)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-slate-900 text-sm">
                      {formatRupiah(singleAccount.closing_balance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ===================================================================
           MODE B: IKHTISAR SELURUH AKUN (ALL ACCOUNTS OVERVIEW)
           =================================================================== */
        <div className="space-y-4">
          {/* Summary KPI Cards for All Accounts */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Akun Aktif */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Akun Beraktivitas
                </div>
                <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-slate-900">
                  {ledgerData?.total_accounts ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Memiliki mutasi / saldo</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
            </div>

            {/* Grand Total Debit */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Grand Total Debit
                </div>
                <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-emerald-700 truncate max-w-[170px]" title={formatRupiah(ledgerData?.grand_total_debit ?? 0)}>
                  {formatRupiah(ledgerData?.grand_total_debit ?? 0)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Seluruh akun</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <FontAwesomeIcon icon={faScaleBalanced} />
              </div>
            </div>

            {/* Grand Total Kredit */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Grand Total Kredit
                </div>
                <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-blue-700 truncate max-w-[170px]" title={formatRupiah(ledgerData?.grand_total_credit ?? 0)}>
                  {formatRupiah(ledgerData?.grand_total_credit ?? 0)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Seluruh akun</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <FontAwesomeIcon icon={faScaleBalanced} />
              </div>
            </div>

            {/* Periode Terpilih */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Periode Aktif
                </div>
                <div className="mt-1 font-bold text-base text-slate-900 truncate max-w-[160px]">
                  {ledgerData?.period?.name || "Semua Periode"}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {ledgerData?.period?.status === "closed" ? "Status: Tertutup" : "Status: Aktif"}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FontAwesomeIcon icon={faBookOpen} />
              </div>
            </div>
          </div>

          {/* All Accounts Table / Search */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                />
                <input
                  type="text"
                  value={accountSearchQuery}
                  onChange={(e) => {
                    setAccountSearchQuery(e.target.value);
                    setAllAccountsPage(1);
                  }}
                  placeholder="Cari kode atau nama akun perkiraan..."
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                {accountSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAccountSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Menampilkan {filteredAllAccounts.length} dari {ledgerData?.total_accounts ?? 0} akun
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 w-28">Kode Akun</th>
                    <th className="px-4 py-4 min-w-[200px]">Nama Akun Perkiraan</th>
                    <th className="px-4 py-4 w-28">Tipe Akun</th>
                    <th className="px-4 py-4 w-36 text-right">Saldo Awal</th>
                    <th className="px-4 py-4 w-36 text-right">Total Debit</th>
                    <th className="px-4 py-4 w-36 text-right">Total Kredit</th>
                    <th className="px-4 py-4 w-36 text-right">Saldo Akhir</th>
                    <th className="px-5 py-4 w-28 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12">
                        <FinanceEmptyState
                          title="Tidak Ada Akun yang Sesuai"
                          description="Tidak ada data akun buku besar yang cocok dengan kata kunci atau filter terpilih."
                          icon={faBookOpen}
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
                      </td>
                    </tr>
                  ) : (
                    paginatedAccounts.map((acc) => (
                      <tr
                        key={acc.account_id}
                        className="hover:bg-slate-50/80 transition cursor-pointer"
                        onClick={() => setAccountFilter(acc.account_id)}
                      >
                        {/* Kode Akun */}
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="text-emerald-700">{acc.code}</span>
                        </td>

                        {/* Nama Akun */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-800">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {acc.transactions.length} transaksi mutasi
                            {acc.report_category && <span> • {acc.report_category}</span>}
                          </div>
                        </td>

                        {/* Tipe Akun */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getAccountTypeBadgeClass(
                              acc.account_type
                            )}`}
                          >
                            {getAccountTypeLabel(acc.account_type)}
                          </span>
                        </td>

                        {/* Saldo Awal */}
                        <td className="px-4 py-3.5 text-right font-mono">
                          {formatRupiah(acc.opening_balance)}
                        </td>

                        {/* Total Debit */}
                        <td className="px-4 py-3.5 text-right font-mono text-emerald-700 font-semibold">
                          {acc.total_debit > 0 ? formatRupiah(acc.total_debit) : "-"}
                        </td>

                        {/* Total Kredit */}
                        <td className="px-4 py-3.5 text-right font-mono text-blue-700 font-semibold">
                          {acc.total_credit > 0 ? formatRupiah(acc.total_credit) : "-"}
                        </td>

                        {/* Saldo Akhir */}
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          {formatRupiah(acc.closing_balance)}
                        </td>

                        {/* Aksi */}
                        <td
                          className="px-5 py-3.5 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setAccountFilter(acc.account_id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition active:scale-95"
                          >
                            <span>Rincian</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for All Accounts */}
            {filteredAllAccounts.length > accountsPerPage && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50 text-xs">
                <div className="text-slate-500">
                  Menampilkan{" "}
                  <strong>{(allAccountsPage - 1) * accountsPerPage + 1}</strong> -{" "}
                  <strong>
                    {Math.min(
                      allAccountsPage * accountsPerPage,
                      filteredAllAccounts.length
                    )}
                  </strong>{" "}
                  dari <strong>{filteredAllAccounts.length}</strong> akun
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAllAccountsPage((p) => Math.max(1, p - 1))}
                    disabled={allAccountsPage <= 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                    <span>Sebelumnya</span>
                  </button>

                  <div className="px-3 py-1.5 font-semibold text-slate-600">
                    Halaman <span className="font-bold text-slate-900">{allAccountsPage}</span> dari{" "}
                    <span className="font-bold text-slate-900">{totalAllAccountsPages}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setAllAccountsPage((p) => Math.min(totalAllAccountsPages, p + 1))
                    }
                    disabled={allAccountsPage >= totalAllAccountsPages}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Selanjutnya</span>
                    <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Journal Detail Modal (Reused from Phase 6.4) */}
      <JournalDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        journal={selectedJournal}
        canManage={canManage}
        onPost={() => {
          // If a journal is posted from modal, refresh ledger
          void fetchLedger();
        }}
        onVoid={() => {
          void fetchLedger();
        }}
        onReverse={() => {
          void fetchLedger();
        }}
      />
    </div>
  );
}

export default GeneralLedgerPage;
