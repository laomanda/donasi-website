import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface TrialBalancePaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalFilteredCount: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
  onPerPageChange: (count: number) => void;
}

export const TrialBalancePagination: React.FC<TrialBalancePaginationProps> = ({
  currentPage,
  totalPages,
  perPage,
  totalFilteredCount,
  onPageChange,
  onPerPageChange,
}) => {
  if (totalFilteredCount === 0) return null;

  const startRecord = perPage === -1 ? 1 : (currentPage - 1) * perPage + 1;
  const endRecord =
    perPage === -1
      ? totalFilteredCount
      : Math.min(currentPage * perPage, totalFilteredCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-xs text-xs">
      {/* Left: Record Range & Per-page selector */}
      <div className="flex flex-wrap items-center gap-3 text-slate-600">
        <div>
          Menampilkan <strong className="text-slate-900">{startRecord}</strong> -{" "}
          <strong className="text-slate-900">{endRecord}</strong> dari{" "}
          <strong className="text-slate-900">{totalFilteredCount}</strong> akun
        </div>

        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <span className="text-[11px] text-slate-400">Tampilkan:</span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            aria-label="Jumlah baris per halaman"
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 transition focus:border-slate-800 focus:outline-hidden"
          >
            <option value={25}>25 baris</option>
            <option value={50}>50 baris</option>
            <option value={100}>100 baris</option>
            <option value={-1}>Semua baris</option>
          </select>
        </div>
      </div>

      {/* Right: Previous / Next controls (only if paginated) */}
      {perPage !== -1 && totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
            <span>Sebelumnya</span>
          </button>

          <div className="px-3 py-1 font-semibold text-slate-600">
            Halaman{" "}
            <span className="font-bold text-slate-900">{currentPage}</span> dari{" "}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </div>

          <button
            type="button"
            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Selanjutnya</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TrialBalancePagination;
