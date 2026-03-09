import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface AdminSuggestionPaginationProps {
  page: number;
  lastPage: number;
  pageLabel: string;
  loading: boolean;
  onPageChange: (nextPage: number) => void;
}

export const AdminSuggestionPagination = ({
  page,
  lastPage,
  pageLabel,
  loading,
  onPageChange,
}: AdminSuggestionPaginationProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm font-semibold text-slate-600">{pageLabel}</div>
      <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Sebelumnya
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(lastPage, page + 1))}
          disabled={page >= lastPage || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
        >
          Berikutnya
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
};

export default AdminSuggestionPagination;
