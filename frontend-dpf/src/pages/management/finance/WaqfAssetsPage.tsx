import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faFileExcel,
  faVault,
  faBuildingColumns,
  faBoxesStacked,
  faLayerGroup,
  faSearch,
  faTimes,
  faEye,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faFileLines,
  faLocationDot,
  faUser,
  faClock,
  faMoneyBillWave,
  faXmark,
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
  WaqfAssetReportResponse,
  WaqfAssetItem,
  WaqfAssetFilterParams,
} from "@/types/finance";

export function WaqfAssetsPage() {
  // Data States
  const [reportData, setReportData] = useState<WaqfAssetReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Master Data
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);

  // Filter States
  const [periodFilter, setPeriodFilter] = useState<number | "">("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Selected Asset for Detail Modal
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [assetDetail, setAssetDetail] = useState<WaqfAssetItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

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

  // Fetch LRAW Report data from backend
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
      setCurrentPage(1);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat laporan rincian aset wakaf."));
    } finally {
      setLoading(false);
    }
  }, [periodFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  // Load single asset detail when selected
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
    return Boolean(periodFilter !== "" || categoryFilter !== "" || statusFilter !== "");
  }, [periodFilter, categoryFilter, statusFilter]);

  // Reset filters
  const handleResetFilter = () => {
    setPeriodFilter("");
    setCategoryFilter("");
    setStatusFilter("");
    setSearchQuery("");
    setCurrentPage(1);
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

  // Filtered assets by client search query
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

  // Pagination calculations
  const totalItems = filteredAssets.length;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * perPage;
  const paginatedAssets = useMemo(() => {
    return filteredAssets.slice(startIndex, startIndex + perPage);
  }, [filteredAssets, startIndex, perPage]);

  // Summary figures from backend
  const summary = reportData?.summary;
  const periodInfo = reportData?.period;

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <FinancePageHeader
        title="Laporan Rincian Aset Wakaf (LRAW)"
        description={`Pencatatan inventaris aset wakaf, nilai perolehan, akumulasi penyusutan, dan nilai buku berdasarkan Standar Akuntansi Wakaf (PSAK 409).${
          periodInfo
            ? ` Periode: ${periodInfo.name} (${formatFinanceDate(periodInfo.start_date)} s/d ${formatFinanceDate(periodInfo.end_date)}).`
            : ""
        }`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
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
              onClick={fetchReport}
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

      {/* 2. FILTER TOOLBAR */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          {/* Filter Periode */}
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

          {/* Filter Status */}
          <div className="w-full sm:w-44">
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
              <option value="active">Aktif</option>
              <option value="disposed">Dihapuskan</option>
              <option value="transferred">Dimutasi</option>
            </select>
          </div>

          {/* Reset Filter Button */}
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

      {/* 3. ERROR STATE */}
      {error && (
        <FinanceErrorState
          title="Tidak Dapat Memuat Laporan Aset Wakaf"
          message={error}
          onRetry={fetchReport}
        />
      )}

      {/* 4. LOADING SKELETON */}
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

      {/* 5. SUMMARY & ASSET REGISTER CONTENT */}
      {!loading && !error && reportData && (
        <div className="space-y-6">
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Aset Wakaf */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  TOTAL ASET WAKAF
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FontAwesomeIcon icon={faBoxesStacked} className="text-xs" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-black font-heading text-slate-900 tabular-nums">
                  {summary?.total_assets ?? rawAssets.length} Unit
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  {summary?.by_category?.length || 0} kategori aset terdaftar
                </p>
              </div>
            </div>

            {/* Card 2: Total Nilai Perolehan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  NILAI PEROLEHAN
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-xs" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-lg sm:text-xl font-bold font-heading text-slate-900 tabular-nums">
                  {formatRupiah(summary?.total_acquisition_value ?? 0)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  Nilai historis perolehan aset
                </p>
              </div>
            </div>

            {/* Card 3: Akumulasi Penyusutan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  AKUMULASI PENYUSUTAN
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-lg sm:text-xl font-bold font-heading text-amber-700 tabular-nums">
                  {formatRupiah(summary?.total_accumulated_depreciation ?? 0)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  Total depresiasi yang telah dibukukan
                </p>
              </div>
            </div>

            {/* Card 4: Total Nilai Buku */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                  TOTAL NILAI BUKU
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-lg sm:text-xl font-black font-heading text-emerald-950 tabular-nums">
                  {formatRupiah(summary?.total_book_value ?? 0)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-emerald-800">
                  Nilai tercatat di Laporan Posisi Keuangan
                </p>
              </div>
            </div>
          </div>

          {/* CATEGORY BREAKDOWN PILLS (IF AVAILABLE) */}
          {summary?.by_category && summary.by_category.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                Rincian Per Kategori Aset
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {summary.by_category.map((cat, idx) => (
                  <div
                    key={`${cat.category}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{cat.category}</p>
                      <p className="text-[10px] text-slate-500">{cat.count} unit</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {formatRupiah(cat.book_value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSET REGISTER TABLE CARD */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-xs overflow-hidden">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                  <FontAwesomeIcon icon={faLayerGroup} />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-slate-900">
                    Register Aset Wakaf
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Menampilkan {filteredAssets.length} dari {rawAssets.length} aset terdaftar
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari kode, nama, wakif, lokasi..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
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
                    <tr className="border-b border-slate-200/80 bg-slate-50/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-6 w-36">Kode Aset</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Nama Aset</th>
                      <th className="py-3.5 px-4 w-36">Kategori</th>
                      <th className="py-3.5 px-4 w-36">Wakif</th>
                      <th className="py-3.5 px-4 w-32">Perolehan</th>
                      <th className="py-3.5 px-4 text-right w-36">Nilai Perolehan</th>
                      <th className="py-3.5 px-4 text-right w-36">Akum. Penyusutan</th>
                      <th className="py-3.5 px-6 text-right w-36">Nilai Buku</th>
                      <th className="py-3.5 px-4 text-center w-24">Kondisi</th>
                      <th className="py-3.5 px-4 text-center w-24">Status</th>
                      <th className="py-3.5 px-4 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedAssets.map((asset) => {
                      const assetName = asset.asset_name || asset.name || "-";
                      const acqVal = asset.acquisition_value ?? asset.acquisition_cost ?? 0;
                      const bookVal = asset.book_value ?? 0;
                      const depVal = asset.accumulated_depreciation ?? 0;

                      return (
                        <tr
                          key={asset.id}
                          className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                          onClick={() => setSelectedAssetId(asset.id)}
                        >
                          <td className="py-3.5 px-6 font-mono font-bold text-slate-800">
                            <span className="text-emerald-700 group-hover:underline">
                              {asset.asset_code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {assetName}
                            {asset.location && (
                              <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                                <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                                {asset.location}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                              {asset.category || "-"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {asset.wakif || "Hamba Allah"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {formatFinanceDate(asset.acquisition_date)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 tabular-nums">
                            {formatRupiah(acqVal)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-700 tabular-nums">
                            {formatRupiah(depVal)}
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-700 tabular-nums">
                            {formatRupiah(bookVal)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <AssetConditionBadge condition={asset.condition} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <AssetStatusBadge status={asset.status} />
                          </td>
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
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
                    <tr className="border-t-2 border-slate-300 bg-slate-100/80 font-bold text-xs text-slate-900">
                      <td colSpan={5} className="py-4 px-6 uppercase tracking-wider">
                        GRAND TOTAL INVENTARIS
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums">
                        {formatRupiah(summary?.total_acquisition_value ?? 0)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-amber-800 tabular-nums">
                        {formatRupiah(summary?.total_accumulated_depreciation ?? 0)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-800 tabular-nums">
                        {formatRupiah(summary?.total_book_value ?? 0)}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Pagination Bar */}
            {filteredAssets.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 px-6 py-3.5 bg-slate-50/50 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Baris per halaman:</span>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-bold text-slate-700"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-slate-400">|</span>
                  <span>
                    Menampilkan {startIndex + 1} –{" "}
                    {Math.min(startIndex + perPage, totalItems)} dari {totalItems} aset
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={safeCurrentPage === 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                  </button>
                  <span className="px-2 font-bold text-slate-800">
                    {safeCurrentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={safeCurrentPage === totalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CLK NOTES LINK / PREVIEW */}
          {reportData.notes && reportData.notes.length > 0 && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <FontAwesomeIcon icon={faFileLines} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                    Catatan Atas Laporan Keuangan (CLK) — Pos Aset Wakaf
                  </h4>
                  <p className="text-xs text-purple-800">
                    Terdapat {reportData.notes.length} catatan pengungkapan aktif untuk periode ini.
                  </p>
                </div>
              </div>

              <Link
                to="/finance/financial-notes"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 hover:text-purple-950 bg-white px-3.5 py-2 rounded-xl border border-purple-200 shadow-2xs transition"
              >
                <span>Lihat CLK</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 6. ASSET DETAIL MODAL / DRAWER */}
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
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-bold">
              <FontAwesomeIcon icon={faVault} />
            </div>
            <div>
              <h3 id="asset-detail-title" className="font-heading text-sm font-bold text-slate-900">
                Detail Aset Wakaf
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                {assetDetail?.asset_code || "Memuat..."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
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
                    <span className="font-semibold text-slate-900">
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

              {/* SECTION: SUMBER DANA (IF AVAILABLE) */}
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

              {/* SECTION: RIWAYAT PENYUSUTAN (IF AVAILABLE) */}
              {assetDetail.depreciation_history && assetDetail.depreciation_history.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Riwayat Penyusutan Per Periode
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                          <th className="py-2.5 px-3">Periode</th>
                          <th className="py-2.5 px-3 text-right">Beban Penyusutan</th>
                          <th className="py-2.5 px-3 text-right">Akumulasi</th>
                          <th className="py-2.5 px-3 text-right">Nilai Buku</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assetDetail.depreciation_history.map((dep, idx) => (
                          <tr key={dep.id || idx}>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {dep.period_name || `Periode #${dep.period_id}`}
                              {dep.period_end_date && (
                                <span className="text-[10px] text-slate-400 block">
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
  if (c === "under_maintenance" || c === "pemeliharaan") {
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
