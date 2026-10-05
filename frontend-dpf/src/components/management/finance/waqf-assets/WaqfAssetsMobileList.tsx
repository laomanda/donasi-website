import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEye,
  faInbox,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import type { WaqfAssetItem } from "@/types/finance";
import { WaqfAssetStatusBadge } from "./WaqfAssetStatusBadge";
import { WaqfAssetConditionBadge } from "./WaqfAssetConditionBadge";
import { WaqfAssetEconomicUseBadge } from "./WaqfAssetEconomicUseBadge";

interface WaqfAssetsMobileListProps {
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

export const WaqfAssetsMobileList: React.FC<WaqfAssetsMobileListProps> = ({
  assets,
  periodId,
  defaultPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(defaultPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [assets, periodId]);

  if (assets.length === 0) {
    return (
      <div className="md:hidden flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <FontAwesomeIcon icon={faInbox} className="text-xl" />
        </div>
        <p className="text-sm font-semibold text-slate-700 font-poppins">
          Tidak Ada Aset Wakaf Sesuai Kriteria
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Silakan sesuaikan pilihan filter atau kata kunci pencarian Anda.
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
    <div className="md:hidden space-y-3 print:hidden">
      {/* List of cards */}
      {paginatedAssets.map((asset) => {
        const code = asset.asset_code || "-";
        const name = asset.asset_name || asset.name || "Aset Tanpa Nama";
        const category = asset.category || "-";
        const acqVal = asset.acquisition_value ?? asset.acquisition_cost ?? 0;
        const bookVal = asset.book_value ?? 0;

        return (
          <div
            key={asset.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
          >
            {/* Top row: Code and Status Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <span className="font-mono text-xs font-bold text-slate-900">
                {code}
              </span>
              <WaqfAssetStatusBadge status={asset.status} />
            </div>

            {/* Asset Name & Meta */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-poppins leading-snug">
                {name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{category}</span>
                <span>•</span>
                <WaqfAssetEconomicUseBadge
                  economicUse={asset.economic_use}
                  percentage={asset.productive_percentage}
                />
              </div>
            </div>

            {/* Location if present */}
            {asset.location && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-400 text-[10px]" />
                <span className="truncate">{asset.location}</span>
              </div>
            )}

            {/* Financial Info Box */}
            <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Nilai Buku
                </span>
                <span className="text-sm font-bold text-slate-900 font-poppins tabular-nums">
                  {formatCurrency(bookVal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Nilai Perolehan:</span>
                <span className="font-medium text-slate-700 tabular-nums">
                  {formatCurrency(acqVal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Kondisi Aset:</span>
                <WaqfAssetConditionBadge condition={asset.condition} />
              </div>
            </div>

            {/* Action Button: Clear View Detail */}
            <Link
              to={getDetailUrl(asset.id)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-98"
            >
              <FontAwesomeIcon icon={faEye} className="text-xs" />
              <span>Lihat Detail Aset</span>
            </Link>
          </div>
        );
      })}

      {/* Pagination Bar - Hanya tampil jika data aset melebihi 10 baris */}
      {totalItems > 10 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div>
              Menampilkan <strong className="text-slate-900">{startRecord}</strong>-
              <strong className="text-slate-900">{endRecord}</strong> dari{" "}
              <strong className="text-slate-900">{totalItems}</strong> aset
            </div>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              aria-label="Baris per halaman"
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={-1}>Semua</option>
            </select>
          </div>

          {perPage !== -1 && totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                <span>Sebelumnya</span>
              </button>
              <span className="text-xs font-bold text-slate-800 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
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
