import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export interface JournalsPaginationProps {
  currentPage?: number;
  lastPage?: number;
  totalItems?: number;
  fromItem?: number;
  toItem?: number;
  onPageChange: (page: number) => void;
  perPage?: number;
  onPerPageChange: (size: number) => void;
  pagination?: {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
  };
}

export const JournalsPagination: React.FC<JournalsPaginationProps> = ({
  currentPage: propCurrentPage,
  lastPage: propLastPage,
  totalItems: propTotalItems,
  fromItem: propFromItem,
  toItem: propToItem,
  onPageChange,
  perPage: propPerPage,
  onPerPageChange,
  pagination,
}) => {
  const current = pagination ? pagination.current_page : (propCurrentPage || 1);
  const last = pagination ? pagination.last_page : (propLastPage || 1);
  const total = pagination ? pagination.total : (propTotalItems || 0);
  const from = pagination ? pagination.from : (propFromItem || 0);
  const to = pagination ? pagination.to : (propToItem || 0);
  const size = pagination ? pagination.per_page : (propPerPage || 15);

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
      {/* Items count & page size selector */}
      <div className="flex items-center gap-3">
        <span>
          Menampilkan <strong className="text-slate-900">{from}</strong> -{" "}
          <strong className="text-slate-900">{to}</strong> dari{" "}
          <strong className="text-slate-900">{total}</strong> jurnal
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">|</span>
          <label htmlFor="journals-per-page" className="sr-only">
            Jumlah per halaman
          </label>
          <select
            id="journals-per-page"
            value={size}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white py-1 px-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-primary-500 focus:outline-hidden cursor-pointer"
          >
            <option value={15}>15 / hal</option>
            <option value={25}>25 / hal</option>
            <option value={50}>50 / hal</option>
          </select>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
          <span>Sebelumnya</span>
        </button>

        <span className="px-2 font-medium text-slate-700">
          Halaman <strong className="text-slate-900">{current}</strong> dari{" "}
          <strong className="text-slate-900">{last}</strong>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= last}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <span>Selanjutnya</span>
          <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
        </button>
      </div>
    </div>
  );
};

export default JournalsPagination;
