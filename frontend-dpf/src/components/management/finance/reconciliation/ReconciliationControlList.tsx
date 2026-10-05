import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faFilterCircleXmark,
  faRotateRight,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { ReconciliationControlItem as IReconciliationControlItem } from "@/types/finance";
import { ReconciliationControlItem } from "./ReconciliationControlItem";

interface ReconciliationControlListProps {
  checks: IReconciliationControlItem[];
  hasFullReport: boolean;
  loading: boolean;
  runningReconciliation: boolean;
  onRunReconciliation: () => void;
  expandedControls: Record<string, boolean>;
  onToggleExpand: (code: string) => void;
  onResetFilters: () => void;
}

export const ReconciliationControlList: React.FC<ReconciliationControlListProps> = ({
  checks,
  hasFullReport,
  loading,
  runningReconciliation,
  onRunReconciliation,
  expandedControls,
  onToggleExpand,
  onResetFilters,
}) => {
  // Pagination state for the control list
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(5);

  // Auto-reset to page 1 whenever the filtered checks list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [checks.length]);

  // Skeletons during initial loading
  if (loading && checks.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 rounded bg-slate-200" />
              <div className="h-6 w-20 rounded-full bg-slate-200" />
            </div>
            <div className="h-4 w-72 rounded bg-slate-100" />
            <div className="h-3 w-40 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  // State A: Only Zero-write Summary was read, Full Detailed Report hasn't been executed yet in session
  if (!hasFullReport) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brandBlueTeal-500 text-white mb-3 shadow-xs">
          <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 font-poppins">
          Rincian Kontrol Siap Diperiksa
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mb-4 leading-relaxed">
          Status ringkasan integritas berhasil dimuat melalui pembacaan aman. Jalankan rekonsiliasi
          untuk memverifikasi seluruh titik kontrol dan menampilkan rincian diagnostik.
        </p>
        <button
          type="button"
          onClick={onRunReconciliation}
          disabled={runningReconciliation}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-600 transition active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faRotateRight}
            className={runningReconciliation ? "animate-spin text-xs" : "text-xs"}
          />
          <span>{runningReconciliation ? "Memeriksa..." : "Jalankan Rekonsiliasi"}</span>
        </button>
      </div>
    );
  }

  // State B: Full Report exists, but search/filter matches 0 checks
  if (checks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white mb-3 shadow-xs">
          <FontAwesomeIcon icon={faFilterCircleXmark} className="text-xl" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 font-poppins">
          Tidak Ada Titik Kontrol Sesuai Filter
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
          Ubah kata kunci pencarian atau tab filter untuk melihat titik kontrol lainnya.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-95"
        >
          Reset Filter
        </button>
      </div>
    );
  }

  // Pagination calculations
  const totalItems = checks.length;
  const isAll = perPage === -1;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = isAll ? 0 : (safeCurrentPage - 1) * perPage;
  const paginatedChecks = isAll ? checks : checks.slice(startIndex, startIndex + perPage);

  const startRecord = totalItems === 0 ? 0 : startIndex + 1;
  const endRecord = isAll ? totalItems : Math.min(startIndex + perPage, totalItems);

  // State C: Render Control Items List with Pagination
  return (
    <div className="space-y-4">
      {/* List of Controls */}
      <div className="space-y-3">
        {paginatedChecks.map((check) => (
          <ReconciliationControlItem
            key={check.check_code}
            check={check}
            isExpanded={!!expandedControls[check.check_code]}
            onToggleExpand={() => onToggleExpand(check.check_code)}
          />
        ))}
      </div>

      {/* Pagination Bar */}
      {totalItems > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>
              Menampilkan{" "}
              <strong className="font-bold text-slate-900">{startRecord}</strong> -{" "}
              <strong className="font-bold text-slate-900">{endRecord}</strong> dari{" "}
              <strong className="font-bold text-slate-900">{totalItems}</strong> titik kontrol
            </span>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-500">Tampilkan:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Jumlah titik kontrol per halaman"
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition focus:border-slate-800 focus:outline-hidden"
              >
                <option value={5}>5 kontrol</option>
                <option value={10}>10 kontrol</option>
                <option value={-1}>Semua kontrol</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
                      safeCurrentPage === p
                        ? "bg-primary-500 text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-2 text-xs font-medium text-slate-600">
                Halaman <strong className="text-slate-900">{safeCurrentPage}</strong> dari{" "}
                <strong className="text-slate-900">{totalPages}</strong>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman Selanjutnya"
            >
              <span>Selanjutnya</span>
              <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

