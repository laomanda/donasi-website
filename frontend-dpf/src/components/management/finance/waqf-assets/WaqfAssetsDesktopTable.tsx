import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEye,
  faInbox,
} from "@fortawesome/free-solid-svg-icons";
import type { WaqfAssetItem } from "@/types/finance";
import { WaqfAssetStatusBadge } from "./WaqfAssetStatusBadge";
import { WaqfAssetConditionBadge } from "./WaqfAssetConditionBadge";
import { WaqfAssetEconomicUseBadge } from "./WaqfAssetEconomicUseBadge";

interface WaqfAssetsDesktopTableProps {
  assets: WaqfAssetItem[];
  periodId?: number | "";
  defaultPerPage?: number;
}

const formatCurrency = (val?: number | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val));
};

export const WaqfAssetsDesktopTable: React.FC<WaqfAssetsDesktopTableProps> = ({
  assets,
  periodId,
  defaultPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(defaultPerPage);

  // Reset pagination on items or period change
  useEffect(() => {
    setCurrentPage(1);
  }, [assets, periodId]);

  if (assets.length === 0) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <FontAwesomeIcon icon={faInbox} className="text-xl" />
        </div>
        <p className="text-sm font-semibold text-slate-700 font-poppins">
          Tidak Ada Aset Wakaf Sesuai Kriteria
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Coba sesuaikan pilihan filter periode, kategori, status, atau kata kunci pencarian Anda.
        </p>
      </div>
    );
  }

  const totalItems = assets.length;
  const totalPages =
    perPage === -1 ? 1 : Math.max(1, Math.ceil(totalItems / perPage));
  const startRecord =
    perPage === -1
      ? 1
      : Math.min((currentPage - 1) * perPage + 1, totalItems);
  const endRecord =
    perPage === -1 ? totalItems : Math.min(currentPage * perPage, totalItems);

  const paginatedAssets =
    perPage === -1
      ? assets
      : assets.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handlePerPageChange = (val: number) => {
    setPerPage(val);
    setCurrentPage(1);
  };

  const getDetailUrl = (assetId: number) => {
    const query = periodId ? `?period_id=${periodId}` : "";
    return `/finance/waqf-assets/${assetId}${query}`;
  };

  return (
    <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden print:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="px-4 py-3.5 whitespace-nowrap">Kode Aset</th>
              <th className="px-4 py-3.5 whitespace-nowrap min-w-[180px]">Nama Aset</th>
              <th className="px-3 py-3.5 whitespace-nowrap">Kategori</th>
              <th className="px-3 py-3.5 whitespace-nowrap">Penggunaan</th>
              <th className="px-3 py-3.5 whitespace-nowrap hidden xl:table-cell">Wakif</th>
              <th className="px-3 py-3.5 whitespace-nowrap hidden lg:table-cell">Perolehan</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Nilai Perolehan</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Akumulasi Penyusutan</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Nilai Buku</th>
              <th className="px-3 py-3.5 whitespace-nowrap text-center">Kondisi</th>
              <th className="px-3 py-3.5 whitespace-nowrap text-center">Status</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-center print:hidden">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedAssets.map((asset) => {
              const code = asset.asset_code || "-";
              const name = asset.asset_name || asset.name || "Aset Tanpa Nama";
              const category = asset.category || "-";
              const acqVal = asset.acquisition_value ?? asset.acquisition_cost ?? 0;
              const depVal = asset.accumulated_depreciation ?? 0;
              const bookVal = asset.book_value ?? 0;

              return (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                    {code}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 line-clamp-2">
                      {name}
                    </div>
                    {asset.location && (
                      <span className="text-[11px] text-slate-400 block truncate">
                        {asset.location}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                    {category}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <WaqfAssetEconomicUseBadge
                      economicUse={asset.economic_use}
                      percentage={asset.productive_percentage}
                    />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-slate-600 hidden xl:table-cell">
                    {asset.wakif || "-"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-slate-500 hidden lg:table-cell">
                    {asset.acquisition_date || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-slate-700 tabular-nums">
                    {formatCurrency(acqVal)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-slate-700 tabular-nums">
                    {formatCurrency(depVal)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-slate-900 tabular-nums font-poppins">
                    {formatCurrency(bookVal)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <WaqfAssetConditionBadge condition={asset.condition} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <WaqfAssetStatusBadge status={asset.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center print:hidden">
                    <Link
                      to={getDetailUrl(asset.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-400 hover:bg-slate-50 active:scale-95"
                      title="Lihat Detail Aset Wakaf"
                    >
                      <FontAwesomeIcon icon={faEye} className="text-slate-500 text-[11px]" />
                      <span>Detail</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar - Hanya tampil jika data aset melebihi 10 baris */}
      {totalItems > 10 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/75 px-5 py-3 text-xs print:hidden">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <div>
              Menampilkan <strong className="text-slate-900">{startRecord}</strong> -{" "}
              <strong className="text-slate-900">{endRecord}</strong> dari{" "}
              <strong className="text-slate-900">{totalItems}</strong> aset
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-500">Tampilkan:</span>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                aria-label="Jumlah baris per halaman"
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 transition focus:border-slate-800 focus:outline-hidden"
              >
                <option value={10}>10 baris</option>
                <option value={25}>25 baris</option>
                <option value={50}>50 baris</option>
                <option value={-1}>Semua baris</option>
              </select>
            </div>
          </div>

          {perPage !== -1 && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Halaman Sebelumnya"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                <span>Sebelumnya</span>
              </button>

              {totalPages <= 7 ? (
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                        currentPage === p
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-2 text-xs font-medium text-slate-600">
                  Halaman <strong className="text-slate-900">{currentPage}</strong> dari{" "}
                  <strong className="text-slate-900">{totalPages}</strong>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Halaman Selanjutnya"
              >
                <span>Selanjutnya</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
