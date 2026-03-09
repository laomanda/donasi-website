interface AdminTaskPaginationProps {
  pageLabel: string;
  onPageChange: (nextPage: number) => void;
  page: number;
  lastPage: number;
  loading: boolean;
}

export default function AdminTaskPagination({
  pageLabel,
  onPageChange,
  page,
  lastPage,
  loading,
}: AdminTaskPaginationProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm font-semibold text-slate-600">{pageLabel}</div>
      <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:w-auto"
        >
          Sebelumnya
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(lastPage, page + 1))}
          disabled={page >= lastPage || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:w-auto"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
