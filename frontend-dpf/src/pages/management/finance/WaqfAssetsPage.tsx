import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faFileExcel,
  faPrint,
  faVault,
  faBuildingColumns,
  faBoxesStacked,
  faLayerGroup,
  faSearch,
  faTimes,
  faEye,
  faArrowRight,
  faLocationDot,
  faUser,
  faClock,
  faMoneyBillWave,
  faXmark,
  faScaleBalanced,
  faBookOpen,
  faChartPie,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";

import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
  FinanceStatusBadge,
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
  WaqfAssetReportResponse,
  WaqfAssetItem,
  WaqfAssetFilterParams,
} from "@/types/finance";

interface CategoryOption {
  id: number;
  name: string;
}

export function WaqfAssetsPage() {
  // Data States
  const [reportData, setReportData] = useState<WaqfAssetReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Master Data
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  const [searchParams] = useSearchParams();
  const initialPeriodId = searchParams.get("period_id");

  // Filter States
  const [periodFilter, setPeriodFilter] = useState<number | "">(
    initialPeriodId ? Number(initialPeriodId) : ""
  );
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Sync with URL searchParams if changed
  useEffect(() => {
    const pId = searchParams.get("period_id");
    if (pId) {
      setPeriodFilter(Number(pId));
    }
  }, [searchParams]);

  // Search Query (Client-side presentation convenience)
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Asset for Detail Modal
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [assetDetail, setAssetDetail] = useState<WaqfAssetItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // 1. Load accounting periods on mount
  useEffect(() => {
    let isMounted = true;
    const loadPeriods = async () => {
      try {
        const periodList = await financeService.getAccountingPeriods();
        if (isMounted) {
          setPeriods(periodList || []);
        }
      } catch {
        // Fallback silently if periods cannot be fetched
      }
    };

    void loadPeriods();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch LRAW Report data from backend
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: WaqfAssetFilterParams = {};
      if (periodFilter !== "") {
        params.period_id = periodFilter;
        params.accounting_period_id = periodFilter;
      }
      if (categoryFilter !== "") {
        params.category_id = categoryFilter;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }

      const res = await financeService.getWaqfAssetReport(params);
      setReportData(res);

      // Collect distinct categories from assets if category_id and category are present
      if (res?.assets && Array.isArray(res.assets)) {
        setCategoryOptions((prev) => {
          const map = new Map<number, string>();
          prev.forEach((c) => map.set(c.id, c.name));
          res.assets.forEach((a) => {
            if (a.category_id && a.category && a.category !== "-") {
              map.set(a.category_id, a.category);
            }
          });
          return Array.from(map.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
        });
      }
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat laporan rincian aset wakaf."));
    } finally {
      setLoading(false);
    }
  }, [periodFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  // 3. Load single asset detail when modal opens
  useEffect(() => {
    if (!selectedAssetId) {
      setAssetDetail(null);
      return;
    }

    let isMounted = true;
    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const params = periodFilter !== "" ? { period_id: Number(periodFilter) } : undefined;
        const detail = await financeService.getWaqfAssetDetail(selectedAssetId, params);
        if (isMounted) {
          setAssetDetail(detail);
        }
      } catch (err) {
        if (isMounted) {
          setDetailError(extractFinanceErrorMessage(err, "Gagal memuat detail aset wakaf."));
        }
      } finally {
        if (isMounted) {
          setDetailLoading(false);
        }
      }
    };

    void loadDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedAssetId, periodFilter]);

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return Boolean(periodFilter !== "" || categoryFilter !== "" || statusFilter !== "" || searchQuery);
  }, [periodFilter, categoryFilter, statusFilter, searchQuery]);

  // Reset filters
  const handleResetFilter = () => {
    setPeriodFilter("");
    setCategoryFilter("");
    setStatusFilter("");
    setSearchQuery("");
  };

  // Export Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams: Record<string, string> = {};
      if (periodFilter !== "") exportParams.period_id = String(periodFilter);
      if (categoryFilter !== "") exportParams.category_id = String(categoryFilter);
      if (statusFilter) exportParams.status = statusFilter;

      const blob = await financeService.exportWaqfAssets(exportParams);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blob as unknown as BlobPart,
        `Laporan_Rincian_Aset_Wakaf_${today}.xlsx`
      );
      toast.success("Laporan Aset Wakaf Excel berhasil diunduh.");
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengunduh laporan aset wakaf."));
    } finally {
      setExporting(false);
    }
  };

  // Browser Print trigger
  const handlePrint = () => {
    window.print();
  };

  // Filtered assets by client search query (presentation convenience only)
  const rawAssets = useMemo(() => reportData?.assets || [], [reportData?.assets]);
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return rawAssets;
    const q = searchQuery.toLowerCase().trim();
    return rawAssets.filter((a) => {
      const code = (a.asset_code || "").toLowerCase();
      const name = (a.asset_name || a.name || "").toLowerCase();
      const cat = (a.category || "").toLowerCase();
      const wakif = (a.wakif || "").toLowerCase();
      const loc = (a.location || "").toLowerCase();
      return (
        code.includes(q) ||
        name.includes(q) ||
        cat.includes(q) ||
        wakif.includes(q) ||
        loc.includes(q)
      );
    });
  }, [rawAssets, searchQuery]);



  // Summary figures from backend (Single Source of Truth)
  const summary = reportData?.summary;
  const periodInfo = reportData?.period;

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      {/* 1. PAGE HEADER (SCREEN ONLY) */}
      <div className="print:hidden">
        <FinancePageHeader
          title="Laporan Rincian Aset Wakaf"
          description="Rincian aset wakaf yang tercatat dalam sistem keuangan berdasarkan kategori, nilai, kondisi, dan status aset."
          badge={
            periodInfo ? (
              <FinanceStatusBadge
                status={periodInfo.status === "open" ? "open" : "closed"}
                label={
                  periodInfo.status === "open"
                    ? `Periode Aktif: ${periodInfo.name}`
                    : `Periode Ditutup: ${periodInfo.name}`
                }
              />
            ) : undefined
          }
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
                onClick={fetchReport}
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
                title="Export berkas XLSX"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                <FontAwesomeIcon
                  icon={faFileExcel}
                  className={exporting ? "animate-bounce" : ""}
                />
                <span>{exporting ? "Mengunduh..." : "Export Excel"}</span>
              </button>
            </div>
          }
        />
      </div>

      {/* 2. FORMAL PRINT-ONLY HEADER */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
        <div className="text-center space-y-1">
          <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
            Yayasan Wakaf dan Pendidikan (YWDP)
          </p>
          <h1 className="text-lg font-black text-slate-950 uppercase font-heading">
            LAPORAN RINCIAN ASET WAKAF (LRAW)
          </h1>
          <p className="text-xs text-slate-700 font-medium">
            {periodInfo
              ? `Periode: ${periodInfo.name} (${formatFinanceDate(periodInfo.start_date)} s/d ${formatFinanceDate(periodInfo.end_date)})`
              : "Semua Periode Akuntansi"}
          </p>
          <p className="text-[10px] text-slate-500 pt-1">
            Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
          </p>
        </div>
      </div>

      {/* 3. FILTER TOOLBAR (SCREEN ONLY) */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-xs print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {/* Filter Periode */}
          <div>
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
                  {p.name || p.period_name} ({p.status === "open" ? "OPEN" : "CLOSED"})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kategori Aset */}
          <div>
            <label
              htmlFor="category_select"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Kategori Aset
            </label>
            <select
              id="category_select"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua Kategori</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Aset */}
          <div>
            <label
              htmlFor="status_select"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Status Aset
            </label>
            <select
              id="status_select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif (active)</option>
              <option value="disposed">Dihapuskan (disposed)</option>
              <option value="transferred">Dimutasi (transferred)</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilter}
              disabled={!isFilterActive}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95 disabled:opacity-40"
            >
              <FontAwesomeIcon icon={faRotateRight} className="text-[10px]" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        {/* Bottom row quick links */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Navigasi Laporan:</span>
            <Link
              to={periodFilter ? `/finance/balance-sheet?period_id=${periodFilter}` : "/finance/balance-sheet"}
              className="font-bold text-emerald-700 hover:underline"
            >
              Posisi Keuangan (LP)
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              to={periodFilter ? `/finance/activity-statement?period_id=${periodFilter}` : "/finance/activity-statement"}
              className="font-bold text-emerald-700 hover:underline"
            >
              Laporan Aktivitas
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              to={periodFilter ? `/finance/financial-notes?period_id=${periodFilter}` : "/finance/financial-notes"}
              className="font-bold text-emerald-700 hover:underline"
            >
              Catatan Keuangan (CLK)
            </Link>
          </div>

          <div>
            Periode: <strong>{periodInfo?.name || "Semua Periode"}</strong>
          </div>
        </div>
      </div>

      {/* 4. ERROR STATE */}
      {error && (
        <FinanceErrorState
          title="Tidak Dapat Memuat Laporan Aset Wakaf"
          message={error}
          onRetry={fetchReport}
        />
      )}

      {/* 5. LOADING SKELETON */}
      {loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <FinanceTableSkeleton rows={8} cols={6} />
          </div>
        </div>
      )}

      {/* 6. REPORT CONTEXT & CONTENT */}
      {!loading && !error && reportData && (
        <div className="space-y-6 print:space-y-4">
          {/* CONTEXT STRIP (SCREEN ONLY) */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <FontAwesomeIcon icon={faInfoCircle} className="text-emerald-600 text-sm" />
                <span className="font-semibold">
                  {periodInfo
                    ? `Periode: ${periodInfo.name} (${formatFinanceDate(periodInfo.start_date)} s/d ${formatFinanceDate(periodInfo.end_date)})`
                    : "Menampilkan akumulasi seluruh periode akuntansi."}
                </span>
                {periodInfo?.status && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    periodInfo.status === "open"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}>
                    {periodInfo.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-slate-500 font-medium">
                <span>Total Unit: <strong className="text-slate-900 font-mono">{summary?.total_assets ?? rawAssets.length}</strong></span>
                <span>Kategori: <strong className="text-slate-900 font-mono">{summary?.by_category?.length || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* SUMMARY KPI CARDS (4 CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            {/* Card 1: Total Aset Wakaf */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs print:p-3 print:border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 print:text-[10px]">
                  TOTAL ASET WAKAF
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 print:hidden">
                  <FontAwesomeIcon icon={faBoxesStacked} className="text-xs" />
                </div>
              </div>
              <div className="mt-3 print:mt-1">
                <p className="text-xl font-black font-heading text-slate-900 tabular-nums print:text-base">
                  {summary?.total_assets ?? rawAssets.length} Unit
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 print:text-[9px]">
                  {summary?.by_category?.length || 0} kategori terdaftar
                </p>
              </div>
            </div>

            {/* Card 2: Total Nilai Perolehan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs print:p-3 print:border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 print:text-[10px]">
                  NILAI PEROLEHAN
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 print:hidden">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-xs" />
                </div>
              </div>
              <div className="mt-3 print:mt-1">
                <p className="text-lg sm:text-xl font-bold font-heading text-slate-900 tabular-nums print:text-sm">
                  {formatRupiah(summary?.total_acquisition_value ?? 0)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 print:text-[9px]">
                  Nilai historis perolehan aset
                </p>
              </div>
            </div>

            {/* Card 3: Akumulasi Penyusutan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs print:p-3 print:border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 print:text-[10px]">
                  AKUMULASI PENYUSUTAN
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 print:hidden">
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                </div>
              </div>
              <div className="mt-3 print:mt-1">
                <p className="text-lg sm:text-xl font-bold font-heading text-amber-700 tabular-nums print:text-sm">
                  {formatRupiah(summary?.total_accumulated_depreciation ?? 0)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 print:text-[9px]">
                  Total depresiasi dibukukan
                </p>
              </div>
            </div>

            {/* Card 4: Total Nilai Buku */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs print:p-3 print:border-slate-300 print:bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 print:text-[10px] print:text-slate-900">
                  TOTAL NILAI BUKU
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 print:hidden">
                  <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
                </div>
              </div>
              <div className="mt-3 print:mt-1">
                <p className="text-lg sm:text-xl font-black font-heading text-emerald-950 tabular-nums print:text-sm print:text-slate-950">
                  {formatRupiah(summary?.total_book_value ?? 0)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-emerald-800 print:text-[9px] print:text-slate-600">
                  Nilai tercatat di Posisi Keuangan
                </p>
              </div>
            </div>
          </div>

          {/* CATEGORY BREAKDOWN SUMMARY */}
          {summary?.by_category && summary.by_category.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs print:border-slate-300 print:p-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5 print:text-[10px]">
                Ringkasan Nilai Buku Per Kategori Aset
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 print:grid-cols-4 print:gap-2">
                {summary.by_category.map((cat, idx) => (
                  <div
                    key={`${cat.category}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs print:bg-white print:border-slate-300 print:p-2"
                  >
                    <div>
                      <p className="font-bold text-slate-800 print:text-[11px]">{cat.category}</p>
                      <p className="text-[10px] text-slate-500 print:text-[9px]">{cat.count} unit</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 tabular-nums print:text-[11px]">
                      {formatRupiah(cat.book_value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSET REGISTER TABLE CARD */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-xs overflow-hidden print:rounded-none print:border-0 print:shadow-none">
            {/* Table Toolbar (Screen Only) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 bg-slate-50/50 print:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                  <FontAwesomeIcon icon={faLayerGroup} />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-slate-900">
                    Register Rincian Aset Wakaf
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {filteredAssets.length === rawAssets.length
                      ? `Total ${rawAssets.length} aset terdaftar`
                      : `Menampilkan ${filteredAssets.length} dari ${rawAssets.length} aset terdaftar`}
                  </p>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode, nama, wakif, lokasi..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title="Hapus pencarian"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                )}
              </div>
            </div>

            {/* Table Content */}
            {filteredAssets.length === 0 ? (
              <div className="p-8">
                <FinanceEmptyState
                  title="Tidak Ada Aset Wakaf Sesuai Kriteria"
                  description="Tidak ditemukan data register aset wakaf pada filter atau kata kunci pencarian yang dipilih."
                  icon={faVault}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 print:bg-slate-100 print:text-[10px] print:text-slate-800">
                      <th scope="col" className="py-3.5 px-6 w-36">Kode Aset</th>
                      <th scope="col" className="py-3.5 px-4 min-w-[200px]">Nama Aset</th>
                      <th scope="col" className="py-3.5 px-4 w-32">Kategori</th>
                      <th scope="col" className="py-3.5 px-4 w-36">Wakif</th>
                      <th scope="col" className="py-3.5 px-4 w-28">Perolehan</th>
                      <th scope="col" className="py-3.5 px-4 text-right w-36">Nilai Perolehan</th>
                      <th scope="col" className="py-3.5 px-4 text-right w-36">Akum. Penyusutan</th>
                      <th scope="col" className="py-3.5 px-6 text-right w-36">Nilai Buku</th>
                      <th scope="col" className="py-3.5 px-4 text-center w-24">Kondisi</th>
                      <th scope="col" className="py-3.5 px-4 text-center w-24">Status</th>
                      <th scope="col" className="py-3.5 px-4 text-center w-20 print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs print:divide-slate-300 print:text-[10px]">
                    {filteredAssets.map((asset) => {
                      const assetName = asset.asset_name || asset.name || "-";
                      const acqVal = asset.acquisition_value ?? asset.acquisition_cost ?? 0;
                      const bookVal = asset.book_value ?? 0;
                      const depVal = asset.accumulated_depreciation ?? 0;

                      return (
                        <tr
                          key={asset.id}
                          className="hover:bg-slate-50/70 transition-colors group cursor-pointer print:hover:bg-transparent"
                          onClick={() => setSelectedAssetId(asset.id)}
                        >
                          <td className="py-3.5 px-6 font-mono font-bold text-slate-800">
                            <span className="text-emerald-700 group-hover:underline print:text-slate-900">
                              {asset.asset_code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {assetName}
                            {asset.location && (
                              <span className="block text-[10px] text-slate-400 font-normal mt-0.5 print:text-[9px] print:text-slate-600">
                                <FontAwesomeIcon icon={faLocationDot} className="mr-1 print:hidden" />
                                {asset.location}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600 print:bg-transparent print:p-0 print:text-[10px] print:text-slate-800">
                              {asset.category || "-"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 print:text-slate-800">
                            {asset.wakif || "Hamba Allah"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap print:text-slate-800">
                            {formatFinanceDate(asset.acquisition_date)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 tabular-nums">
                            {formatRupiah(acqVal)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-700 tabular-nums print:text-slate-900">
                            {formatRupiah(depVal)}
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-700 tabular-nums print:text-slate-950">
                            {formatRupiah(bookVal)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <AssetConditionBadge condition={asset.condition} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <AssetStatusBadge status={asset.status} />
                          </td>
                          <td className="py-3.5 px-4 text-center print:hidden" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedAssetId(asset.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition"
                              title="Lihat Detail Aset"
                            >
                              <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                              <span>Detail</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 bg-slate-100/80 font-bold text-xs text-slate-900 print:bg-slate-200 print:text-[10px]">
                      <td colSpan={5} className="py-4 px-6 uppercase tracking-wider">
                        GRAND TOTAL INVENTARIS ASET WAKAF
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums">
                        {formatRupiah(summary?.total_acquisition_value ?? 0)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-amber-800 tabular-nums print:text-slate-900">
                        {formatRupiah(summary?.total_accumulated_depreciation ?? 0)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-800 tabular-nums print:text-slate-950">
                        {formatRupiah(summary?.total_book_value ?? 0)}
                      </td>
                      <td colSpan={2}></td>
                      <td className="print:hidden"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}


          </div>

          {/* 7. CROSS-REPORT SHORTCUTS (SCREEN ONLY) */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xs space-y-3 print:hidden">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Integrasi Laporan Keuangan Lainnya
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                to="/finance/balance-sheet"
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-300 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      Posisi Keuangan
                    </span>
                    <p className="text-[10px] text-slate-500">Neraca Saldo Aset</p>
                  </div>
                </div>
                <FontAwesomeIcon icon={faArrowRight} className="text-slate-400 group-hover:text-emerald-600 text-xs transition" />
              </Link>

              <Link
                to="/finance/activity-statement"
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-300 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <FontAwesomeIcon icon={faChartPie} className="text-xs" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      Laporan Aktivitas
                    </span>
                    <p className="text-[10px] text-slate-500">Penerimaan & Beban</p>
                  </div>
                </div>
                <FontAwesomeIcon icon={faArrowRight} className="text-slate-400 group-hover:text-emerald-600 text-xs transition" />
              </Link>

              <Link
                to="/finance/trial-balance"
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-300 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <FontAwesomeIcon icon={faScaleBalanced} className="text-xs" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      Neraca Saldo
                    </span>
                    <p className="text-[10px] text-slate-500">Trial Balance Akun</p>
                  </div>
                </div>
                <FontAwesomeIcon icon={faArrowRight} className="text-slate-400 group-hover:text-emerald-600 text-xs transition" />
              </Link>

              <Link
                to="/finance/general-ledger"
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-300 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <FontAwesomeIcon icon={faBookOpen} className="text-xs" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      Buku Besar
                    </span>
                    <p className="text-[10px] text-slate-500">Mutasi Jurnal Akun</p>
                  </div>
                </div>
                <FontAwesomeIcon icon={faArrowRight} className="text-slate-400 group-hover:text-emerald-600 text-xs transition" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 8. ASSET DETAIL MODAL */}
      {selectedAssetId !== null && (
        <AssetDetailModal
          assetId={selectedAssetId}
          assetDetail={assetDetail}
          loading={detailLoading}
          error={detailError}
          onClose={() => {
            setSelectedAssetId(null);
            setAssetDetail(null);
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: ASSET DETAIL MODAL
// ==========================================
interface AssetDetailModalProps {
  assetId: number;
  assetDetail: WaqfAssetItem | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

function AssetDetailModal({
  assetDetail,
  loading,
  error,
  onClose,
}: AssetDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:hidden"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-bold">
              <FontAwesomeIcon icon={faVault} />
            </div>
            <div>
              <h3 id="asset-detail-title" className="font-heading text-sm font-bold text-slate-900">
                Detail Register Aset Wakaf
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                {assetDetail?.asset_code || "Memuat detail aset..."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            title="Tutup Modal"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {loading && (
            <div className="space-y-4 py-8">
              <div className="h-6 w-full rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-6 w-full rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-6 w-full rounded-lg bg-slate-100 animate-pulse" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              {error}
            </div>
          )}

          {!loading && !error && assetDetail && (
            <div className="space-y-6">
              {/* SECTION: IDENTITAS */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Identitas & Legalitas Aset
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Nama Aset
                    </span>
                    <span className="font-semibold text-slate-900">
                      {assetDetail.asset_name || assetDetail.name || "-"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Kategori Aset
                    </span>
                    <span className="font-semibold text-slate-900">
                      {assetDetail.category || "-"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Wakif (Pemberi Wakaf)
                    </span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <FontAwesomeIcon icon={faUser} className="text-slate-400 text-[10px]" />
                      {assetDetail.wakif || "Hamba Allah"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Tanggal Perolehan
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {formatFinanceDate(assetDetail.acquisition_date)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Lokasi / Alamat
                    </span>
                    <span className="font-semibold text-slate-900">
                      {assetDetail.location || "-"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Kondisi & Status
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <AssetConditionBadge condition={assetDetail.condition} />
                      <AssetStatusBadge status={assetDetail.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: NILAI FINANSIAL */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Posisi Nilai Finansial
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Nilai Perolehan
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                      {formatRupiah(assetDetail.acquisition_value ?? assetDetail.acquisition_cost ?? 0)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                    <span className="text-[10px] text-amber-800 uppercase font-bold block">
                      Akum. Penyusutan
                    </span>
                    <span className="text-sm font-bold font-mono text-amber-900 tabular-nums">
                      {formatRupiah(assetDetail.accumulated_depreciation ?? 0)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                      Nilai Buku (Neto)
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-950 tabular-nums">
                      {formatRupiah(assetDetail.book_value ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: SUMBER DANA PEROLEHAN */}
              {assetDetail.sources && assetDetail.sources.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Sumber Dana Perolehan
                  </h4>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs">
                    {assetDetail.sources.map((src, idx) => (
                      <div
                        key={src.id || idx}
                        className="flex items-center justify-between py-2 px-2"
                      >
                        <div>
                          <p className="font-bold text-slate-800 capitalize">
                            {src.source_type.replace(/_/g, " ")}
                          </p>
                          {src.description && (
                            <p className="text-[11px] text-slate-500">{src.description}</p>
                          )}
                        </div>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatRupiah(src.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: RIWAYAT PENYUSUTAN */}
              {assetDetail.depreciation_history && assetDetail.depreciation_history.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Riwayat Penyusutan Per Periode
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                          <th scope="col" className="py-2.5 px-3">Periode</th>
                          <th scope="col" className="py-2.5 px-3 text-right">Beban Penyusutan</th>
                          <th scope="col" className="py-2.5 px-3 text-right">Akumulasi</th>
                          <th scope="col" className="py-2.5 px-3 text-right">Nilai Buku</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assetDetail.depreciation_history.map((dep, idx) => (
                          <tr key={dep.id || idx}>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {dep.period_name || `Periode #${dep.period_id}`}
                              {dep.period_end_date && (
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {formatFinanceDate(dep.period_end_date)}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-700 tabular-nums">
                              {formatRupiah(dep.depreciation_expense)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-amber-700 tabular-nums">
                              {formatRupiah(dep.accumulated_depreciation)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                              {formatRupiah(dep.book_value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-3.5 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: CONDITION & STATUS BADGES
// ==========================================
function AssetConditionBadge({ condition }: { condition: string }) {
  const c = (condition || "").toLowerCase();
  if (c === "excellent" || c === "sangat baik") {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-[10px] font-bold text-emerald-800 uppercase">
        Sangat Baik
      </span>
    );
  }
  if (c === "good" || c === "baik") {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-[10px] font-bold text-blue-800 uppercase">
        Baik
      </span>
    );
  }
  if (c === "under_maintenance" || c === "under_repair" || c === "pemeliharaan") {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-[10px] font-bold text-amber-800 uppercase">
        Pemeliharaan
      </span>
    );
  }
  if (c === "damaged" || c === "rusak") {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-[10px] font-bold text-rose-800 uppercase">
        Rusak
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
      {condition || "-"}
    </span>
  );
}

function AssetStatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "aktif") {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-[10px] font-bold text-emerald-800 uppercase">
        Aktif
      </span>
    );
  }
  if (s === "disposed" || s === "dihapuskan") {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-200 text-[10px] font-bold text-slate-700 uppercase">
        Dihapuskan
      </span>
    );
  }
  if (s === "transferred" || s === "dimutasi") {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-[10px] font-bold text-purple-800 uppercase">
        Dimutasi
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
      {status || "-"}
    </span>
  );
}

export default WaqfAssetsPage;
