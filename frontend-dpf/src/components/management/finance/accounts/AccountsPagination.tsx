import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export interface AccountsPaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalItems: number;
  fromItem: number;
  toItem: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export const AccountsPagination: React.FC<AccountsPaginationProps> = ({
  currentPage,
  totalPages,
  perPage,
  totalItems,
  fromItem,
  toItem,
  onPageChange,
  onPerPageChange,
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
      {/* Items count & page size selector */}
      <div className="flex items-center gap-3">
        <span>
          Menampilkan <strong className="text-slate-900">{fromItem}</strong> -{" "}
          <strong className="text-slate-900">{toItem}</strong> dari{" "}
          <strong className="text-slate-900">{totalItems}</strong> akun
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">|</span>
          <label htmlFor="accounts-per-page" className="sr-only">
            Jumlah per halaman
          </label>
          <select
            id="accounts-per-page"
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white py-1 px-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
          >
            <option value={15}>15 / hal</option>
            <option value={25}>25 / hal</option>
            <option value={50}>50 / hal</option>
            <option value={100}>100 / hal</option>
          </select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          aria-label="Halaman sebelumnya"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
        </button>

        <span className="px-2 text-xs font-semibold text-slate-700">
          Hal <strong className="text-slate-900">{currentPage}</strong> dari{" "}
          <strong className="text-slate-900">{totalPages}</strong>
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          aria-label="Halaman selanjutnya"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default AccountsPagination;
