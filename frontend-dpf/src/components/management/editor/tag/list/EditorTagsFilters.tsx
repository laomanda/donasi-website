import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

type EditorTagsFiltersProps = {
  q: string;
  setQ: (val: string) => void;
  status: "all" | "active" | "inactive";
  setStatus: (val: "all" | "active" | "inactive") => void;
  perPage: number;
  setPerPage: (val: number) => void;
  onReset: () => void;
  hasFilters: boolean;
  pageLabel: string;
};

export default function EditorTagsFilters({
  q,
  setQ,
  status,
  setStatus,
  perPage,
  setPerPage,
  onReset,
  hasFilters,
  pageLabel,
}: EditorTagsFiltersProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Cari</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama tag atau URL..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "all" | "active" | "inactive")}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            >
              <option value="all">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            <span className="text-slate-400">
              <FontAwesomeIcon icon={faFilter} />
            </span>
            <span>Per halaman</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </label>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faRotateLeft} />
              Reset
            </button>
          )}

          <div className="w-full text-right text-xs font-semibold text-slate-500 sm:w-auto">
            {pageLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
