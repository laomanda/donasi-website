import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

type CashFlowPaginationProps = {
  page: number;
  lastPage: number;
  total: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
};

export function CashFlowPagination({
  page,
  lastPage,
  total,
  loading,
  onPageChange,
}: CashFlowPaginationProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-xs">
      <div className="font-medium text-slate-500">
        Menampilkan halaman <span className="font-bold text-slate-700">{page}</span> dari{" "}
        <span className="font-bold text-slate-700">{lastPage}</span> ({total} transaksi kas)
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-brandGreen-50 hover:text-brandGreen-600 hover:border-brandGreen-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200"
          title="Halaman Sebelumnya"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
        </button>

        <span className="px-2 font-semibold text-slate-700">
          {page} / {lastPage}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(lastPage, page + 1))}
          disabled={page >= lastPage || loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-brandGreen-50 hover:text-brandGreen-600 hover:border-brandGreen-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200"
          title="Halaman Selanjutnya"
        >
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </button>
      </div>
    </div>
  );
}
