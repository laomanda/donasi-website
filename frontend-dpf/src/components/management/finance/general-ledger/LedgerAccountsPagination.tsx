import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface LedgerAccountsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const LedgerAccountsPagination: React.FC<LedgerAccountsPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalItems <= pageSize) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 bg-slate-50 text-xs">
      <div className="text-slate-500 font-medium text-center sm:text-left">
        Menampilkan <strong>{start}</strong> - <strong>{end}</strong> dari{" "}
        <strong>{totalItems}</strong> akun
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
          <span>Sebelumnya</span>
        </button>

        <div className="px-2 font-semibold text-slate-600">
          Halaman <span className="font-bold text-slate-900">{currentPage}</span> dari{" "}
          <span className="font-bold text-slate-900">{totalPages}</span>
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Selanjutnya</span>
          <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
        </button>
      </div>
    </div>
  );
};

export default LedgerAccountsPagination;
