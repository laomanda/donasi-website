import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface AdminDonationPaginationProps {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  loading: boolean;
  pageLabel: string;
  onPageChange: (nextPage: number) => void;
}

export function AdminDonationPagination({
  page,
  lastPage,
  loading,
  pageLabel,
  onPageChange,
}: AdminDonationPaginationProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 p-5">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{pageLabel}</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || loading}
          className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(lastPage, page + 1))}
          disabled={page >= lastPage || loading}
          className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
}

export default AdminDonationPagination;
