import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faShieldHalved,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faChevronDown,
  faChevronUp,
  faMagnifyingGlass,
  faCalendarDays,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceStatCard,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type {
  ReconciliationReport,
  ReconciliationControlItem,
  AccountingPeriod,
} from "@/types/finance";
import {
  extractFinanceErrorMessage,
  formatNumber,
  formatRupiah,
  formatFinanceDate,
} from "@/utils/financeUtils";
import { useToast } from "@/components/ui/ToastProvider";

const ERRORS_PER_PAGE = 10;

/**
 * Format timestamp naturally in Indonesian with WIB/timeZone.
 * Example: "02 Oktober 2026, 09:35:20 WIB"
 */
function formatReconciliationTimestamp(isoString?: string | null): string {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function ReconciliationPage() {
  const toast = useToast();
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail filters
  const [filterTab, setFilterTab] = useState<"all" | "failed" | "passed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Expand/collapse state for each control
  const [expandedControls, setExpandedControls] = useState<Record<string, boolean>>({});
  // Pagination page for each expanded control's error list
  const [errorPageMap, setErrorPageMap] = useState<Record<string, number>>({});

  // 1. Fetch available accounting periods
  useEffect(() => {
    financeService
      .getAccountingPeriods()
      .then((data) => setPeriods(data || []))
      .catch(() => {});
  }, []);

  // 2. Fetch full reconciliation report
  const fetchReport = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = selectedPeriodId ? { period_id: Number(selectedPeriodId) } : undefined;
      const res = await financeService.getReconciliationReport(params);
      setReport(res);

      if (isManualRefresh) {
        toast.info("Pemeriksaan rekonsiliasi selesai.", { title: "Audit Integritas" });
      }
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat laporan rekonsiliasi keuangan."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchReport(false);
  }, [selectedPeriodId]);

  // Toggle detail accordion
  const toggleExpand = (checkCode: string) => {
    setExpandedControls((prev) => ({
      ...prev,
      [checkCode]: !prev[checkCode],
    }));
  };

  // Set error pagination page for a control
  const setErrorPage = (checkCode: string, page: number) => {
    setErrorPageMap((prev) => ({
      ...prev,
      [checkCode]: page,
    }));
  };

  // Filtered checks list
  const filteredChecks = useMemo(() => {
    if (!report?.checks) return [];
    return report.checks.filter((check) => {
      // Tab filter
      if (filterTab === "failed" && check.status !== "failed") return false;
      if (filterTab === "passed" && check.status !== "passed") return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = check.name.toLowerCase().includes(query);
        const matchesCode = check.check_code.toLowerCase().includes(query);
        const matchesMsg = check.message.toLowerCase().includes(query);
        return matchesName || matchesCode || matchesMsg;
      }

      return true;
    });
  }, [report, filterTab, searchQuery]);

  // Overall status badge renderer
  const renderOverallBadge = (status?: string) => {
    const norm = (status || "").toLowerCase();
    if (norm === "critical") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 shadow-xs uppercase tracking-wide">
          <FontAwesomeIcon icon={faCircleXmark} className="text-rose-600 text-xs" />
          STATUS: KRITIS (CRITICAL)
        </span>
      );
    }
    if (norm === "needs_review" || norm === "needs_attention") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 shadow-xs uppercase tracking-wide">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-600 text-xs" />
          STATUS: PERLU TINJAUAN (REVIEW)
        </span>
      );
    }
    if (norm === "reconciled_with_warnings") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 shadow-xs uppercase tracking-wide">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-600 text-xs" />
          STATUS: SEIMBANG DENGAN CATATAN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs uppercase tracking-wide">
        <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 text-xs" />
        STATUS: SEIMBANG (RECONCILED)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <FinancePageHeader
        title="Rekonsiliasi & Kontrol Integritas Keuangan"
        description="Pengecekan otomatis terhadap 14 titik kontrol integritas jurnal, periode akuntansi, transaksi donasi dan penyaluran, buku besar, neraca saldo, serta laporan keuangan."
        badge={report ? renderOverallBadge(report.overall_status) : undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period Selector Filter */}
            <div className="relative">
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value ? Number(e.target.value) : "")}
                disabled={loading || refreshing}
                className="rounded-2xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-8 text-xs font-bold text-slate-700 shadow-xs transition hover:border-slate-400 focus:border-brandGreen-500 focus:outline-none focus:ring-1 focus:ring-brandGreen-500 disabled:opacity-60"
              >
                <option value="">Semua Periode (Global)</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.status ? `(${p.status})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Run Reconciliation Button */}
            <button
              type="button"
              onClick={() => void fetchReport(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-2xl bg-brandGreen-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brandGreen-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              <FontAwesomeIcon
                icon={faRotateRight}
                className={loading || refreshing ? "animate-spin text-xs" : "text-xs"}
              />
              {refreshing ? "Memeriksa..." : "Jalankan Rekonsiliasi"}
            </button>
          </div>
        }
      />

      {/* Error State */}
      {error && !loading && (
        <FinanceErrorState
          title="Tidak dapat memuat laporan rekonsiliasi"
          message={error}
          onRetry={() => void fetchReport(false)}
        />
      )}

      {/* Main Content */}
      {!error && (
        <div className="space-y-6">
          {/* Summary Panel */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-slate-400 text-xs" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Waktu Pengecekan:
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {loading ? "Memuat..." : formatReconciliationTimestamp(report?.last_checked_at)}
                </span>
              </div>

              {report?.period && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400 text-xs" />
                  <span>Periode Aktif: <strong className="text-slate-700">{report.period.name}</strong></span>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FinanceStatCard
                title="KONTROL SEIMBANG"
                value={loading ? "-" : (report?.passed_checks ?? 0)}
                tone="emerald"
                icon={faCircleCheck}
                loading={loading}
                helper={
                  report
                    ? `${report.passed_checks} dari ${report.total_checks} titik kontrol valid`
                    : undefined
                }
              />
              <FinanceStatCard
                title="PERHATIAN (WARNING)"
                value={loading ? "-" : (report?.warnings ?? 0)}
                tone="amber"
                icon={faTriangleExclamation}
                loading={loading}
                helper={
                  report
                    ? `${report.warnings} kontrol dengan catatan non-kritis`
                    : undefined
                }
              />
              <FinanceStatCard
                title="ANOMALI TERDETEKSI"
                value={loading ? "-" : (report?.failed_checks ?? 0)}
                tone="rose"
                icon={faShieldHalved}
                loading={loading}
                helper={
                  report
                    ? `${report.critical_errors} anomali kritis memerlukan tindakan`
                    : undefined
                }
              />
            </div>
          </div>

          {/* Controls Detail Section */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading">
                  Detail 14 Titik Kontrol Integritas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar seluruh pemeriksaan integritas buku besar dan siklus akuntansi
                </p>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Tabs */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setFilterTab("all")}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      filterTab === "all"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    Semua ({report?.checks?.length ?? 14})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("failed")}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      filterTab === "failed"
                        ? "bg-white text-rose-700 shadow-xs font-bold"
                        : "hover:text-rose-700"
                    }`}
                  >
                    Bermasalah ({report?.failed_checks ?? 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("passed")}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      filterTab === "passed"
                        ? "bg-white text-emerald-700 shadow-xs font-bold"
                        : "hover:text-emerald-700"
                    }`}
                  >
                    Seimbang ({report?.passed_checks ?? 0})
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari titik kontrol..."
                    className="w-48 sm:w-56 rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-brandGreen-500 focus:outline-none focus:ring-1 focus:ring-brandGreen-500"
                  />
                </div>
              </div>
            </div>

            {/* Content List */}
            {loading ? (
              <div className="py-4">
                <FinanceTableSkeleton rows={8} cols={4} />
              </div>
            ) : !report || report.checks.length === 0 ? (
              <FinanceEmptyState
                title="Data Rekonsiliasi Kosong"
                description="Pemeriksaan integritas keuangan belum menghasilkan data."
                icon={faShieldHalved}
              />
            ) : filteredChecks.length === 0 ? (
              <div className="py-12 text-center">
                <FontAwesomeIcon icon={faShieldHalved} className="text-3xl text-slate-300" />
                <p className="mt-2 text-sm font-bold text-slate-700">Tidak ada kontrol yang cocok</p>
                <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredChecks.map((check, index) => {
                  const isPassed = check.status === "passed";
                  const isCritical = !isPassed && check.severity === "critical";
                  const isWarning = !isPassed && !isCritical;
                  const isExpanded = !!expandedControls[check.check_code];
                  const hasErrors = check.errors && check.errors.length > 0;

                  return (
                    <div
                      key={check.check_code || index}
                      className={`py-4.5 transition-colors ${
                        isCritical
                          ? "bg-rose-50/20 -mx-4 px-4 sm:-mx-6 sm:px-6 rounded-2xl my-1"
                          : isWarning
                          ? "bg-amber-50/20 -mx-4 px-4 sm:-mx-6 sm:px-6 rounded-2xl my-1"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        {/* Left Info */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Status Icon */}
                          <div className="mt-0.5 shrink-0">
                            {isPassed ? (
                              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
                              </div>
                            ) : isCritical ? (
                              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                                <FontAwesomeIcon icon={faCircleXmark} className="text-sm" />
                              </div>
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-sm" />
                              </div>
                            )}
                          </div>

                          {/* Titles & Message */}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-heading text-sm font-bold text-slate-900">
                                {check.name}
                              </h3>
                              <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {check.check_code}
                              </span>
                            </div>
                            <p
                              className={`text-xs mt-1 leading-relaxed ${
                                isPassed ? "text-slate-600" : "text-rose-700 font-medium"
                              }`}
                            >
                              {check.message}
                            </p>
                          </div>
                        </div>

                        {/* Right Metrics & Badge */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0 lg:self-center pl-10 lg:pl-0">
                          {/* Metrics Pills */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              Diperiksa: <strong className="text-slate-900">{formatNumber(check.total_checked)}</strong>
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                                check.total_failed > 0
                                  ? "bg-rose-100 text-rose-800 font-bold"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              Bermasalah: <strong className={check.total_failed > 0 ? "text-rose-800" : "text-slate-900"}>{formatNumber(check.total_failed)}</strong>
                            </span>
                          </div>

                          {/* Status Badge */}
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                              <FontAwesomeIcon icon={faCircleCheck} className="text-[9px]" />
                              LULUS
                            </span>
                          ) : isCritical ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                              <FontAwesomeIcon icon={faCircleXmark} className="text-[9px]" />
                              KRITIS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                              <FontAwesomeIcon icon={faTriangleExclamation} className="text-[9px]" />
                              PERINGATAN
                            </span>
                          )}

                          {/* Expand Details Button */}
                          {hasErrors && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(check.check_code)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-400"
                            >
                              <span>{isExpanded ? "Tutup Temuan" : `Lihat ${check.total_failed} Temuan`}</span>
                              <FontAwesomeIcon
                                icon={isExpanded ? faChevronUp : faChevronDown}
                                className="text-[10px] text-slate-500"
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Diagnostic Panel */}
                      {isExpanded && hasErrors && (
                        <div className="mt-4 pt-3 border-t border-slate-200/80">
                          <DiagnosticErrorTable
                            check={check}
                            currentPage={errorPageMap[check.check_code] || 1}
                            onPageChange={(p) => setErrorPage(check.check_code, p)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Dense Diagnostic Table for Failed Reconciliation Controls.
 * Safely displays reference numbers and diagnostic logs without exposing private donor data.
 */
function DiagnosticErrorTable({
  check,
  currentPage,
  onPageChange,
}: {
  check: ReconciliationControlItem;
  currentPage: number;
  onPageChange: (p: number) => void;
}) {
  const errors = check.errors || [];
  const totalItems = errors.length;
  const totalPages = Math.ceil(totalItems / ERRORS_PER_PAGE);
  const startIndex = (currentPage - 1) * ERRORS_PER_PAGE;
  const currentErrors = errors.slice(startIndex, startIndex + ERRORS_PER_PAGE);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs font-bold text-slate-700">
          Temuan Diagnostik: <span className="text-rose-700">{totalItems} anomali tercatat</span>
        </p>
        <span className="text-[11px] text-slate-400">
          Menampilkan {startIndex + 1} - {Math.min(startIndex + ERRORS_PER_PAGE, totalItems)} dari {totalItems} temuan
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
            {check.check_code === "CLOSED_PERIOD_CONTROL" ? (
              <tr>
                <th className="py-2.5 px-3">No. Jurnal</th>
                <th className="py-2.5 px-3">Tgl Transaksi</th>
                <th className="py-2.5 px-3">Waktu Jurnal Dibuat</th>
                <th className="py-2.5 px-3">Waktu Tutup Buku</th>
                <th className="py-2.5 px-3">Keterangan</th>
              </tr>
            ) : check.check_code === "DONATION_RECONCILIATION" ? (
              <tr>
                <th className="py-2.5 px-3">Ref Transaksi</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nominal</th>
                <th className="py-2.5 px-3">Status Integritas</th>
              </tr>
            ) : check.check_code === "ALLOCATION_RECONCILIATION" ? (
              <tr>
                <th className="py-2.5 px-3">Ref Penyaluran</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nominal</th>
                <th className="py-2.5 px-3">Status Integritas</th>
              </tr>
            ) : check.check_code === "JOURNAL_BALANCE" ? (
              <tr>
                <th className="py-2.5 px-3">No. Jurnal</th>
                <th className="py-2.5 px-3">Total Debit</th>
                <th className="py-2.5 px-3">Total Credit</th>
                <th className="py-2.5 px-3">Selisih</th>
                <th className="py-2.5 px-3">Alasan</th>
              </tr>
            ) : (
              <tr>
                <th className="py-2.5 px-3">Referensi / ID</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nominal / Selisih</th>
                <th className="py-2.5 px-3">Alasan / Keterangan</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {currentErrors.map((err, idx) => {
              if (check.check_code === "CLOSED_PERIOD_CONTROL") {
                return (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">
                      {err.journal_number || `#${err.journal_id}`}
                    </td>
                    <td className="py-2 px-3">{formatFinanceDate(err.transaction_date)}</td>
                    <td className="py-2 px-3 text-rose-700 font-mono text-[11px]">
                      {err.created_at || "-"}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                      {err.closed_at || "-"}
                    </td>
                    <td className="py-2 px-3 text-rose-700">
                      {err.reason || "Jurnal dibuat setelah periode ditutup"}
                    </td>
                  </tr>
                );
              }

              if (check.check_code === "DONATION_RECONCILIATION") {
                return (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">
                      Donasi #{err.reference_id}
                    </td>
                    <td className="py-2 px-3">{formatFinanceDate(err.transaction_date)}</td>
                    <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                      {formatRupiah(err.amount)}
                    </td>
                    <td className="py-2 px-3 text-rose-700">
                      Donasi paid belum memiliki posted journal entry
                    </td>
                  </tr>
                );
              }

              if (check.check_code === "ALLOCATION_RECONCILIATION") {
                return (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">
                      Penyaluran #{err.reference_id}
                    </td>
                    <td className="py-2 px-3">{formatFinanceDate(err.transaction_date)}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">
                      {formatRupiah(err.amount)}
                    </td>
                    <td className="py-2 px-3 text-rose-700">
                      Penyaluran belum memiliki posted journal entry
                    </td>
                  </tr>
                );
              }

              if (check.check_code === "JOURNAL_BALANCE") {
                return (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">
                      {err.journal_number || `#${err.journal_id}`}
                    </td>
                    <td className="py-2 px-3 font-mono">{formatRupiah(err.total_debit)}</td>
                    <td className="py-2 px-3 font-mono">{formatRupiah(err.total_credit)}</td>
                    <td className="py-2 px-3 font-mono text-rose-700 font-bold">
                      {formatRupiah(err.difference)}
                    </td>
                    <td className="py-2 px-3 text-rose-700">{err.reason || "Debit != Credit"}</td>
                  </tr>
                );
              }

              // Generic fallback row
              return (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3 font-mono font-bold text-slate-900">
                    {err.journal_number || (err.reference_id ? `#${err.reference_id}` : (err.journal_id ? `#${err.journal_id}` : "-"))}
                  </td>
                  <td className="py-2 px-3">{formatFinanceDate(err.transaction_date)}</td>
                  <td className="py-2 px-3 font-mono">
                    {err.amount !== undefined ? formatRupiah(err.amount) : (err.difference !== undefined ? formatRupiah(err.difference) : "-")}
                  </td>
                  <td className="py-2 px-3 text-rose-700">
                    {err.reason || String(err.message || "Anomali terdeteksi")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}

export default ReconciliationPage;
