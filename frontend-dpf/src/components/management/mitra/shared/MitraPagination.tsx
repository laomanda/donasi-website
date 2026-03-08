import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface MitraPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentCount: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  showingInfoText: string; // e.g. "Showing {count} of {total}"
}

export function MitraPagination({
  currentPage,
  totalPages,
  totalItems,
  currentCount,
  loading,
  onPageChange,
  showingInfoText,
}: MitraPaginationProps) {
  if (loading || totalItems === 0) return null;

  const info = showingInfoText
    .replace("{count}", currentCount.toString())
    .replace("{total}", totalItems.toString());

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-8 py-6 sm:flex-row">
      <div className="text-sm font-bold text-slate-500">{info}</div>
      <div className="flex gap-3">
        <button
          disabled={currentPage === 1 || loading}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        >
          <FontAwesomeIcon icon={faChevronLeft} size="sm" />
        </button>
        <div className="flex h-12 min-w-[48px] items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-black text-white shadow-lg shadow-slate-200">
          {currentPage} / {totalPages}
        </div>
        <button
          disabled={currentPage === totalPages || loading}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        >
          <FontAwesomeIcon icon={faChevronRight} size="sm" />
        </button>
      </div>
    </div>
  );
}
