import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faRotateRight,
  faReceipt,
  faSearch,
  faTimes,
  faFileExcel,
  faFileImport,
  faEye,
  faCheck,
  faBan,
  faRotate,
  faChevronLeft,
  faChevronRight,
  faFileInvoiceDollar,
  faClock,
  faCheckCircle,
  faBan as faBanIcon,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

import {
  FinancePageHeader,
  FinanceStatusBadge,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
  CurrencyDisplay,
} from "@/components/management/finance/shared";
import { JournalDetailModal } from "@/components/management/finance/JournalDetailModal";
import { JournalFormModal } from "@/components/management/finance/JournalFormModal";

import financeService from "@/services/financeService";
import {
  formatFinanceDate,
  extractFinanceErrorMessage,
  downloadBlobFile,
} from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";
import type {
  JournalEntry,
  JournalStatus,
  JournalFilterParams,
  Account,
  AccountingPeriod,
  ProgramOption,
} from "@/types/finance";

export function JournalsPage() {
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

  // Data States
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [fromItem, setFromItem] = useState(0);
  const [toItem, setToItem] = useState(0);

  // Filter & Search States
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JournalStatus | "">("");
  const [periodFilter, setPeriodFilter] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Ancillary Master Data (loaded for filters and creation modal)
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);

  // Modal States
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, periodFilter, dateFrom, dateTo, perPage]);

  // Load master data once on mount (Periods, Programs, Accounts)
  useEffect(() => {
    let isMounted = true;
    const loadMasterData = async () => {
      try {
        const [periodList, programList, accountData] = await Promise.all([
          financeService.getAccountingPeriods().catch(() => []),
          financeService.getPrograms().catch(() => []),
          financeService.getAccounts({ all: true }).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;
        setPeriods(periodList || []);
        setPrograms(programList || []);

        const rawAcc = accountData?.data;
        const accList = Array.isArray(rawAcc)
          ? rawAcc
          : (rawAcc as { data?: Account[] })?.data || [];
        setAccounts(accList);
      } catch {
        // Silently fail fallback
      }
    };

    void loadMasterData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch journals from backend
  const fetchJournals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: JournalFilterParams = {
        page: currentPage,
        per_page: perPage,
      };

      if (debouncedSearch) {
        params.q = debouncedSearch;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (periodFilter !== "") {
        params.period_id = periodFilter;
      }
      if (dateFrom) {
        params.date_from = dateFrom;
      }
      if (dateTo) {
        params.date_to = dateTo;
      }

      const res = await financeService.getJournals(params);

      // Laravel paginate contract: { current_page, data, from, to, total, last_page, per_page }
      setJournals(res.data || []);
      setCurrentPage(res.current_page || 1);
      setLastPage(res.last_page || 1);
      setTotalItems(res.total || 0);
      setFromItem(res.from || 0);
      setToItem(res.to || 0);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat daftar jurnal umum."));
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, debouncedSearch, statusFilter, periodFilter, dateFrom, dateTo]);

  useEffect(() => {
    void fetchJournals();
  }, [fetchJournals]);

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return Boolean(
      debouncedSearch ||
        statusFilter ||
        periodFilter !== "" ||
        dateFrom ||
        dateTo
    );
  }, [debouncedSearch, statusFilter, periodFilter, dateFrom, dateTo]);

  // Reset all filters
  const handleResetFilter = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("");
    setPeriodFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  // View Journal Detail
  const handleViewDetail = async (journal: JournalEntry) => {
    try {
      // Fetch fresh detail with full relationships (lines.account, program, period, creator)
      const freshDetail = await financeService.getJournal(journal.id);
      setSelectedJournal(freshDetail);
    } catch {
      // Fallback to row data if single fetch fails
      setSelectedJournal(journal);
    } finally {
      setDetailModalOpen(true);
    }
  };

  // Export Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams: Record<string, string> = {};
      if (periodFilter !== "") exportParams.period_id = String(periodFilter);
      if (dateFrom) exportParams.start_date = dateFrom;
      if (dateTo) exportParams.end_date = dateTo;

      const blobData = await financeService.exportJournals(exportParams);
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blobData as unknown as BlobPart,
        `Jurnal_Umum_${dateStr}.xlsx`
      );
      toast.success("Berhasil mengunduh jurnal umum Excel.");
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengunduh Excel jurnal."));
    } finally {
      setExporting(false);
    }
  };

  // Post Journal Action
  const handlePostJournal = async (journal: JournalEntry) => {
    const result = await Swal.fire({
      title: "Posting Jurnal?",
      html: `Jurnal <b>${journal.journal_number}</b> akan langsung dibukukan ke Buku Besar (General Ledger).<br/><br/>Setelah diposting, jurnal ini berstatus <i>immutable</i> (tidak dapat diubah atau dihapus).`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Posting Sekarang",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await financeService.postJournal(journal.id);
      toast.success(`Jurnal ${journal.journal_number} berhasil diposting.`);
      void fetchJournals();
      if (selectedJournal?.id === journal.id) {
        setDetailModalOpen(false);
        setSelectedJournal(null);
      }
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal memposting jurnal."));
    }
  };

  // Void Journal Action
  const handleVoidJournal = async (journal: JournalEntry) => {
    const result = await Swal.fire({
      title: "Batalkan Jurnal (Void)?",
      html: `Jurnal <b>${journal.journal_number}</b> akan dibatalkan secara permanen dan tidak berlaku dalam pembukuan yayasan.`,
      icon: "warning",
      input: "textarea",
      inputLabel: "Alasan Pembatalan (Void)",
      inputPlaceholder: "Tuliskan alasan pembatalan jurnal secara jelas...",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Alasan pembatalan wajib diisi!";
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Batalkan Jurnal",
      cancelButtonText: "Tutup",
    });

    if (!result.isConfirmed) return;

    try {
      await financeService.voidJournal(journal.id, result.value);
      toast.success(`Jurnal ${journal.journal_number} berhasil dibatalkan (void).`);
      void fetchJournals();
      if (selectedJournal?.id === journal.id) {
        setDetailModalOpen(false);
        setSelectedJournal(null);
      }
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal membatalkan jurnal."));
    }
  };

  // Reverse Journal Action
  const handleReverseJournal = async (journal: JournalEntry) => {
    const result = await Swal.fire({
      title: "Buat Jurnal Pembalik (Reverse)?",
      html: `Akan dibuat jurnal baru berstatus draft yang membalik posisi Debit dan Kredit dari jurnal <b>${journal.journal_number}</b>.<br/><br/>Jurnal asli tetap tersimpan untuk integritas riwayat audit.`,
      icon: "info",
      input: "textarea",
      inputLabel: "Alasan Pembalikan Jurnal",
      inputPlaceholder: "Tuliskan alasan pembuatan jurnal pembalik...",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Alasan pembalikan wajib diisi!";
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Buat Jurnal Pembalik",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await financeService.reverseJournal(journal.id, result.value);
      const revNum = res.data?.journal_number;
      toast.success(
        revNum
          ? `Jurnal pembalik ${revNum} berhasil dibuat sebagai draft.`
          : "Jurnal pembalik berhasil dibuat sebagai draft."
      );
      void fetchJournals();
      if (selectedJournal?.id === journal.id) {
        setDetailModalOpen(false);
        setSelectedJournal(null);
      }
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal membuat jurnal pembalik."));
    }
  };

  // Helper to compute line totals for table rows
  const getJournalTotals = (journal: JournalEntry) => {
    if (journal.total_debit !== undefined && journal.total_credit !== undefined) {
      return {
        debit: Number(journal.total_debit || 0),
        credit: Number(journal.total_credit || 0),
      };
    }
    const lines = journal.lines || [];
    const debit = lines.reduce((acc, l) => acc + Number(l.debit || 0), 0);
    const credit = lines.reduce((acc, l) => acc + Number(l.credit || 0), 0);
    return { debit, credit };
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <FinancePageHeader
        title="Jurnal Umum"
        description="Pencatatan transaksi keuangan berdasarkan prinsip pembukuan berpasangan (double-entry accounting)."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchJournals}
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

            <Link
              to="/finance/import"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
            >
              <FontAwesomeIcon icon={faFileImport} className="text-blue-600" />
              <span className="hidden md:inline">Import Jurnal</span>
            </Link>

            {canManage && (
              <button
                type="button"
                onClick={() => setFormModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Jurnal Baru</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. Journal Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Jurnal */}
        <button
          type="button"
          onClick={() => setStatusFilter("")}
          className={`flex items-center justify-between p-4 rounded-2xl border transition text-left ${
            statusFilter === ""
              ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
              : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
          }`}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Jurnal
            </div>
            <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-slate-900">
              {totalItems.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Semua transaksi</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <FontAwesomeIcon icon={faFileInvoiceDollar} />
          </div>
        </button>

        {/* Diposting */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "posted" ? "" : "posted")}
          className={`flex items-center justify-between p-4 rounded-2xl border transition text-left ${
            statusFilter === "posted"
              ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
              : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
          }`}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Diposting
            </div>
            <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-emerald-700">
              {statusFilter === "posted" ? totalItems.toLocaleString("id-ID") : "Buku Besar"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Berstatus resmi</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        </button>

        {/* Draft */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "draft" ? "" : "draft")}
          className={`flex items-center justify-between p-4 rounded-2xl border transition text-left ${
            statusFilter === "draft"
              ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
              : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
          }`}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Draft
            </div>
            <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-amber-700">
              {statusFilter === "draft" ? totalItems.toLocaleString("id-ID") : "Tertunda"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Belum dibukukan</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <FontAwesomeIcon icon={faClock} />
          </div>
        </button>

        {/* Void */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "void" ? "" : "void")}
          className={`flex items-center justify-between p-4 rounded-2xl border transition text-left ${
            statusFilter === "void"
              ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20"
              : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
          }`}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Void
            </div>
            <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-rose-700">
              {statusFilter === "void" ? totalItems.toLocaleString("id-ID") : "Dibatalkan"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tidak berlaku</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <FontAwesomeIcon icon={faBanIcon} />
          </div>
        </button>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Server-side Search */}
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nomor jurnal, keterangan, atau referensi..."
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Hapus pencarian"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            )}
          </div>

          {/* Filter Periode */}
          <div className="w-full sm:w-56">
            <select
              value={periodFilter}
              onChange={(e) =>
                setPeriodFilter(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Semua Periode</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.status === "closed" ? "(Tertutup)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as JournalStatus | "")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="posted">Diposting</option>
              <option value="void">Void</option>
            </select>
          </div>
        </div>

        {/* Date Range and Reset Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Rentang Tanggal:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Tanggal Mulai"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Tanggal Akhir"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

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
              Total: <strong className="font-mono text-slate-900">{totalItems}</strong> jurnal
            </div>
          </div>
        </div>
      </div>

      {/* 4. Journal Table / States */}
      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat jurnal"
          message={error}
          onRetry={fetchJournals}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 w-40">Nomor Jurnal</th>
                  <th className="px-4 py-4 w-28">Tanggal</th>
                  <th className="px-4 py-4 min-w-[200px]">Keterangan</th>
                  <th className="px-4 py-4 w-36">Program</th>
                  <th className="px-4 py-4 w-32 text-right">Debit</th>
                  <th className="px-4 py-4 w-32 text-right">Kredit</th>
                  <th className="px-4 py-4 w-28 text-center">Status</th>
                  <th className="px-5 py-4 w-32 text-right">Aksi</th>
                </tr>
              </thead>

              {loading ? (
                <FinanceTableSkeleton rows={8} cols={8} />
              ) : journals.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={8} className="py-12">
                      <FinanceEmptyState
                        title={
                          isFilterActive
                            ? "Tidak Ada Jurnal yang Sesuai"
                            : "Belum Ada Jurnal"
                        }
                        description={
                          isFilterActive
                            ? "Tidak ada transaksi jurnal yang cocok dengan filter atau kata kunci pencarian Anda."
                            : "Belum ada catatan jurnal pada periode ini. Klik tombol '+ Jurnal Baru' untuk membuat entri pembukuan."
                        }
                        icon={faReceipt}
                        action={
                          isFilterActive ? (
                            <button
                              type="button"
                              onClick={handleResetFilter}
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                            >
                              Reset Filter
                            </button>
                          ) : canManage ? (
                            <button
                              type="button"
                              onClick={() => setFormModalOpen(true)}
                              className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                              + Buat Jurnal Baru
                            </button>
                          ) : undefined
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-slate-100 bg-white">
                  {journals.map((journal) => {
                    const totals = getJournalTotals(journal);
                    const txDate = journal.transaction_date || journal.date;

                    return (
                      <tr
                        key={journal.id}
                        className="transition hover:bg-slate-50/80 cursor-pointer"
                        onClick={() => handleViewDetail(journal)}
                      >
                        {/* Nomor Jurnal */}
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-700">{journal.journal_number}</span>
                          </div>
                          {journal.reference_type && journal.reference_type !== "manual" && (
                            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                              Ref: {journal.reference_type}
                              {journal.reference_id ? ` #${journal.reference_id}` : ""}
                            </div>
                          )}
                        </td>

                        {/* Tanggal */}
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                          {formatFinanceDate(txDate)}
                        </td>

                        {/* Keterangan */}
                        <td className="px-4 py-3.5 max-w-sm">
                          <div
                            className="font-medium text-slate-800 line-clamp-2"
                            title={journal.description}
                          >
                            {journal.description}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {journal.lines?.length ?? 0} baris akun
                            {journal.accounting_period?.name && (
                              <span> • {journal.accounting_period.name}</span>
                            )}
                          </div>
                        </td>

                        {/* Program */}
                        <td className="px-4 py-3.5">
                          {journal.program ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold max-w-[130px] truncate" title={journal.program.title}>
                              {journal.program.title}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Debit */}
                        <td className="px-4 py-3.5 text-right font-mono">
                          <CurrencyDisplay amount={totals.debit} tone="debit" />
                        </td>

                        {/* Kredit */}
                        <td className="px-4 py-3.5 text-right font-mono">
                          <CurrencyDisplay amount={totals.credit} tone="credit" />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <FinanceStatusBadge status={journal.status} />
                        </td>

                        {/* Aksi */}
                        <td
                          className="px-5 py-3.5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewDetail(journal)}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition active:scale-95"
                              title="Lihat Detail Jurnal"
                            >
                              <FontAwesomeIcon icon={faEye} className="text-xs" />
                            </button>

                            {/* Draft actions: Post & Void */}
                            {canManage && journal.status === "draft" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handlePostJournal(journal)}
                                  className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition active:scale-95"
                                  title="Posting ke Buku Besar"
                                >
                                  <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVoidJournal(journal)}
                                  className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-95"
                                  title="Batalkan Jurnal (Void)"
                                >
                                  <FontAwesomeIcon icon={faBan} className="text-xs" />
                                </button>
                              </>
                            )}

                            {/* Posted actions: Reverse only */}
                            {canManage && journal.status === "posted" && (
                              <button
                                type="button"
                                onClick={() => handleReverseJournal(journal)}
                                className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition active:scale-95"
                                title="Buat Jurnal Pembalik (Reverse)"
                              >
                                <FontAwesomeIcon icon={faRotate} className="text-xs" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>

          {/* 5. Pagination Toolbar */}
          {!loading && journals.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50 text-xs">
              <div className="flex items-center gap-3 text-slate-500">
                <span>
                  Menampilkan <strong className="font-semibold text-slate-800">{fromItem}</strong> -{" "}
                  <strong className="font-semibold text-slate-800">{toItem}</strong> dari{" "}
                  <strong className="font-semibold text-slate-800">{totalItems}</strong> jurnal
                </span>

                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[11px] text-slate-400">Per halaman:</span>
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-hidden"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
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
                  <span className="font-bold text-slate-900">{lastPage}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Selanjutnya</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Detail Modal */}
      <JournalDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        journal={selectedJournal}
        canManage={canManage}
        onPost={handlePostJournal}
        onVoid={handleVoidJournal}
        onReverse={handleReverseJournal}
      />

      {/* 7. Create Journal Modal */}
      <JournalFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        accounts={accounts}
        periods={periods}
        programs={programs}
        onSuccess={() => {
          void fetchJournals();
        }}
      />
    </div>
  );
}

export default JournalsPage;
